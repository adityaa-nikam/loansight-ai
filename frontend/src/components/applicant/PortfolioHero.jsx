import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatINRCompact } from '../../lib/loanMath';
import { ROUTES } from '../../constants/routes';

const RADIUS = 84;
const CENTER = 100;
const ARC_LENGTH = Math.PI * RADIUS;

function Gauge({ percent, color = '#10B981', ariaLabel }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const filled = (clamped / 100) * ARC_LENGTH;
  const angle = Math.PI * (1 - clamped / 100);
  const knobX = CENTER + RADIUS * Math.cos(angle);
  const knobY = CENTER - RADIUS * Math.sin(angle);
  const arc = `M ${CENTER - RADIUS} ${CENTER} A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER + RADIUS} ${CENTER}`;

  return (
    <svg
      viewBox="0 0 200 116"
      className="w-full"
      role="img"
      aria-label={ariaLabel || `${clamped} percent`}
    >
      <path d={arc} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${ARC_LENGTH}`}
      />
      {clamped > 0 && <circle cx={knobX} cy={knobY} r="7" fill={color} stroke="#0A192F" strokeWidth="3" />}
    </svg>
  );
}

// Verification score bands drive the dial colour and copy so the number reads
// the same way everywhere: strong (green) / moderate (amber) / weak (red).
const BAND_COLOR = { strong: '#10B981', moderate: '#F59E0B', weak: '#EF4444' };
const BAND_TEXT = { strong: 'text-emerald-400', moderate: 'text-amber-400', weak: 'text-red-400' };
const BAND_LABEL = { strong: 'Strong', moderate: 'Moderate', weak: 'Needs review' };
const RISK_BADGE = {
  LOW: 'bg-emerald-500/15 text-emerald-300',
  MEDIUM: 'bg-amber-500/15 text-amber-300',
  HIGH: 'bg-red-500/15 text-red-300',
};

function VerificationCard({ verification }) {
  const {
    score,
    band,
    riskLevel,
    checksPassed,
    checksTotal,
    docsUploaded,
    docsRequired,
    loanType,
    bankName,
  } = verification;

  const color = BAND_COLOR[band] || BAND_COLOR.moderate;
  const subtitle = [loanType ? `${loanType} loan` : null, bankName].filter(Boolean).join(' · ');

  return (
    <>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        <p className="text-[13px] font-semibold text-white">AI Verification</p>
      </div>
      <p className="text-[11px] text-slate-400 mt-0.5 capitalize truncate">
        {subtitle || 'Cross-document consistency'}
      </p>

      {/* Score sits inside the arc so the dial reads as a single unit. */}
      <div className="relative max-w-[148px] mx-auto mt-1">
        <Gauge percent={score} color={color} ariaLabel={`Verification score ${score} of 100`} />
        <p className="absolute inset-x-0 bottom-1 text-center leading-none">
          <span className="text-[24px] font-semibold tabular-nums text-white">{score}</span>
          <span className="text-[11px] text-slate-400"> /100</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 -mt-0.5">
        <span className={`text-[11px] font-medium ${BAND_TEXT[band] || 'text-slate-300'}`}>
          {BAND_LABEL[band] || 'Verified'}
        </span>
        {riskLevel && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              RISK_BADGE[riskLevel] || 'bg-white/10 text-slate-300'
            }`}
          >
            {riskLevel} RISK
          </span>
        )}
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Consistency checks</span>
          <span className="text-white tabular-nums font-medium">
            {checksTotal > 0 ? `${checksPassed} / ${checksTotal} passed` : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Documents</span>
          <span className="text-white tabular-nums font-medium">
            {docsRequired > 0 ? `${docsUploaded} / ${docsRequired} uploaded` : `${docsUploaded} uploaded`}
          </span>
        </div>
      </div>
    </>
  );
}

function ReadinessCard({ total, percent, required, uploadedCount, missingCount }) {
  // A 0% gauge would read as a bad score, so an empty state is shown instead.
  if (required === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-lg bg-white/5 grid place-items-center shrink-0">
          <FileText className="w-[18px] h-[18px] text-slate-400" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white">
            {total === 0 ? 'No documents yet' : 'Nothing to upload'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {total === 0
              ? 'Verification appears once you start an application.'
              : 'AI verification runs once your documents are in.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-[13px] font-semibold text-white">Document Readiness</p>
      <p className="text-[11px] text-slate-400 mt-0.5">AI verification runs after submission</p>

      <div className="relative max-w-[148px] mx-auto mt-1">
        <Gauge percent={percent} ariaLabel={`Document readiness ${percent} percent`} />
        <p className="absolute inset-x-0 bottom-0.5 text-center text-[22px] font-semibold tabular-nums text-white leading-none">
          {percent}%
        </p>
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-1">
        {uploadedCount} of {required} documents uploaded
      </p>

      {missingCount > 0 ? (
        <p className="text-[11px] text-amber-400 mt-1.5 text-center">
          {missingCount} document{missingCount === 1 ? '' : 's'} still required
        </p>
      ) : percent === 100 ? (
        <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          All documents uploaded
        </p>
      ) : null}
    </>
  );
}

export default function PortfolioHero({ summary = null, readiness = null, latest = null, verification = null }) {
  const total = summary?.total ?? 0;
  const active = summary?.active ?? 0;
  const approved = summary?.approved ?? 0;
  const actionRequired = summary?.actionRequired ?? 0;
  const totalRequested = summary?.totalRequested ?? 0;

  const percent = readiness?.percent ?? 0;
  const required = readiness?.required ?? 0;
  const uploadedCount = readiness?.uploadedCount ?? 0;
  const missingCount = readiness?.missingCount ?? 0;

  const headline =
    total === 0
      ? 'Start your first application'
      : total === 1
        ? 'Your application, tracked end to end'
        : `${total} applications, one clear view`;

  const parts = [];
  if (active > 0) parts.push(`${active} in progress`);
  if (approved > 0) parts.push(`${approved} approved`);
  if (actionRequired > 0) parts.push(`${actionRequired} needing documents`);
  if (parts.length === 0 && total > 0) parts.push(`${total} on file`);

  const subline =
    total === 0
      ? 'Compare partner banks, upload your documents once, and track every step.'
      : parts.join(' · ');

  return (
    <section className="relative overflow-hidden rounded-xl bg-navy-900 text-white p-5 lg:p-6">
      <div className="absolute inset-0 dash-grid-pattern" aria-hidden="true" />

      <div className="relative grid lg:grid-cols-[1fr_auto] gap-5 lg:gap-8 items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Your Loan Portfolio
          </p>
          <h1 className="text-[21px] lg:text-[25px] font-semibold leading-tight tracking-[-0.01em] mt-1.5">
            {headline}
          </h1>
          <p className="text-[13px] text-slate-300 mt-1">
            {subline}
            {latest?.bankName && (
              <span className="text-slate-400">
                {' · '}Most recent: <span className="capitalize">{latest.loanType}</span> loan with{' '}
                {latest.bankName}
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Total Requested
              </p>
              <p className="text-xl font-semibold tabular-nums mt-0.5">
                {total === 0 ? '—' : formatINRCompact(totalRequested)}
              </p>
            </div>
            <span className="hidden sm:block w-px h-8 bg-white/10" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                In Progress
              </p>
              <p className="text-xl font-semibold tabular-nums mt-0.5">{active}</p>
            </div>
            <span className="hidden sm:block w-px h-8 bg-white/10" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Needs Attention
              </p>
              <p
                className={`text-xl font-semibold tabular-nums mt-0.5 ${
                  actionRequired > 0 ? 'text-red-400' : 'text-white'
                }`}
              >
                {actionRequired}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Link
                to={ROUTES.APPLY}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium rounded-lg px-3.5 py-2 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Application
              </Link>
              {actionRequired > 0 && (
                <Link
                  to={ROUTES.ACTION_REQUIRED}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-[13px] font-medium rounded-lg px-3.5 py-2 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  Resolve {actionRequired} {actionRequired === 1 ? 'issue' : 'issues'}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-navy-800 border border-white/5 rounded-xl p-4 w-full lg:w-[258px]">
          {verification ? (
            <VerificationCard verification={verification} />
          ) : (
            <ReadinessCard
              total={total}
              percent={percent}
              required={required}
              uploadedCount={uploadedCount}
              missingCount={missingCount}
            />
          )}
        </div>
      </div>
    </section>
  );
}
