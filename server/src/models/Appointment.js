const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please select appointment date'],
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: [true, 'Please select appointment time'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for consultation'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    priorityScore: {
      type: Number,
      default: 0.5,
    },
    priorityReason: {
      type: String,
      default: 'Routine clinical consultation',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to help check/prevent double booking for the same doctor at the same date & time
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
