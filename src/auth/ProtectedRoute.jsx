import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Maps normalised role string → its home dashboard path
const ROLE_HOME = {
    SUPER_ADMIN: "/super-admin-dashboard",
    ADMIN:       "/admin-dashboard",
    VENDOR:      "/vendor-dashboard",
    RIDER:       "/rider-dashboard",
    CUSTOMER:    "/dashboard",
    ACCOUNTING:  "/accounting-dashboard",
};

// Normalise role to uppercase with no ROLE_ prefix
const normaliseRole = (raw) =>
    String(raw || "").toUpperCase().replace("ROLE_", "").trim();

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Wait until AuthContext has finished reading localStorage
        if (loading) return;

        // Not authenticated → send to login, preserve return path
        if (!user) {
            navigate("/login", {
                state: { returnTo: location.pathname },
                replace: true,
            });
            return;
        }

        // Role check — normalise both sides so casing never matters
        if (allowedRoles.length > 0) {
            const userRole  = normaliseRole(user.role || user.roles?.[0]);
            const allowed   = allowedRoles.map(normaliseRole);

            if (!allowed.includes(userRole)) {
                // Send them to wherever their actual role belongs
                const target = ROLE_HOME[userRole] || "/";
                navigate(target, { replace: true });
            }
        }
    }, [user, loading, navigate, location.pathname, allowedRoles]);

    // Show spinner while AuthContext is initialising
    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fdf8", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #d6ebd6", borderTopColor: "#2d8a2d", animation: "spin .7s linear infinite" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#5a7a5a", fontWeight: 600 }}>
                    Checking authentication…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Not authenticated — render nothing (useEffect handles the redirect)
    if (!user) return null;

    // Wrong role — render nothing (useEffect handles the redirect)
    if (allowedRoles.length > 0) {
        const userRole = normaliseRole(user.role || user.roles?.[0]);
        const allowed  = allowedRoles.map(normaliseRole);
        if (!allowed.includes(userRole)) return null;
    }

    // Authenticated and correct role — render the protected page
    return children;
};

export default ProtectedRoute;