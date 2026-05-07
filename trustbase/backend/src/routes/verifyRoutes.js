const { Router } = require('express');
const { initiate, webhook, getStatus } = require('../controllers/verification.controller');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { verificationSchema } = require('../utils/validators');

const router = Router();

router.post('/initiate', verifyToken, validate(verificationSchema), initiate);
router.post('/webhook', webhook);
router.get('/status', verifyToken, getStatus);

module.exports = router;
