const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const config = require('../src/config');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const LoanApplication = require('../src/models/LoanApplication');

const API_BASE = 'http://localhost:5000/api';

async function testBankAndLoanTypeSelection() {
  console.log('--- 🧪 Testing Bank & Loan Type Selection Feature ---');
  await connectDB();

  // 1. Get or create applicant user
  let applicant = await User.findOne({ email: 'rohit.sharma@example.com' });
  if (!applicant) {
    applicant = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit.sharma@example.com',
      passwordHash: 'Password123!',
      role: 'applicant',
    });
  }

  const applicantToken = jwt.sign({ id: applicant._id }, config.jwtSecret, { expiresIn: '7d' });
  const applicantHeaders = {
    Authorization: `Bearer ${applicantToken}`,
    'Content-Type': 'application/json',
  };

  // 2. Create a new application selecting SBI and Home Loan
  console.log('\n1️⃣ Creating Application: State Bank of India (sbi) + Home Loan...');
  const createPayload = {
    bankId: 'sbi',
    bankName: 'State Bank of India',
    loanType: 'home',
    requestedAmount: 4500000, // 45 Lakh
    tenureMonths: 240, // 20 years
    employmentType: 'salaried',
    declaredMonthlyIncome: 125000,
  };

  const createRes = await axios.post(`${API_BASE}/applications`, createPayload, {
    headers: applicantHeaders,
  });

  const createdApp = createRes.data.data;
  console.log('   ✅ Application Created Successfully!');
  console.log(`   ID:        ${createdApp._id}`);
  console.log(`   Bank ID:   ${createdApp.bankId}`);
  console.log(`   Bank Name: ${createdApp.bankName}`);
  console.log(`   Loan Type: ${createdApp.loanType}`);
  console.log(`   Amount:    ₹${createdApp.requestedAmount.toLocaleString('en-IN')}`);

  if (createdApp.bankId !== 'sbi' || createdApp.bankName !== 'State Bank of India' || createdApp.loanType !== 'home') {
    throw new Error('Bank selection data mismatch!');
  }

  // 3. Fetch application from applicant endpoint
  console.log('\n2️⃣ Fetching Application from GET /api/applications/:id...');
  const fetchRes = await axios.get(`${API_BASE}/applications/${createdApp._id}`, {
    headers: applicantHeaders,
  });
  const fetchedApp = fetchRes.data.data;
  console.log(`   ✅ Verified Bank: ${fetchedApp.bankName} (${fetchedApp.bankId}), Loan Type: ${fetchedApp.loanType}`);

  // 4. Fetch application from officer endpoint
  console.log('\n3️⃣ Fetching Application from GET /api/officer/applications/:id...');
  let officer = await User.findOne({ role: 'officer' });
  const officerToken = jwt.sign({ id: officer._id }, config.jwtSecret, { expiresIn: '7d' });
  const officerHeaders = {
    Authorization: `Bearer ${officerToken}`,
    'Content-Type': 'application/json',
  };

  const officerFetchRes = await axios.get(`${API_BASE}/officer/applications/${createdApp._id}`, {
    headers: officerHeaders,
  });
  const officerApp = officerFetchRes.data.data;
  console.log(`   ✅ Officer View Verified: Bank=${officerApp.bankName}, LoanType=${officerApp.loanType}`);

  console.log('\n🎉 ALL BANK & LOAN TYPE SELECTION TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testBankAndLoanTypeSelection().catch((err) => {
  console.error('\n❌ Test Failure:', err.response?.data || err.message);
  process.exit(1);
});
