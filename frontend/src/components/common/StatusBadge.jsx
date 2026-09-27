import { statusMeta } from '../../lib/officerData';

export default function StatusBadge({ status, className = '' }) {
  const meta = statusMeta(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md tracking-tight whitespace-nowrap border border-slate-200 ${meta.chip} ${className}`}
    >
      {meta.label}
    </span>
  );
}
