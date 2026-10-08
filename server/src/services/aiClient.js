const axios = require('axios');

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const aiApi = axios.create({
  baseURL: AI_SERVICE_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Predict Patient Health Risk via FastAPI AI service
 */
const predictHealthRisk = async (data) => {
  try {
    const response = await aiApi.post('/predict/health-risk', data);
    return response.data;
  } catch (error) {
    console.error(`[AI Client] Health Risk API error (${AI_SERVICE_BASE_URL}):`, error.message);
    
    // Fallback heuristic if FastAPI service is temporarily offline
    const bp = Number(data.bloodPressure) || 120;
    const glu = Number(data.glucose) || 100;
    const bmi = Number(data.bmi) || 24;
    const smoking = Boolean(data.smoking);

    let riskLevel = 'Low';
    let prob = 0.78;
    if (bp >= 140 || glu >= 130 || bmi >= 30) {
      riskLevel = 'High';
      prob = 0.85;
    } else if (bp >= 130 || glu >= 105 || bmi >= 26 || smoking) {
      riskLevel = 'Medium';
      prob = 0.68;
    }

    return {
      riskLevel,
      probability: prob,
      classProbabilities: { [riskLevel]: prob },
      message: `${riskLevel} risk indicators identified. Consult a healthcare professional.`,
      keyFactors: [
        bp >= 130 ? `Systolic blood pressure: ${bp} mmHg` : 'Blood pressure evaluated',
        glu >= 110 ? `Blood glucose: ${glu} mg/dL` : 'Glucose evaluated',
      ],
      disclaimer: 'AI-generated risk assessment for educational/support purposes only. It is not a medical diagnosis.',
      isFallback: true,
    };
  }
};

/**
 * Predict Appointment Priority via FastAPI AI service
 */
const predictAppointmentPriority = async (data) => {
  try {
    const response = await aiApi.post('/predict/appointment-priority', data);
    return response.data;
  } catch (error) {
    console.error(`[AI Client] Priority API error:`, error.message);
    
    const severity = Number(data.symptomSeverity) || 2;
    const isEmerg = Boolean(data.emergencyIndicator);
    const pain = Number(data.painLevel) || 3;

    let priority = 'LOW';
    let score = 0.45;
    if (isEmerg || severity >= 4 || pain >= 8) {
      priority = 'HIGH';
      score = 0.90;
    } else if (severity >= 3 || pain >= 5) {
      priority = 'MEDIUM';
      score = 0.65;
    }

    return {
      priority,
      score,
      reason: priority === 'HIGH' ? 'Critical symptoms or pain level reported' : 'Routine clinical outpatient scheduling',
      factors: ['Clinical severity scoring heuristic'],
      disclaimer: 'AI-generated priority support only.',
      isFallback: true,
    };
  }
};

/**
 * Summarize Clinical Report via FastAPI AI service
 */
const summarizeReport = async (reportText, patientName, reportType) => {
  try {
    const response = await aiApi.post('/summarize/report', {
      reportText,
      patientName,
      reportType,
    });
    return response.data;
  } catch (error) {
    console.error(`[AI Client] Summarize API error:`, error.message);
    
    return {
      summary: `CLINICAL SUMMARY (Heuristic Fallback)\nType: ${reportType || 'Clinical Note'}\n\nClinical observation notes processed. Further clinical review recommended.`,
      symptoms: ['Symptom notes noted in record'],
      keyFindings: ['Observations recorded in consultation notes'],
      followUp: ['Follow-up as advised by physician'],
      urgency: 'Routine',
      modelUsed: 'CloudMed Fallback Extractor',
      rawTextLength: reportText ? reportText.length : 0,
      isFallback: true,
    };
  }
};

module.exports = {
  predictHealthRisk,
  predictAppointmentPriority,
  summarizeReport,
};
