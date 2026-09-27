/**
 * Neutral full-screen placeholder shown while the session check resolves.
 * Deliberately quiet — it should read as "still loading", never as an error.
 */
export default function RouteFallback() {
  return (
    <div
      className="min-h-screen bg-cream-100 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-charcoal-900 flex items-center justify-center">
          <span className="text-cream-50 text-sm font-semibold">L</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-charcoal-200 border-t-charcoal-900 animate-spin" />
          <span className="text-sm text-charcoal-500">Restoring your session…</span>
        </div>
      </div>
    </div>
  );
}
