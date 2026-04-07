import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, isAuthenticated } = useAuth();   // make sure these exist in your AuthContext

    useEffect(() => {
        if (loading) return;   // Wait until auth is ready

        // Not logged in → send to login with return path
        if (!user && !isAuthenticated) {
            navigate("/login", {
                state: {
                    returnTo: location.pathname,
                    sessionExpired: true
                },
                replace: true,
            });
            return;
        }

        // Role check (normalize case)
        if (allowedRoles.length > 0 && user) {
            const userRole = String(user.role || user.roles?.[0] || "").toUpperCase().replace("ROLE_", "");
            const allowed = allowedRoles.map(r => String(r).toUpperCase().replace("ROLE_", ""));

            if (!allowed.includes(userRole)) {
                // Redirect to correct dashboard based on actual role
                const roleMap = {
                    "SUPER_ADMIN": "/super-admin-dashboard",
                    "ADMIN":       "/admin-dashboard",
                    "VENDOR":      "/vendor-dashboard",
                    "RIDER":       "/rider-dashboard",
                    "CUSTOMER":    "/dashboard",           // or "/customer-dashboard" if you prefer
                    "ACCOUNTING":  "/accounting-dashboard",
                };

                const target = roleMap[userRole] || "/";
                navigate(target, { replace: true });
                return;
            }
        }
    }, [user, loading, isAuthenticated, navigate, location.pathname, allowedRoles]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user && !isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;