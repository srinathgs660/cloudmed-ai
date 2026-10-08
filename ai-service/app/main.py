import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.ai_routes import router as ai_router

app = FastAPI(
    title="CloudMed AI - Machine Learning & Analytics Service",
    description="Microservice providing Health Risk Assessment, Appointment Priority Triage, and Clinical Report Summarization",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "message": "CloudMed AI Service is operational",
        "endpoints": [
            "/health",
            "/docs",
            "/predict/health-risk",
            "/predict/appointment-priority",
            "/summarize/report"
        ]
    }

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
