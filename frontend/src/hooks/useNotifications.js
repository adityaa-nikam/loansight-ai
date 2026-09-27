import { useEffect, useState, useCallback } from 'react';
import { applicationService } from '../services/applicationService';

/**
 * Applicant notification feed.
 *
 * The topbar bell and the dashboard panel both need this list, so the fetch is
 * shared at module level: whichever mounts first triggers the request, the other
 * reads the same result instead of firing a second one.
 *
 * "Seen" state is kept in localStorage. It is a client-side read marker, not a
 * server record — the notifications themselves always come from the API.
 */

const TTL_MS = 30_000;
const SEEN_KEY = 'loanlens.notifications.seenAt';

const EMPTY = { notifications: [], counts: { total: 0, actionRequired: 0, unresolvedIssues: 0 } };

let cache = null;
let cachedAt = 0;
let inflight = null;
const listeners = new Set();

function readSeenAt() {
  try {
    return Number(window.localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function snapshot(loading, error) {
  const data = cache || EMPTY;
  const seenAt = readSeenAt();
  const unread = data.notifications.filter((n) => new Date(n.createdAt).getTime() > seenAt);
  return {
    notifications: data.notifications,
    counts: data.counts,
    unreadCount: unread.length,
    loading,
    error,
  };
}

function publish(loading, error) {
  const next = snapshot(loading, error);
  listeners.forEach((listener) => listener(next));
}

async function load({ force = false } = {}) {
  const fresh = cache && Date.now() - cachedAt < TTL_MS;
  if (fresh && !force) return cache;
  if (inflight) return inflight;

  publish(true, null);

  inflight = applicationService
    .getNotifications()
    .then((response) => {
      const data = response?.data || EMPTY;
      cache = {
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        counts: data.counts || EMPTY.counts,
      };
      cachedAt = Date.now();
      publish(false, null);
      return cache;
    })
    .catch((error) => {
      // A failed feed should never break the page it sits on.
      publish(false, error.message || 'Could not load notifications');
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Marks everything currently in the feed as read. */
export function markNotificationsSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* private browsing — the badge just stays visible */
  }
  publish(false, null);
}

export function useNotifications() {
  const [state, setState] = useState(() => snapshot(!cache, null));

  useEffect(() => {
    const listener = (next) => setState(next);
    listeners.add(listener);
    load();
    return () => listeners.delete(listener);
  }, []);

  const refresh = useCallback(() => load({ force: true }), []);

  return { ...state, refresh, markSeen: markNotificationsSeen };
}
