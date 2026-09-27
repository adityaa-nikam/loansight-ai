import { Check } from 'lucide-react';

/**
 * Horizontal step indicator for the application flow. Rendered on the navy
 * header card, so complete/current states use emerald against white-on-navy text.
 */
export default function StepProgress({ steps = [], currentStep = 1 }) {
  const total = steps.length;

  return (
    <ol className="flex items-start gap-2 sm:gap-3">
      {steps.map((item, index) => {
        const isComplete = item.step < currentStep;
        const isCurrent = item.step === currentStep;
        const isLast = index === total - 1;

        return (
          <li key={item.step} className="flex items-start gap-2 sm:gap-3 min-w-0">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span
                className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold shrink-0 transition-colors ${
                  isComplete
                    ? 'bg-emerald-500 text-navy-900'
                    : isCurrent
                      ? 'bg-white text-navy-900'
                      : 'bg-white/10 text-slate-400'
                }`}
                aria-hidden="true"
              >
                {isComplete ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
              </span>
            </div>

            <div className="min-w-0 pt-1 hidden sm:block">
              <p
                className={`text-xs font-medium leading-tight truncate ${
                  isCurrent ? 'text-white' : isComplete ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {item.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {isComplete ? 'Done' : isCurrent ? 'In progress' : `Step ${item.step}`}
              </p>
            </div>

            {!isLast && (
              <span
                className={`hidden sm:block h-px w-6 lg:w-10 mt-4 shrink-0 ${
                  isComplete ? 'bg-emerald-500' : 'bg-white/10'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
