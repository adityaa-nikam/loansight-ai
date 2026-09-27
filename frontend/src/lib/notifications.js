import { LOAN_TYPE_DETAILS } from '../constants/banks';
import { formatINRCompact } from './loanMath';

/**
 * Presentation helpers for the applicant notification feed. Tones map onto the
 * same emerald / amber / red / navy tokens the rest of the portal uses, so a
 * decision reads the same colour wherever it appears.
 */

export const TONES = {
  positive: {
    tile: 'bg-emerald-50 text-emerald-600',
    dot: 'bg-emerald-500',
    strip: 'border-l-emerald-500',
    title: 'text-slate-900',
  },
  negative: {
    tile: 'bg-red-50 text-red-600',
    dot: 'bg-red-500',
    strip: 'border-l-red-500',
    title: 'text-slate-900',
  },
  warning: {
    tile: 'bg-amber-50 text-amber-600',
    dot: 'bg-amber-500',
    strip: 'border-l-amber-500',
    title: 'text-slate-900',
  },
  info: {
    tile: 'bg-navy-900/8 text-navy-800',
    dot: 'bg-navy-700',
    strip: 'border-l-navy-700',
    title: 'text-slate-900',
  },
  neutral: {
    tile: 'bg-slate-100 text-slate-500',
    dot: 'bg-slate-400',
    strip: 'border-l-slate-300',
    title: 'text-slate-700',
  },
};

export const toneOf = (tone) => TONES[tone] || TONES.neutral;

/** Chip colour for a single flagged reason. */
export const severityChip = (severity) => {
  if (severity === 'HIGH') return 'bg-red-50 text-red-700';
  if (severity === 'MEDIUM') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
};

export function loanTypeLabel(value) {
  if (!value) return 'Loan';
  const normalised = value === 'auto' ? 'vehicle' : value;
  const detail = LOAN_TYPE_DETAILS.find((t) => t.value === normalised);
  if (detail) return detail.label;
  return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)} Loan`;
}

/** "Home Loan · ₹17L · HDFC Bank" */
export function applicationLabel(application) {
  if (!application) return '';
  const parts = [loanTypeLabel(application.loanType)];
  if (Number(application.requestedAmount) > 0) {
    parts.push(formatINRCompact(Number(application.requestedAmount)));
  }
  if (application.bankName) parts.push(application.bankName);
  return parts.join(' · ');
}

export function relativeTime(value) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
