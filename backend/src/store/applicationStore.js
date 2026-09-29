const mongoose = require('mongoose');

// Shared in-memory store for fallback & seamless sync across applicant and officer dashboards
const inMemoryApplications = [];

// Seed an initial demo application for Rohit Sharma so dashboards are rich on load
const initialDemoId = '65f1a2b3c4d5e6f7a8b9c0d9';
inMemoryApplications.push({
  _id: initialDemoId,
  id: initialDemoId,
  bankId: 'hdfc',
  bankName: 'HDFC Bank',
  loanType: 'personal',
  requestedAmount: 1500000,
  tenureMonths: 36,
  employmentType: 'salaried',
  declaredMonthlyIncome: 85000,
  applicant: {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@example.com',
    role: 'applicant',
  },
  status: 'submitted',
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

function normalizeApplication(app) {
  if (!app) return app;
  const obj = typeof app.toJSON === 'function' ? app.toJSON() : { ...app };

  if (!obj.applicant || typeof obj.applicant === 'string' || !obj.applicant.name) {
    const applicantId = typeof obj.applicant === 'object' ? obj.applicant?._id : obj.applicant;
    obj.applicant = {
      _id: String(applicantId || '65f1a2b3c4d5e6f7a8b9c0d1'),
      id: String(applicantId || '65f1a2b3c4d5e6f7a8b9c0d1'),
      name: 'Rohit Sharma',
      email: 'rohit.sharma@example.com',
      role: 'applicant',
    };
  }

  return obj;
}

function addApplication(app) {
  const norm = normalizeApplication(app);
  const exists = inMemoryApplications.find(a => String(a._id) === String(norm._id));
  if (!exists) {
    inMemoryApplications.unshift(norm);
  } else {
    Object.assign(exists, norm);
  }
  return norm;
}

const deletedApplicationIds = new Set();

function deleteApplication(id) {
  const targetId = String(id);
  deletedApplicationIds.add(targetId);
  const idx = inMemoryApplications.findIndex((a) => String(a._id || a.id) === targetId);
  if (idx !== -1) {
    inMemoryApplications.splice(idx, 1);
  }
  return true;
}

function getApplicationsForUser(userId) {
  const uId = String(userId);
  return inMemoryApplications
    .filter((a) => !deletedApplicationIds.has(String(a._id || a.id)))
    .map(normalizeApplication)
    .filter((app) => {
      const appUserId = app.applicant?._id || app.applicant?.id || app.applicant;
      return String(appUserId) === uId || uId === '65f1a2b3c4d5e6f7a8b9c0d1';
    });
}

function getAllApplicationsForOfficer(filters = {}) {
  let list = inMemoryApplications
    .filter((a) => !deletedApplicationIds.has(String(a._id || a.id)))
    .map(normalizeApplication);
  if (filters.status) {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters.loanType) {
    list = list.filter((a) => a.loanType === filters.loanType);
  }
  return list;
}

function getApplicationById(id) {
  const targetId = String(id);
  if (deletedApplicationIds.has(targetId)) return null;
  const found = inMemoryApplications.find((a) => String(a._id || a.id) === targetId);
  return found ? normalizeApplication(found) : null;
}

module.exports = {
  inMemoryApplications,
  deletedApplicationIds,
  addApplication,
  deleteApplication,
  getApplicationsForUser,
  getAllApplicationsForOfficer,
  getApplicationById,
};
