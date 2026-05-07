const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');
const companyRoutes = require('./companyRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/companies', companyRoutes);

module.exports = router;
