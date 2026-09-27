import ApplicantShell from '../layouts/ApplicantShell';
import ActionRequiredPanel from '../components/applicant/ActionRequiredPanel';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Dedicated "Action Required" screen. The panel used to live inline on the
 * dashboard; it now has its own tab so the applicant's to-do list is a
 * deliberate destination rather than something scrolled past. The panel is
 * self-contained (its own header, refresh and empty state), so the page only
 * frames it in a readable column and keeps the sidebar badge in sync.
 */
export default function ActionRequiredPage() {
  const { user } = useAuth();
  const { counts } = useNotifications();

  return (
    <ApplicantShell
      userName={user?.name || ''}
      subtitle="Everything that needs your attention, in one place."
      showSearch={false}
      actionRequiredCount={counts?.actionRequired || 0}
    >
      <div className="mx-auto w-full max-w-3xl">
        <ActionRequiredPanel />
      </div>
    </ApplicantShell>
  );
}
