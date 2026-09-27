import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
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
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-lg
            text-charcoal-900 text-sm
            bg-white border appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-cream-200
            ${!value ? 'text-charcoal-300' : ''}
            ${error
              ? 'border-error-600 focus:ring-error-600'
              : 'border-charcoal-200 hover:border-charcoal-300'
            }
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400 pointer-events-none" />
      </div>
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
