'use strict';

const { createReport, getReportsByPhone, getRecentReports, upvoteReport, getReportsByUser } = require('../models/report.model');
const { incrementTrustPoints } = require('../models/user.model');
const { createAuditLog } = require('../models/audit.model');
const { emitNewReport } = require('../sockets');
const { computeRiskScore } = require('../utils/risk');
const { HIGH_RISK_SCAM_TYPES, MEDIUM_RISK_SCAM_TYPES, RISK_LEVELS, REPORT_STATUS, AUDIT_ACTIONS } = require('../constants');

function resolveRiskLevel(scamType) {
  if (HIGH_RISK_SCAM_TYPES.has(scamType)) {return RISK_LEVELS.HIGH;}
  if (MEDIUM_RISK_SCAM_TYPES.has(scamType)) {return RISK_LEVELS.MEDIUM;}
  return RISK_LEVELS.LOW;
}

async function submitReport(data, userId) {
  const riskLevel = resolveRiskLevel(data.scamType);

  const report = await createReport({
    reporter_id: userId || null,
    phone: data.phone || null,
    business_name: data.businessName || null,
    scam_type: data.scamType,
    description: data.description,
    amount_lost: data.amountLost || null,
    anonymous: data.anonymous || false,
    risk_level: riskLevel,
    status: REPORT_STATUS.PENDING,
  });

  if (userId) {
    await incrementTrustPoints(userId, 10);
  }

  emitNewReport({ reportId: report.id, riskLevel, scamType: data.scamType });
  createAuditLog({
    userId: userId || null,
    action: AUDIT_ACTIONS.REPORT_SUBMITTED,
    entity: 'reports',
    entityId: report.id,
    metadata: { scamType: data.scamType, riskLevel },
  });

  return report;
}

async function searchEntity(query) {
  const existingReports = await getReportsByPhone(query);
  const riskAssessment = computeRiskScore(existingReports);
  return { query, reports: existingReports, riskAssessment };
}

async function listRecentReports({ page, limit }) {
  return getRecentReports({ page, limit });
}

async function upvoteReportById(reportId, userId) {
  const result = await upvoteReport(reportId, userId);
  createAuditLog({
    userId,
    action: AUDIT_ACTIONS.UPVOTE_ADDED,
    entity: 'reports',
    entityId: reportId,
  });
  return result;
}

async function getMyReports(userId) {
  return getReportsByUser(userId);
}

module.exports = { submitReport, searchEntity, listRecentReports, upvoteReportById, getMyReports };
