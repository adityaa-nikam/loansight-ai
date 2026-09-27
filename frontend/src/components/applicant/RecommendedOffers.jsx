import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import BankLogo from '../common/BankLogo';
import { AVAILABLE_BANKS } from '../../constants/banks';
import { ROUTES } from '../../constants/routes';

export default function RecommendedOffers({ rates = [], loanTypeLabel = '', limit = 3 }) {
  const shell = 'bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

  if (!Array.isArray(rates) || rates.length === 0) {
    return (
      <section className={shell}>
        <h2 className="text-[15px] font-semibold text-slate-900">Best Available Rates</h2>
        <p className="text-sm text-slate-400 text-center py-10">No partner rates available.</p>
      </section>
    );
  }

  const entries = rates.slice(0, limit).map((rate) => ({
    ...rate,
    detail: AVAILABLE_BANKS.find((b) => b.id === rate.id) || null,
  }));

  return (
    <section className={shell}>
      <h2 className="text-[15px] font-semibold text-slate-900">Best Available Rates</h2>
      <p className="text-xs text-slate-400 mt-0.5">
        Lowest advertised starting rates{loanTypeLabel ? ` for ${loanTypeLabel}` : ''}
      </p>

      <div className="space-y-3 mt-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <BankLogo bank={entry.detail} name={entry.name} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{entry.name}</p>
                  {index === 0 && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                      Lowest rate
                    </span>
                  )}
                </div>
                {entry.detail?.tagline && (
                  <p className="text-[11px] text-slate-400 truncate">{entry.detail.tagline}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-base font-semibold tabular-nums text-emerald-600">{entry.minRate}</p>
                <p className="text-[10px] text-slate-400">p.a. onwards</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-600 min-w-0">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{entry.detail?.tag || 'Partner bank'}</span>
              </span>
              <Link
                to={ROUTES.APPLY}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 shrink-0"
              >
                Apply
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200 leading-relaxed">
        Rates are advertised starting rates, not personalised offers. Eligibility is confirmed after
        document verification.
      </p>
    </section>
  );
}
