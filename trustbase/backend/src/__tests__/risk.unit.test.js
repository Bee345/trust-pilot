const { computeRiskScore } = require('../utils/risk');

const recentISO = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const oldISO = () => new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

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

  it('adds "Large Amount Lost" tag for amounts over 100000', () => {
    const result = computeRiskScore([
      { scam_type: 'Other', created_at: recentISO(), amount_lost: 150_000, anonymous: true },
    ]);
    expect(result.tags).toContain('Large Amount Lost');
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
});
