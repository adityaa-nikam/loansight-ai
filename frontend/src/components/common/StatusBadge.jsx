import { statusMeta } from '../../lib/officerData';

/**
 * Status badge for loan application statuses. Labels and colours come from the
 * shared officer status map so the badge, the queue chips and the dashboard
 * donut can never disagree.
 * Keys stay in sync with APPLICATION_STATUSES in
 * backend/src/models/LoanApplication.js
 */
export default function StatusBadge({ status, className = '' }) {
  const meta = statusMeta(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${meta.chip} ${className}`}
    >
      {meta.label}
    </span>
  );
}
