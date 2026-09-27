/**
 * Loan product configuration.
 *
 * `type` values MUST stay within the Document model enum in
 * backend/src/models/Document.js:
 *   payment_slip | salary_slip | bank_statement | form16 | pan | aadhaar |
 *   property_document | other
 *
 * Loan type keys MUST stay in sync with LOAN_TYPE_DETAILS in ./banks.js
 * and with LOAN_TYPES in backend/src/models/LoanApplication.js.
 */

export const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'lap', label: 'Loan Against Property' },
  { value: 'education', label: 'Education Loan' },
  { value: 'vehicle', label: 'Vehicle / Auto Loan' },
];

const IDENTITY_DOCS = [
  { type: 'pan', label: 'PAN Card', description: 'Identity Proof' },
  { type: 'aadhaar', label: 'Aadhaar Card', description: 'Identity Proof' },
];

const INCOME_DOCS = [
  { type: 'salary_slip', label: 'Salary Slip', description: 'Last 3 Months' },
  { type: 'bank_statement', label: 'Bank Statement', description: 'Last 6 Months' },
];

export const DOCUMENT_REQUIREMENTS = {
  personal: [
    ...IDENTITY_DOCS,
    ...INCOME_DOCS,
    { type: 'form16', label: 'Form 16', description: 'Latest Assessment Year' },
  ],
  home: [
    ...IDENTITY_DOCS,
    ...INCOME_DOCS,
    { type: 'property_document', label: 'Property Documents', description: 'Agreement / Title Deed' },
  ],
  business: [
    ...IDENTITY_DOCS,
    { type: 'bank_statement', label: 'Bank Statement', description: 'Last 12 Months (Current A/c)' },
    { type: 'form16', label: 'ITR / Form 16', description: 'Last 2 Assessment Years' },
  ],
  lap: [
    ...IDENTITY_DOCS,
    ...INCOME_DOCS,
    { type: 'property_document', label: 'Property Documents', description: 'Title Deed & Valuation Report' },
  ],
  education: [
    ...IDENTITY_DOCS,
    { type: 'bank_statement', label: 'Bank Statement', description: 'Last 6 Months' },
    { type: 'other', label: 'Admission Letter', description: 'Institution Offer / Fee Structure' },
  ],
  vehicle: [
    ...IDENTITY_DOCS,
    ...INCOME_DOCS,
  ],
};

/** Legacy key — older applications were stored as `auto` before `vehicle`. */
DOCUMENT_REQUIREMENTS.auto = DOCUMENT_REQUIREMENTS.vehicle;

/**
 * Always returns a usable checklist. Never returns an empty array, so neither
 * the applicant uploader nor the officer checklist can render blank for a loan
 * type that has not been configured yet.
 */
export function getDocumentRequirements(loanType) {
  if (!loanType) return [];
  return DOCUMENT_REQUIREMENTS[loanType] || [...IDENTITY_DOCS, ...INCOME_DOCS];
}

export const EMPLOYMENT_TYPES = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'business-owner', label: 'Business Owner' },
];

export const APPLICATION_STEPS = [
  { step: 1, label: 'Loan Details', status: 'active' },
  { step: 2, label: 'Documents', status: 'upcoming' },
  { step: 3, label: 'Verification', status: 'upcoming' },
  { step: 4, label: 'Review', status: 'upcoming' },
];
