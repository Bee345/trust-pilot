const { Router } = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);

module.exports = router;
