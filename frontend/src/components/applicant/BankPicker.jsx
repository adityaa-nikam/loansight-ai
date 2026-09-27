import { Check } from 'lucide-react';
import BankLogo from '../common/BankLogo';
import { AVAILABLE_BANKS } from '../../constants/banks';

/**
 * Lending-partner picker. The native select stays as the accessible control;
 * the cards are an equivalent visual shortcut, not the only way to choose.
 */
export default function BankPicker({ value, onChange }) {
  return (
    <div>
      <label htmlFor="bank-quick-select" className="block text-sm font-medium text-slate-900 mb-1.5">
        Lending partner <span className="text-red-500">*</span>
      </label>
      <select
        id="bank-quick-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
      >
        {AVAILABLE_BANKS.map((bank) => (
          <option key={bank.id} value={bank.id}>
            {bank.name} — {bank.tagline} (from {bank.minRate})
          </option>
        ))}
      </select>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
        {AVAILABLE_BANKS.map((bank) => {
          const isSelected = value === bank.id;

          return (
            <button
              type="button"
              key={bank.id}
              onClick={() => onChange(bank.id)}
              aria-pressed={isSelected}
              className={`text-left w-full rounded-xl border p-4 transition-colors cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <BankLogo bank={bank} size="md" />
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 grid place-items-center shrink-0">
                    <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-900 mt-3 truncate">{bank.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{bank.tagline}</p>

              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate">
                  {bank.tag}
                </span>
                <span className="text-xs font-semibold text-emerald-600 tabular-nums shrink-0">
                  from {bank.minRate}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
