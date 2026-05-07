const { createReport, getReportsByPhone } = require('../models/report.model');
const { incrementTrustPoints } = require('../models/user.model');
const { computeRiskScore } = require('../utils/risk');

const HIGH_RISK_TYPES = new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud']);

async function submitReport(data, userId) {
  const riskLevel = HIGH_RISK_TYPES.has(data.scamType) ? 'high' : 'medium';

  const report = await createReport({
    reporter_id: userId || null,
    phone: data.phone || null,
    business_name: data.businessName || null,
    scam_type: data.scamType,
    description: data.description,
    amount_lost: data.amountLost || null,
    anonymous: data.anonymous || false,
    risk_level: riskLevel,
    status: 'pending',
  });

  if (userId) {
    await incrementTrustPoints(userId, 10);
  }

  return report;
}

async function searchEntity(query) {
  const existingReports = await getReportsByPhone(query);
  const riskAssessment = computeRiskScore(existingReports);

  return {
    query,
    reports: existingReports,
    riskAssessment,
  };
}

module.exports = { submitReport, searchEntity };
