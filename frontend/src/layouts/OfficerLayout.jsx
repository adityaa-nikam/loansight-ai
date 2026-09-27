import { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import OfficerSidebar from '../components/officer/OfficerSidebar';
import OfficerTopbar from '../components/officer/OfficerTopbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { officerService } from '../services/officerService';
import { queueSummary, statusMeta } from '../lib/officerData';
import { ROUTES } from '../constants/routes';

/**
 * Frame shared by every officer screen. The application list is fetched once
 * here so the sidebar queue badges, the dashboard and the list page all read
 * from the same data instead of firing three separate requests.
 */
export default function OfficerLayout() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [params] = useSearchParams();

  const [navOpen, setNavOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      try {
        if (!quiet) setLoading(true);
        const response = await officerService.getApplications();
        setApplications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to load applications', error);
        toast.error(error.message, { title: 'Could not load the application queue' });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  const removeApplication = useCallback((id) => {
    setApplications((prev) => prev.filter((app) => app._id !== id));
  }, []);

  const summary = useMemo(() => queueSummary(applications), [applications]);

  const statusParam = params.get('status') || '';
  const onDetails = /\/officer\/applications\/[^/]+$/.test(location.pathname);

  let title = 'Officer Workspace';
  let subtitle = '';

  if (onDetails) {
    title = 'Application Review';
    subtitle = 'Verify documents, run checks and record a decision';
  } else if (location.pathname.startsWith(ROUTES.OFFICER_APPLICATIONS)) {
    title = statusParam ? statusMeta(statusParam).label : 'All Applications';
    subtitle = statusParam
      ? 'Filtered work queue'
      : 'Search, filter and open any loan request';
  } else if (location.pathname === ROUTES.OFFICER) {
    title = 'Verification Dashboard';
    subtitle = 'Live queue, portfolio mix and recent activity';
  }

  const outletContext = useMemo(
    () => ({ applications, loading, summary, refresh: load, removeApplication }),
    [applications, loading, summary, load, removeApplication]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <OfficerSidebar counts={summary} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <OfficerTopbar
          title={title}
          subtitle={subtitle}
          userName={user?.name || ''}
          role={user?.role || 'officer'}
          alertCount={summary.docsRequired}
          onMenuClick={() => setNavOpen(true)}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>
    </div>
  );
}
