/**
 * Form Validation Utilities
 */

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  passwordStrength: (value) => {
    if (!value) return { score: 0, label: 'None', color: '#94a3b8' };
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const levels = [
      { label: 'Very Weak', color: '#ef4444' },
      { label: 'Weak', color: '#f97316' },
      { label: 'Fair', color: '#eab308' },
      { label: 'Good', color: '#22c55e' },
      { label: 'Strong', color: '#10b981' },
    ];

    return { score, ...levels[Math.min(score, levels.length) - 1] || levels[0] };
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  phone: (value) => {
    if (!value) return null; // optional
    const phoneRegex = /^[+]?[\d\s()-]{7,15}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return null;
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
    return null;
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) return `${fieldName} must be less than ${max} characters`;
    return null;
  },

  number: (value, fieldName = 'This field') => {
    if (value === '' || value === null || value === undefined) return null;
    if (isNaN(Number(value))) return `${fieldName} must be a number`;
    return null;
  },

  positiveNumber: (value, fieldName = 'This field') => {
    if (value === '' || value === null || value === undefined) return null;
    if (isNaN(Number(value)) || Number(value) < 0) return `${fieldName} must be a positive number`;
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  validateForm: (fields) => {
    const errors = {};
    let isValid = true;

    for (const [key, validations] of Object.entries(fields)) {
      for (const validation of validations) {
        const error = validation();
        if (error) {
          errors[key] = error;
          isValid = false;
          break;
        }
      }
    }

    return { isValid, errors };
  },
};

export default validators;
