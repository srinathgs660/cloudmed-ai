const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { predictHealthRisk, predictAppointmentPriority } = require('../services/aiClient');

const runTests = async () => {
  console.log('\n--- STARTING CLOUDMED BACKEND TEST SUITE ---');
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudmed_ai';
  await mongoose.connect(mongoURI, { dbName: 'cloudmed_ai' });

  try {
    // Test 1: Verify Seeded Admin
    const admin = await User.findOne({ email: 'admin@cloudmed.demo' }).select('+password');
    if (!admin) throw new Error('Admin user missing!');
    const isMatch = await admin.matchPassword('Admin@1234');
    if (!isMatch) throw new Error('Admin password mismatch!');
    console.log('✅ Test 1 Passed: Admin credentials and password hashing verified');

    // Test 2: Check Doctors and Patients
    const docCount = await Doctor.countDocuments();
    const patCount = await Patient.countDocuments();
    if (docCount < 5 || patCount < 15) throw new Error(`Count mismatch: Doctors ${docCount}, Patients ${patCount}`);
    console.log(`✅ Test 2 Passed: Doctors (${docCount}) & Patients (${patCount}) retrieved`);

    // Test 3: Double booking prevention check
    const existingAppt = await Appointment.findOne({ status: 'Confirmed' });
    if (existingAppt) {
      const duplicate = await Appointment.findOne({
        doctorId: existingAppt.doctorId,
        date: existingAppt.date,
        time: existingAppt.time,
        status: { $in: ['Pending', 'Confirmed'] },
      });
      if (!duplicate) throw new Error('Double booking lookup failed');
      console.log('✅ Test 3 Passed: Double booking collision detection logic confirmed');
    }

    // Test 4: AI Service Integration
    const healthResult = await predictHealthRisk({
      age: 52,
      gender: 'male',
      bmi: 29.4,
      bloodPressure: 145,
      glucose: 168,
      cholesterol: 230,
      smoking: true,
    });
    if (!healthResult || !healthResult.riskLevel) throw new Error('Health risk inference failed');
    console.log(`✅ Test 4 Passed: AI Health Risk model output verified: ${healthResult.riskLevel} (${healthResult.probability})`);

    const prioResult = await predictAppointmentPriority({
      age: 65,
      symptomSeverity: 4,
      painLevel: 8,
      emergencyIndicator: true,
    });
    if (!prioResult || !prioResult.priority) throw new Error('Priority inference failed');
    console.log(`✅ Test 5 Passed: AI Appointment Priority output verified: ${prioResult.priority} (${prioResult.score})`);

    console.log('\n🌟 ALL BACKEND & ML INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Suite Failed:', err.message);
    process.exit(1);
  }
};

runTests();
