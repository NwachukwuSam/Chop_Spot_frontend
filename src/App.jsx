import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './auth/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

import Home from './pages/Home';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorRegister from './auth/VendoRegister.jsx';
import VendorDashboard from './dashboards/VendorDashboard';
import RiderRegister from './auth/RiderRegister';
import RiderDashboard from './dashboards/RiderDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AccountingDashboard from './dashboards/AccountingDashboard';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import { useAuth } from './auth/AuthContext';

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN:       'ADMIN',
    VENDOR:      'VENDOR',
    RIDER:       'RIDER',
    CUSTOMER:    'CUSTOMER',
    ACCOUNTING:  'ACCOUNTING',
};

// ── Must be rendered INSIDE both BrowserRouter and AuthProvider ───────────────
function GlobalAuthGuard() {
    const navigate     = useNavigate();
    const { logout }   = useAuth();

    useEffect(() => {
        const handle = () => {
            console.warn("🔐 Session expired — redirecting to login");
            logout();
            navigate("/login", {
                state: { returnTo: window.location.pathname, sessionExpired: true },
                replace: true,
            });
        };
        window.addEventListener("chopspot:unauthorized", handle);
        return () => window.removeEventListener("chopspot:unauthorized", handle);
    }, [navigate, logout]);

    return null;
}

// ── AppRoutes keeps the router tree clean ────────────────────────────────────
function AppRoutes() {
    return (
        <>
            <GlobalAuthGuard />
            <Routes>
                {/* Public */}
                <Route path="/"                    element={<Home />} />
                <Route path="/login"               element={<LoginPage />} />
                <Route path="/register"            element={<RegisterPage />} />
                <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
                <Route path="/vendor-registration" element={<VendorRegister />} />
                <Route path="/rider-registration"  element={<RiderRegister />} />

                {/* Customer */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                        <CustomerDashboard />
                    </ProtectedRoute>
                } />

                {/* Staff / Admin */}
                <Route path="/vendor-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.VENDOR]}>
                        <VendorDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/rider-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.RIDER]}>
                        <RiderDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/super-admin-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/accounting-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.ACCOUNTING]}>
                        <AccountingDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    );
}