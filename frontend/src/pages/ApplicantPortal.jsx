import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ApplicantShell from '../layouts/ApplicantShell';
import PortfolioHero from '../components/applicant/PortfolioHero';
import LoanCategoryGrid from '../components/applicant/LoanCategoryGrid';
import BankRateComparison from '../components/applicant/BankRateComparison';
import EmiSnapshot from '../components/applicant/EmiSnapshot';
import ApplicationsPanel from '../components/applicant/ApplicationsPanel';
import LoanJourney from '../components/applicant/LoanJourney';
import RecommendedOffers from '../components/applicant/RecommendedOffers';
import UpdatesPanel from '../components/applicant/UpdatesPanel';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { applicationService } from '../services/applicationService';
import {
  portfolioSummary,
  portfolioReadiness,
  journeySteps,
  emiEstimate,
  rateComparison,
  getLoanTypeDetail,
  isActive,
  docReadiness,
  verificationSnapshot,
} from '../lib/dashboardData';

export default function ApplicantPortal() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Replacement upload is scoped to one document at a time.
  const [replacingKey, setReplacingKey] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sortNewestFirst = (list) =>
    [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await applicationService.getApplications();
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setApplications(sortNewestFirst(list));
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch applications', error);
        toast.error(error.message, { title: 'Could not load your applications' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Sidebar links arrive as /applicant#applications; scroll once the data is in.
  useEffect(() => {
    if (loading) return;
    const hash = location.hash;
    if (!hash || hash.length < 2) return;
    let target = null;
    try {
      target = document.querySelector(hash);
    } catch {
      target = null;
    }
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, location.hash, location.key]);

  const handleReplace = useCallback(
    async (applicationId, documentType, file) => {
      if (!file || !applicationId || !documentType) return;
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        await applicationService.uploadDocument(applicationId, formData);

        const response = await applicationService.getApplications();
        const list = Array.isArray(response.data) ? response.data : [];
        setApplications(sortNewestFirst(list));

        toast.success('Replacement uploaded. Our team will review it shortly.', {
          title: 'Document received',
        });
        setReplacingKey(null);
      } catch (error) {
        toast.error(error.message, { title: 'Upload failed' });
      } finally {
        setUploading(false);
      }
    },
    [toast]
  );

  const summary = useMemo(() => portfolioSummary(applications), [applications]);
  const readiness = useMemo(() => portfolioReadiness(applications), [applications]);
  const rates = useMemo(() => rateComparison(), []);

  const focusApp = useMemo(
    () => applications.find((app) => isActive(app.status)) || summary.latest,
    [applications, summary.latest]
  );

  const steps = useMemo(() => journeySteps(focusApp), [focusApp]);
  const journeyPercent = steps.length
    ? Math.round((steps.filter((s) => s.state === 'complete').length / steps.length) * 100)
    : 0;

  const estimate = useMemo(() => emiEstimate(focusApp), [focusApp]);

  // AI verification scorecard for the hero, built from the focus application's
  // real ValidationResult plus its document counts. null until it's verified.
  const heroVerification = useMemo(() => {
    const v = verificationSnapshot(focusApp);
    if (!v) return null;
    const dr = docReadiness(focusApp);
    return {
      ...v,
      docsUploaded: dr.uploadedCount,
      docsRequired: dr.required,
      docsApproved: dr.approved,
      loanType: focusApp?.loanType || null,
      bankName: focusApp?.bankName || null,
    };
  }, [focusApp]);

  const appliedTypes = useMemo(
    () => [...new Set(applications.map((app) => app.loanType).filter(Boolean))],
    [applications]
  );
  const focusTypeLabel = getLoanTypeDetail(focusApp?.loanType)?.label || '';

  const journeySubtitle = focusApp
    ? `${String(focusApp.loanType || '').replace(/^\w/, (c) => c.toUpperCase())} loan · ${
        focusApp.bankName || 'Partner bank'
      }`
    : 'Start an application to see your progress';

  if (loading) {
    return (
      <ApplicantShell userName={user?.name || ''}>
        <div className="space-y-5 animate-pulse">
          <div className="h-56 rounded-xl bg-slate-200" />
          <div className="grid xl:grid-cols-[1fr_360px] gap-5">
            <div className="space-y-5">
              <div className="h-40 rounded-xl bg-slate-200" />
              <div className="h-64 rounded-xl bg-slate-200" />
            </div>
            <div className="h-72 rounded-xl bg-slate-200" />
          </div>
        </div>
      </ApplicantShell>
    );
  }

  return (
    <ApplicantShell
      userName={user?.name || ''}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      actionRequiredCount={summary.actionRequired}
    >
      <div className="space-y-5">
        <PortfolioHero
          summary={summary}
          readiness={readiness}
          latest={summary.latest}
          verification={heroVerification}
        />

        <div className="grid xl:grid-cols-[1fr_360px] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            <ApplicationsPanel
              applications={applications}
              searchTerm={searchTerm}
              onReplace={handleReplace}
              uploading={uploading}
              replacingKey={replacingKey}
              onReplaceTargetChange={setReplacingKey}
            />

            <div className="grid lg:grid-cols-2 gap-5 items-start">
              <EmiSnapshot application={focusApp} estimate={estimate} />
              <BankRateComparison
                rates={rates}
                highlightBankId={focusApp?.bankId || null}
                loanTypeLabel={focusTypeLabel}
              />
            </div>

            <LoanCategoryGrid appliedTypes={appliedTypes} />
          </div>

          <div className="space-y-5 min-w-0">
            <UpdatesPanel />
            <LoanJourney steps={steps} percent={journeyPercent} subtitle={journeySubtitle} />
            <RecommendedOffers rates={rates} loanTypeLabel={focusTypeLabel} />
          </div>
        </div>
      </div>
    </ApplicantShell>
  );
}
