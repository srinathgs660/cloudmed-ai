const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

/**
 * @route GET /api/prescriptions
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    let query = {};

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patientId = patient._id;
    } else if (req.user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (patientId) query.patientId = patientId;
      else if (doc) query.doctorId = doc._id;
    } else {
      if (patientId) query.patientId = patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialization qualification' },
      })
      .populate('medicalRecordId', 'diagnosis visitDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/prescriptions/:id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialization qualification' },
      })
      .populate('medicalRecordId');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/prescriptions
 * Doctor creates prescription
 */
const createPrescription = async (req, res, next) => {
  try {
    let { patientId, doctorId, medicalRecordId, medicines, instructions } = req.body;

    if (req.user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (!doc) return res.status(400).json({ success: false, message: 'Doctor profile not found.' });
      doctorId = doc._id;
    }

    if (!patientId || !medicines || !medicines.length) {
      return res.status(400).json({
        success: false,
        message: 'Patient and at least one medicine item are required.',
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      medicalRecordId,
      medicines,
      instructions: instructions || '',
    });

    // Notify patient
    const patientDoc = await Patient.findById(patientId);
    if (patientDoc && patientDoc.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        title: 'New Prescription Issued',
        message: `Dr. has prescribed ${medicines.length} medicine(s) for your care regimen.`,
        type: 'PRESCRIPTION',
        link: `/prescriptions/${prescription._id}`,
      });
    }

    const populated = await Prescription.findById(prescription._id)
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
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
};
