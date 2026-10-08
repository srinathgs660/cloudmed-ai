# CloudMed AI - Machine Learning & Analytics Microservice

This microservice provides intelligent predictive modeling and NLP clinical report extraction for CloudMed AI, developed for intelligent hospital operations and patient risk assessment.

## Features

1. **Health Risk Prediction Model (`/predict/health-risk`)**
   - **Algorithm:** Random Forest Classifier (`n_estimators=150`, `max_depth=10`, balanced class weights)
   - **Trained on:** 3,000 structured clinical feature vectors (Age, Gender, BMI, Systolic Blood Pressure, Glucose, Cholesterol, Smoking status, Physical Activity, Family History).
   - **Evaluation Metrics (Tested):**
     - Overall Accuracy: ~83.00%
     - High Risk F1-Score: 0.8669
     - Low Risk F1-Score: 0.8485
     - Medium Risk F1-Score: 0.7893
   - **Safety:** Always outputs explicit educational disclaimers; results do not constitute clinical diagnosis.

2. **Appointment Priority Triage Model (`/predict/appointment-priority`)**
   - **Algorithm:** Random Forest Classifier (`n_estimators=120`, `max_depth=8`)
   - **Trained on:** 2,500 clinical acuity records (Age, Symptom Severity, Comorbidities, Pain Level, Emergency Indicator, Prior Admissions).
   - **Evaluation Metrics (Tested):**
     - Overall Accuracy: ~86.40%
     - High Priority F1-Score: 0.9095
     - Low Priority F1-Score: 0.8205
     - Medium Priority F1-Score: 0.8308

3. **Medical Report Summarization (`/summarize/report`)**
   - Rule-assisted Clinical NLP extractor categorizing unstructured medical notes into:
     - Symptoms
     - Key Findings
     - Follow-up Recommendations
     - Clinical Urgency (Routine / Attention / Urgent)

## Installation & Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Retrain models (optional, models are pre-trained in ml/models/)
python ml/train_health_model.py
python ml/train_priority_model.py

# 3. Start FastAPI Service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger documentation is available at: `http://localhost:8000/docs`
