export default function Card({
  children,
  glass = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        rounded-xl p-6
        ${glass
          ? 'glass shadow-soft'
          : 'bg-white border border-cream-300/60 shadow-soft'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
