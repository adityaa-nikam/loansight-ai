import {
  User,
  Home,
  Briefcase,
  Building,
  GraduationCap,
  Car,
  FileText,
  Check,
} from 'lucide-react';
import { LOAN_TYPE_DETAILS } from '../../constants/banks';

const ICONS = { User, Home, Briefcase, Building, GraduationCap, Car };

/**
 * Loan-product picker. Mirrors the dashboard's category cards so the same
 * product reads identically in both places.
 */
export default function LoanTypePicker({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="loan-type-quick-select" className="block text-sm font-medium text-slate-900 mb-1.5">
        Loan type <span className="text-red-500">*</span>
      </label>
      <select
        id="loan-type-quick-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
      >
        <option value="">Select a loan type</option>
        {LOAN_TYPE_DETAILS.map((detail) => (
          <option key={detail.value} value={detail.value}>
            {detail.label} — {detail.rateRange} ({detail.tenure})
          </option>
        ))}
      </select>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
        {LOAN_TYPE_DETAILS.map((detail) => {
          const Icon = ICONS[detail.iconName] || FileText;
          const isSelected = value === detail.value;

          return (
            <button
              type="button"
              key={detail.value}
              onClick={() => onChange(detail.value)}
              aria-pressed={isSelected}
              className={`text-left w-full rounded-xl border p-4 transition-colors cursor-pointer flex flex-col ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${
                    isSelected ? 'bg-emerald-500' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600'}`}
                    aria-hidden="true"
                  />
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 grid place-items-center shrink-0">
                    <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-900 mt-3">{detail.label}</p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 flex-1">{detail.subtitle}</p>

              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">{detail.tenure}</span>
                <span className="text-xs font-semibold text-emerald-600 tabular-nums shrink-0">
                  {detail.rateRange}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
