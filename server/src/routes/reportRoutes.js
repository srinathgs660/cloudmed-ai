const express = require('express');
const router = express.Router();
const {
  getReports,
  uploadReport,
  summarizeExistingReport,
} = require('../controllers/reportController');
const { authenticateUser } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authenticateUser);

router.get('/', getReports);
router.post('/upload', upload.single('file'), uploadReport);
router.post('/:id/summarize', summarizeExistingReport);

module.exports = router;
