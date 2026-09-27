import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { ROUTES } from '../../constants/routes';

/**
 * Topbar bell. Shows how many updates the applicant has not opened yet and, on
 * click, the decisions and flagged checks behind that number.
 */
export default function NotificationBell() {
  const { notifications, unreadCount, loading, markSeen } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const seenAt = (() => {
    try {
      return Number(window.localStorage.getItem('loanlens.notifications.seenAt')) || 0;
    } catch {
      return 0;
    }
  })();

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const toggle = () => {
    setOpen((prev) => {
      // Opening the panel is what counts as reading it.
      if (!prev && unreadCount > 0) markSeen();
      return !prev;
    });
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        className="relative text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full grid place-items-center tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+12px)] w-[min(380px,calc(100vw-2rem))] bg-white border border-slate-200 rounded-xl shadow-[0_12px_32px_-8px_rgba(15,23,42,0.22)] z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div>
              <p className="text-[13px] font-semibold text-slate-900">Notifications</p>
              <p className="text-[11px] text-slate-400">Decisions and checks on your applications</p>
            </div>
            {notifications.length > 0 && (
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums shrink-0">
                {notifications.length}
              </span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 && (
              <div className="p-4 space-y-3 animate-pulse">
                <div className="h-12 rounded-lg bg-slate-100" />
                <div className="h-12 rounded-lg bg-slate-100" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-4 py-10 text-center">
                <span className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center mx-auto">
                  <Bell className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </span>
                <p className="text-[13px] font-medium text-slate-900 mt-3">No updates yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  You'll hear from us when an officer reviews your application.
                </p>
              </div>
            )}

            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to={`${ROUTES.APPLICANT}#applications`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <NotificationItem
                  notification={notification}
                  unread={new Date(notification.createdAt).getTime() > seenAt}
                  compact
                />
              </Link>
            ))}
          </div>

          {notifications.length > 0 && (
            <Link
              to={`${ROUTES.APPLICANT}#updates`}
              onClick={() => setOpen(false)}
              className="block text-center text-[12px] font-medium text-emerald-700 hover:text-emerald-800 py-2.5 border-t border-slate-200 bg-slate-50/60 transition-colors"
            >
              View all updates
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
