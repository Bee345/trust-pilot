const reportService = require('../services/report.service');
const { success, error } = require('../utils/response');
const { RISK_LEVELS } = require('../constants');

async function submitReport(req, res, next) {
  try {
    const userId = req.user ? req.user.sub : null;
    const context = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    const report = await reportService.submitReport(req.validatedBody, userId, context);
    success(res, { report }, 201);
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { risk_level } = req.query;
    const riskLevel = Object.values(RISK_LEVELS).includes(risk_level) ? risk_level : null;
    const result = await reportService.listRecentReports({ page, limit, riskLevel });
    success(res, result);
  } catch (err) {
    next(err);
  }
}

async function searchEntity(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {return error(res, 'Query must be at least 3 characters', 400);}
    const result = await reportService.searchEntity(q);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

async function upvote(req, res, next) {
  try {
    await reportService.upvoteReportById(req.params.id, req.user.sub);
    success(res, { message: 'Upvoted' });
  } catch (err) {
    next(err);
  }
}

async function getMyReports(req, res, next) {
  try {
    const reports = await reportService.getMyReports(req.user.sub);
    success(res, { reports });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitReport, getReports, searchEntity, upvote, getMyReports };
