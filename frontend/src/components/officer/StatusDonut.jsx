const SIZE = 132;
const CENTER = SIZE / 2;
const RADIUS = 52;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Status mix as a donut. Hand-authored SVG so the chart uses the same tokens as
 * the rest of the UI and adds no dependency. Segments are drawn from real
 * counts; an empty list renders the track only.
 */
export default function StatusDonut({ segments = [], total = 0, label = 'total' }) {
  const sum = segments.reduce((acc, s) => acc + (Number(s.count) || 0), 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={
            sum === 0
              ? 'No applications to chart'
              : segments.map((s) => `${s.label}: ${s.count}`).join(', ')
          }
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={STROKE}
          />
          {sum > 0 &&
            segments.map((segment) => {
              const fraction = (Number(segment.count) || 0) / sum;
              const length = fraction * CIRCUMFERENCE;
              const dash = `${Math.max(0, length - 1.5)} ${CIRCUMFERENCE - Math.max(0, length - 1.5)}`;
              const dashOffset = -offset;
              offset += length;
              return (
                <circle
                  key={segment.status}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={dash}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[26px] font-semibold text-white tabular-nums leading-none">{total}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{label}</p>
          </div>
        </div>
      </div>

      <ul className="min-w-0 space-y-1.5">
        {segments.length === 0 && (
          <li className="text-[11px] text-slate-400">Nothing in the queue yet</li>
        )}
        {segments.map((segment) => (
          <li key={segment.status} className="flex items-center gap-2 text-[11px]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            <span className="text-slate-300 truncate">{segment.label}</span>
            <span className="text-white font-semibold tabular-nums ml-auto pl-2">
              {segment.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
