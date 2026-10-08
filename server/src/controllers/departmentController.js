const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

/**
 * @route GET /api/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Aggregate doctor count per department
    const doctorCounts = await Doctor.aggregate([
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    doctorCounts.forEach((dc) => {
      countMap[dc._id.toString()] = dc.count;
    });

    const dataWithCounts = departments.map((dept) => ({
      ...dept.toObject(),
      doctorCount: countMap[dept._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: dataWithCounts.length,
      data: dataWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, headDoctorName, iconName } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists.' });
    }

    const department = await Department.create({
      name,
      description,
      headDoctorName,
      iconName: iconName || 'Activity',
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, headDoctorName, status, iconName } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(headDoctorName !== undefined && { headDoctorName }),
        ...(status && { status }),
        ...(iconName && { iconName }),
      },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Toggle status to Inactive rather than breaking foreign keys
    department.status = department.status === 'Active' ? 'Inactive' : 'Active';
    await department.save();

    res.status(200).json({
      success: true,
      message: `Department status changed to ${department.status}`,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
