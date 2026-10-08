const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

/**
 * @route GET /api/medical-records
 */
const getMedicalRecords = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    let query = {};

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patientId = patient._id;
    } else if (req.user.role === 'DOCTOR') {
      if (patientId) query.patientId = patientId;
      // Doctor can query specific patient or all records they created
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (doc && !patientId) query.doctorId = doc._id;
    } else {
      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;
    }

    const records = await MedicalRecord.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/medical-records/:id
 */
const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialization' },
      });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    // Patient access check
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== record.patientId._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this medical record.' });
      }
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/medical-records
 * Doctors or Admins create record
 */
const createMedicalRecord = async (req, res, next) => {
  try {
    let { patientId, doctorId, appointmentId, visitDate, symptoms, diagnosis, notes, treatment, followUpDate } = req.body;

    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(400).json({ success: false, message: 'Doctor profile not found.' });
      doctorId = doctor._id;
    }

    if (!patientId || !diagnosis || !treatment) {
      return res.status(400).json({ success: false, message: 'Patient, diagnosis, and treatment plan are required.' });
    }

    const symptomsList = Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(',').map((s) => s.trim()) : []);

    const record = await MedicalRecord.create({
      patientId,
      doctorId,
      appointmentId,
      visitDate: visitDate || Date.now(),
      symptoms: symptomsList,
      diagnosis,
      notes: notes || '',
      treatment,
      followUpDate,
    });

    // Notify patient
    const patientDoc = await Patient.findById(patientId);
    if (patientDoc && patientDoc.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        title: 'New Medical Record Added',
        message: `Your medical record for diagnosis '${diagnosis}' has been updated in your patient portal.`,
        type: 'MEDICAL_RECORD',
        link: `/medical-records/${record._id}`,
      });
    }

    const populated = await MedicalRecord.findById(record._id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
};
