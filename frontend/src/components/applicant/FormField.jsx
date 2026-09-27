import { AlertCircle } from 'lucide-react';

/**
 * Form primitives for the applicant flow, styled with the dashboard design
 * tokens (slate neutrals, emerald focus, red errors). Kept separate from the
 * older cream-themed common/ inputs so officer screens are unaffected.
 */

const FIELD_BASE =
  'w-full text-sm bg-white border rounded-lg px-3 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2';
const FIELD_IDLE = 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/25';
const FIELD_ERROR = 'border-red-300 focus:border-red-500 focus:ring-red-500/25';

function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-900 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FieldFooter({ error, helperText }) {
  if (error) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-red-600 mt-1.5" role="alert">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (helperText) {
    return <p className="text-xs text-slate-400 mt-1.5">{helperText}</p>;
  }
  return null;
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  helperText,
  error,
  required = false,
  prefix,
  ...rest
}) {
  const fieldId = id || name;

  return (
    <div>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          className={`${FIELD_BASE} ${error ? FIELD_ERROR : FIELD_IDLE} ${prefix ? 'pl-8' : ''} tabular-nums`}
          {...rest}
        />
      </div>
      <FieldFooter error={error} helperText={helperText} />
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  helperText,
  error,
  required = false,
  ...rest
}) {
  const fieldId = id || name;

  return (
    <div>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      <select
        id={fieldId}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        className={`${FIELD_BASE} ${error ? FIELD_ERROR : FIELD_IDLE} cursor-pointer`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldFooter error={error} helperText={helperText} />
    </div>
  );
}
