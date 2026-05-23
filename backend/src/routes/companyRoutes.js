const { Router } = require('express');
const { searchCompanies, getVerified, getById } = require('../controllers/company.controller');
const { searchRateLimit } = require('../middlewares/rateLimit');

const router = Router();

router.get('/search', searchRateLimit, searchCompanies);
router.get('/verified', getVerified);
router.get('/:id', getById);

module.exports = router;
