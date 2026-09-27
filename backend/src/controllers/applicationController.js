const applicationService = require('../services/applicationService');
const notificationService = require('../services/notificationService');
const ApiError = require('../utils/ApiError');

const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.createApplication(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getUserApplications(req.user._id);
    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationByIdAndUser(req.params.id, req.user._id);
    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const uploadApplicationDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a file');
    }
    
    const documentType = req.body.documentType || 'other';
    const manualText = req.body.manualText || null;

    const document = await applicationService.uploadDocument(
      req.params.id,
      req.user._id,
      req.file,
      documentType,
      manualText
    );

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const submitApplication = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStatus(req.params.id, req.user._id, 'under_review');
    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const payload = await notificationService.getApplicantNotifications(req.user._id);
    res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplication,
  getNotifications,
  uploadApplicationDocument,
  submitApplication,
};
