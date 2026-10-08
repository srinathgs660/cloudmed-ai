"""
CloudMed AI - Appointment Priority Model Training Pipeline
Algorithm: Random Forest Classifier
Dataset: Clinical indicators (Age, Symptom Severity 1-5, Existing Conditions Count, Pain Level 1-10, Emergency Indicator, Prior Admissions)
Output: models/priority_model.joblib
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

def generate_priority_dataset(n_samples=2500, random_state=42):
    np.random.seed(random_state)
    
    age = np.random.randint(5, 88, size=n_samples)
    symptom_severity = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.25, 0.30, 0.25, 0.12, 0.08])
    existing_conditions_count = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.40, 0.30, 0.18, 0.08, 0.04])
    pain_level = np.random.randint(1, 11, size=n_samples) # 1-10
    emergency_indicator = np.random.choice([0, 1], size=n_samples, p=[0.88, 0.12])
    prior_admissions = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.55, 0.25, 0.14, 0.06])
    
    # Priority calculation logic
    # Score >= 11 -> HIGH, 6-10 -> MEDIUM, < 6 -> LOW
    score = (
        emergency_indicator * 6.5 +
        symptom_severity * 2.2 +
        (pain_level >= 8) * 2.5 +
        (pain_level >= 5) * 1.2 +
        existing_conditions_count * 1.3 +
        prior_admissions * 1.1 +
        (age >= 65) * 1.5 +
        (age <= 12) * 1.0 +
        np.random.normal(0, 0.7, size=n_samples)
    )
    
    labels = []
    for s in score:
        if s >= 10.5:
            labels.append("HIGH")
        elif s >= 6.0:
            labels.append("MEDIUM")
        else:
            labels.append("LOW")
            
    df = pd.DataFrame({
        "age": age,
        "symptomSeverity": symptom_severity,
        "existingConditionsCount": existing_conditions_count,
        "painLevel": pain_level,
        "emergencyIndicator": emergency_indicator,
        "priorAdmissions": prior_admissions,
        "priority": labels
    })
    return df

def train_and_save():
    dataset_dir = os.path.join(os.path.dirname(__file__), "datasets")
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(dataset_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    csv_path = os.path.join(dataset_dir, "priority_data.csv")
    print("Generating structured priority training dataset...")
    df = generate_priority_dataset(n_samples=2500, random_state=42)
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to: {csv_path} (Records: {len(df)})")
    print("Class distribution:\n", df["priority"].value_counts())
    
    features = ["age", "symptomSeverity", "existingConditionsCount", "painLevel", "emergencyIndicator", "priorAdmissions"]
    X = df[features]
    y = df["priority"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\nTraining Priority Classifier Pipeline...")
    model_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            random_state=42,
            class_weight="balanced"
        ))
    ])
    
    model_pipeline.fit(X_train, y_train)
    y_pred = model_pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print("\n" + "="*50)
    print("CLOUDMED AI - APPOINTMENT PRIORITY MODEL EVALUATION")
    print("="*50)
    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))
    print("Confusion Matrix:")
    labels_order = ["LOW", "MEDIUM", "HIGH"]
    cm = confusion_matrix(y_test, y_pred, labels=labels_order)
    print(pd.DataFrame(cm, index=[f"True_{l}" for l in labels_order], columns=[f"Pred_{l}" for l in labels_order]))
    
    artifact = {
        "pipeline": model_pipeline,
        "features": features,
        "classes": list(model_pipeline.named_steps["classifier"].classes_),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "n_samples": len(df)
        }
    }
    
    output_path = os.path.join(models_dir, "priority_model.joblib")
    joblib.dump(artifact, output_path)
    print(f"\nModel successfully saved to: {output_path}")

if __name__ == "__main__":
    train_and_save()
