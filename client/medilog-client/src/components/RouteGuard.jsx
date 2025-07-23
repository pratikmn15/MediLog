import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();

  if (requireAuth) {
    // Protected route logic
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  } else {
    // Auth redirect logic (for login/register pages)
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RouteGuard;