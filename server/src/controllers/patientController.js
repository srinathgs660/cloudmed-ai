const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const AIAssessment = require('../models/AIAssessment');

/**
 * @route GET /api/patients
 * List patients with search, blood group filter, risk filter, pagination
 */
const getPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, riskLevel, page = 1, limit = 20 } = req.query;

    let userQuery = { role: 'PATIENT' };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const matchedUsers = await User.find(userQuery).select('_id');
    const matchedUserIds = matchedUsers.map((u) => u._id);

    let query = { userId: { $in: matchedUserIds } };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (riskLevel && riskLevel !== 'All') {
      query['latestRiskScore.level'] = riskLevel;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const patients = await Patient.find(query)
      .populate('userId', 'name email phone profileImage isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/patients/:id
 * Retrieve patient by ID along with full clinical profile:
 * Personal info, Medical Info, Appointment History, Records, Prescriptions, Reports, AI Assessments
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'userId',
      'name email phone profileImage isActive createdAt'
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // Role-based security: Patients can only view their own profile
    if (req.user.role === 'PATIENT' && req.user._id.toString() !== patient.userId._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient profile.' });
    }

    // Fetch related records concurrently
    const [appointments, medicalRecords, prescriptions, reports, aiAssessments] = await Promise.all([
      Appointment.find({ patientId: patient._id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
        .populate('departmentId', 'name')
        .sort({ date: -1, time: -1 }),
      MedicalRecord.find({ patientId: patient._id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ visitDate: -1 }),
      Prescription.find({ patientId: patient._id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 }),
      MedicalReport.find({ patientId: patient._id }).sort({ createdAt: -1 }),
      AIAssessment.find({ patientId: patient._id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        patient,
        appointments,
        medicalRecords,
        prescriptions,
        reports,
        aiAssessments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/patients
 * Admin or Staff creates new patient
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      existingConditions,
      smokingStatus,
      bmi,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Patient@1234',
      role: 'PATIENT',
      phone: phone || '',
    });

    let calcAge = age;
    if (!calcAge && dateOfBirth) {
      calcAge = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    }

    const patient = await Patient.create({
      userId: user._id,
      dateOfBirth,
      age: calcAge || 30,
      gender: gender || 'male',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
      emergencyContact: emergencyContact || {},
      allergies: allergies || [],
      existingConditions: existingConditions || [],
      smokingStatus: Boolean(smokingStatus),
      bmi: Number(bmi) || 24,
    });

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/patients/:id
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const {
      name,
      phone,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      existingConditions,
      smokingStatus,
      bmi,
    } = req.body;

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(patient.userId, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        ...(dateOfBirth && { dateOfBirth }),
        ...(age && { age }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodGroup }),
        ...(address !== undefined && { address }),
        ...(emergencyContact && { emergencyContact }),
        ...(allergies && { allergies }),
        ...(existingConditions && { existingConditions }),
        ...(smokingStatus !== undefined && { smokingStatus }),
        ...(bmi && { bmi }),
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone profileImage');

    res.status(200).json({
      success: true,
      data: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/patients/:id
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Soft deactivate user
    await User.findByIdAndUpdate(patient.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Patient deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
