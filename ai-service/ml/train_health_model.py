"""
CloudMed AI - Health Risk Model Training Pipeline
Algorithm: Random Forest Classifier
Dataset: Clinical indicators (Age, Gender, BMI, Systolic BP, Glucose, Cholesterol, Smoking, Physical Activity, Family History)
Output: models/health_risk_model.joblib
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

def generate_educational_dataset(n_samples=2500, random_state=42):
    """
    Generates realistic clinical risk distribution based on standard epidemiological criteria:
    - Normal BP < 120, Prehypertension 120-139, Hypertension Stage 1 & 2 >= 140
    - Normal Fasting Glucose < 100, Impaired 100-125, Diabetic >= 126
    - BMI: Normal 18.5-24.9, Overweight 25-29.9, Obese >= 30
    - Cholesterol: Desirable < 200, Borderline 200-239, High >= 240
    """
    np.random.seed(random_state)
    
    age = np.random.randint(18, 85, size=n_samples)
    gender_num = np.random.choice([0, 1], size=n_samples) # 0: female, 1: male
    bmi = np.round(np.random.normal(loc=26.5, scale=5.2, size=n_samples), 1)
    bmi = np.clip(bmi, 16.0, 48.0)
    
    blood_pressure = np.round(np.random.normal(loc=128, scale=18, size=n_samples)).astype(int)
    blood_pressure = np.clip(blood_pressure, 88, 210)
    
    glucose = np.round(np.random.normal(loc=115, scale=35, size=n_samples)).astype(int)
    glucose = np.clip(glucose, 65, 300)
    
    cholesterol = np.round(np.random.normal(loc=205, scale=40, size=n_samples)).astype(int)
    cholesterol = np.clip(cholesterol, 110, 360)
    
    smoking = np.random.choice([0, 1], size=n_samples, p=[0.72, 0.28])
    physical_activity = np.random.choice([0, 1, 2], size=n_samples, p=[0.35, 0.45, 0.20]) # 0=low, 1=mod, 2=high
    family_history = np.random.choice([0, 1], size=n_samples, p=[0.65, 0.35])

    # Clinically-weighted risk calculation
    risk_score = (
        (age / 85.0) * 2.2 +
        (bmi > 29.9) * 2.0 +
        (bmi > 24.9) * 1.0 +
        (blood_pressure >= 140) * 2.8 +
        (blood_pressure >= 130) * 1.2 +
        (glucose >= 126) * 3.0 +
        (glucose >= 100) * 1.2 +
        (cholesterol >= 240) * 2.0 +
        (cholesterol >= 200) * 0.9 +
        smoking * 2.2 +
        family_history * 1.8 -
        (physical_activity == 2) * 1.5 -
        (physical_activity == 1) * 0.7
    )
    
    # Add minor biological noise
    noise = np.random.normal(0, 0.8, size=n_samples)
    final_score = risk_score + noise
    
    # Categorize into Low, Medium, High
    # Low: < 5.0, Medium: 5.0 - 9.0, High: > 9.0
    labels = []
    for s in final_score:
        if s < 5.2:
            labels.append("Low")
        elif s < 9.0:
            labels.append("Medium")
        else:
            labels.append("High")
            
    df = pd.DataFrame({
        "age": age,
        "gender": gender_num,
        "bmi": bmi,
        "bloodPressure": blood_pressure,
        "glucose": glucose,
        "cholesterol": cholesterol,
        "smoking": smoking,
        "physicalActivity": physical_activity,
        "familyHistory": family_history,
        "riskLevel": labels
    })
    
    return df

def train_and_save():
    dataset_dir = os.path.join(os.path.dirname(__file__), "datasets")
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(dataset_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    csv_path = os.path.join(dataset_dir, "health_data.csv")
    print("Generating structured clinical training dataset...")
    df = generate_educational_dataset(n_samples=3000, random_state=42)
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to: {csv_path} (Records: {len(df)})")
    print("Class distribution:\n", df["riskLevel"].value_counts())
    
    features = ["age", "gender", "bmi", "bloodPressure", "glucose", "cholesterol", "smoking", "physicalActivity", "familyHistory"]
    X = df[features]
    y = df["riskLevel"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\nTraining Random Forest Classifier Pipeline...")
    model_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_split=4,
            random_state=42,
            class_weight="balanced"
        ))
    ])
    
    model_pipeline.fit(X_train, y_train)
    y_pred = model_pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print("\n" + "="*50)
    print("CLOUDMED AI - HEALTH RISK MODEL EVALUATION")
    print("="*50)
    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))
    print("Confusion Matrix:")
    labels_order = ["Low", "Medium", "High"]
    cm = confusion_matrix(y_test, y_pred, labels=labels_order)
    print(pd.DataFrame(cm, index=[f"True_{l}" for l in labels_order], columns=[f"Pred_{l}" for l in labels_order]))
    
    # Save model package
    artifact = {
        "pipeline": model_pipeline,
        "features": features,
        "classes": list(model_pipeline.named_steps["classifier"].classes_),
        "metrics": {
            "accuracy": round(float(acc), 4),
            "n_samples": len(df)
        }
    }
    
    output_path = os.path.join(models_dir, "health_risk_model.joblib")
    joblib.dump(artifact, output_path)
    print(f"\nModel successfully saved to: {output_path}")

if __name__ == "__main__":
    train_and_save()
