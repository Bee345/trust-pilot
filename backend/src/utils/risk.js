const HIGH_RISK_TYPES = new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud']);
const MEDIUM_RISK_TYPES = new Set(['Online Marketplace Scam', 'Loan / Finance Fraud', 'Romantic Scam']);
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function calculateBasePoints(scamType) {
  if (HIGH_RISK_TYPES.has(scamType)) {
    return 25;
  }
  if (MEDIUM_RISK_TYPES.has(scamType)) {
    return 15;
  }
  return 10;
}

function applyRecencyMultiplier(basePoints, createdAt) {
  const age = Date.now() - new Date(createdAt).getTime();
  return age < THIRTY_DAYS_MS ? basePoints * 1.5 : basePoints;
}

function determineLevel(score) {
  if (score >= 60) {
    return 'high';
  }
  if (score >= 30) {
    return 'medium';
  }
  return 'low';
}

function computeRiskScore(reports) {
  if (!reports || reports.length === 0) {
    return { score: 0, level: 'low', tags: [] };
  }

  let score = 0;
  const tags = new Set();

  reports.forEach((report) => {
    const base = calculateBasePoints(report.scam_type);
    score += applyRecencyMultiplier(base, report.created_at);

    if (report.scam_type) {
      tags.add(report.scam_type.replace(' Scam', '').replace(' Fraud', ''));
    }
    if (report.amount_lost > 100000) {
      tags.add('Large Amount Lost');
    }
  });

  if (reports.length >= 3) {
    score += 10;
    tags.add('Multiple Victims');
  }

  if (reports.some((r) => r.anonymous === false)) {
    tags.add('Verified Reporter');
  }

  score = Math.min(Math.round(score), 100);

  return { score, level: determineLevel(score), tags: [...tags] };
}

module.exports = { calculateBasePoints, applyRecencyMultiplier, determineLevel, computeRiskScore };
