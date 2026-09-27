import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

export function useForm({ initialValues, validationRules, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;

    setValues((prev) => ({ ...prev, [name]: processedValue }));
    setSubmitError(null);

    if (touched[name]) {
      const fieldRules = validationRules[name];
      if (fieldRules) {
        let fieldError = null;
        for (const rule of fieldRules) {
          fieldError = rule(processedValue);
          if (fieldError) break;
        }
        setErrors((prev) => ({ ...prev, [name]: fieldError }));
      }
    }
  }, [touched, validationRules]);

  const handleBlur = useCallback((e) => {
    const { name, value, type } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    const fieldRules = validationRules[name];
    if (fieldRules) {
      let fieldError = null;
      for (const rule of fieldRules) {
        fieldError = rule(processedValue);
        if (fieldError) break;
      }
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  }, [validationRules]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const allTouched = {};
    Object.keys(validationRules).forEach((key) => { allTouched[key] = true; });
    setTouched(allTouched);

    const validationErrors = validateForm(values, validationRules);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationRules, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError(null);
    setIsSuccess(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);

    const fieldRules = validationRules[name];
    if (fieldRules) {
      let fieldError = null;
      for (const rule of fieldRules) {
        fieldError = rule(value);
        if (fieldError) break;
      }
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  }, [validationRules]);

  return {
    values,
    setValues,
    setFieldValue,
    errors,
    touched,
    isSubmitting,
    submitError,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
