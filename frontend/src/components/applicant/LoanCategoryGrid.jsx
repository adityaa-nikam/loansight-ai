import { Link } from 'react-router-dom';
import {
  User,
  Home,
  Briefcase,
  Building,
  GraduationCap,
  Car,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { LOAN_TYPE_DETAILS } from '../../constants/banks';
import { parseRate } from '../../lib/loanMath';
import { ROUTES } from '../../constants/routes';

const ICONS = { User, Home, Briefcase, Building, GraduationCap, Car };

export default function LoanCategoryGrid({ categories = [], appliedTypes = [] }) {
  const list = Array.isArray(categories) && categories.length > 0 ? categories : LOAN_TYPE_DETAILS;
  const applied = Array.isArray(appliedTypes) ? appliedTypes : [];

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Explore Loan Products</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Published rate ranges across our partner banks
          </p>
        </div>
        <Link
          to={ROUTES.APPLY}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium rounded-lg px-3 py-2 transition-colors"
        >
          Compare all
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((category) => {
          const Icon = ICONS[category.iconName] || FileText;
          const from = parseRate(category.rateRange);
          const isApplied = applied.includes(category.value);

          return (
            <div
              key={category.value}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex flex-col shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 grid place-items-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" aria-hidden="true" />
                </span>
                {isApplied && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    Applied
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mt-3">{category.label}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 flex-1">{category.subtitle}</p>

              <div className="flex items-end justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Starting From
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 tabular-nums mt-0.5">
                    {from === null ? '—' : `${from}% p.a.`}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 text-right">{category.tenure}</p>
              </div>

              <Link
                to={ROUTES.APPLY}
                className="w-full mt-4 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                {isApplied ? 'Apply Again' : 'Apply Now'}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
