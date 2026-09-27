import { useId } from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-charcoal-700"
        >
          {label}
          {required && <span className="text-error-600 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`
          w-full px-4 py-2.5 rounded-lg
          text-charcoal-900 text-sm
          bg-white border
          transition-all duration-200
          placeholder:text-charcoal-300
          focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-cream-200
          ${error
            ? 'border-error-600 focus:ring-error-600'
            : 'border-charcoal-200 hover:border-charcoal-300'
          }
        `}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-error-600" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${id}-helper`} className="text-xs text-charcoal-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
