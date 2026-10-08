const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { predictAppointmentPriority } = require('../services/aiClient');

/**
 * @route GET /api/appointments
 * Filtering by date, doctor, patient, status, priority
 */
const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, priority, date, page = 1, limit = 50 } = req.query;

    let query = {};

    // Role scoping
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patientId = patient._id;
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(200).json({ success: true, count: 0, data: [] });
      query.doctorId = doctor._id;
    } else {
      // ADMIN can filter by specific doctor or patient
      if (doctorId) query.doctorId = doctorId;
      if (patientId) query.patientId = patientId;
    }

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (date) query.date = date;

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('departmentId', 'name')
      .sort({ date: -1, time: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      currentPage: Number(page),
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('departmentId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/appointments
 * Patient or Admin books appointment
 */
const createAppointment = async (req, res, next) => {
  try {
    let {
      patientId,
      doctorId,
      departmentId,
      date,
      time,
      reason,
      symptomSeverity = 2,
      painLevel = 3,
      emergencyIndicator = false,
    } = req.body;

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(400).json({ success: false, message: 'Patient profile not registered.' });
      }
      patientId = patient._id;
    } else if (!patientId) {
      return res.status(400).json({ success: false, message: 'Please specify patient ID.' });
    }

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: 'Doctor, date, time, and reason are required.' });
    }

    // Double booking check: ensure doctor doesn't have an active appointment at the requested date & time
    const existing = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'The selected doctor is already booked for this date and time slot. Please choose another time.',
      });
    }

    // Determine department if not supplied
    if (!departmentId) {
      const doc = await Doctor.findById(doctorId);
      if (doc) departmentId = doc.departmentId;
    }

    // Fetch patient age & conditions for AI priority model
    const patientDoc = await Patient.findById(patientId);
    const age = patientDoc ? patientDoc.age || 35 : 35;
    const condCount = patientDoc && patientDoc.existingConditions ? patientDoc.existingConditions.length : 0;

    // Call AI Priority Triage Service
    const aiPriority = await predictAppointmentPriority({
      age,
      symptomSeverity: Number(symptomSeverity) || 2,
      existingConditionsCount: condCount,
      painLevel: Number(painLevel) || 3,
      emergencyIndicator: Boolean(emergencyIndicator),
      reason,
    });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      departmentId,
      date,
      time,
      reason,
      priority: aiPriority.priority || 'MEDIUM',
      priorityScore: aiPriority.score || 0.5,
      priorityReason: aiPriority.reason || 'Calculated via AI triage',
      status: 'Pending',
    });

    // Notify doctor
    const doctorObj = await Doctor.findById(doctorId).populate('userId');
    if (doctorObj && doctorObj.userId) {
      await Notification.create({
        userId: doctorObj.userId._id,
        title: 'New Appointment Booked',
        message: `A new ${appointment.priority} priority appointment is scheduled for ${date} at ${time}.`,
        type: 'APPOINTMENT',
        link: `/appointments/${appointment._id}`,
      });
    }

    // Notify patient
    if (patientDoc && patientDoc.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        title: 'Appointment Scheduled',
        message: `Your appointment with Dr. ${doctorObj ? doctorObj.userId.name : 'Physician'} for ${date} at ${time} is currently pending confirmation.`,
        type: 'APPOINTMENT',
        link: `/appointments`,
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email phone' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .populate('departmentId', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment successfully requested.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/appointments/:id/status
 * Doctor or Admin updates status (Confirmed, Cancelled, Completed)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    await appointment.save();

    // Trigger notification to patient
    if (appointment.patientId && appointment.patientId.userId) {
      await Notification.create({
        userId: appointment.patientId.userId,
        title: `Appointment ${status}`,
        message: `Your appointment on ${appointment.date} has been updated to '${status}'.`,
        type: 'APPOINTMENT',
        link: '/appointments',
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/appointments/:id
 * Patient cancels appointment
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment has been cancelled.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
};
