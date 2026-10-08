import os
import re
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

DISCLAIMER_TEXT = (
    "AI-generated risk assessment for educational and decision-support purposes only. "
    "It is not a medical diagnosis and must not replace professional clinical judgment."
)

class AIModelManager:
    def __init__(self):
        self.health_model_artifact = None
        self.priority_model_artifact = None
        self.load_models()

    def load_models(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models"))
        health_path = os.path.join(base_dir, "health_risk_model.joblib")
        priority_path = os.path.join(base_dir, "priority_model.joblib")

        if os.path.exists(health_path):
            self.health_model_artifact = joblib.load(health_path)
            print(f"[AI Service] Health model loaded from {health_path}")
        else:
            print(f"[AI Service] Warning: {health_path} not found.")

        if os.path.exists(priority_path):
            self.priority_model_artifact = joblib.load(priority_path)
            print(f"[AI Service] Priority model loaded from {priority_path}")
        else:
            print(f"[AI Service] Warning: {priority_path} not found.")

    def predict_health_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.health_model_artifact:
            raise RuntimeError("Health risk model is not loaded.")

        pipeline = self.health_model_artifact["pipeline"]
        classes = self.health_model_artifact["classes"]

        # Parse inputs
        gender_val = 1 if str(data.get("gender", "")).lower() in ["male", "1", "true", "m"] else 0
        smoking_val = 1 if bool(data.get("smoking", False)) or str(data.get("smoking")).lower() in ["1", "true", "yes"] else 0
        family_history_val = 1 if bool(data.get("familyHistory", False)) or str(data.get("familyHistory")).lower() in ["1", "true", "yes"] else 0
        physical_val = int(data.get("physicalActivity", 1))

        input_df = pd.DataFrame([{
            "age": int(data["age"]),
            "gender": gender_val,
            "bmi": float(data["bmi"]),
            "bloodPressure": int(data["bloodPressure"]),
            "glucose": int(data["glucose"]),
            "cholesterol": int(data["cholesterol"]),
            "smoking": smoking_val,
            "physicalActivity": physical_val,
            "familyHistory": family_history_val
        }])

        pred_class = pipeline.predict(input_df)[0]
        pred_probs = pipeline.predict_proba(input_df)[0]
        
        prob_dict = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, pred_probs)}
        top_prob = float(np.max(pred_probs))

        # Identify key clinical risk factors for transparency
        factors = []
        if float(data["bmi"]) >= 30.0:
            factors.append(f"Elevated BMI ({data['bmi']} kg/m² - Obese category)")
        elif float(data["bmi"]) >= 25.0:
            factors.append(f"Overweight BMI ({data['bmi']} kg/m²)")

        if int(data["bloodPressure"]) >= 140:
            factors.append(f"Stage 2 Hypertension range ({data['bloodPressure']} mmHg systolic)")
        elif int(data["bloodPressure"]) >= 130:
            factors.append(f"Prehypertension / Stage 1 ({data['bloodPressure']} mmHg systolic)")

        if int(data["glucose"]) >= 126:
            factors.append(f"Hyperglycemia range ({data['glucose']} mg/dL fasting)")
        elif int(data["glucose"]) >= 100:
            factors.append(f"Impaired fasting glucose ({data['glucose']} mg/dL)")

        if int(data["cholesterol"]) >= 240:
            factors.append(f"High total cholesterol ({data['cholesterol']} mg/dL)")
        elif int(data["cholesterol"]) >= 200:
            factors.append(f"Borderline high cholesterol ({data['cholesterol']} mg/dL)")

        if smoking_val:
            factors.append("Active tobacco consumption")
        if family_history_val:
            factors.append("Cardiovascular / metabolic familial predisposition")
        if physical_val == 0:
            factors.append("Sedentary lifestyle pattern")

        if not factors:
            factors.append("Vitals and metabolic indicators appear within conventional ranges.")

        if pred_class == "High":
            msg = "Higher risk indicators detected. Consult a qualified healthcare professional for formal diagnostic evaluation."
        elif pred_class == "Medium":
            msg = "Moderate risk indicators observed. Preventative lifestyle adjustments and routine follow-up are advised."
        else:
            msg = "Favorable metabolic profile indicated. Continue routine wellness maintenance and balanced lifestyle."

        return {
            "riskLevel": pred_class,
            "probability": round(top_prob, 2),
            "classProbabilities": prob_dict,
            "message": msg,
            "keyFactors": factors,
            "disclaimer": DISCLAIMER_TEXT
        }

    def predict_appointment_priority(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.priority_model_artifact:
            raise RuntimeError("Priority model is not loaded.")

        pipeline = self.priority_model_artifact["pipeline"]
        emergency_val = 1 if bool(data.get("emergencyIndicator", False)) or str(data.get("emergencyIndicator")).lower() in ["1", "true"] else 0

        input_df = pd.DataFrame([{
            "age": int(data.get("age", 35)),
            "symptomSeverity": int(data.get("symptomSeverity", 3)),
            "existingConditionsCount": int(data.get("existingConditionsCount", 0)),
            "painLevel": int(data.get("painLevel", 3)),
            "emergencyIndicator": emergency_val,
            "priorAdmissions": int(data.get("priorAdmissions", 0))
        }])

        pred_class = pipeline.predict(input_df)[0]
        pred_probs = pipeline.predict_proba(input_df)[0]
        classes = self.priority_model_artifact["classes"]
        prob_dict = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, pred_probs)}
        top_prob = float(np.max(pred_probs))

        factors = []
        if emergency_val:
            factors.append("Acute emergency flag triggered")
        if int(data.get("symptomSeverity", 1)) >= 4:
            factors.append(f"Severe symptoms reported ({data.get('symptomSeverity')}/5)")
        if int(data.get("painLevel", 1)) >= 7:
            factors.append(f"Acute discomfort/pain level ({data.get('painLevel')}/10)")
        if int(data.get("existingConditionsCount", 0)) >= 2:
            factors.append(f"Comorbidities present ({data.get('existingConditionsCount')} conditions)")
        if int(data.get("age", 30)) >= 65:
            factors.append(f"Geriatric cohort vulnerability (Age: {data.get('age')})")

        reason_text = "Multiple clinical acuity indicators identified" if pred_class == "HIGH" else (
            "Moderate clinical symptom burden requiring timely evaluation" if pred_class == "MEDIUM" else
            "Routine outpatient consultation without acute distress"
        )

        return {
            "priority": pred_class,
            "score": round(top_prob, 2),
            "reason": reason_text,
            "factors": factors or ["Standard outpatient appointment criteria"],
            "disclaimer": DISCLAIMER_TEXT
        }

    def summarize_report(self, report_text: str, patient_name: str = None, report_type: str = "Clinical Note") -> Dict[str, Any]:
        """
        Extracts symptoms, key findings, and recommended follow-ups using clinical NLP heuristics.
        Also computes clinical urgency.
        """
        text = report_text.strip()
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        symptoms = []
        key_findings = []
        follow_ups = []

        # Common clinical term dictionaries for regex extraction
        symptom_patterns = [
            r"(fever|cough|chest pain|shortness of breath|dyspnea|fatigue|headache|dizziness|nausea|vomiting|edema|swelling|palpitations|rash|abdominal pain|back pain|sore throat|chills|malaise)"
        ]
        finding_patterns = [
            r"(elevated|increased|decreased|abnormal|positive for|negative for|lesion|infiltrate|hypertrophy|stenosis|arrhythmia|tachycardia|bradycardia|hypertension|hypotension|opacity|fracture|clear lungs|normal sinus rhythm)"
        ]
        followup_patterns = [
            r"(recommend|advised|prescribe|follow-up|follow up|consult|monitor|recheck|scheduled for|repeat|refer to|dietary|lifestyle)"
        ]

        # Scan text
        for line in lines:
            lower = line.lower()
            if any(re.search(p, lower) for p in symptom_patterns) and not any(re.search(f, lower) for f in followup_patterns):
                symptoms.append(line.lstrip("-•*0123456789. "))
            if any(re.search(p, lower) for p in finding_patterns):
                key_findings.append(line.lstrip("-•*0123456789. "))
            if any(re.search(p, lower) for p in followup_patterns):
                follow_ups.append(line.lstrip("-•*0123456789. "))

        # Fallback deduplication and clean formatting
        if not symptoms:
            symptoms = ["Mild malaise or non-specific presentation reported"]
        if not key_findings:
            key_findings = ["General examination and laboratory markers reviewed"]
        if not follow_ups:
            follow_ups = ["Routine outpatient follow-up and monitoring recommended"]

        # Limit to top items
        symptoms = list(dict.fromkeys(symptoms))[:4]
        key_findings = list(dict.fromkeys(key_findings))[:4]
        follow_ups = list(dict.fromkeys(follow_ups))[:4]

        # Determine urgency
        urgency = "Routine"
        urgent_keywords = ["urgent", "emergency", "acute", "critical", "severe", "immediate", "elevated troponin", "st-elevation"]
        if any(w in text.lower() for w in urgent_keywords):
            urgency = "Urgent"
        elif any(w in text.lower() for w in ["moderate", "abnormal", "elevated", "prescribed"]):
            urgency = "Attention"

        structured_summary = (
            f"CLINICAL SUMMARY\n"
            f"===============\n"
            f"Type: {report_type}\n"
            f"Clinical Urgency: {urgency}\n\n"
            f"SYMPTOMS:\n" + "\n".join([f"• {s}" for s in symptoms]) + "\n\n"
            f"KEY FINDINGS:\n" + "\n".join([f"• {k}" for k in key_findings]) + "\n\n"
            f"FOLLOW-UP & PLAN:\n" + "\n".join([f"• {f}" for f in follow_ups])
        )

        return {
            "summary": structured_summary,
            "symptoms": symptoms,
            "keyFindings": key_findings,
            "followUp": follow_ups,
            "urgency": urgency,
            "modelUsed": "CloudMed Rule-NLP Extractive Summarizer v1.0",
            "rawTextLength": len(text)
        }

model_manager = AIModelManager()
