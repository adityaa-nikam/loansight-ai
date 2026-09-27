/**
 * Pure loan-maths helpers. No React, no side effects.
 */

/** '8.50%' -> 8.5 ; '8.40% - 9.50%' -> 8.4 (lower bound) ; garbage -> null */
export function parseRate(rateString) {
  if (typeof rateString === 'number') {
    return Number.isFinite(rateString) ? rateString : null;
  }
  if (typeof rateString !== 'string') return null;
  const match = rateString.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number.parseFloat(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Reducing-balance EMI rounded to the nearest rupee. null on invalid input. */
export function calculateEmi(principal, annualRatePct, tenureMonths) {
  const p = Number(principal);
  const n = Number(tenureMonths);
  const annual = Number(annualRatePct);

  if (!Number.isFinite(p) || p <= 0) return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  if (!Number.isFinite(annual) || annual < 0) return null;

  if (annual === 0) return Math.round(p / n);

  const r = annual / 12 / 100;
  const growth = Math.pow(1 + r, n);
  const emi = (p * r * growth) / (growth - 1);
  return Number.isFinite(emi) ? Math.round(emi) : null;
}

/** Full EMI split. Percentages are 0-100 and sum to 100. null on invalid input. */
export function emiBreakdown(principal, annualRatePct, tenureMonths) {
  const emi = calculateEmi(principal, annualRatePct, tenureMonths);
  if (emi === null) return null;

  const p = Number(principal);
  const n = Number(tenureMonths);
  const totalPayable = Math.round(emi * n);
  const totalInterest = Math.max(0, totalPayable - p);

  const principalPct = totalPayable > 0 ? Math.round((p / totalPayable) * 1000) / 10 : 0;
  const interestPct = Math.round((100 - principalPct) * 10) / 10;

  return { emi, totalPayable, totalInterest, principal: p, principalPct, interestPct };
}

/** EMI as a percentage of declared monthly income. null when either is unusable. */
export function affordabilityRatio(emi, monthlyIncome) {
  const e = Number(emi);
  const income = Number(monthlyIncome);
  if (!Number.isFinite(e) || e <= 0) return null;
  if (!Number.isFinite(income) || income <= 0) return null;
  return Math.round((e / income) * 1000) / 10;
}

/** 'healthy' <= 35% <= 'moderate' <= 50% < 'stretched'. null passes through. */
export function affordabilityBand(ratio) {
  if (ratio === null || ratio === undefined || !Number.isFinite(Number(ratio))) return null;
  const value = Number(ratio);
  if (value <= 35) return 'healthy';
  if (value <= 50) return 'moderate';
  return 'stretched';
}

/** 1250000 -> '₹12,50,000'. Non-numbers -> '—'. */
export function formatINR(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 12400000 -> '₹1.24Cr' ; 1250000 -> '₹12.5L' ; 85000 -> '₹85,000'. */
export function formatINRCompact(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';

  const strip = (n) => String(n).replace(/\.0$/, '');

  if (Math.abs(amount) >= 1e7) {
    return `₹${strip(Math.round((amount / 1e7) * 100) / 100)}Cr`;
  }
  if (Math.abs(amount) >= 1e5) {
    return `₹${strip(Math.round((amount / 1e5) * 10) / 10)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 360 -> '30 yrs' ; 18 -> '18 mo'. Non-numbers -> '—'. */
export function formatMonths(months) {
  const n = Number(months);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 12 && n % 12 === 0) {
    const years = n / 12;
    return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
  }
  return `${n} mo`;
}
