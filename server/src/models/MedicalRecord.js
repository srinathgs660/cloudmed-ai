const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    symptoms: {
      type: [String],
      required: [true, 'Please provide observed symptoms'],
    },
    diagnosis: {
      type: String,
      required: [true, 'Please provide clinical diagnosis'],
    },
    notes: {
      type: String,
      default: '',
    },
    treatment: {
      type: String,
      required: [true, 'Please provide treatment plan'],
    },
    followUpDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
