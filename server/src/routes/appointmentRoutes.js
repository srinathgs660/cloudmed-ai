const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id/status', authorizeRoles('ADMIN', 'DOCTOR'), updateAppointmentStatus);
router.delete('/:id', cancelAppointment);

module.exports = router;
