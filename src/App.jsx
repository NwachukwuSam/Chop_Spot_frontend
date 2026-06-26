import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './auth/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

import Home from './pages/Home';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorRegister from './auth/VendoRegister';
import VendorApp from "./utils/VendorApp.jsx";
import RiderRegister from './auth/RiderRegister';
import RiderApp  from './utils/RiderApp';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AccountingDashboard from './dashboards/AccountingDashboard';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/Registerpage';
import ForgotPasswordPage from './auth/Forgotpasswordpage';
import { useAuth } from './auth/AuthContext';
import {NetworkProvider} from "./context/NetworkContext.jsx";
import OfflinePage from "./pages/OfflinePage.jsx";
import AboutPage from './pages/AboutUs.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import CompanyPublicPage from './pages/PublicPage.jsx';
import JoinUs from './pages/JoinUs.jsx';
import ContactUs from './pages/ContactUs.jsx';

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
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="/"                    element={<Home />} />
                <Route path="/login"               element={<LoginPage />} />
                <Route path="/register"            element={<RegisterPage />} />
                <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
                <Route path="/vendor-registration" element={<VendorRegister />} />
                <Route path="/rider-registration"  element={<RiderRegister />} />
                <Route path="/about-us"  element={<AboutPage />} />
                <Route path="/contact-us"  element={<ContactUs />} />
                <Route path="/join-us"  element={<JoinUs />} />

                {/* Customer */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                        <CustomerDashboard />
                    </ProtectedRoute>
                } />

                {/* Staff / Admin */}
                <Route path="/vendor-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.VENDOR]}>
                        <VendorApp />
                    </ProtectedRoute>
                } />
                <Route path="/rider-dashboard" element={
                    <ProtectedRoute allowedRoles={[ROLES.RIDER]}>
                        <RiderApp />
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
                <NetworkProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                </NetworkProvider>
            </AuthProvider>
        </ToastProvider>
    );
}