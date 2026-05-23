const { Router } = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { updateProfileSchema } = require('../utils/validators');

const router = Router();

router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, validate(updateProfileSchema), updateProfile);

module.exports = router;
