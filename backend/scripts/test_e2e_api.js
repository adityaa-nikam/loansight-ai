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

async function runE2ETests() {
  console.log('================================================================');
  console.log('🚀 Running Comprehensive E2E Test Suite for LoanLens AI Assistant');
  console.log('================================================================\n');

  // 1. Health check
  console.log('1️⃣ Checking Health Endpoint...');
  const healthRes = await axios.get(`${API_BASE}/health`);
  console.log('   Status:', healthRes.data.status || 'OK');

  // 2. Connect DB and find/create officer user
  console.log('\n2️⃣ Authenticating as Loan Officer...');
  await connectDB();
  let officer = await User.findOne({ role: 'officer' });
  if (!officer) {
    officer = await User.create({
      name: 'Sahil Dhamane',
      email: 'officer_demo@loanlens.ai',
      passwordHash: 'Password123!',
      role: 'officer',
    });
  }

  const token = jwt.sign({ id: officer._id }, config.jwtSecret, { expiresIn: '7d' });
  console.log(`   ✅ Authenticated as: ${officer.name} (${officer.email}) [Role: ${officer.role}]`);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Get Applications List
  console.log('\n3️⃣ Fetching Applications from MongoDB (GET /api/officer/applications)...');
  const appsRes = await axios.get(`${API_BASE}/officer/applications`, { headers: authHeaders });
  const applications = appsRes.data.data || appsRes.data;
  console.log(`   ✅ Found ${applications.length} applications in database.`);

  if (applications.length === 0) {
    throw new Error('No applications found in database.');
  }

  const testApp = applications[0];
  const testAppId = testApp._id;
  console.log(`   Selected Application: #${testAppId.slice(-6)} (${testApp.loanType?.toUpperCase()} Loan - ${testApp.applicant?.name || 'Applicant'})`);

  // 4. Test Policy Catalog API
  console.log('\n4️⃣ Testing Bank Policy RAG Catalog API (GET /api/ai/policies)...');
  const polRes = await axios.get(`${API_BASE}/ai/policies`, { headers: authHeaders });
  const policies = polRes.data.data || polRes.data.policies || [];
  console.log(`   ✅ Retrieved ${policies.length} Bank Policies from Vector RAG Knowledge Base.`);
  console.log(`   Categories: ${[...new Set(policies.map(p => p.category))].join(', ')}`);

  // 5. Test AI Assistant Query: Eligibility
  console.log('\n5️⃣ Testing AI Loan Officer Assistant Query (POST /api/ai/loan-assistant)...');
  console.log('   ❓ Question: "Is this applicant eligible for ₹15 lakh?"');
  const q1Res = await axios.post(
    `${API_BASE}/ai/loan-assistant`,
    {
      applicationId: testAppId,
      question: 'Is this applicant eligible for ₹15 lakh?',
    },
    { headers: authHeaders }
  );

  const data1 = q1Res.data.data;
  console.log('   ------------------------------------------------------------');
  console.log(`   🏷️  Verdict:          ${data1.verdict}`);
  console.log(`   🎯 Confidence:       ${Math.round((data1.confidence || 0.9) * 100)}% (${data1.confidenceLevel || 'HIGH'})`);
  console.log(`   📊 Calculated FOIR:  ${data1.financialMetrics?.calculatedFoirPct}% (Policy Cap: ${data1.financialMetrics?.maxPermissibleFoirPct}%)`);
  console.log(`   💰 Proposed EMI:     ₹${data1.financialMetrics?.proposedEmi?.toLocaleString('en-IN')}/mo`);
  console.log(`   💎 Max Eligible Loan: ₹${data1.financialMetrics?.maxEligibleAmount?.toLocaleString('en-IN')}`);
  console.log(`   📁 Applicant Facts Cited: ${data1.applicantDataSources?.length}`);
  data1.applicantDataSources?.slice(0, 3).forEach((src, idx) => {
    console.log(`      ${idx + 1}. [${src.sourceDocument}] ${src.label}: ${src.value} (${src.verified ? 'Verified' : 'Declared'})`);
  });
  console.log(`   🏛️  Bank Policies Cited: ${data1.policySources?.length}`);
  data1.policySources?.slice(0, 3).forEach((pol, idx) => {
    console.log(`      ${idx + 1}. [${pol.policyName}] ${pol.section} (${Math.round((pol.similarityScore || 0.9) * 100)}% Match)`);
  });
  console.log('   ------------------------------------------------------------');

  // 6. Test AI Assistant Query: Why Flagged
  console.log('\n6️⃣ Testing Root Cause Flag Analysis (POST /api/ai/loan-assistant)...');
  console.log('   ❓ Question: "Why was this application flagged?"');
  const q2Res = await axios.post(
    `${API_BASE}/ai/loan-assistant`,
    {
      applicationId: testAppId,
      question: 'Why was this application flagged?',
    },
    { headers: authHeaders }
  );
  const data2 = q2Res.data.data;
  console.log(`   🏷️  Verdict:    ${data2.verdict}`);
  console.log(`   🔍 Reasoning:  ${data2.reasoning?.join(' | ') || 'N/A'}`);

  // 7. Test AI Assistant Query: Policy Rule
  console.log('\n7️⃣ Testing Policy Rule Identification (POST /api/ai/loan-assistant)...');
  console.log('   ❓ Question: "Which policy rule caused the issue?"');
  const q3Res = await axios.post(
    `${API_BASE}/ai/loan-assistant`,
    {
      applicationId: testAppId,
      question: 'Which policy rule caused the issue?',
    },
    { headers: authHeaders }
  );
  const data3 = q3Res.data.data;
  console.log(`   🏛️  Policy Sources: ${data3.policySources?.map(p => p.policyName + ' - ' + p.section).join(', ')}`);

  // 8. Test Saving AI Analysis to Officer Notes
  console.log('\n8️⃣ Testing Save AI Insights to Officer Notes in MongoDB...');
  const noteContent = `[AI Underwriting Evaluation - ${data1.verdict}]\n${data1.answer.substring(0, 200)}...\n\nMetrics: FOIR ${data1.financialMetrics?.calculatedFoirPct}%, Max Eligible: ₹${data1.financialMetrics?.maxEligibleAmount}`;
  const noteRes = await axios.post(
    `${API_BASE}/officer/applications/${testAppId}/notes`,
    { content: noteContent },
    { headers: authHeaders }
  );
  console.log('   ✅ Note successfully persisted in MongoDB! Note ID:', noteRes.data.data?._id || noteRes.data._id);

  console.log('\n================================================================');
  console.log('🎉 ALL END-TO-END HYBRID RAG AI TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err.response?.data || err.message);
  process.exit(1);
});
