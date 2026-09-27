import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import PortfolioHero from 'C:/Manish/Loanlens/frontend/src/components/applicant/PortfolioHero.jsx';
import { portfolioSummary, portfolioReadiness } from 'C:/Manish/Loanlens/frontend/src/lib/dashboardData.js';

const doc = (type, status) => ({ _id: type + status, documentType: type, status });

// A realistic active home-loan application with a partial checklist.
const appActive = {
  _id: 'a1', bankId: 'hdfc', bankName: 'HDFC Bank', loanType: 'home',
  requestedAmount: 4500000, tenureMonths: 240, employmentType: 'salaried',
  declaredMonthlyIncome: 145000, status: 'under_review',
  createdAt: '2026-08-10T09:00:00.000Z', updatedAt: '2026-08-12T09:00:00.000Z',
  documents: [doc('pan','approved'), doc('aadhaar','approved'), doc('salary_slip','rejected')],
};
const appApproved = { ...appActive, _id:'a2', bankId:'sbi', bankName:'SBI', loanType:'personal',
  requestedAmount: 800000, status:'approved', createdAt:'2026-07-01T09:00:00.000Z', documents:[] };
const appDraft = { ...appActive, _id:'a3', bankId:'axis', bankName:'Axis Bank', loanType:'vehicle',
  requestedAmount: 1200000, status:'draft', createdAt:'2026-08-15T09:00:00.000Z', documents:[] };
const appWithdrawn = { ...appActive, _id:'a4', status:'withdrawn', documents:[] };

function render(label, props) {
  try {
    const html = renderToStaticMarkup(
      <StaticRouter location="/applicant"><PortfolioHero {...props} /></StaticRouter>
    );
    const grab = (re) => { const m = html.match(re); return m ? m[1].replace(/<[^>]+>/g,'').trim() : null; };
    console.log('--- ' + label + ' -> RENDER OK (' + html.length + ' chars)');
    console.log('    headline : ' + grab(/<h1[^>]*>([\s\S]*?)<\/h1>/));
    console.log('    subline  : ' + grab(/max-w-md[^>]*>([\s\S]*?)<\/p>/));
    console.log('    gauge    : ' + (grab(/aria-label="(Document readiness[^"]*)"/) || 'EMPTY STATE'));
    console.log('    emptyTxt : ' + (grab(/text-sm font-medium text-white">([^<]*)</) || '-'));
    console.log('    hasKnob  : ' + /<circle/.test(html) + '  hasValueArc: ' + /#10B981/.test(html));
    console.log('    ctas     : ' + (html.match(/<a [^>]*href="[^"]*"/g)||[]).join(' | '));
    console.log('    footNote : ' + (grab(/text-\[11px\] text-(?:amber|emerald)-400[^>]*>([\s\S]*?)<\/p>/) || '-'));
  } catch (e) {
    console.log('--- ' + label + ' -> CRASH: ' + e.message);
    process.exitCode = 1;
  }
}

// 1. Nothing at all — the null-prop contract.
render('null props', {});
// 2. Explicit nulls.
render('all nulls explicit', { summary: null, readiness: null, latest: null });
// 3. Zero applications.
const empty = [];
render('0 applications', { summary: portfolioSummary(empty), readiness: portfolioReadiness(empty), latest: null });
// 4. One active application, partial docs + a rejected doc.
const one = [appActive];
render('1 active (partial + rejected doc)', { summary: portfolioSummary(one), readiness: portfolioReadiness(one), latest: appActive });
// 5. Several applications, mixed statuses.
const many = [appActive, appApproved, appDraft];
render('3 mixed', { summary: portfolioSummary(many), readiness: portfolioReadiness(many), latest: appDraft });
// 6. Only closed/withdrawn -> no active apps, so no basis for a score.
const closed = [appWithdrawn, appApproved];
render('closed only (no active)', { summary: portfolioSummary(closed), readiness: portfolioReadiness(closed), latest: appApproved });
// 7. Malformed / hostile input.
render('garbage props', { summary: { total: 'x', active: -4, actionRequired: NaN, totalRequested: null }, readiness: { required: 'y', percent: 900, missingCount: -1, uploadedCount: undefined }, latest: 42 });
// 8. 100% readiness -> success line.
const full = { ...appActive, documents: ['pan','aadhaar','salary_slip','bank_statement','form16','property_document','other','payment_slip'].map(t=>doc(t,'approved')) };
render('full readiness', { summary: portfolioSummary([full]), readiness: portfolioReadiness([full]), latest: full });
