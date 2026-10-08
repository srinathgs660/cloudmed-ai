require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const MedicalReport = require('../models/MedicalReport');
const AIAssessment = require('../models/AIAssessment');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudmed_ai';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { dbName: 'cloudmed_ai' });
    console.log('[Seed] Connected. Clearing previous seed collections...');

    await Promise.all([
      User.deleteMany(),
      Patient.deleteMany(),
      Doctor.deleteMany(),
      Department.deleteMany(),
      Appointment.deleteMany(),
      MedicalRecord.deleteMany(),
      Prescription.deleteMany(),
      MedicalReport.deleteMany(),
      AIAssessment.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seed] Previous records purged.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@cloudmed.demo',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    console.log(`[Seed] Admin created: ${adminUser.email} / (Admin@1234)`);

    // 2. Create Departments
    const departmentData = [
      { name: 'Cardiology', description: 'Comprehensive heart & cardiovascular care', headDoctorName: 'Dr. Arun Kumar', iconName: 'HeartPulse' },
      { name: 'General Medicine', description: 'Primary healthcare and metabolic diagnostics', headDoctorName: 'Dr. Sarah Jenkins', iconName: 'Stethoscope' },
      { name: 'Neurology', description: 'Advanced neurological diagnostics and therapeutics', headDoctorName: 'Dr. Vikram Patel', iconName: 'Brain' },
      { name: 'Orthopedics', description: 'Musculoskeletal surgery and rehabilitation', headDoctorName: 'Dr. Michael Chen', iconName: 'Activity' },
      { name: 'Pediatrics', description: 'Child and adolescent healthcare services', headDoctorName: 'Dr. Elena Rostova', iconName: 'Baby' },
      { name: 'Dermatology', description: 'Skin pathology, allergy and aesthetic dermatology', headDoctorName: 'Dr. Anita Roy', iconName: 'Sparkles' },
    ];
    const createdDepts = await Department.insertMany(departmentData);
    console.log(`[Seed] ${createdDepts.length} Departments created.`);

    // 3. Create 5 Doctors
    const doctorProfiles = [
      {
        name: 'Dr. Arun Kumar',
        email: 'doctor.arun@cloudmed.demo',
        phone: '+1 (555) 201-8841',
        deptIndex: 0, // Cardiology
        specialization: 'Interventional Cardiology',
        qualification: 'MBBS, MD (Cardiology), FACC',
        experience: 14,
        consultationFee: 120,
        bio: 'Senior cardiologist with over 14 years specializing in ischemic heart disease and preventive cardiovascular triage.',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'doctor.sarah@cloudmed.demo',
        phone: '+1 (555) 201-8842',
        deptIndex: 1, // General Medicine
        specialization: 'Internal & Preventative Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experience: 11,
        consultationFee: 85,
        bio: 'Consultant physician focusing on lifestyle metabolic disorders, diabetes management, and chronic illness mitigation.',
        image: 'https://images.unsplash.com/photo-1594824813593-54b207555627?w=150',
      },
      {
        name: 'Dr. Vikram Patel',
        email: 'doctor.vikram@cloudmed.demo',
        phone: '+1 (555) 201-8843',
        deptIndex: 2, // Neurology
        specialization: 'Clinical Neurophysiology',
        qualification: 'MBBS, DM (Neurology)',
        experience: 9,
        consultationFee: 140,
        bio: 'Neurologist with clinical expertise in migraine management, cerebrovascular risk profiling, and peripheral neuropathy.',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
      },
      {
        name: 'Dr. Michael Chen',
        email: 'doctor.chen@cloudmed.demo',
        phone: '+1 (555) 201-8844',
        deptIndex: 3, // Orthopedics
        specialization: 'Joint Reconstruction & Sports Medicine',
        qualification: 'MBBS, MS (Orthopedics), MCh',
        experience: 16,
        consultationFee: 110,
        bio: 'Orthopedic specialist in joint preservation, minimally invasive arthroscopy, and spine mobility recovery.',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'doctor.elena@cloudmed.demo',
        phone: '+1 (555) 201-8845',
        deptIndex: 4, // Pediatrics
        specialization: 'Pediatric Care & Neonatology',
        qualification: 'MBBS, MD (Pediatrics), DCH',
        experience: 8,
        consultationFee: 75,
        bio: 'Compassionate pediatrician focusing on developmental milestones, preventive vaccination, and adolescent immunology.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      },
    ];

    const createdDoctors = [];
    for (const d of doctorProfiles) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        password: 'Doctor@1234',
        role: 'DOCTOR',
        phone: d.phone,
        profileImage: d.image,
      });

      const doc = await Doctor.create({
        userId: u._id,
        departmentId: createdDepts[d.deptIndex]._id,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        consultationFee: d.consultationFee,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'],
        },
        bio: d.bio,
      });
      createdDoctors.push(doc);
    }
    console.log(`[Seed] ${createdDoctors.length} Doctors created (password: Doctor@1234).`);

    // 4. Create 15 Patients
    const patientRaw = [
      { name: 'Rahul Sharma', email: 'rahul.patient@cloudmed.demo', gender: 'male', age: 48, blood: 'O+', bmi: 28.4, smoker: false, risk: 'Medium', prob: 0.72 },
      { name: 'Priya Iyer', email: 'priya.patient@cloudmed.demo', gender: 'female', age: 34, blood: 'A+', bmi: 22.1, smoker: false, risk: 'Low', prob: 0.88 },
      { name: 'Arjun Das', email: 'arjun.patient@cloudmed.demo', gender: 'male', age: 58, blood: 'B+', bmi: 31.8, smoker: true, risk: 'High', prob: 0.89 },
      { name: 'Neha Varma', email: 'neha.patient@cloudmed.demo', gender: 'female', age: 29, blood: 'AB+', bmi: 21.5, smoker: false, risk: 'Low', prob: 0.94 },
      { name: 'David Miller', email: 'david.m@cloudmed.demo', gender: 'male', age: 62, blood: 'O-', bmi: 29.8, smoker: true, risk: 'High', prob: 0.85 },
      { name: 'Ananya Roy', email: 'ananya.r@cloudmed.demo', gender: 'female', age: 41, blood: 'A-', bmi: 25.4, smoker: false, risk: 'Low', prob: 0.81 },
      { name: 'Karan Mehra', email: 'karan.m@cloudmed.demo', gender: 'male', age: 53, blood: 'B-', bmi: 27.9, smoker: true, risk: 'Medium', prob: 0.69 },
      { name: 'Sneha Patel', email: 'sneha.p@cloudmed.demo', gender: 'female', age: 37, blood: 'O+', bmi: 24.2, smoker: false, risk: 'Low', prob: 0.90 },
      { name: 'Robert King', email: 'robert.k@cloudmed.demo', gender: 'male', age: 67, blood: 'AB-', bmi: 32.5, smoker: true, risk: 'High', prob: 0.92 },
      { name: 'Meera Nambiar', email: 'meera.n@cloudmed.demo', gender: 'female', age: 45, blood: 'A+', bmi: 26.8, smoker: false, risk: 'Medium', prob: 0.74 },
      { name: 'Siddharth Rao', email: 'sid.rao@cloudmed.demo', gender: 'male', age: 31, blood: 'O+', bmi: 23.0, smoker: false, risk: 'Low', prob: 0.95 },
      { name: 'Fatima Sheikh', email: 'fatima.s@cloudmed.demo', gender: 'female', age: 52, blood: 'B+', bmi: 30.1, smoker: false, risk: 'High', prob: 0.81 },
      { name: 'Amit Saxena', email: 'amit.s@cloudmed.demo', gender: 'male', age: 44, blood: 'O-', bmi: 27.2, smoker: false, risk: 'Medium', prob: 0.70 },
      { name: 'Claire Wilson', email: 'claire.w@cloudmed.demo', gender: 'female', age: 26, blood: 'A+', bmi: 20.8, smoker: false, risk: 'Low', prob: 0.96 },
      { name: 'Vikram Joshi', email: 'vikram.j@cloudmed.demo', gender: 'male', age: 55, blood: 'B+', bmi: 28.7, smoker: true, risk: 'Medium', prob: 0.77 },
    ];

    const createdPatients = [];
    for (const p of patientRaw) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        password: 'Patient@1234',
        role: 'PATIENT',
        phone: `+1 (555) 700-${Math.floor(1000 + Math.random() * 9000)}`,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name.replace(' ', '')}`,
      });

      const pt = await Patient.create({
        userId: u._id,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.blood,
        address: `${100 + Math.floor(Math.random() * 800)} Healthway Blvd, Metro City`,
        emergencyContact: {
          name: 'Relative Contact',
          phone: '+1 (555) 999-4421',
          relationship: 'Spouse / Parent',
        },
        allergies: p.risk === 'High' ? ['Penicillin', 'Sulfa drugs'] : ['Dust mites'],
        existingConditions: p.risk === 'High' ? ['Hypertension', 'Type 2 Diabetes'] : (p.risk === 'Medium' ? ['Pre-hypertension'] : []),
        smokingStatus: p.smoker,
        bmi: p.bmi,
        latestRiskScore: {
          level: p.risk,
          probability: p.prob,
          assessedAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000)),
        },
      });
      createdPatients.push(pt);
    }
    console.log(`[Seed] ${createdPatients.length} Patients created (password: Patient@1234).`);

    // 5. Create 25 Realistic Appointments
    const appointmentDates = [
      '2026-10-08',
      '2026-10-08',
      '2026-10-08',
      '2026-10-09',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-05',
      '2026-10-04',
      '2026-10-03',
      '2026-10-02',
    ];
    const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
    const reasons = [
      'Persistent chest tightness and exertion shortness of breath',
      'Routine annual metabolic checkup and fasting panel review',
      'Migraine episodes accompanied by photophobia and nausea',
      'Chronic knee joint stiffness after physical running',
      'Recurrent allergic skin rash and persistent hives',
      'Post-prandial glucose spike assessment and lifestyle coaching',
      'Hypertension medication adjustment and blood pressure review',
      'Pediatric seasonal vaccination and growth milestone assessment',
    ];

    const createdAppointments = [];
    for (let i = 0; i < 24; i++) {
      const patient = createdPatients[i % createdPatients.length];
      const doctor = createdDoctors[i % createdDoctors.length];
      const date = appointmentDates[i % appointmentDates.length];
      const time = times[i % times.length];
      const reason = reasons[i % reasons.length];

      let status = 'Confirmed';
      if (date < '2026-10-08') status = 'Completed';
      else if (i % 5 === 0) status = 'Pending';
      else if (i === 13) status = 'Cancelled';

      let priority = 'MEDIUM';
      let priorityScore = 0.65;
      if (patient.latestRiskScore.level === 'High' || reason.includes('chest tightness')) {
        priority = 'HIGH';
        priorityScore = 0.91;
      } else if (patient.latestRiskScore.level === 'Low' && reason.includes('Routine')) {
        priority = 'LOW';
        priorityScore = 0.38;
      }

      const appt = await Appointment.create({
        patientId: patient._id,
        doctorId: doctor._id,
        departmentId: doctor.departmentId,
        date,
        time,
        reason,
        priority,
        priorityScore,
        priorityReason: priority === 'HIGH' ? 'Acute cardiovascular risk indicators detected' : 'Standard clinical outpatient consult',
        status,
        notes: status === 'Completed' ? 'Patient evaluated, treatment initiated.' : '',
      });
      createdAppointments.push(appt);
    }
    console.log(`[Seed] ${createdAppointments.length} Appointments seeded.`);

    // 6. Medical Records for Completed Appointments
    const completedApps = createdAppointments.filter((a) => a.status === 'Completed');
    for (const app of completedApps) {
      const record = await MedicalRecord.create({
        patientId: app.patientId,
        doctorId: app.doctorId,
        appointmentId: app._id,
        visitDate: new Date(app.date),
        symptoms: ['Exertional dyspnea', 'Mild peripheral fatigue', 'Elevated systolic pressure'],
        diagnosis: 'Essential Hypertension Stage 1 with metabolic syndrome risk',
        treatment: 'Prescribed daily ACE-inhibitor, advised dietary sodium reduction (<2g/day) and 30 min daily brisk walking.',
        notes: 'Follow-up lipid and renal function profile requested in 4 weeks.',
        followUpDate: new Date('2026-11-05'),
      });

      // Corresponding Prescription
      await Prescription.create({
        patientId: app.patientId,
        doctorId: app.doctorId,
        medicalRecordId: record._id,
        medicines: [
          { medicine: 'Ramipril', dosage: '5 mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning with water' },
          { medicine: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at bedtime after dinner' },
        ],
        instructions: 'Monitor blood pressure log every morning. Report dizziness or swelling promptly.',
      });
    }
    console.log(`[Seed] Seeded Medical Records and Prescriptions.`);

    // 7. Medical Reports with Structured AI Summaries
    const reportsData = [
      {
        patientId: createdPatients[0]._id, // Rahul
        fileName: 'Comprehensive_Metabolic_Panel.pdf',
        fileType: 'application/pdf',
        fileSize: 248102,
        cloudinaryUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
        reportType: 'Metabolic Blood Panel',
        summary: `CLINICAL SUMMARY\nType: Metabolic Blood Panel\nClinical Urgency: Attention\n\nSYMPTOMS:\n• Exertional fatigue\n• Occasional headaches\n\nKEY FINDINGS:\n• Fasting Glucose: 138 mg/dL (Elevated)\n• Total Cholesterol: 232 mg/dL (Borderline High)\n• Serum Creatinine: 0.9 mg/dL (Normal)\n\nFOLLOW-UP & PLAN:\n• Dietary counseling for carbohydrate control\n• Repeat fasting panel in 60 days`,
        structuredSummary: {
          symptoms: ['Exertional fatigue', 'Occasional headaches'],
          keyFindings: ['Fasting Glucose: 138 mg/dL (Elevated)', 'Total Cholesterol: 232 mg/dL'],
          followUp: ['Dietary counseling', 'Repeat fasting panel in 60 days'],
          urgency: 'Attention',
        },
      },
      {
        patientId: createdPatients[2]._id, // Arjun (High Risk)
        fileName: 'Stress_Echocardiogram_Report.pdf',
        fileType: 'application/pdf',
        fileSize: 491024,
        cloudinaryUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800',
        reportType: 'Cardiovascular Diagnostic',
        summary: `CLINICAL SUMMARY\nType: Stress Echocardiogram\nClinical Urgency: Urgent\n\nSYMPTOMS:\n• Substernal chest tightness on treadmill stage 3\n• Dyspnea on moderate exertion\n\nKEY FINDINGS:\n• Left ventricular ejection fraction (LVEF): 52%\n• Mild anterior wall hypokinesia during peak exertion\n• Resting blood pressure: 154/96 mmHg\n\nFOLLOW-UP & PLAN:\n• Cardiology consultation for coronary angiography evaluation\n• Intensify dual antiplatelet and statin therapy`,
        structuredSummary: {
          symptoms: ['Substernal chest tightness', 'Dyspnea on exertion'],
          keyFindings: ['LVEF: 52%', 'Mild anterior wall hypokinesia', 'Resting BP: 154/96 mmHg'],
          followUp: ['Coronary angiography evaluation', 'Dual antiplatelet therapy'],
          urgency: 'Urgent',
        },
      },
    ];
    await MedicalReport.insertMany(reportsData);
    console.log(`[Seed] Seeded Medical Reports.`);

    // 8. Seed AI Assessments
    const aiAssessmentsData = [
      {
        patientId: createdPatients[0]._id,
        assessmentType: 'HEALTH_RISK',
        inputData: { age: 48, gender: 'male', bmi: 28.4, bloodPressure: 138, glucose: 135, cholesterol: 228, smoking: false },
        result: 'Medium',
        probability: 0.72,
        classProbabilities: { Low: 0.14, Medium: 0.72, High: 0.14 },
        message: 'Moderate risk indicators observed. Preventative lifestyle adjustments advised.',
        keyFactors: ['Overweight BMI (28.4 kg/m²)', 'Prehypertension systolic (138 mmHg)', 'Impaired fasting glucose (135 mg/dL)'],
      },
      {
        patientId: createdPatients[2]._id,
        assessmentType: 'HEALTH_RISK',
        inputData: { age: 58, gender: 'male', bmi: 31.8, bloodPressure: 155, glucose: 172, cholesterol: 260, smoking: true },
        result: 'High',
        probability: 0.89,
        classProbabilities: { Low: 0.02, Medium: 0.09, High: 0.89 },
        message: 'Higher risk indicators detected. Consult a qualified healthcare professional.',
        keyFactors: ['Obese BMI (31.8 kg/m²)', 'Stage 2 Hypertension range (155 mmHg)', 'Hyperglycemia (172 mg/dL)', 'Active tobacco consumption'],
      },
      {
        patientId: createdPatients[1]._id,
        assessmentType: 'HEALTH_RISK',
        inputData: { age: 34, gender: 'female', bmi: 22.1, bloodPressure: 112, glucose: 88, cholesterol: 165, smoking: false },
        result: 'Low',
        probability: 0.88,
        classProbabilities: { Low: 0.88, Medium: 0.09, High: 0.03 },
        message: 'Favorable metabolic profile indicated. Continue routine wellness maintenance.',
        keyFactors: ['Vitals and metabolic indicators appear within conventional ranges.'],
      },
    ];
    await AIAssessment.insertMany(aiAssessmentsData);
    console.log(`[Seed] Seeded AI Assessments.`);

    // 9. Initial Notifications for Admin, Doctors, and Patients
    await Notification.create([
      {
        userId: adminUser._id,
        title: 'System Initialized',
        message: 'CloudMed AI hospital database seeded successfully with realistic clinical demo data.',
        type: 'SYSTEM',
      },
      {
        userId: createdDoctors[0].userId,
        title: 'Daily Clinic Schedule',
        message: 'You have 4 clinical consultations scheduled today.',
        type: 'APPOINTMENT',
        link: '/appointments',
      },
      {
        userId: createdPatients[0].userId,
        title: 'Upcoming Clinical Appointment',
        message: 'Your appointment with Dr. Arun Kumar is confirmed for 10:00 AM.',
        type: 'APPOINTMENT',
        link: '/appointments',
      },
    ]);

    console.log('\n' + '='.repeat(60));
    console.log('CLOUDMED AI - DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('Demo Credentials for Viva / Testing:');
    console.log('------------------------------------------------------------');
    console.log('ADMIN:   admin@cloudmed.demo     / Admin@1234');
    console.log('DOCTOR:  doctor.arun@cloudmed.demo / Doctor@1234');
    console.log('DOCTOR:  doctor.sarah@cloudmed.demo/ Doctor@1234');
    console.log('PATIENT: rahul.patient@cloudmed.demo/ Patient@1234');
    console.log('PATIENT: priya.patient@cloudmed.demo/ Patient@1234');
    console.log('------------------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
