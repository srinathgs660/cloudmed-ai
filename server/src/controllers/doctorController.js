const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const cache = require('../utils/cache');

/**
 * @route GET /api/doctors
 * Public / Protected list with department filter, search, specialization filter
 */
const getDoctors = async (req, res, next) => {
  try {
    const { search, department, specialization, sortBy = 'experience', order = 'desc' } = req.query;

    const cacheKey = `doctors_${search || ''}_${department || ''}_${specialization || ''}_${sortBy}_${order}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let query = {};

    if (department) {
      if (department.match(/^[0-9a-fA-F]{24}$/)) {
        query.departmentId = department;
      } else {
        const deptDoc = await Department.findOne({ name: { $regex: department, $options: 'i' } }).lean();
        if (deptDoc) query.departmentId = deptDoc._id;
      }
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let userFilter = { role: 'DOCTOR' };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
      const matchedUsers = await User.find(userFilter).select('_id').lean();
      query.userId = { $in: matchedUsers.map((u) => u._id) };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone profileImage isActive')
      .populate('departmentId', 'name description')
      .sort(sortOptions)
      .lean();

    const responsePayload = {
      success: true,
      count: doctors.length,
      data: doctors,
    };

    cache.set(cacheKey, responsePayload, 60); // 60 seconds TTL

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/doctors/:id
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone profileImage isActive')
      .populate('departmentId', 'name description');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Get doctor's upcoming schedule
    const appointments = await Appointment.find({ doctorId: doctor._id, status: { $in: ['Pending', 'Confirmed'] } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ date: 1, time: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        doctor,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/doctors
 * Admin creates doctor
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      specialization,
      qualification,
      experience,
      consultationFee,
      availability,
      bio,
      profileImage,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Doctor@1234',
      role: 'DOCTOR',
      phone: phone || '',
      profileImage: profileImage || '',
    });

    const doctor = await Doctor.create({
      userId: user._id,
      departmentId,
      specialization,
      qualification,
      experience: Number(experience) || 5,
      consultationFee: Number(consultationFee) || 50,
      availability: availability || {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      },
      bio: bio || '',
    });

    const populated = await Doctor.findById(doctor._id)
      .populate('userId', 'name email phone profileImage')
      .populate('departmentId', 'name')
      .lean();

    cache.invalidatePrefix('doctors');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const {
      name,
      phone,
      profileImage,
      departmentId,
      specialization,
      qualification,
      experience,
      consultationFee,
      availability,
      bio,
    } = req.body;

    if (name || phone !== undefined || profileImage !== undefined) {
      await User.findByIdAndUpdate(doctor.userId, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(profileImage !== undefined && { profileImage }),
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        ...(departmentId && { departmentId }),
        ...(specialization && { specialization }),
        ...(qualification && { qualification }),
        ...(experience !== undefined && { experience }),
        ...(consultationFee !== undefined && { consultationFee }),
        ...(availability && { availability }),
        ...(bio !== undefined && { bio }),
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone profileImage')
      .populate('departmentId', 'name')
      .lean();

    cache.invalidatePrefix('doctors');

    res.status(200).json({
      success: true,
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    await User.findByIdAndUpdate(doctor.userId, { isActive: false });
    cache.invalidatePrefix('doctors');

    res.status(200).json({
      success: true,
      message: 'Doctor deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
