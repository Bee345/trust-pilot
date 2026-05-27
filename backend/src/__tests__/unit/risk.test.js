const {
  calculateBasePoints,
  applyRecencyMultiplier,
  determineLevel,
  computeRiskScore,
} = require('../../utils/risk');

const recentISO = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const oldISO = () => new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

describe('calculateBasePoints', () => {
  it.each([
    ['Investment / Ponzi', 25],
    ['Job / Recruitment Scam', 25],
    ['POS Fraud', 25],
  ])('returns 25 for high-risk type %s', (type, expected) => {
    expect(calculateBasePoints(type)).toBe(expected);
  });

  it.each([
    ['Online Marketplace Scam', 15],
    ['Loan / Finance Fraud', 15],
    ['Romantic Scam', 15],
  ])('returns 15 for medium-risk type %s', (type, expected) => {
    expect(calculateBasePoints(type)).toBe(expected);
  });

  it.each([
    ['Fake Product / Non-delivery', 10],
    ['Other', 10],
  ])('returns 10 for low-risk type %s', (type, expected) => {
    expect(calculateBasePoints(type)).toBe(expected);
  });

  it('returns 10 for an unknown scam type', () => {
    expect(calculateBasePoints('Something New')).toBe(10);
  });
});

describe('applyRecencyMultiplier', () => {
  it('applies 1.5x multiplier for reports within 30 days', () => {
    expect(applyRecencyMultiplier(25, recentISO())).toBe(37.5);
  });

  it('returns base points unchanged for reports older than 30 days', () => {
    expect(applyRecencyMultiplier(25, oldISO())).toBe(25);
  });

  it('applies multiplier at the 30-day boundary (29 days ago)', () => {
    const justUnder = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    expect(applyRecencyMultiplier(10, justUnder)).toBe(15);
  });

  it('does not apply multiplier at 31 days ago', () => {
    const justOver = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    expect(applyRecencyMultiplier(10, justOver)).toBe(10);
  });
});

describe('determineLevel', () => {
  it('returns high for score >= 60', () => {
    expect(determineLevel(60)).toBe('high');
    expect(determineLevel(100)).toBe('high');
  });

  it('returns medium for score >= 30 and < 60', () => {
    expect(determineLevel(30)).toBe('medium');
    expect(determineLevel(59)).toBe('medium');
  });

  it('returns low for score < 30', () => {
    expect(determineLevel(0)).toBe('low');
    expect(determineLevel(29)).toBe('low');
  });
});

describe('computeRiskScore', () => {
  it('returns zero score for no reports', () => {
    expect(computeRiskScore([])).toEqual({ score: 0, level: 'low', tags: [] });
  });

  it('returns zero score for null input', () => {
    expect(computeRiskScore(null)).toEqual({ score: 0, level: 'low', tags: [] });
  });

  it('scores a single recent high-risk report', () => {
    const result = computeRiskScore([
      { scam_type: 'POS Fraud', created_at: recentISO(), anonymous: false },
    ]);
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.tags).toContain('Verified Reporter');
  });

  it('caps score at 100', () => {
    const reports = Array.from({ length: 20 }, () => ({
      scam_type: 'Investment / Ponzi',
      created_at: recentISO(),
      anonymous: false,
      amount_lost: 1_000_000,
    }));
    const result = computeRiskScore(reports);
    expect(result.score).toBe(100);
    expect(result.level).toBe('high');
  });

  it('adds "Multiple Victims" tag when 3+ reports', () => {
    const reports = Array.from({ length: 3 }, () => ({
      scam_type: 'Other',
      created_at: oldISO(),
      anonymous: true,
    }));
    const result = computeRiskScore(reports);
    expect(result.tags).toContain('Multiple Victims');
  });

  it('does not add "Multiple Victims" tag for fewer than 3 reports', () => {
    const reports = Array.from({ length: 2 }, () => ({
      scam_type: 'Other',
      created_at: oldISO(),
      anonymous: true,
    }));
    const result = computeRiskScore(reports);
    expect(result.tags).not.toContain('Multiple Victims');
  });

  it('adds "Large Amount Lost" tag for amounts over 100000', () => {
    const result = computeRiskScore([
      { scam_type: 'Other', created_at: recentISO(), amount_lost: 150_000, anonymous: true },
    ]);
    expect(result.tags).toContain('Large Amount Lost');
  });

  it('does not add "Large Amount Lost" tag for amounts at or below 100000', () => {
    const result = computeRiskScore([
      { scam_type: 'Other', created_at: recentISO(), amount_lost: 100_000, anonymous: true },
    ]);
    expect(result.tags).not.toContain('Large Amount Lost');
  });

  it('classifies low/medium/high levels correctly', () => {
    const low = computeRiskScore([
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
    ]);
    expect(low.level).toBe('low');

    const medium = computeRiskScore([
      { scam_type: 'Online Marketplace Scam', created_at: recentISO(), anonymous: true },
      { scam_type: 'Loan / Finance Fraud', created_at: oldISO(), anonymous: true },
    ]);
    expect(medium.level).toBe('medium');

    const high = computeRiskScore([
      { scam_type: 'Investment / Ponzi', created_at: recentISO(), anonymous: true },
      { scam_type: 'Investment / Ponzi', created_at: recentISO(), anonymous: true },
      { scam_type: 'POS Fraud', created_at: recentISO(), anonymous: true },
    ]);
    expect(high.level).toBe('high');
  });

  it('boosts recent reports relative to old ones', () => {
    const recent = computeRiskScore([
      { scam_type: 'POS Fraud', created_at: recentISO(), anonymous: true },
    ]);
    const old = computeRiskScore([
      { scam_type: 'POS Fraud', created_at: oldISO(), anonymous: true },
    ]);
    expect(recent.score).toBeGreaterThan(old.score);
  });

  it('adds volume bonus of 10 for 3+ reports', () => {
    const twoReports = computeRiskScore([
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
    ]);
    const threeReports = computeRiskScore([
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
      { scam_type: 'Other', created_at: oldISO(), anonymous: true },
    ]);
    expect(threeReports.score - twoReports.score).toBe(20);
  });
});
