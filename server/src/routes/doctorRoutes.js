const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

// Public or authenticated doctor listings
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Admin doctor management
router.post('/', authenticateUser, authorizeRoles('ADMIN'), createDoctor);
router.put('/:id', authenticateUser, authorizeRoles('ADMIN', 'DOCTOR'), updateDoctor);
router.delete('/:id', authenticateUser, authorizeRoles('ADMIN'), deleteDoctor);

module.exports = router;
