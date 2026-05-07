const { Router } = require('express');
const { submitReport, getReports, searchEntity, upvote } = require('../controllers/review.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { reportRateLimit, searchRateLimit } = require('../middlewares/rateLimit');
const { reportSchema } = require('../utils/validators');

const router = Router();

router.post('/', optionalAuth, reportRateLimit, validate(reportSchema), submitReport);
router.get('/', searchRateLimit, getReports);
router.get('/search', searchRateLimit, searchEntity);
router.post('/:id/upvote', verifyToken, upvote);

module.exports = router;
