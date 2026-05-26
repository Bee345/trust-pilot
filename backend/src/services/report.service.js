'use strict';

const { createReport, getReportsByPhone, getRecentReports, upvoteReport, getReportsByUser } = require('../models/report.model');
const { incrementTrustPoints } = require('../models/user.model');
const { createAuditLog, findRecentReportByIp } = require('../models/audit.model');
const { emitNewReport } = require('../sockets');
const { computeRiskScore } = require('../utils/risk');
const { HIGH_RISK_SCAM_TYPES, MEDIUM_RISK_SCAM_TYPES, RISK_LEVELS, REPORT_STATUS, AUDIT_ACTIONS } = require('../constants');
const { conflict } = require('../errors/AppError');
const logger = require('../config/logger');

const DUPLICATE_REPORT_WINDOW_MINUTES = 10;

function resolveRiskLevel(scamType) {
  if (HIGH_RISK_SCAM_TYPES.has(scamType)) {return RISK_LEVELS.HIGH;}
  if (MEDIUM_RISK_SCAM_TYPES.has(scamType)) {return RISK_LEVELS.MEDIUM;}
  return RISK_LEVELS.LOW;
}

function buildReportRow(data, userId, riskLevel) {
  return {
    reporter_id: userId || null,
    phone: data.phone || null,
    business_name: data.businessName || null,
    scam_type: data.scamType,
    description: data.description,
    amount_lost: data.amountLost || null,
    anonymous: data.anonymous || false,
    risk_level: riskLevel,
    status: REPORT_STATUS.PENDING,
  };
}

async function awardTrustPoints(userId) {
  try {
    await incrementTrustPoints(userId, 10);
  } catch (err) {
    logger.warn({ err, userId }, 'Failed to increment trust points — ensure increment_trust_points function exists in Supabase');
  }
}

async function submitReport(data, userId, context = {}) {
  const { ipAddress } = context;

  if (data.phone && ipAddress) {
    const recent = await findRecentReportByIp(ipAddress, data.phone, DUPLICATE_REPORT_WINDOW_MINUTES);
    if (recent) {
      throw conflict('You have already reported this number recently. Please wait before submitting another report.');
    }
  }

  const riskLevel = resolveRiskLevel(data.scamType);
  const report = await createReport(buildReportRow(data, userId, riskLevel));

  if (userId) {await awardTrustPoints(userId);}

  emitNewReport({ reportId: report.id, riskLevel, scamType: data.scamType });
  createAuditLog({
    userId: userId || null,
    action: AUDIT_ACTIONS.REPORT_SUBMITTED,
    entity: 'reports',
    entityId: data.phone || null,
    ipAddress: ipAddress || null,
    metadata: { scamType: data.scamType, riskLevel, reportId: report.id },
  });

  return report;
}

async function searchEntity(query) {
  const existingReports = await getReportsByPhone(query);
  const riskAssessment = computeRiskScore(existingReports);
  return { query, reports: existingReports, riskAssessment };
}

async function listRecentReports({ page, limit, riskLevel }) {
  return getRecentReports({ page, limit, riskLevel });
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
