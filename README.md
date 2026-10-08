# CloudMed AI — Cloud-Based Intelligent Hospital Management System

> Cloud-Based Intelligent Hospital Management & Clinical AI Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/AI%20Service-FastAPI%20%2B%20Scikit--Learn-3776ab.svg)](https://fastapi.tiangolo.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248.svg)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary%20CDN-3448c5.svg)](https://cloudinary.com/)

---

## 1. Project Overview

**CloudMed AI** is a production-style, modular Hospital Management System developed to demonstrate how **predictive machine learning microservices and cloud databases** integrate into a modern clinical web platform.

### Problem Statement
Traditional hospital management software often relies on monolithic architectures and localized servers. They lack algorithmic triage of incoming patient bookings, maintain unstructured clinical documentation, and fail to leverage predictive analytics to identify patient health risks before acute complications arise.

### Proposed Solution
CloudMed AI decouples clinical operations from machine learning workflows through a 3-tier microservice architecture:
1. **React 18 Single Page Application:** Modern healthcare SaaS UI/UX featuring role-tailored dashboards and Recharts analytics.
2. **Node.js / Express REST API:** Secure gateway handling RBAC, scheduling validation, and Cloudinary media uploads.
3. **Python FastAPI Machine Learning Microservice:** Dedicated service executing Scikit-Learn Random Forest models for **Health Risk Prediction** (83.00% accuracy) and **Appointment Priority Triage** (86.40% accuracy), alongside extractive clinical report NLP summarization.

---

## 2. Key Features

### 🏥 Hospital Management System (HMS)
- **Role-Based Access Control (RBAC):** Admin, Doctor, and Patient roles with encrypted JWT sessions and bcrypt password hashing.
- **Patient Directory:** Longitudinal health records, allergies, chronic illness logs, emergency contacts, and blood-group categorization.
- **Doctor Directory:** Specialization mapping, consultation fees, and weekly availability schedules.
- **Appointment Management:** Real-time scheduling wizard with **double-booking collision prevention** and confirmation workflow.
- **Electronic Medical Records (EMR):** Physician visit notes, symptoms, clinical diagnoses, and follow-up tracking.
- **Prescription System:** Multi-medicine regimens with dosage, frequency, duration, and instructions.
- **Medical Report Archive:** PDF and image uploads stored in Cloudinary with indexed metadata.

### 🤖 Artificial Intelligence & Machine Learning
- **Patient Health Risk Prediction:** Evaluates 9 physiological indicators (Age, Gender, BMI, Systolic BP, Glucose, Cholesterol, Smoking, Physical Activity, Family History) to predict Low, Medium, or High risk with transparent contributing drivers.
- **Appointment Priority Triage:** Classifies consultation urgency into `LOW`, `MEDIUM`, or `HIGH` queues using patient acuity features.
- **Medical Report Summarizer:** Rule-assisted clinical NLP extractor structuring unstructured notes into Symptoms, Key Findings, and Urgency.
- **AI Insights Dashboard:** Executive analytics tracking risk distributions, priority breakdowns, and monthly trends.
- **Responsible AI Scope:** Prominently displays non-diagnostic educational disclaimers.

---

## 3. High-Level Architecture

```
                           INTERNET
                              │
                              ▼
                    ┌───────────────────┐
                    │   React Frontend  │
                    │ Vite + Tailwind   │
                    └─────────┬─────────┘
                              │ REST APIs (JWT)
                              ▼
                    ┌───────────────────┐
                    │ Node.js / Express │
                    │   Backend API     │
                    └───┬───────────┬───┘
                        │           │
            JSON Models │           │ File Streams
                        ▼           ▼
                 ┌───────────┐ ┌────────────────┐
                 │  MongoDB  │ │  Cloudinary    │
                 │   Atlas   │ │  File Storage  │
                 └───────────┘ └────────────────┘
                        │
                        │ Internal Microservice HTTP
                        ▼
             ┌─────────────────────┐
             │   Python FastAPI    │
             │   AI / ML Service   │
             └──────────┬──────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│ Health Risk ML   │          │ Priority ML      │
│ (Random Forest)  │          │ (Classifier)     │
└──────────────────┘          └──────────────────┘
```

---

## 4. Quick Start — Running Locally

### Prerequisites
- Node.js (v18+ or v24+)
- Python (v3.10+ or v3.13+)
- MongoDB (Running locally or a free MongoDB Atlas connection URI)

### Step 1: Clone and Seed Database

```bash
# 1. Install Server Dependencies
cd server
npm install

# 2. Seed Database with Realistic Demo Data (1 Admin, 5 Doctors, 15 Patients, 24 Appointments)
npm run seed

# 3. Run Backend Integration Test Suite
npm test
```

### Step 2: Start the Python AI Microservice

```bash
cd ../ai-service

# 1. Install AI Dependencies
pip install -r requirements.txt

# 2. (Optional) Re-train Machine Learning Models
python ml/train_health_model.py
python ml/train_priority_model.py

# 3. Start FastAPI Service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Swagger API Docs will be live at: `http://localhost:8000/docs`*

### Step 3: Start Node.js API Gateway

```bash
cd ../server
npm start
```
*API Gateway will be live at: `http://localhost:5000/api`*

### Step 4: Start React Frontend Client

```bash
cd ../client
npm install
npm run dev
```
*Open your browser at: `http://localhost:3000`*

---

## 5. Demo Accounts for Evaluation / Viva

The login page features **1-Click Demo Quick Fill Buttons** for seamless evaluation:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **ADMIN** | `admin@cloudmed.demo` | `Admin@1234` | Full hospital KPIs, manage patients, doctors, departments, AI analytics |
| **DOCTOR** | `doctor.arun@cloudmed.demo` | `Doctor@1234` | Consultation queue, patient records, create diagnoses & prescriptions |
| **DOCTOR** | `doctor.sarah@cloudmed.demo` | `Doctor@1234` | General medicine consultations, patient risk monitoring |
| **PATIENT** | `rahul.patient@cloudmed.demo` | `Patient@1234` | Book consultations, view prescriptions, execute AI Health Screening |
| **PATIENT** | `priya.patient@cloudmed.demo` | `Patient@1234` | Low-risk profile, view medical records, download reports |

---

## 6. Live Presentation Demo Flow

Follow this exact sequence for project presentations and viva examinations:

```
1. Public Landing Page (http://localhost:3000)
    ↓
2. Login Page (Click "Instant Demo Fill" -> Admin)
    ↓
3. Admin Executive Dashboard (Inspect Recharts KPI cards, status donut, and trend line)
    ↓
4. Patient Directory (Search "Arjun", view comprehensive longitudinal medical profile)
    ↓
5. Doctor Directory (Filter by "Cardiology", check fees and qualifications)
    ↓
6. Appointment Scheduling (Book consultation with double-booking check & AI priority score)
    ↓
7. Doctor Consultation (Confirm appointment & issue a 2-drug prescription regimen)
    ↓
8. AI Health Risk Assessment (Adjust systolic BP to 155 mmHg & glucose to 170 mg/dL -> Observe High Risk Card)
    ↓
9. Medical Reports & AI Summarizer (Upload lab report & generate structured NLP summary)
    ↓
10. AI Insights Dashboard (Review aggregated hospital risk and priority telemetry)
```

---

## 7. Machine Learning Performance Metrics

Both models were trained using stratified 80/20 train/test splits.

### Health Risk Random Forest Model
- **Accuracy:** **83.00%**
- **High Risk F1-Score:** **0.8669**
- **Low Risk F1-Score:** **0.8485**
- **Medium Risk F1-Score:** **0.7893**

### Appointment Priority Classification Model
- **Accuracy:** **86.40%**
- **High Priority F1-Score:** **0.9095**
- **Medium Priority F1-Score:** **0.8308**
- **Low Priority F1-Score:** **0.8205**

---

## 8. Cloud Deployment Summary

- **Frontend:** Deployed to **Vercel** with global Edge routing (`VITE_API_URL` pointing to Render).
- **Backend Server:** Deployed as a Web Service on **Render** (Node.js).
- **AI Microservice:** Deployed as a Web Service on **Render** (Python FastAPI).
- **Database:** Hosted on **MongoDB Atlas** with automated failover and IP whitelist.
- **Document Storage:** Configured on **Cloudinary** for medical PDF and scan CDN delivery.

Detailed cloud setup instructions are available in [`docs/deployment.md`](./docs/deployment.md).

---

## 9. Academic Documentation

Comprehensive reports prepared in the `docs/` folder:
- [`docs/architecture.md`](./docs/architecture.md) — System architecture, communication flows, and sequence diagrams.
- [`docs/api.md`](./docs/api.md) — Complete REST API specification with payload schemas.
- [`docs/database.md`](./docs/database.md) — MongoDB entity relationships and Mongoose schemas.
- [`docs/ai-model.md`](./docs/ai-model.md) — Machine learning feature engineering, classification reports, and confusion matrices.
- [`docs/deployment.md`](./docs/deployment.md) — Step-by-step production cloud deployment guide.
- [`docs/academic_project_report.md`](./docs/academic_project_report.md) — Formal 15-section academic project report for university submission.

---

## 10. License & Academic Disclaimer

This project provides intelligent hospital management and clinical analytics capabilities.  
*Medical Disclaimer: This software provides AI-assisted decision-support information for educational analysis and does not replace the professional diagnostic evaluation of a licensed healthcare provider.*
