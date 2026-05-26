const { searchEntities, getVerifiedUsers, getVerifiedUserById } = require('../models/company.model');
const { success, error } = require('../utils/response');
const { sanitiseSearchQuery } = require('../utils/validators');

async function searchCompanies(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {return error(res, 'Query must be at least 2 characters', 400);}
    const sanitised = sanitiseSearchQuery(q);
    if (!sanitised) {return error(res, 'Query must be at least 2 characters', 400);}
    const results = await searchEntities(sanitised);
    return success(res, { results });
  } catch (err) {
    return next(err);
  }
}

async function getVerified(req, res, next) {
  try {
    const users = await getVerifiedUsers();
    success(res, { users });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await getVerifiedUserById(req.params.id);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchCompanies, getVerified, getById };
