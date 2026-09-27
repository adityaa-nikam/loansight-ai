import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, RefreshCw, Upload, ArrowRight } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { ROUTES } from '../../constants/routes';

const CARD = 'bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

const RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// Left-border accent + CTA colour, keyed on how blocking the item is.
const ACCENT = {
  HIGH: { strip: 'border-l-red-500', cta: 'bg-navy-900 hover:bg-navy-800' },
  MEDIUM: { strip: 'border-l-amber-500', cta: 'bg-navy-900 hover:bg-navy-800' },
  LOW: { strip: 'border-l-slate-300', cta: 'bg-navy-900 hover:bg-navy-800' },
};

/** Worst severity across a notification's reasons drives ordering and the accent. */
function topSeverity(notification) {
  const reasons = notification.reasons || [];
  if (reasons.length === 0) return notification.tone === 'negative' ? 'HIGH' : 'MEDIUM';
  return reasons.reduce(
    (worst, r) => (RANK[r.severity] < RANK[worst] ? r.severity : worst),
    'LOW'
  );
}

/** What the applicant actually needs to do — every path is a document upload. */
function ctaLabelFor(notification) {
  if (notification.kind === 'document') return 'Re-upload document';
  if (notification.status === 'documents_required') return 'Upload documents';
  return 'Review & correct';
}

/**
 * The applicant's to-do list. Only surfaces feed items flagged actionRequired by
 * the server — a document an officer sent back, a "documents required" decision,
 * or a high-severity verification finding — so nothing here is busywork. Blocking
 * items sort to the top; each carries a direct route to the upload area.
 */
export default function ActionRequiredPanel() {
  const { notifications, loading, error, refresh } = useNotifications();

  const items = notifications
    .filter((n) => n.actionRequired)
    .sort((a, b) => {
      const bySeverity = RANK[topSeverity(a)] - RANK[topSeverity(b)];
      if (bySeverity !== 0) return bySeverity;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const count = items.length;
  const hasWork = count > 0;

  return (
    <section id="action-required" className={`${CARD} p-5 scroll-mt-24`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${
              hasWork ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {hasWork ? (
              <AlertTriangle className="w-[18px] h-[18px]" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-[18px] h-[18px]" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              Action Required
              {hasWork && (
                <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
                  {count}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasWork
                ? `Resolve ${count === 1 ? 'this' : 'these'} to move your ${
                    count === 1 ? 'application' : 'applications'
                  } forward`
                : 'Nothing needs your attention right now'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh action items"
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && notifications.length === 0 && (
        <div className="space-y-3 mt-4 animate-pulse">
          <div className="h-20 rounded-lg bg-slate-100" />
          <div className="h-20 rounded-lg bg-slate-100" />
        </div>
      )}

      {error && notifications.length === 0 && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-100 p-4">
          <p className="text-[13px] text-red-700">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="text-[12px] font-medium text-red-700 underline mt-1 cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && !hasWork && (
        <div className="mt-4 rounded-lg bg-emerald-50/60 border border-emerald-100 p-5">
          <p className="text-[13px] font-medium text-slate-900">You're all caught up</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">
            No documents or verification issues need your attention. The moment an officer requests
            a document or a check needs a closer look, it will appear here with clear next steps.
          </p>
          <Link
            to={ROUTES.APPLY}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 hover:text-emerald-800 mt-3 transition-colors"
          >
            Start a new application
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {hasWork && (
        <ul className="mt-4 space-y-3">
          {items.map((notification) => {
            const accent = ACCENT[topSeverity(notification)] || ACCENT.LOW;
            return (
              <li
                key={notification.id}
                className={`border border-slate-200 border-l-[3px] ${accent.strip} rounded-lg p-3.5`}
              >
                <NotificationItem notification={notification} />
                <div className="mt-3 pl-12">
                  <Link
                    to={`${ROUTES.APPLICANT}#applications`}
                    className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-white ${accent.cta} px-3 py-1.5 rounded-lg transition-colors`}
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    {ctaLabelFor(notification)}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
