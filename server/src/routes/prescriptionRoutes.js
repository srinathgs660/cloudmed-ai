const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
} = require('../controllers/prescriptionController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', authorizeRoles('ADMIN', 'DOCTOR'), createPrescription);

module.exports = router;
