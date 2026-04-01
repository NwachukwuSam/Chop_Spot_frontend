import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from '../src/auth/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from '../src/auth/ProtectedRoute.jsx';

// Pages and Components
import Home from './pages/Home';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorRegister from '../src/auth/VendoRegister.jsx';
import VendorDashboard from './dashboards/VendorDashboard';
import RiderRegister from './auth/RiderRegister';
import RiderDashboard from './dashboards/RiderDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AccountingDashboard from './dashboards/AccountingDashboard';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import { useAuth } from './hooks/useAuth.js';

// Role constants for easier maintenance
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VENDOR: 'vendor',
  RIDER: 'rider',
  CUSTOMER: 'customer',
  ACCOUNTING: 'accounting'
};

/**
 * GlobalAuthGuard
 *
 * Listens for the "chopspot:unauthorized" custom event fired by Api.js
 * whenever any authenticated request receives a 401.
 *
 * When it fires, the user's token has expired or been invalidated.
 * We redirect to /login and preserve the current path as returnTo so
 * they land back where they were after re-authenticating.
 */
function GlobalAuthGuard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("🔐 Session expired — redirecting to login");
      logout(); // Clear session
      navigate("/login", {
        state: {
          returnTo: window.location.pathname,
          sessionExpired: true,
        },
        replace: true,
      });
    };

    window.addEventListener("chopspot:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("chopspot:unauthorized", handleUnauthorized);
  }, [navigate, logout]);

  return null;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalAuthGuard />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/vendor-registration" element={<VendorRegister />} />
            <Route path="/rider-registration" element={<RiderRegister />} />
            
            {/* Protected Routes */}
            <Route 
              path="/customer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/vendor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.VENDOR]}>
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/rider-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.RIDER]}>
                  <RiderDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/super-admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/accounting-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ACCOUNTING]}>
                  <AccountingDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;