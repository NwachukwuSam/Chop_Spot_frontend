import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { useEffect } from 'react';
import Home from './pages/Home';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorRegister from './auth/VendoRegister';
import VendorDashboard from './dashboards/VendorDashboard';
import RiderRegister from './auth/RiderRegister';
import RiderDashboard from './dashboards/RiderDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AccountingDashboard from './dashboards/AccountingDashboard';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';

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

    useEffect(() => {
        const handleUnauthorized = () => {
            console.warn("🔐 Session expired — redirecting to login");
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
    }, [navigate]);

    return null;
}

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                {/* Sits inside BrowserRouter so it has access to useNavigate */}
                <GlobalAuthGuard />

                <Routes>
                    <Route path="/"                       element={<Home />} />
                    <Route path="/login"                  element={<LoginPage />} />
                    <Route path="/register"               element={<RegisterPage />} />
                    <Route path="/forgot-password"          element={<ForgotPasswordPage />} />
                    <Route path="/customer-dashboard"     element={<CustomerDashboard />} />
                    <Route path="/vendor-registration"    element={<VendorRegister />} />
                    <Route path="/vendor-dashboard"       element={<VendorDashboard />} />
                    <Route path="/rider-registration"     element={<RiderRegister />} />
                    <Route path="/rider-dashboard"        element={<RiderDashboard />} />
                    <Route path="/super-admin-dashboard"  element={<SuperAdminDashboard />} />
                    <Route path="/admin-dashboard"        element={<AdminDashboard />} />
                    <Route path="/accounting-dashboard"   element={<AccountingDashboard />} />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;