const LoanApplication = require('../models/LoanApplication');
const Document = require('../models/Document');
const ValidationResult = require('../models/ValidationResult');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activityLogger');
const aiService = require('./aiService');

/**
 * Applicant-safe projection of a ValidationResult: the headline score, risk
 * band, status and check tallies only. Deliberately omits check messages,
 * findings, evidence and the internal recommendedAction — those are for the
 * officer console, not the applicant dashboard.
 */
const summarizeVerification = (v) => {
  const checks = Array.isArray(v.checks) ? v.checks : [];
  return {
    score: typeof v.verificationScore === 'number' ? v.verificationScore : null,
    riskLevel: v.riskLevel || null,
    status: v.status || null,
    checksTotal: checks.length,
    checksPassed: checks.filter((c) => c.status === 'PASSED').length,
    checksFlagged: checks.filter((c) => c.status === 'FLAGGED').length,
    checksWarnings: checks.filter((c) => c.status === 'WARNING').length,
    validatedAt: v.validatedAt || null,
  };
};

const createApplication = async (data, userId) => {
  const application = await LoanApplication.create({
    bankId: data.bankId || 'hdfc',
    bankName: data.bankName || 'HDFC Bank',
    loanType: data.loanType,
    requestedAmount: data.requestedAmount,
    tenureMonths: data.tenureMonths,
    employmentType: data.employmentType,
    declaredMonthlyIncome: data.declaredMonthlyIncome,
    applicant: userId,
    status: 'draft',
  });

  await logActivity(application._id, userId, 'Application Created', {
    bankName: data.bankName || 'HDFC Bank',
    bankId: data.bankId || 'hdfc',
    loanType: data.loanType,
    requestedAmount: data.requestedAmount,
  });

  return application;
};

const getUserApplications = async (userId) => {
  const applications = await LoanApplication.find({ applicant: userId })
    .sort({ createdAt: -1 })
    .populate('documents');

  if (applications.length === 0) return [];

  // Attach the AI verification summary (one ValidationResult per application).
  const validations = await ValidationResult.find({
    application: { $in: applications.map((a) => a._id) },
  })
    .select('application status riskLevel verificationScore checks validatedAt')
    .lean();

  const byApp = new Map(validations.map((v) => [String(v.application), v]));

  return applications.map((app) => {
    const obj = app.toJSON();
    const v = byApp.get(String(app._id));
    obj.verification = v ? summarizeVerification(v) : null;
    return obj;
  });
};

const getApplicationByIdAndUser = async (id, userId) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  const application = await LoanApplication.findOne({ _id: id, applicant: userId }).populate('documents');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  return application;
};

const uploadDocument = async (applicationId, userId, fileData, documentType, manualText = null) => {
  const application = await getApplicationByIdAndUser(applicationId, userId);

  const docData = {
    application: applicationId,
    uploadedBy: userId,
    documentType,
    originalName: fileData.originalname,
    filename: fileData.filename,
    path: fileData.path,
    mimetype: fileData.mimetype,
    size: fileData.size,
  };

  const isIdentityDoc = documentType === 'pan' || documentType === 'aadhaar';

  if (manualText && manualText.trim()) {
    const formattedLabel = documentType === 'pan' ? 'PAN Card Number' : documentType === 'aadhaar' ? 'Aadhaar Card Number' : 'Manual Input';
    const textContent = `${formattedLabel}: ${manualText.trim()}`;
    
    docData.ocr = {
      text: textContent,
      engine: 'manual_input',
      status: 'completed',
      processedAt: new Date(),
    };

    docData.aiProcessing = {
      status: 'completed',
      predictedType: documentType === 'pan' ? 'PAN' : documentType === 'aadhaar' ? 'AADHAAR' : 'OTHER',
      confidence: 1.0,
      extractedData: documentType === 'pan' 
        ? { pan_number: manualText.trim() }
        : documentType === 'aadhaar' 
        ? { aadhaar_number: manualText.trim() }
        : {},
      processedAt: new Date(),
      documentTypeMatch: true,
      geminiCallsMade: 0,
    };
  } else if (isIdentityDoc) {
    // Digital PDF/image — PyMuPDF extraction runs in aiService (no Gemini)
    docData.ocr = { status: 'pending' };
    docData.aiProcessing = { status: 'pending' };
  }

  const document = await Document.create(docData);

  application.documents.push(document._id);
  
  if (application.status === 'draft') {
    application.status = 'documents_pending';
  }
  
  await application.save();

  await logActivity(applicationId, userId, 'Document Uploaded', {
    documentType,
    originalName: fileData.originalname,
    hasManualText: Boolean(manualText),
  });

  // Trigger AI processing asynchronously (fire-and-forget)
  aiService.processDocument(document._id).catch((err) =>
    console.error('[AI] Auto-processing failed:', err.message)
  );

  return document;
};

const updateApplicationStatus = async (applicationId, userId, status) => {
  const application = await getApplicationByIdAndUser(applicationId, userId);
  const previousStatus = application.status;
  application.status = status;
  await application.save();

  await logActivity(applicationId, userId, 'Status Changed', {
    from: previousStatus,
    to: status,
  });

  return application;
};

module.exports = {
  createApplication,
  getUserApplications,
  getApplicationByIdAndUser,
  uploadDocument,
  updateApplicationStatus,
};
