const ApiError = require('../utils/ApiError');

const LOAN_TYPES = ['home', 'personal', 'vehicle', 'education', 'business'];
const EMPLOYMENT_TYPES = ['salaried', 'self-employed', 'business-owner'];

const validateApplication = (req, res, next) => {
  const { loanType, requestedAmount, tenureMonths, employmentType, declaredMonthlyIncome } = req.body;
  const errors = [];

  if (!loanType || !LOAN_TYPES.includes(loanType)) {
    errors.push(`loanType must be one of: ${LOAN_TYPES.join(', ')}`);
  }

  if (requestedAmount == null || typeof requestedAmount !== 'number' || requestedAmount < 10000) {
    errors.push('requestedAmount must be a number of at least 10,000');
  }

  if (requestedAmount != null && requestedAmount > 100000000) {
    errors.push('requestedAmount cannot exceed 10,00,00,000');
  }

  if (tenureMonths == null || typeof tenureMonths !== 'number' || tenureMonths < 6 || tenureMonths > 360) {
    errors.push('tenureMonths must be a number between 6 and 360');
  }

  if (!employmentType || !EMPLOYMENT_TYPES.includes(employmentType)) {
    errors.push(`employmentType must be one of: ${EMPLOYMENT_TYPES.join(', ')}`);
  }

  if (declaredMonthlyIncome == null || typeof declaredMonthlyIncome !== 'number' || declaredMonthlyIncome < 1000) {
    errors.push('declaredMonthlyIncome must be a number of at least 1,000');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join('; ')));
  }

  next();
};

module.exports = { validateApplication };
