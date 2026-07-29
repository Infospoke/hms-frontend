import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Guards the candidate dashboard ("/dashboard-careers/...").
 * Unauthenticated visitors are bounced to /login and, per the Job
 * Application Submission FRD ("redirect an unauthenticated candidate to
 * Login/Sign Up and return them to the same job's application flow after
 * successful authentication"), we remember where they were headed so
 * LoginPage can send them straight back after signing in.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}
