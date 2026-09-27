import { Info, TrendingUp } from 'lucide-react';
import BankLogo from '../common/BankLogo';
import {
  parseRate,
  emiBreakdown,
  affordabilityRatio,
  affordabilityBand,
  formatINR,
  formatMonths,
} from '../../lib/loanMath';

const CARD = 'bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

const BAND_COPY = {
  healthy: { label: 'Comfortable', className: 'text-emerald-600' },
  moderate: { label: 'Moderate', className: 'text-amber-600' },
  stretched: { label: 'Stretched', className: 'text-red-600' },
};

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span
        className={`text-sm font-medium text-slate-900 text-right min-w-0 ${mono ? 'tabular-nums' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Sticky rail showing what the applicant has chosen so far, plus an indicative
 * EMI derived from the selected bank's published starting rate. No estimate is
 * shown unless a real rate, amount and tenure are all available.
 */
export default function ApplicationSummaryRail({
  bank = null,
  loanTypeDetail = null,
  requestedAmount = '',
  tenureMonths = '',
  declaredMonthlyIncome = '',
  documentsUploaded = 0,
  documentsRequired = 0,
}) {
  const amount = Number(requestedAmount);
  const tenure = Number(tenureMonths);
  const income = Number(declaredMonthlyIncome);

  const bankRate = parseRate(bank?.minRate);
  const fallbackRate = parseRate(loanTypeDetail?.rateRange);
  const ratePct = bankRate ?? fallbackRate;
  const rateSource = bankRate !== null && bank ? `${bank.name} starting rate` : 'published range';

  const breakdown =
    ratePct !== null && Number.isFinite(amount) && Number.isFinite(tenure)
      ? emiBreakdown(amount, ratePct, tenure)
      : null;

  const ratio = breakdown ? affordabilityRatio(breakdown.emi, income) : null;
  const band = affordabilityBand(ratio);
  const bandCopy = band ? BAND_COPY[band] : null;

  return (
    <div className="space-y-5">
      <section className={`${CARD} p-5`}>
        <h2 className="text-[15px] font-semibold text-slate-900">Application summary</h2>
        <p className="text-xs text-slate-400 mt-0.5">Updates as you fill the form</p>

        {bank && (
          <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <BankLogo bank={bank} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{bank.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{bank.tagline}</p>
            </div>
          </div>
        )}

        <div className="mt-3">
          <Row label="Loan type" value={loanTypeDetail?.label || 'Not selected'} />
          <Row
            label="Amount"
            value={Number.isFinite(amount) && amount > 0 ? formatINR(amount) : '—'}
            mono
          />
          <Row
            label="Tenure"
            value={Number.isFinite(tenure) && tenure > 0 ? formatMonths(tenure) : '—'}
            mono
          />
          <Row
            label="Declared income"
            value={Number.isFinite(income) && income > 0 ? `${formatINR(income)}/mo` : '—'}
            mono
          />
          {documentsRequired > 0 && (
            <Row
              label="Documents"
              value={`${documentsUploaded} of ${documentsRequired} uploaded`}
              mono
            />
          )}
        </div>
      </section>

      <section className={`${CARD} p-5`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900">Indicative EMI</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 shrink-0">
            Estimate
          </span>
        </div>

        {!breakdown ? (
          <p className="text-sm text-slate-400 mt-3">
            {ratePct === null
              ? 'No published rate available for this partner yet.'
              : 'Enter an amount and tenure to see your estimated monthly payment.'}
          </p>
        ) : (
          <>
            <p className="text-[28px] font-semibold text-slate-900 tabular-nums leading-none mt-3">
              {formatINR(breakdown.emi)}
            </p>
            <p className="text-xs text-slate-400 mt-1">per month</p>

            <div className="mt-4">
              <Row label="Total interest" value={formatINR(breakdown.totalInterest)} mono />
              <Row label="Total payable" value={formatINR(breakdown.totalPayable)} mono />
            </div>

            {ratio !== null && bandCopy && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <TrendingUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-slate-600">
                  That is{' '}
                  <span className={`font-semibold ${bandCopy.className}`}>{ratio}%</span> of your
                  declared monthly income —{' '}
                  <span className={`font-semibold ${bandCopy.className}`}>
                    {bandCopy.label.toLowerCase()}
                  </span>
                  .
                </p>
              </div>
            )}

            <p className="flex items-start gap-1.5 text-[11px] text-slate-400 mt-3 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
              Calculated at {ratePct}% p.a. ({rateSource}) over {formatMonths(tenure)}. Your final
              rate is set by the bank after verification.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
