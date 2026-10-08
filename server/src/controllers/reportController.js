const MedicalReport = require('../models/MedicalReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { uploadToCloudinaryOrLocal } = require('../middleware/upload');
const { summarizeReport } = require('../services/aiClient');

/**
 * @route GET /api/reports
 */
const getReports = async (req, res, next) => {
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

    const reports = await MedicalReport.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/reports/upload
 * Multi-part upload handler
 */
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file.' });
    }

    let { patientId, doctorId, reportType = 'Diagnostic Report', summary } = req.body;

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(400).json({ success: false, message: 'Patient profile not found.' });
      patientId = patient._id;
    } else if (req.user.role === 'DOCTOR') {
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (doc) doctorId = doc._id;
    }

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    // Upload to Cloudinary or secure local path
    const uploadResult = await uploadToCloudinaryOrLocal(req.file);

    const report = await MedicalReport.create({
      patientId,
      doctorId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      reportType,
      summary: summary || '',
      uploadedBy: req.user.role,
    });

    // Notify patient or doctor
    const patientDoc = await Patient.findById(patientId);
    if (patientDoc && req.user.role !== 'PATIENT') {
      await Notification.create({
        userId: patientDoc.userId,
        title: 'New Medical Report Uploaded',
        message: `A new document '${req.file.originalname}' has been attached to your medical records.`,
        type: 'REPORT',
        link: '/reports',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/reports/:id/summarize
 * Generates an AI structured summary of report text or note and saves to the report
 */
const summarizeExistingReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found.' });
    }

    const { textToSummarize } = req.body;
    const text = textToSummarize || report.summary || `Clinical diagnostic report for ${report.fileName}.`;

    const summaryData = await summarizeReport(text, null, report.reportType);

    report.summary = summaryData.summary;
    report.structuredSummary = {
      symptoms: summaryData.symptoms,
      keyFindings: summaryData.keyFindings,
      followUp: summaryData.followUp,
      urgency: summaryData.urgency,
    };
    await report.save();

    res.status(200).json({
      success: true,
      data: report,
      aiSummary: summaryData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  uploadReport,
  summarizeExistingReport,
};
