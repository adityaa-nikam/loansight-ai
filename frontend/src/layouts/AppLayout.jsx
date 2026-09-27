import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileText, LogOut } from 'lucide-react';
import Container from '../components/layout/Container';
import BrandLogo from '../components/common/BrandLogo';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', to: ROUTES.APPLICANT, icon: Home },
  { label: 'New Application', to: ROUTES.APPLY, icon: FileText },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-cream-300/60 sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-14">
            <BrandLogo to={ROUTES.HOME} variant="dark" size="sm" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-charcoal-900">{user?.name || 'User'}</p>
                <p className="text-xs text-charcoal-400 capitalize">{user?.role || 'applicant'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-cream-300 flex items-center justify-center text-sm font-semibold text-charcoal-700">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </Container>
      </header>

      <div className="flex">
        {/* Sidebar — Desktop */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r border-cream-300/60 pt-6 pb-4 px-3 sticky top-14 self-start">
          <nav className="flex-1 flex flex-col gap-1" aria-label="Application navigation">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-cream-200 text-charcoal-900'
                      : 'text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-900 transition-colors duration-200 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-300/60 z-40 flex">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium
                  transition-colors duration-200
                  ${isActive ? 'text-charcoal-900' : 'text-charcoal-400'}
                `}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-24 md:pb-0">
          <Container className="py-8">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}
