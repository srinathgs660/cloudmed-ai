const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: 'O+',
    },
    address: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    allergies: {
      type: [String],
      default: [],
    },
    existingConditions: {
      type: [String],
      default: [],
    },
    smokingStatus: {
      type: Boolean,
      default: false,
    },
    bmi: {
      type: Number,
      default: 23.5,
    },
    latestRiskScore: {
      level: { type: String, enum: ['Low', 'Medium', 'High', 'Not Assessed'], default: 'Not Assessed' },
      probability: { type: Number, default: 0 },
      assessedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
