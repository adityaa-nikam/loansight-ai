const LoanApplication = require('../models/LoanApplication');
const Document = require('../models/Document');
const Note = require('../models/Note');
const Activity = require('../models/Activity');
const ValidationResult = require('../models/ValidationResult');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const { logActivity } = require('../utils/activityLogger');

const getAllApplications = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $nin: ['draft', 'documents_pending'] };
  }
  if (filters.loanType) query.loanType = filters.loanType;

  return await LoanApplication.find(query)
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });
};

const getApplicationById = async (id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  const application = await LoanApplication.findById(id)
    .populate('applicant', 'name email role')
    .populate('documents');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  return application;
};

const updateApplicationStatus = async (id, status, officerId) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  const application = await LoanApplication.findById(id);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const previousStatus = application.status;
  application.status = status;
  await application.save();

  // Log the status change activity
  await logActivity(id, officerId, 'Status Changed', {
    from: previousStatus,
    to: status,
  });

  // Approving the application clears every supporting document. Once the officer
  // signs off on the whole file, each document is accepted — so the applicant
  // sees a fully "Approved" set instead of stale pending/rejected pills, and any
  // earlier rejection comment is cleared.
  if (status === 'approved') {
    const result = await Document.updateMany(
      { application: id, status: { $ne: 'approved' } },
      { $set: { status: 'approved', reviewComment: null } }
    );
    const changed = result.modifiedCount ?? result.nModified ?? 0;
    if (changed > 0) {
      await logActivity(id, officerId, 'Documents Approved', { count: changed });
    }
  }

  // Re-populate for the response — documents included so the officer UI reflects
  // the auto-approval immediately without a second fetch.
  await application.populate('applicant', 'name email');
  await application.populate('documents');

  return application;
};

const getDocumentForDownload = async (documentId) => {
  if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid document ID format');
  }

  const document = await Document.findById(documentId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  return document;
};

const updateDocumentReview = async (docId, status, reviewComment, officerId) => {
  if (!docId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid document ID format');
  }

  const document = await Document.findById(docId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  document.status = status;
  document.reviewComment = status === 'rejected' ? reviewComment : null;
  await document.save();

  // Log the activity
  const actionText = status === 'approved' ? 'Document Approved' : 'Document Rejected';
  await logActivity(document.application, officerId, actionText, {
    documentType: document.documentType,
    originalName: document.originalName,
    reviewComment: reviewComment || null,
  });

  return document;
};

const addNote = async (applicationId, authorId, content) => {
  if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  const note = await Note.create({
    application: applicationId,
    author: authorId,
    content,
  });

  await logActivity(applicationId, authorId, 'Note Added', {
    preview: content.substring(0, 100),
  });

  // Populate author for the response
  await note.populate('author', 'name email role');

  return note;
};

const getNotes = async (applicationId) => {
  if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  return await Note.find({ application: applicationId })
    .populate('author', 'name email role')
    .sort({ createdAt: -1 });
};

const getActivity = async (applicationId) => {
  if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  return await Activity.find({ application: applicationId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 });
};

const deleteApplication = async (applicationId) => {
  if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw ApiError.badRequest('Invalid application ID format');
  }

  const application = await LoanApplication.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Find all documents to delete physical files
  const documents = await Document.find({ application: applicationId });
  documents.forEach(doc => {
    try {
      if (doc.path && fs.existsSync(doc.path)) {
        fs.unlinkSync(doc.path);
      }
    } catch (err) {
      console.error(`Failed to delete file ${doc.path}:`, err);
    }
  });

  // Delete all related records
  await Document.deleteMany({ application: applicationId });
  await Note.deleteMany({ application: applicationId });
  await Activity.deleteMany({ application: applicationId });
  await ValidationResult.deleteMany({ application: applicationId });

  // Delete the application itself
  await LoanApplication.findByIdAndDelete(applicationId);
  
  return true;
};

const getDashboardStats = async () => {
  const [total, submitted, underReview, completed, pendingDocs, docsRequired] = await Promise.all([
    LoanApplication.countDocuments({ status: { $nin: ['draft', 'documents_pending'] } }),
    LoanApplication.countDocuments({ status: 'submitted' }),
    LoanApplication.countDocuments({ status: 'under_review' }),
    LoanApplication.countDocuments({ status: { $in: ['approved', 'rejected'] } }),
    LoanApplication.countDocuments({ status: 'documents_pending' }),
    LoanApplication.countDocuments({ status: 'documents_required' }),
  ]);

  const recent = await LoanApplication.find({ status: { $nin: ['draft', 'documents_pending'] } })
    .populate('applicant', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    stats: { total, submitted, underReview, completed, pendingDocs, docsRequired },
    recent,
  };
};

module.exports = {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getDocumentForDownload,
  updateDocumentReview,
  addNote,
  getNotes,
  getActivity,
  getDashboardStats,
  deleteApplication,
};
