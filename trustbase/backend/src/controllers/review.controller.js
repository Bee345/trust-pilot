const reportService = require('../services/report.service');
const { getRecentReports, upvoteReport } = require('../models/report.model');
const { success, error } = require('../utils/response');

async function submitReport(req, res, next) {
  try {
    const userId = req.user ? req.user.sub : null;
    const report = await reportService.submitReport(req.validatedBody, userId);
    success(res, { report }, 201);
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await getRecentReports({ page, limit });
    success(res, result);
  } catch (err) {
    next(err);
  }
}

async function searchEntity(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return error(res, 'Query must be at least 3 characters', 400);
    const result = await reportService.searchEntity(q);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

async function upvote(req, res, next) {
  try {
    await upvoteReport(req.params.id, req.user.sub);
    success(res, { message: 'Upvoted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitReport, getReports, searchEntity, upvote };
