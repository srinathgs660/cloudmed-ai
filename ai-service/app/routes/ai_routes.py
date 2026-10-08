from fastapi import APIRouter, HTTPException, status
from app.schemas.ai_schemas import (
    HealthRiskRequest, HealthRiskResponse,
    PriorityRequest, PriorityResponse,
    SummarizeRequest, SummarizeResponse
)
from app.services.predictor_service import model_manager

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "CloudMed AI Engine",
        "models": {
            "healthRisk": model_manager.health_model_artifact is not None,
            "appointmentPriority": model_manager.priority_model_artifact is not None
        }
    }

@router.post("/predict/health-risk", response_model=HealthRiskResponse, tags=["AI Predictions"])
@router.post("/api/ai/health-risk", response_model=HealthRiskResponse, tags=["AI Predictions"])
def predict_health_risk_endpoint(payload: HealthRiskRequest):
    try:
        return model_manager.predict_health_risk(payload.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health risk inference error: {str(e)}"
        )

@router.post("/predict/appointment-priority", response_model=PriorityResponse, tags=["AI Predictions"])
@router.post("/api/ai/appointment-priority", response_model=PriorityResponse, tags=["AI Predictions"])
def predict_appointment_priority_endpoint(payload: PriorityRequest):
    try:
        return model_manager.predict_appointment_priority(payload.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Priority inference error: {str(e)}"
        )

@router.post("/summarize/report", response_model=SummarizeResponse, tags=["AI Summarization"])
@router.post("/api/ai/summarize-report", response_model=SummarizeResponse, tags=["AI Summarization"])
def summarize_report_endpoint(payload: SummarizeRequest):
    try:
        return model_manager.summarize_report(
            report_text=payload.reportText,
            patient_name=payload.patientName,
            report_type=payload.reportType
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report summarization error: {str(e)}"
        )
