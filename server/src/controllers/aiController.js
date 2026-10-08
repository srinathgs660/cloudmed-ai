const AIAssessment = require('../models/AIAssessment');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const {
  predictHealthRisk,
  predictAppointmentPriority,
  summarizeReport,
} = require('../services/aiClient');

/**
 * @route POST /api/ai/health-risk
 * Predicts health risk using Python Random Forest model and stores in MongoDB
 */
const runHealthRiskAssessment = async (req, res, next) => {
  try {
    const {
      patientId,
      age,
      gender,
      bmi,
      bloodPressure,
      glucose,
      cholesterol,
      smoking,
      physicalActivity,
      familyHistory,
    } = req.body;

    let targetPatientId = patientId;
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(400).json({ success: false, message: 'Patient profile not found.' });
      targetPatientId = patient._id;
    }

    if (!age || gender === undefined || !bmi || !bloodPressure || !glucose || !cholesterol || smoking === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide age, gender, bmi, bloodPressure, glucose, cholesterol, and smoking status.',
      });
    }

    const aiResult = await predictHealthRisk({
      age: Number(age),
      gender,
      bmi: Number(bmi),
      bloodPressure: Number(bloodPressure),
      glucose: Number(glucose),
      cholesterol: Number(cholesterol),
      smoking,
      physicalActivity: physicalActivity !== undefined ? Number(physicalActivity) : 1,
      familyHistory: familyHistory !== undefined ? Boolean(familyHistory) : false,
    });

    let assessmentDoc = null;
    if (targetPatientId) {
      assessmentDoc = await AIAssessment.create({
        patientId: targetPatientId,
        assessmentType: 'HEALTH_RISK',
        inputData: { age, gender, bmi, bloodPressure, glucose, cholesterol, smoking, physicalActivity, familyHistory },
        result: aiResult.riskLevel,
        probability: aiResult.probability,
        classProbabilities: aiResult.classProbabilities,
        message: aiResult.message,
        keyFactors: aiResult.keyFactors,
        disclaimer: aiResult.disclaimer,
      });

      // Update patient profile with latest risk metric
      await Patient.findByIdAndUpdate(targetPatientId, {
        bmi: Number(bmi),
        smokingStatus: Boolean(smoking),
        latestRiskScore: {
          level: aiResult.riskLevel,
          probability: aiResult.probability,
          assessedAt: new Date(),
        },
      });

      // Create notification
      const patient = await Patient.findById(targetPatientId);
      if (patient && patient.userId) {
        await Notification.create({
          userId: patient.userId,
          title: 'AI Health Assessment Completed',
          message: `Your latest health risk assessment completed with status: ${aiResult.riskLevel} Risk.`,
          type: 'AI_ASSESSMENT',
          link: '/ai-assessment',
        });
      }
    }

    res.status(200).json({
      success: true,
      assessmentId: assessmentDoc ? assessmentDoc._id : undefined,
      ...aiResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/ai/appointment-priority
 */
const runAppointmentPriorityTriage = async (req, res, next) => {
  try {
    const { age, symptomSeverity, existingConditionsCount, painLevel, emergencyIndicator, priorAdmissions, reason } = req.body;

    const result = await predictAppointmentPriority({
      age: Number(age) || 35,
      symptomSeverity: Number(symptomSeverity) || 2,
      existingConditionsCount: Number(existingConditionsCount) || 0,
      painLevel: Number(painLevel) || 3,
      emergencyIndicator: Boolean(emergencyIndicator),
      priorAdmissions: Number(priorAdmissions) || 0,
      reason: reason || '',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/ai/summarize-report
 */
const runReportSummarization = async (req, res, next) => {
  try {
    const { reportText, patientName, reportType } = req.body;

    if (!reportText || reportText.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide clinical report text to summarize.' });
    }

    const summary = await summarizeReport(reportText, patientName, reportType);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/ai/assessments
 * List assessments by patient
 */
const getAssessments = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    let query = {};

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, data: [] });
      query.patientId = patient._id;
    } else if (patientId) {
      query.patientId = patientId;
    }

    const assessments = await AIAssessment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runHealthRiskAssessment,
  runAppointmentPriorityTriage,
  runReportSummarization,
  getAssessments,
};
