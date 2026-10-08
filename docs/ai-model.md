# Artificial Intelligence & Machine Learning Architecture — CloudMed AI

CloudMed AI integrates two supervised machine-learning models and one rule-assisted clinical Natural Language Processing (NLP) summarization engine.

All model artifacts are generated and evaluated through Scikit-Learn pipelines, serialized using Joblib, and deployed within a FastAPI microservice.

---

## 1. Model 1: Patient Health Risk Prediction

### 1.1 Objective
Estimate patient health risk tier (`Low`, `Medium`, `High`) based on nine physiological, metabolic, and lifestyle parameters to assist preventative care planning.

### 1.2 Pipeline & Algorithm
- **Algorithm:** Random Forest Classifier (`n_estimators=150`, `max_depth=10`, `min_samples_split=4`, `class_weight='balanced'`)
- **Pre-processing:** `StandardScaler` feature normalization within an `sklearn.pipeline.Pipeline`.
- **Dataset:** 3,000 synthetic clinical records reflecting epidemiological guidelines (JNC-8 Blood Pressure, ADA Glycemic Standards, WHO BMI thresholds).
- **Split:** 80% Training (2,400 samples), 20% Testing (600 samples), stratified by class label.

### 1.3 Feature Vector Definition
| Feature | Type | Units / Scale | Description |
|---|---|---|---|
| `age` | Integer | Years (18–85) | Chronological age |
| `gender` | Categorical | 0=Female, 1=Male | Biological sex |
| `bmi` | Float | kg/m² (16.0–48.0) | Body Mass Index |
| `bloodPressure` | Integer | mmHg (88–210) | Systolic blood pressure |
| `glucose` | Integer | mg/dL (65–300) | Fasting blood glucose |
| `cholesterol` | Integer | mg/dL (110–360) | Total serum cholesterol |
| `smoking` | Binary | 0=No, 1=Yes | Current tobacco consumption |
| `physicalActivity` | Ordinal | 0=Low, 1=Moderate, 2=High | Weekly exercise frequency |
| `familyHistory` | Binary | 0=No, 1=Yes | Familial cardiovascular history |

### 1.4 Empirical Evaluation Results
Tested on 600 holdout clinical test records:

- **Overall Test Accuracy:** **83.00%** (0.8300)
- **Macro Average F1-Score:** **0.8349**
- **Weighted Average F1-Score:** **0.8299**

#### Classification Report:
| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **High Risk** | 0.8644 | 0.8693 | **0.8669** | 176 |
| **Low Risk** | 0.8462 | 0.8508 | **0.8485** | 181 |
| **Medium Risk** | 0.7925 | 0.7860 | **0.7893** | 243 |
| **Total / Avg** | **0.8298** | **0.8300** | **0.8299** | **600** |

#### Confusion Matrix:
| | Predicted Low | Predicted Medium | Predicted High |
|---|---|---|---|
| **True Low** | **154** | 27 | 0 |
| **True Medium** | 28 | **191** | 24 |
| **True High** | 0 | 23 | **153** |

*Key finding: Note that there are zero false negatives between High and Low risk (True High predicted as Low = 0; True Low predicted as High = 0).*

---

## 2. Model 2: Appointment Priority Triage

### 2.1 Objective
Automatically categorize scheduled appointments into `LOW`, `MEDIUM`, or `HIGH` clinical urgency to optimize physician consultation queues.

### 2.2 Algorithm & Dataset
- **Algorithm:** Random Forest Classifier (`n_estimators=120`, `max_depth=8`, `random_state=42`)
- **Dataset:** 2,500 acuity records.
- **Features:**
  1. `age` (Years)
  2. `symptomSeverity` (1 to 5 Likert scale)
  3. `existingConditionsCount` (Comorbidity count)
  4. `painLevel` (1 to 10 VAS scale)
  5. `emergencyIndicator` (0 or 1 flag)
  6. `priorAdmissions` (Number of previous hospitalizations)

### 2.3 Empirical Evaluation Results
Tested on 500 holdout triage records:

- **Overall Test Accuracy:** **86.40%** (0.8640)
- **Macro Average F1-Score:** **0.8536**
- **Weighted Average F1-Score:** **0.8654**

#### Classification Report:
| Priority | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **HIGH** | 0.9437 | 0.8777 | **0.9095** | 229 |
| **LOW** | 0.7619 | 0.8889 | **0.8205** | 72 |
| **MEDIUM** | 0.8227 | 0.8392 | **0.8308** | 199 |
| **Total / Avg** | **0.8693** | **0.8640** | **0.8654** | **500** |

#### Confusion Matrix:
| | Predicted LOW | Predicted MEDIUM | Predicted HIGH |
|---|---|---|---|
| **True LOW** | **64** | 8 | 0 |
| **True MEDIUM** | 20 | **167** | 12 |
| **True HIGH** | 0 | 28 | **201** |

---

## 3. Clinical NLP Report Summarization

### 3.1 Pipeline
Unstructured diagnostic narratives are processed through rule-assisted clinical NLP heuristics that extract:
1. **Symptoms:** Matches against clinical lexical ontologies (e.g. fever, dyspnea, palpitations, cough).
2. **Key Findings:** Identifies laboratory flags, morphological abnormalities, or metabolic markers.
3. **Follow-up Plan:** Gathers actionable physician directions and repeat screening recommendations.
4. **Clinical Urgency Classifier:** Classifies urgency into `Routine`, `Attention`, or `Urgent`.

---

## 4. Responsible AI & Ethical Disclaimer

In full compliance with clinical decision-support ethics:
- Predictions are **explicitly non-diagnostic**.
- Every AI card and analytics view displays the mandatory educational notice:
  > *"AI-generated risk assessment for educational and decision-support purposes only. It is not a medical diagnosis and must not replace professional clinical judgment."*
