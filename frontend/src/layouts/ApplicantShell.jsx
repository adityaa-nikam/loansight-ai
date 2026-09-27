import { useState } from 'react';
import ApplicantSidebar from '../components/applicant/ApplicantSidebar';
import ApplicantTopbar from '../components/applicant/ApplicantTopbar';

/**
 * Frame shared by every applicant screen: navy sidebar + white topbar + content well.
 * Takes data as props rather than reading it itself so each page stays the single
 * source of truth for its own data.
 */
export default function ApplicantShell({
  userName = '',
  subtitle = '',
  searchTerm = '',
  onSearchChange = () => {},
  showSearch = true,
  actionRequiredCount = 0,
  children,
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ApplicantSidebar
        actionRequiredCount={actionRequiredCount}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <ApplicantTopbar
          userName={userName}
          subtitle={subtitle}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          showSearch={showSearch}
          onMenuClick={() => setNavOpen(true)}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
