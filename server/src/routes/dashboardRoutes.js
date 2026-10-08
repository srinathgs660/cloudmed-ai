const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
  getAIAnalytics,
} = require('../controllers/dashboardController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/admin', authorizeRoles('ADMIN'), getAdminDashboard);
router.get('/doctor', authorizeRoles('DOCTOR'), getDoctorDashboard);
router.get('/patient', authorizeRoles('PATIENT'), getPatientDashboard);
router.get('/ai-analytics', getAIAnalytics);

module.exports = router;
