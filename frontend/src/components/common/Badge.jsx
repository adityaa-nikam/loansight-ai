const variantStyles = {
  default: 'bg-cream-200 text-charcoal-700',
  info: 'bg-accent-100 text-accent-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  error: 'bg-error-100 text-error-600',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
