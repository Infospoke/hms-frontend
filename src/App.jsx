import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import CareersPage from './pages/CareersPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import ApplicationFormPage from './pages/ApplicationFormPage.jsx';
import MyApplicationsPage from './pages/MyApplicationsPage.jsx';
import InterviewsPage from './pages/InterviewsPage.jsx';
import OffersPage from './pages/OffersPage.jsx';
import OfferDetailPage from './pages/OfferDetailPage.jsx';
import OfferNegotiationPage from './pages/OfferNegotiationPage.jsx';
import ApplicationDetailPage from './pages/Applicationdetailpage .jsx';

/** Sends already-signed-in candidates straight to the dashboard instead of back to Login. */
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard-careers' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
       

  
        <Route
          path="/dashboard-careers"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CareersPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="offer" element={<OffersPage />} />
          <Route path="offer/:applicantId/negotiate" element={<OfferNegotiationPage />} />
          <Route path="offer/:applicantId/:offerId" element={<OfferDetailPage />} />
          <Route path=":jobId/apply" element={<ApplicationFormPage />} />
          <Route path=":jobId" element={<JobDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
