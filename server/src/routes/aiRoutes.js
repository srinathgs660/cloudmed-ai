const express = require('express');
const router = express.Router();
const {
  runHealthRiskAssessment,
  runAppointmentPriorityTriage,
  runReportSummarization,
  getAssessments,
} = require('../controllers/aiController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/health-risk', runHealthRiskAssessment);
router.post('/appointment-priority', runAppointmentPriorityTriage);
router.post('/summarize-report', runReportSummarization);
router.get('/assessments', getAssessments);

module.exports = router;
