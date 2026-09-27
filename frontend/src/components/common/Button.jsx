import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-charcoal-900 text-cream-50 hover:bg-charcoal-800 active:bg-charcoal-700',
  secondary:
    'bg-white text-charcoal-900 border border-charcoal-200 hover:bg-cream-200 active:bg-cream-300',
  ghost:
    'bg-transparent text-charcoal-700 hover:bg-cream-200 active:bg-cream-300',
  danger:
    'bg-error-600 text-cream-50 hover:bg-error-500 active:bg-error-600',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
