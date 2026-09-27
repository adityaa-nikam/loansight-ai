/* TEMP: seed a realistic action-required state for the preview test applicant. Safe to delete. */
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const LoanApplication = require('../src/models/LoanApplication');
const Activity = require('../src/models/Activity');
const ValidationResult = require('../src/models/ValidationResult');

(async () => {
  await connectDB();

  const user = await User.findOne({ email: 'ui.preview.test@loanlens.local' }).lean();
  if (!user) throw new Error('preview test user not found');

  const app = await LoanApplication.findOne({ applicant: user._id, loanType: 'home' }).sort({ createdAt: 1 });
  if (!app) throw new Error('home application not found for preview test user');

  // Real verification checks (same shape deterministic_validator emits).
  const checks = [
    {
      type: 'IDENTITY_NAME_MATCH',
      status: 'FLAGGED',
      severity: 'HIGH',
      message:
        "Significant name discrepancy: Salary Slip name does not match the declared applicant name (lowest match score 17%).",
    },
    {
      type: 'SLIP_VS_BANK_SALARY',
      status: 'WARNING',
      severity: 'MEDIUM',
      message:
        'No recurring salary credit entries were identified in the bank statement to corroborate the declared salary.',
    },
    {
      type: 'AADHAAR_VERIFICATION',
      status: 'WARNING',
      severity: 'MEDIUM',
      message: 'Aadhaar number could not be fully verified from the uploaded documents.',
    },
  ];

  await ValidationResult.findOneAndUpdate(
    { application: app._id },
    {
      application: app._id,
      status: 'REVIEW_REQUIRED',
      overallSeverity: 'HIGH',
      riskLevel: 'HIGH',
      verificationScore: 48,
      recommendedAction: 'REQUEST_ADDITIONAL_DOCS',
      checks,
      validatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // A real status-change audit row -> "Documents required" decision notification.
  const already = await Activity.findOne({ application: app._id, action: 'Status Changed' });
  if (!already) {
    await Activity.create({
      application: app._id,
      action: 'Status Changed',
      details: { from: 'under_review', to: 'documents_required' },
    });
  }

  if (app.status !== 'documents_required') {
    app.status = 'documents_required';
    await app.save();
  }

  console.log('Seeded action-required state for application', String(app._id));
  await mongoose.connection.close();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
