const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: String,
      required: true,
    },
    dosage: {
      type: String, // e.g. "500 mg"
      required: true,
    },
    frequency: {
      type: String, // e.g. "2 times/day"
      required: true,
    },
    duration: {
      type: String, // e.g. "5 days"
      required: true,
    },
    instructions: {
      type: String, // e.g. "After food"
      default: 'As directed',
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      required: false,
    },
    medicines: {
      type: [medicineItemSchema],
      required: [true, 'Please provide at least one medicine'],
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
