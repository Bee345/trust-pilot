const HIGH_RISK_TYPES = new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud']);
const MEDIUM_RISK_TYPES = new Set(['Online Marketplace Scam', 'Loan / Finance Fraud', 'Romantic Scam']);
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function computeRiskScore(reports) {
  if (!reports || reports.length === 0) {
    return { score: 0, level: 'low', tags: [] };
  }

  const now = Date.now();
  let score = 0;
  const tags = new Set();

  reports.forEach((report) => {
    const basePoints = HIGH_RISK_TYPES.has(report.scam_type)
      ? 25
      : MEDIUM_RISK_TYPES.has(report.scam_type)
      ? 15
      : 10;

    const isRecent = now - new Date(report.created_at).getTime() < THIRTY_DAYS_MS;
    score += isRecent ? basePoints * 1.5 : basePoints;

    if (report.scam_type) {tags.add(report.scam_type.replace(' Scam', '').replace(' Fraud', ''));}
    if (report.amount_lost > 100000) {tags.add('Large Amount Lost');}
  });

  if (reports.length >= 3) {
    score += 10;
    tags.add('Multiple Victims');
  }

  if (reports.some((r) => r.anonymous === false)) {tags.add('Verified Reporter');}

  score = Math.min(Math.round(score), 100);

  const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return { score, level, tags: [...tags] };
}

module.exports = { computeRiskScore };
