export default function PageHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-semibold text-charcoal-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-charcoal-500 text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
