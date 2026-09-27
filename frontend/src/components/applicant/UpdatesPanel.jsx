import { Link } from 'react-router-dom';
import { BellRing, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { toneOf } from '../../lib/notifications';
import { useNotifications } from '../../hooks/useNotifications';
import { ROUTES } from '../../constants/routes';

const CARD = 'bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

/**
 * Dashboard feed of decisions and flagged checks. This is the applicant's answer
 * to "what happened to my application, and what is wrong with it" — every line
 * comes from an officer action or a verification check, never a guess.
 */
export default function UpdatesPanel({ limit = 4 }) {
  const { notifications, counts, loading, error, refresh } = useNotifications();
  const visible = notifications.slice(0, limit);
  const actionCount = counts?.actionRequired || 0;

  return (
    <section id="updates" className={`${CARD} p-5 scroll-mt-24`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-slate-400" aria-hidden="true" />
            Updates on your applications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {actionCount > 0
              ? `${actionCount} update${actionCount === 1 ? '' : 's'} need something from you`
              : 'Decisions, document reviews and verification checks'}
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh updates"
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && notifications.length === 0 && (
        <div className="space-y-3 mt-4 animate-pulse">
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
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

      {!loading && !error && notifications.length === 0 && (
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
          <span className="w-10 h-10 rounded-full bg-emerald-50 grid place-items-center mx-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          </span>
          <p className="text-[13px] font-medium text-slate-900 mt-3">Nothing to report</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            When an officer approves, declines or asks for a document, the decision and the reason
            behind it show up here.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <ul className="mt-4 space-y-3">
          {visible.map((notification) => {
            const tone = toneOf(notification.tone);
            return (
              <li
                key={notification.id}
                className={`border border-slate-200 border-l-[3px] ${tone.strip} rounded-lg p-3.5`}
              >
                <NotificationItem notification={notification} />
              </li>
            );
          })}
        </ul>
      )}

      {notifications.length > limit && (
        <Link
          to={`${ROUTES.APPLICANT}#applications`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 hover:text-emerald-800 mt-4 transition-colors"
        >
          See all {notifications.length} updates
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
