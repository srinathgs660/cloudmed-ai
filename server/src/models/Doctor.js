const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
    },
    qualification: {
      type: String,
      required: [true, 'Please provide qualification (e.g. MBBS, MD)'],
    },
    experience: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      timeSlots: {
        type: [String],
        default: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      },
    },
    bio: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
