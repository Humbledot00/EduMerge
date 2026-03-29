const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const institutionRoutes = require('./institutions');
const campusRoutes = require('./campuses');
const departmentRoutes = require('./departments');
const programRoutes = require('./programs');
const seatMatrixRoutes = require('./seatMatrix');
const applicantRoutes = require('./applicants');
const dashboardRoutes = require('./dashboard');

// Register all routes with single entry point
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/campuses', campusRoutes);
router.use('/departments', departmentRoutes);
router.use('/programs', programRoutes);
router.use('/seat-matrix', seatMatrixRoutes);
router.use('/applicants', applicantRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
