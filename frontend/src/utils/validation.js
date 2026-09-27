export const validators = {
  required: (value, fieldName = 'This field') => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min, fieldName = 'This field') => (value) => {
    if (!value) return null;
    if (String(value).length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, fieldName = 'This field') => (value) => {
    if (!value) return null;
    if (String(value).length > max) {
      return `${fieldName} cannot exceed ${max} characters`;
    }
    return null;
  },

  passwordMatch: (password) => (confirmPassword) => {
    if (!confirmPassword) return null;
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  numericRange: (min, max, fieldName = 'Value') => (value) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (num < min) {
      return `${fieldName} must be at least ${min.toLocaleString('en-IN')}`;
    }
    if (num > max) {
      return `${fieldName} cannot exceed ${max.toLocaleString('en-IN')}`;
    }
    return null;
  },

  select: (fieldName = 'This field') => (value) => {
    if (!value) {
      return `Please select a ${fieldName.toLowerCase()}`;
    }
    return null;
  },
};

export const validateForm = (values, rules) => {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(values[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
};
