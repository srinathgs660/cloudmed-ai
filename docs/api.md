# REST API Specification — CloudMed AI

Base URL: `http://localhost:5000/api` (Local) / `https://cloudmed-api.onrender.com/api` (Production)

All protected endpoints require HTTP Header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new patient account and profile |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token & role |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user session profile |
| `POST` | `/api/auth/logout` | Protected | Invalidate client session token |

### Example: Login
**Request:**
```json
POST /api/auth/login
{
  "email": "admin@cloudmed.demo",
  "password": "Admin@1234"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6704cc01...",
    "name": "System Administrator",
    "email": "admin@cloudmed.demo",
    "role": "ADMIN"
  }
}
```

---

## 2. Patients (`/api/patients`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/patients` | Admin, Doctor | List patients with pagination, search, & risk tier filter |
| `GET` | `/api/patients/:id` | Authenticated | Retrieve comprehensive longitudinal health profile |
| `POST` | `/api/patients` | Admin, Doctor | Create new patient record |
| `PUT` | `/api/patients/:id` | Admin, Doctor | Update patient demographics & clinical metadata |
| `DELETE` | `/api/patients/:id` | Admin | Soft-deactivate patient account |

---

## 3. Doctors (`/api/doctors`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Public / Protected | List physicians with department, specialty, & search filters |
| `GET` | `/api/doctors/:id` | Public / Protected | Get doctor profile and active consultation schedule |
| `POST` | `/api/doctors` | Admin | Create doctor profile with credentials |
| `PUT` | `/api/doctors/:id` | Admin, Doctor | Update doctor bio, consultation fee, or availability |
| `DELETE` | `/api/doctors/:id` | Admin | Deactivate doctor profile |

---

## 4. Departments (`/api/departments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Public / Protected | List all departments with active doctor counts |
| `POST` | `/api/departments` | Admin | Create new clinical department |
| `PUT` | `/api/departments/:id` | Admin | Edit department details or head physician |
| `DELETE` | `/api/departments/:id` | Admin | Toggle department active/inactive status |

---

## 5. Appointments (`/api/appointments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Authenticated | List appointments scoped by user role & filters |
| `GET` | `/api/appointments/:id` | Authenticated | Get appointment details |
| `POST` | `/api/appointments` | Authenticated | Book consultation with double-booking check & AI triage |
| `PUT` | `/api/appointments/:id/status`| Admin, Doctor | Update status (`Confirmed`, `Completed`, `Cancelled`) |
| `DELETE`| `/api/appointments/:id` | Authenticated | Cancel consultation booking |

---

## 6. Medical Records & Prescriptions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/medical-records` | Authenticated | List clinical consultation records |
| `POST` | `/api/medical-records` | Doctor, Admin | Create clinical diagnosis and treatment entry |
| `GET` | `/api/prescriptions` | Authenticated | List medical prescriptions |
| `POST` | `/api/prescriptions` | Doctor, Admin | Issue multi-drug pharmaceutical regimen |

---

## 7. Reports & Cloud Storage (`/api/reports`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Authenticated | List archived medical reports |
| `POST` | `/api/reports/upload` | Authenticated | Multi-part upload to Cloudinary/local storage |
| `POST` | `/api/reports/:id/summarize`| Authenticated | Run AI summarization on report text |

---

## 8. AI Microservice Proxy (`/api/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/health-risk` | Authenticated | Execute Random Forest risk prediction & persist result |
| `POST` | `/api/ai/appointment-priority`| Authenticated | Compute ML priority triage score (LOW, MEDIUM, HIGH) |
| `POST` | `/api/ai/summarize-report` | Authenticated | Run NLP extractive summarizer on raw medical note |
| `GET` | `/api/ai/assessments` | Authenticated | Fetch patient AI screening audit logs |

### Example: AI Health Risk Prediction
**Request:**
```json
POST /api/ai/health-risk
{
  "age": 52,
  "gender": "male",
  "bmi": 29.4,
  "bloodPressure": 145,
  "glucose": 168,
  "cholesterol": 230,
  "smoking": true
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "riskLevel": "High",
  "probability": 0.89,
  "classProbabilities": {
    "Low": 0.02,
    "Medium": 0.09,
    "High": 0.89
  },
  "message": "Higher risk indicators detected. Consult a qualified healthcare professional.",
  "keyFactors": [
    "Overweight BMI (29.4 kg/m²)",
    "Stage 2 Hypertension range (145 mmHg systolic)",
    "Hyperglycemia range (168 mg/dL fasting)",
    "Borderline high cholesterol (230 mg/dL)",
    "Active tobacco consumption"
  ],
  "disclaimer": "AI-generated risk assessment for educational/support purposes only. It is not a medical diagnosis."
}
```

---

## 9. Dashboard Analytics (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | Real-time KPIs, status pipelines, Recharts series |
| `GET` | `/api/dashboard/doctor` | Doctor | Today's patient queue and risk overview |
| `GET` | `/api/dashboard/patient` | Patient | Next appointment, records, and latest risk card |
| `GET` | `/api/dashboard/ai-analytics`| Authenticated | Dedicated AI Insights risk and priority distributions |
