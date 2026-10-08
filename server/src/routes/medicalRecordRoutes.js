const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
} = require('../controllers/medicalRecordController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.post('/', authorizeRoles('ADMIN', 'DOCTOR'), createMedicalRecord);

module.exports = router;
