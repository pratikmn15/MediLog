import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = ({ children, requireAuth = true }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  // Diagnostic: log guard decisions (remove after debug)
  console.debug('[RouteGuard] path=', location.pathname, 'requireAuth=', requireAuth, 'isAuthenticated=', isAuthenticated, 'hasToken=', !!token);

  if (requireAuth) {
    // Protected route logic
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
  } else {
    // Auth redirect logic (for login/register pages)
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
    }
  }

  return children;
};

export default RouteGuard;