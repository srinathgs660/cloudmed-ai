const mongoose = require('mongoose');

const aiAssessmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    assessmentType: {
      type: String,
      enum: ['HEALTH_RISK', 'APPOINTMENT_PRIORITY', 'REPORT_SUMMARY'],
      default: 'HEALTH_RISK',
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: String, // e.g. "High", "Medium", "Low", "HIGH", "Routine"
      required: true,
    },
    probability: {
      type: Number,
      default: 0,
    },
    classProbabilities: {
      type: Map,
      of: Number,
    },
    message: {
      type: String,
      default: '',
    },
    keyFactors: {
      type: [String],
      default: [],
    },
    disclaimer: {
      type: String,
      default: 'AI-generated risk assessment for educational/support purposes only. It is not a medical diagnosis.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAssessment', aiAssessmentSchema);
