from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

class HealthRiskRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: Union[str, int] = Field(..., description="'male'/'female' or 1/0")
    bmi: float = Field(..., ge=10.0, le=70.0, description="Body Mass Index")
    bloodPressure: int = Field(..., ge=60, le=260, description="Systolic Blood Pressure (mmHg)")
    glucose: int = Field(..., ge=40, le=500, description="Fasting Glucose level (mg/dL)")
    cholesterol: int = Field(..., ge=80, le=500, description="Total Cholesterol level (mg/dL)")
    smoking: Union[bool, int] = Field(..., description="Current smoker status")
    physicalActivity: Optional[int] = Field(1, ge=0, le=2, description="0=Sedentary, 1=Moderate, 2=Active")
    familyHistory: Optional[Union[bool, int]] = Field(0, description="Family history of cardiovascular/metabolic illness")

class HealthRiskResponse(BaseModel):
    riskLevel: str
    probability: float
    classProbabilities: Dict[str, float]
    message: str
    keyFactors: List[str]
    disclaimer: str

class PriorityRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    symptomSeverity: int = Field(3, ge=1, le=5, description="1 to 5 scale")
    existingConditionsCount: Optional[int] = Field(0, ge=0, le=10)
    painLevel: Optional[int] = Field(3, ge=1, le=10)
    emergencyIndicator: Optional[Union[bool, int]] = Field(0)
    priorAdmissions: Optional[int] = Field(0, ge=0, le=20)
    reason: Optional[str] = Field(None, description="Reason for appointment")

class PriorityResponse(BaseModel):
    priority: str
    score: float
    reason: str
    factors: List[str]
    disclaimer: str

class SummarizeRequest(BaseModel):
    reportText: str = Field(..., min_length=10, description="Clinical report or visit notes text")
    patientName: Optional[str] = None
    reportType: Optional[str] = "Clinical Note"

class SummarizeResponse(BaseModel):
    summary: str
    symptoms: List[str]
    keyFindings: List[str]
    followUp: List[str]
    urgency: str
    modelUsed: str
    rawTextLength: int
