const express = require('express');
const {
  queryLoanAssistant,
  getPolicies,
  searchPolicies,
} = require('../controllers/officerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes protected for loan officers / admins (or authenticated users)
router.use(protect);

/**
 * @route   POST /api/ai/loan-assistant
 * @desc    Query Hybrid RAG + Applicant Data AI Loan Officer Assistant
 * @access  Private (Officer/Admin)
 */
router.post('/loan-assistant', queryLoanAssistant);

/**
 * @route   GET /api/ai/policies
 * @desc    Get all indexed bank policies from knowledge base
 * @access  Private
 */
router.get('/policies', getPolicies);

/**
 * @route   POST /api/ai/policies/search
 * @desc    Search policy knowledge base
 * @access  Private
 */
router.post('/policies/search', searchPolicies);

module.exports = router;
