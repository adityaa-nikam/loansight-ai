import { CheckCircle2, XCircle, AlertTriangle, Clock, FileWarning, Bell } from 'lucide-react';
import { toneOf, severityChip, applicationLabel, relativeTime } from '../../lib/notifications';

const ICON_BY_KIND = {
  decision: { approved: CheckCircle2, rejected: XCircle, documents_required: FileWarning },
  document: FileWarning,
  issue: AlertTriangle,
};

function iconFor(notification) {
  if (notification.kind === 'decision') {
    return ICON_BY_KIND.decision[notification.status] || Clock;
  }
  return ICON_BY_KIND[notification.kind] || Bell;
}

/**
 * One notification row. Shared by the topbar bell and the dashboard panel so a
 * decision and its reasons read identically in both places.
 */
export default function NotificationItem({ notification, unread = false, compact = false }) {
  const tone = toneOf(notification.tone);
  const Icon = iconFor(notification);
  const reasons = notification.reasons || [];

  return (
    <div className={compact ? 'flex gap-3' : 'flex gap-3'}>
      <span className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg grid place-items-center shrink-0 ${tone.tile}`}>
        <Icon className={compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={`text-[13px] font-semibold ${tone.title} min-w-0`}>{notification.title}</p>
          {unread && (
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${tone.dot}`}
              title="New"
              aria-label="New"
            />
          )}
          <span className="text-[11px] text-slate-400 ml-auto shrink-0 whitespace-nowrap">
            {relativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{notification.message}</p>

        {reasons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-2">
            {reasons.map((reason) => (
              <li key={reason.code}>
                <span
                  className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${severityChip(
                    reason.severity
                  )}`}
                  title={reason.detail}
                >
                  {reason.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!compact && reasons.length > 0 && (
          <ul className="mt-2 space-y-1">
            {reasons.slice(0, 3).map((reason) => (
              <li key={`${reason.code}-detail`} className="text-[11px] text-slate-500 leading-relaxed">
                <span className="text-slate-400">·</span> {reason.detail}
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-slate-400 mt-1.5 truncate">
          {applicationLabel(notification.application)}
        </p>
      </div>
    </div>
  );
}
