# Database Architecture & Schema Design — CloudMed AI

CloudMed AI utilizes **MongoDB Atlas**, a fully-managed multi-cloud document database. Data models are governed via Mongoose ODM schemas to enforce structural validation, referential consistency, and automatic timestamps.

---

## 1. Entity Relationship Overview

```
 ┌──────────────┐          1:1          ┌──────────────┐
 │     User     │───────────────────────│   Patient    │
 └──────┬───────┘                       └──────┬───────┘
        │                                      │
        │ 1:1                                  │ 1:N
        ▼                                      ▼
 ┌──────────────┐                       ┌──────────────┐
 │    Doctor    │                       │ Appointment  │
 └──────┬───────┘                       └──────┬───────┘
        │                                      │
        │ N:1                                  │ 1:1
        ▼                                      ▼
 ┌──────────────┐                       ┌──────────────┐
 │  Department  │                       │MedicalRecord │
 └──────────────┘                       └──────┬───────┘
                                               │
                                               │ 1:N
                                               ▼
                                        ┌──────────────┐
                                        │ Prescription │
                                        └──────────────┘
                                               ▲
                                        1:N    │
                                        ┌──────┴───────┐
                                        │MedicalReport │
                                        └──────────────┘
                                               ▲
                                        1:N    │
                                        ┌──────┴───────┐
                                        │ AIAssessment │
                                        └──────────────┘
```

---

## 2. Model Schemas

### 2.1 User (`users` collection)
Stores authentication credentials, security role, and profile details.
```javascript
{
  _id: ObjectId,
  name: String (required, trim),
  email: String (required, unique, lowercase),
  password: String (required, min 6, select: false, bcrypt hashed),
  role: String (enum: ['ADMIN', 'DOCTOR', 'PATIENT'], default: 'PATIENT'),
  phone: String,
  profileImage: String,
  isActive: Boolean (default: true),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.2 Patient (`patients` collection)
Clinical demographics, longitudinal biometric history, and allergy logs.
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', unique: true),
  dateOfBirth: Date,
  age: Number,
  gender: String (enum: ['male', 'female', 'other']),
  bloodGroup: String (enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  allergies: [String],
  existingConditions: [String],
  smokingStatus: Boolean,
  bmi: Number,
  latestRiskScore: {
    level: String (enum: ['Low', 'Medium', 'High', 'Not Assessed']),
    probability: Number,
    assessedAt: Date
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.3 Doctor (`doctors` collection)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', unique: true),
  departmentId: ObjectId (ref: 'Department', required: true),
  specialization: String (required),
  qualification: String (required),
  experience: Number,
  consultationFee: Number,
  availability: {
    days: [String],
    timeSlots: [String]
  },
  bio: String,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.4 Appointment (`appointments` collection)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'Patient', required: true),
  doctorId: ObjectId (ref: 'Doctor', required: true),
  departmentId: ObjectId (ref: 'Department'),
  date: String (YYYY-MM-DD, required),
  time: String (e.g., '10:00 AM', required),
  reason: String (required),
  priority: String (enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM'),
  priorityScore: Number,
  priorityReason: String,
  status: String (enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending'),
  notes: String,
  createdAt: ISODate,
  updatedAt: ISODate
}
```
**Indexing:** Compound index `{ doctorId: 1, date: 1, time: 1 }` prevents concurrent double booking.

### 2.5 Medical Record (`medicalrecords` collection)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'Patient', required: true),
  doctorId: ObjectId (ref: 'Doctor', required: true),
  appointmentId: ObjectId (ref: 'Appointment'),
  visitDate: Date (default: Date.now),
  symptoms: [String],
  diagnosis: String (required),
  notes: String,
  treatment: String (required),
  followUpDate: Date,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.6 Prescription (`prescriptions` collection)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'Patient', required: true),
  doctorId: ObjectId (ref: 'Doctor', required: true),
  medicalRecordId: ObjectId (ref: 'MedicalRecord'),
  medicines: [
    {
      medicine: String (required),
      dosage: String (required),
      frequency: String (required),
      duration: String (required),
      instructions: String
    }
  ],
  instructions: String,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.7 Medical Report (`medicalreports` collection)
Metadata for files stored in Cloudinary:
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'Patient', required: true),
  doctorId: ObjectId (ref: 'Doctor'),
  fileName: String,
  fileType: String,
  fileSize: Number,
  cloudinaryUrl: String,
  publicId: String,
  reportType: String,
  summary: String,
  structuredSummary: {
    symptoms: [String],
    keyFindings: [String],
    followUp: [String],
    urgency: String
  },
  uploadedBy: String (enum: ['PATIENT', 'DOCTOR', 'ADMIN']),
  createdAt: ISODate
}
```

### 2.8 AI Assessment (`aiassessments` collection)
Audit log for all executed machine learning inferences:
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'Patient', required: true),
  assessmentType: String (enum: ['HEALTH_RISK', 'APPOINTMENT_PRIORITY', 'REPORT_SUMMARY']),
  inputData: Schema.Types.Mixed,
  result: String,
  probability: Number,
  classProbabilities: Map,
  message: String,
  keyFactors: [String],
  disclaimer: String,
  createdAt: ISODate
}
```
