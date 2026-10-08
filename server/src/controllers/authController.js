const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'cloudmed_super_secure_jwt_secret_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route POST /api/auth/register
 * Patient self-registration
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'PATIENT',
      phone: phone || '',
    });

    // Create corresponding Patient profile
    let age = undefined;
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      age = new Date().getFullYear() - birthYear;
    }

    const patient = await Patient.create({
      userId: user._id,
      dateOfBirth: dateOfBirth || null,
      age: age || 30,
      gender: gender || 'male',
      bloodGroup: bloodGroup || 'O+',
      address: address || '',
    });

    // Welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to CloudMed AI',
      message: 'Your patient account has been created successfully. You can now schedule appointments and access AI wellness screenings.',
      type: 'SYSTEM',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patient._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact administration.' });
    }

    const token = generateToken(user._id);

    let roleProfileId = null;
    if (user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) roleProfileId = patient._id;
    } else if (user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) roleProfileId = doctor._id;
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        patientId: user.role === 'PATIENT' ? roleProfileId : undefined,
        doctorId: user.role === 'DOCTOR' ? roleProfileId : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let patient = null;
    let doctor = null;

    if (user.role === 'PATIENT') {
      patient = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      doctor = await Doctor.findOne({ userId: user._id }).populate('departmentId', 'name');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        patient,
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
