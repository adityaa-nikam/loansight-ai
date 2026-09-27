import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import RouteFallback from './RouteFallback';

export default function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // The session check (GET /auth/me) is still in flight. Redirecting now would
  // sign the user out on every hard refresh of a protected route.
  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Send them to the home of the role they actually hold.
    const home = user.role === 'officer' || user.role === 'admin'
      ? ROUTES.OFFICER
      : ROUTES.APPLICANT;
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
