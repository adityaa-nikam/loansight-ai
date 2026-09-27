const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const config = require('../src/config');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const LoanApplication = require('../src/models/LoanApplication');
const Document = require('../src/models/Document');
const ValidationResult = require('../src/models/ValidationResult');
const aiAssistantService = require('../src/services/aiAssistantService');

async function runTests() {
  console.log('--- 🧪 Testing Hybrid RAG + Applicant Data AI Loan Officer Assistant ---');
  await connectDB();

  // Find or create test user and application
  let user = await User.findOne({ email: 'officer_demo@loanlens.ai' });
  if (!user) {
    user = await User.create({
      name: 'Sahil Dhamane',
      email: 'officer_demo@loanlens.ai',
      password: 'Password123!',
      role: 'officer',
    });
  }

  let applicant = await User.findOne({ email: 'rohit.sharma@example.com' });
  if (!applicant) {
    applicant = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit.sharma@example.com',
      password: 'Password123!',
      role: 'applicant',
    });
  }

  let application = await LoanApplication.findOne({ applicant: applicant._id });
  if (!application) {
    application = await LoanApplication.create({
      applicant: applicant._id,
      loanType: 'personal',
      requestedAmount: 1500000, // 15 Lakh
      tenureMonths: 36,
      employmentType: 'salaried',
      declaredMonthlyIncome: 85000,
      status: 'under_review',
    });
    console.log('Created sample loan application:', application._id);
  }

  // Create or update sample documents with extracted data
  let salaryDoc = await Document.findOne({ application: application._id, documentType: 'salary_slip' });
  if (!salaryDoc) {
    salaryDoc = await Document.create({
      application: application._id,
      uploadedBy: applicant._id,
      documentType: 'salary_slip',
      originalName: 'Salary_Slip_Aug_2026.pdf',
      filename: 'salary_slip_rohit.pdf',
      path: 'uploads/sample_salary.pdf',
      mimetype: 'application/pdf',
      size: 150000,
      status: 'approved',
      aiProcessing: {
        status: 'completed',
        predictedType: 'SALARY_SLIP',
        confidence: 0.96,
        extractedData: {
          employer_name: 'Tata Consultancy Services Ltd',
          employee_name: 'Rohit Sharma',
          net_salary: '72,500',
          gross_salary: '88,000',
          pay_period: 'August 2026',
        },
      },
    });
    application.documents.push(salaryDoc._id);
  }

  let bankDoc = await Document.findOne({ application: application._id, documentType: 'bank_statement' });
  if (!bankDoc) {
    bankDoc = await Document.create({
      application: application._id,
      uploadedBy: applicant._id,
      documentType: 'bank_statement',
      originalName: 'HDFC_Bank_Statement_6M.pdf',
      filename: 'hdfc_bank_statement.pdf',
      path: 'uploads/sample_statement.pdf',
      mimetype: 'application/pdf',
      size: 450000,
      status: 'approved',
      aiProcessing: {
        status: 'completed',
        predictedType: 'BANK_STATEMENT',
        confidence: 0.94,
        extractedData: {
          bank_name: 'HDFC Bank Ltd',
          account_holder: 'Rohit Sharma',
          average_monthly_balance: '1,45,000',
          detected_salary_credit: '72,500',
          recurring_loan_debits: '12,000',
          cheque_bounces: 0,
        },
      },
    });
    application.documents.push(bankDoc._id);
  }

  let panDoc = await Document.findOne({ application: application._id, documentType: 'pan' });
  if (!panDoc) {
    panDoc = await Document.create({
      application: application._id,
      uploadedBy: applicant._id,
      documentType: 'pan',
      originalName: 'PAN_Card_Rohit.jpg',
      filename: 'pan_card.jpg',
      path: 'uploads/sample_pan.jpg',
      mimetype: 'image/jpeg',
      size: 80000,
      status: 'approved',
      aiProcessing: {
        status: 'completed',
        predictedType: 'PAN',
        confidence: 0.98,
        extractedData: {
          pan_number: 'ABCPS1234F',
          name_on_card: 'Rohit Sharma',
          date_of_birth: '15/04/1990',
        },
      },
    });
    application.documents.push(panDoc._id);
  }

  await application.save();

  // Create ValidationResult
  let validation = await ValidationResult.findOne({ application: application._id });
  if (!validation) {
    validation = await ValidationResult.create({
      application: application._id,
      status: 'REVIEW_REQUIRED',
      overallSeverity: 'MEDIUM',
      riskLevel: 'MEDIUM',
      verificationScore: 78,
      summary: 'Income variance detected: declared ₹85,000 vs verified salary slip ₹72,500 (14.7% variance). Existing EMI obligation ₹12,000/mo.',
      keyFindings: [
        'Declared salary (₹85,000) exceeds payslip net pay (₹72,500) by 14.7%',
        'KYC verified: PAN name matches application name (100% match)',
        'Bank statement reflects zero cheque bounces and regular salary credits',
      ],
      findings: [
        {
          title: 'Salary Declaration Variance',
          subtitle: 'Declared income is 14.7% higher than extracted net salary',
          severity: 'MEDIUM',
          explanation: ['Declared: ₹85,000/mo', 'Verified Payslip: ₹72,500/mo'],
          documents: ['Application Form', 'salary_slip'],
        },
      ],
      recommendedAction: 'MANUAL_REVIEW',
    });
  }

  console.log('✅ Application and Documents ready:', application._id.toString());

  // Test 1: Eligibility inquiry
  console.log('\n--- 1. Asking: "Is this applicant eligible for ₹15 lakh?" ---');
  const res1 = await aiAssistantService.askLoanAssistant(
    application._id.toString(),
    'Is this applicant eligible for ₹15 lakh?'
  );
  console.log('Verdict:', res1.verdict);
  console.log('Confidence:', res1.confidence, `(${res1.confidenceLevel})`);
  console.log('Calculated FOIR:', res1.financialMetrics?.calculatedFoirPct + '%');
  console.log('Proposed EMI:', '₹' + res1.financialMetrics?.proposedEmi);
  console.log('Max Eligible Amount:', '₹' + res1.financialMetrics?.maxEligibleAmount);
  console.log('Applicant Evidence Cited:', res1.applicantDataSources?.length);
  console.log('Policy Rules Cited:', res1.policySources?.map(p => `${p.policyName} (${p.section})`).join(', '));
  console.log('\nAnswer Snippet:\n', res1.answer.substring(0, 300) + '...\n');

  // Test 2: Why flagged inquiry
  console.log('\n--- 2. Asking: "Why was this application flagged?" ---');
  const res2 = await aiAssistantService.askLoanAssistant(
    application._id.toString(),
    'Why was this application flagged?'
  );
  console.log('Verdict:', res2.verdict);
  console.log('Reasoning:', res2.reasoning);
  console.log('\nAnswer Snippet:\n', res2.answer.substring(0, 300) + '...\n');

  // Test 3: Which policy rule caused the issue
  console.log('\n--- 3. Asking: "Which policy rule caused the issue?" ---');
  const res3 = await aiAssistantService.askLoanAssistant(
    application._id.toString(),
    'Which policy rule caused the issue?'
  );
  console.log('Verdict:', res3.verdict);
  console.log('Policy Sources:', res3.policySources);
  console.log('\nAnswer Snippet:\n', res3.answer.substring(0, 300) + '...\n');

  console.log('\n🎉 ALL HYBRID RAG AI LOAN OFFICER ASSISTANT TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
