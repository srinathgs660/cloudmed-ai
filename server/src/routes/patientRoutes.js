const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN', 'DOCTOR'), getPatients);
router.get('/:id', getPatientById);
router.post('/', authorizeRoles('ADMIN', 'DOCTOR'), createPatient);
router.put('/:id', authorizeRoles('ADMIN', 'DOCTOR'), updatePatient);
router.delete('/:id', authorizeRoles('ADMIN'), deletePatient);

module.exports = router;
