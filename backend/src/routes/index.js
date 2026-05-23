const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');
const companyRoutes = require('./companyRoutes');
const verifyRoutes = require('./verifyRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/companies', companyRoutes);
router.use('/verify', verifyRoutes);

module.exports = router;
