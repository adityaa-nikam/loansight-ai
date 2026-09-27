import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroVisualization() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: FileText,
      label: t('step1_label', 'Application'),
      detail: t('step_1_desc', 'Loan details captured'),
      color: 'text-accent-600',
      bg: 'bg-accent-100',
    },
    {
      icon: CheckCircle2,
      label: t('step2_label', 'Documents'),
      detail: t('trust_ai', 'AI-powered extraction'),
      color: 'text-success-600',
      bg: 'bg-success-100',
    },
    {
      icon: ShieldCheck,
      label: t('step3_label', 'Verification'),
      detail: t('feature_kyc_title', 'Cross-document validation'),
      color: 'text-warning-600',
      bg: 'bg-warning-100',
    },
    {
      icon: TrendingUp,
      label: t('cap_risk_title', 'Assessment'),
      detail: t('feature_foir_desc', 'Risk & decision support'),
      color: 'text-charcoal-600',
      bg: 'bg-cream-300',
    },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none" aria-hidden="true">
      {/* Main Card */}
      <div className="glass rounded-2xl shadow-float p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">
              {t('app_pipeline', 'Application Pipeline')}
            </p>
            <p className="text-sm font-semibold text-charcoal-900 mt-0.5">
              LA-2026-001847
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-100 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success-600"></span>
            <span className="text-xs font-medium text-success-600">{t('processing_status', 'Processing')}</span>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className={`
                  flex items-center gap-3.5 p-3 rounded-xl
                  transition-all duration-300
                  ${idx === 0 ? 'bg-white shadow-soft border border-cream-300/40' : 'bg-cream-100/60'}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${step.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-900">{step.label}</p>
                  <p className="text-xs text-charcoal-400">{step.detail}</p>
                </div>
                {idx === 0 && (
                  <ArrowRight className="w-4 h-4 text-charcoal-300" />
                )}
                {idx > 0 && (
                  <Clock className="w-3.5 h-3.5 text-charcoal-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Confidence Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-charcoal-500 font-medium">{t('processing_confidence', 'Processing confidence')}</span>
            <span className="text-charcoal-900 font-semibold">94%</span>
          </div>
          <div className="h-1.5 bg-cream-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-charcoal-900 rounded-full transition-all duration-1000"
              style={{ width: '94%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Floating Detail Card */}
      <div className="absolute -bottom-4 -left-4 glass-subtle rounded-xl shadow-elevated p-3.5 max-w-48 hidden lg:block">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-100">
            <FileText className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-charcoal-900">{t('docs_verified_count', '4 documents')}</p>
            <p className="text-xs text-charcoal-400">{t('verified_status', 'verified')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
