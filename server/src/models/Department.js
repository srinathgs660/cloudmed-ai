const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide department name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    headDoctorName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    iconName: {
      type: String,
      default: 'Activity',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
