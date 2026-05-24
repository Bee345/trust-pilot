const { Router } = require('express');
const { signup, login } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate');
const { authRateLimit } = require('../middlewares/rateLimit');
const { signupSchema, loginSchema } = require('../utils/validators');

const router = Router();

router.post('/signup', authRateLimit, validate(signupSchema), signup);
router.post('/login', authRateLimit, validate(loginSchema), login);

module.exports = router;
