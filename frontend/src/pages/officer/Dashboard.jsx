import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Files,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  TrendingUp,
  Layers,
  Inspect,
} from 'lucide-react';
import StatusDonut from '../../components/officer/StatusDonut';
import BankLogo from '../../components/common/BankLogo';
import {
  statusMeta,
  statusMix,
  loanTypeMix,
  loanTypeLabel,
  initialsOf,
  bankFor,
  daysWaiting,
  waitingLabel,
  formatDate,
  OPEN_STATUSES,
} from '../../lib/officerData';
import { formatINR, formatINRCompact } from '../../lib/loanMath';
import { ROUTES } from '../../constants/routes';

const CARD = 'bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

function StatCard({ icon: Icon, label, value, note, tone = 'neutral', to = null }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600',
    navy: 'bg-navy-900/10 text-navy-800',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${tones[tone]}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <p className="text-[26px] font-semibold text-slate-900 tabular-nums leading-none mt-3">
        {value}
      </p>
      {note && <p className="text-[11px] text-slate-400 mt-1.5">{note}</p>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${CARD} p-4 block hover:border-slate-300 transition-colors`}>
        {body}
      </Link>
    );
  }
  return <div className={`${CARD} p-4`}>{body}</div>;
}

function BankTile({ application }) {
  const bank = bankFor(application);
  return <BankLogo bank={bank} name={application?.bankName} size="sm" />;
}

function EmptyQueue() {
  return (
    <div className={`${CARD} p-10 text-center`}>
      {/* Simple inline illustration — no binary asset needed. */}
      <svg
        width="132"
        height="96"
        viewBox="0 0 132 96"
        className="mx-auto"
        role="img"
        aria-label="An empty review tray"
      >
        <rect x="18" y="26" width="96" height="60" rx="8" fill="#F1F5F9" stroke="#E2E8F0" />
        <rect x="30" y="14" width="72" height="46" rx="6" fill="#FFFFFF" stroke="#CBD5E1" />
        <rect x="40" y="26" width="42" height="4" rx="2" fill="#E2E8F0" />
        <rect x="40" y="36" width="32" height="4" rx="2" fill="#E2E8F0" />
        <circle cx="96" cy="70" r="14" fill="#ECFDF5" stroke="#10B981" />
        <path
          d="M90 70l4.5 4.5L103 66"
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-base font-semibold text-slate-900 mt-4">No applications yet</h3>
      <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto">
        Submitted loan requests appear here the moment an applicant sends them for verification.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { applications, loading, summary } = useOutletContext();

  const mix = useMemo(() => statusMix(applications), [applications]);
  const byType = useMemo(() => loanTypeMix(applications), [applications]);

  const recent = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 7),
    [applications]
  );

  const longestWaiting = useMemo(
    () =>
      applications
        .filter((app) => OPEN_STATUSES.includes(app.status))
        .map((app) => ({ app, days: daysWaiting(app.createdAt) ?? 0 }))
        .sort((a, b) => b.days - a.days)
        .slice(0, 4),
    [applications]
  );

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-52 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
        </div>
        <div className="h-80 rounded-xl bg-slate-200" />
      </div>
    );
  }

  const headline =
    summary.open === 0
      ? 'Your review queue is clear'
      : `${summary.open} application${summary.open === 1 ? '' : 's'} need your attention`;

  const queueParts = [];
  if (summary.submitted > 0) queueParts.push(`${summary.submitted} new`);
  if (summary.underReview > 0) queueParts.push(`${summary.underReview} under review`);
  if (summary.docsRequired > 0) queueParts.push(`${summary.docsRequired} waiting on documents`);

  const maxTypeCount = byType.length ? Math.max(...byType.map((t) => t.count)) : 0;

  return (
    <div className="space-y-5">
      {/* Queue band */}
      <section className="relative overflow-hidden rounded-xl bg-navy-900 text-white p-5 lg:p-6">
        <div className="absolute inset-0 dash-grid-pattern" aria-hidden="true" />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-5 lg:gap-8 items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Work Queue
            </p>
            <h1 className="text-[21px] lg:text-[25px] font-semibold leading-tight tracking-[-0.01em] mt-1.5">
              {headline}
            </h1>
            <p className="text-[13px] text-slate-300 mt-1">
              {queueParts.length > 0
                ? queueParts.join(' · ')
                : `${summary.decided} decision${summary.decided === 1 ? '' : 's'} on file · nothing pending`}
            </p>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Open Exposure
                </p>
                <p className="text-xl font-semibold tabular-nums mt-0.5">
                  {summary.open === 0 ? '—' : formatINRCompact(summary.openValue)}
                </p>
              </div>
              <span className="hidden sm:block w-px h-8 bg-white/10" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Total Pipeline
                </p>
                <p className="text-xl font-semibold tabular-nums mt-0.5">
                  {summary.total === 0 ? '—' : formatINRCompact(summary.totalValue)}
                </p>
              </div>
              <span className="hidden sm:block w-px h-8 bg-white/10" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Oldest Waiting
                </p>
                <p
                  className={`text-xl font-semibold tabular-nums mt-0.5 ${
                    summary.oldestOpenDays !== null && summary.oldestOpenDays >= 7
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {summary.oldestOpenDays === null ? '—' : waitingLabel(summary.oldestOpenDays)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Link
                  to={`${ROUTES.OFFICER_APPLICATIONS}?status=submitted`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium rounded-lg px-3.5 py-2 transition-colors"
                >
                  <Inspect className="w-4 h-4" aria-hidden="true" />
                  Start reviewing
                </Link>
                <Link
                  to={ROUTES.OFFICER_APPLICATIONS}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-[13px] font-medium rounded-lg px-3.5 py-2 transition-colors"
                >
                  All applications
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-navy-800 border border-white/5 rounded-xl p-4 w-full lg:w-[300px]">
            <p className="text-[13px] font-semibold text-white">Portfolio status</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Every application on file</p>
            <StatusDonut segments={mix} total={summary.total} label="on file" />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Files}
          label="Applications"
          value={summary.total}
          note="Excludes applicant drafts"
          tone="navy"
          to={ROUTES.OFFICER_APPLICATIONS}
        />
        <StatCard
          icon={Inbox}
          label="Awaiting Action"
          value={summary.open}
          note={
            summary.total > 0
              ? `${Math.round((summary.open / summary.total) * 100)}% of the portfolio`
              : 'Nothing queued'
          }
          tone={summary.open > 0 ? 'amber' : 'neutral'}
          to={`${ROUTES.OFFICER_APPLICATIONS}?status=submitted`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Documents Required"
          value={summary.docsRequired}
          note={summary.docsRequired > 0 ? 'Applicant action pending' : 'No document gaps'}
          tone={summary.docsRequired > 0 ? 'red' : 'neutral'}
          to={`${ROUTES.OFFICER_APPLICATIONS}?status=documents_required`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Decided"
          value={summary.decided}
          note={
            summary.approvalRate === null
              ? 'No decisions recorded yet'
              : `${summary.approvalRate}% approved`
          }
          tone={summary.decided > 0 ? 'emerald' : 'neutral'}
        />
      </div>

      {applications.length === 0 ? (
        <EmptyQueue />
      ) : (
        <div className="grid xl:grid-cols-[1fr_340px] gap-5 items-start">
          {/* Recent applications */}
          <section className={`${CARD} min-w-0`}>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-slate-900">Recent applications</h2>
                <p className="text-xs text-slate-400 mt-0.5">Newest submissions first</p>
              </div>
              <Link
                to={ROUTES.OFFICER_APPLICATIONS}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors shrink-0"
              >
                View all
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Applicant
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Product
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                      Amount
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      Waiting
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((app) => {
                    const meta = statusMeta(app.status);
                    const days = daysWaiting(app.createdAt);
                    return (
                      <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold grid place-items-center shrink-0">
                              {initialsOf(app.applicant?.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {app.applicant?.name || 'Unknown applicant'}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {app._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BankTile application={app} />
                            <div className="min-w-0">
                              <p className="text-[13px] text-slate-900 truncate">
                                {loanTypeLabel(app.loanType)}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {app.tenureMonths ? `${app.tenureMonths} months` : '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                          {formatINR(app.requestedAmount)}
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            {waitingLabel(days)}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {formatDate(app.createdAt)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${meta.chip}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={ROUTES.officerApplication(app._id)}
                            className="inline-flex items-center gap-1 text-[13px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Review
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right rail */}
          <div className="space-y-5 min-w-0">
            <section className={`${CARD} p-5`}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-[15px] font-semibold text-slate-900">By loan type</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Volume and requested value</p>

              <ul className="mt-4 space-y-3.5">
                {byType.map((row) => (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] text-slate-900 truncate">{row.label}</p>
                      <p className="text-[13px] font-medium text-slate-900 tabular-nums shrink-0">
                        {row.count}
                      </p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-navy-700 rounded-full"
                        style={{
                          width: `${maxTypeCount ? (row.count / maxTypeCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                      {formatINRCompact(row.amount)} requested
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${CARD} p-5`}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h2 className="text-[15px] font-semibold text-slate-900">Longest waiting</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Open applications, oldest first</p>

              {longestWaiting.length === 0 ? (
                <p className="flex items-center gap-2 text-[13px] text-emerald-600 mt-4">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Nothing is waiting on you.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {longestWaiting.map(({ app, days }) => (
                    <li key={app._id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={ROUTES.officerApplication(app._id)}
                        className="flex items-center gap-3 group"
                      >
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold grid place-items-center shrink-0">
                          {initialsOf(app.applicant?.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {app.applicant?.name || 'Unknown applicant'}
                          </span>
                          <span className="block text-[11px] text-slate-400 truncate">
                            {loanTypeLabel(app.loanType)} · {formatINRCompact(app.requestedAmount)}
                          </span>
                        </span>
                        <span
                          className={`text-[11px] font-semibold tabular-nums shrink-0 ${
                            days >= 7 ? 'text-amber-600' : 'text-slate-600'
                          }`}
                        >
                          {waitingLabel(days)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
