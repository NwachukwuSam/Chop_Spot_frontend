import { useAuth } from "../auth/AuthContext.jsx";
import {riderApi} from "./Api.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RiderRegister from "../auth/RiderRegister.jsx";
import RiderDashboard from "../dashboards/RiderDashboard.jsx";

/**
 * RiderApp
 * Rendered at /rider-dashboard via ProtectedRoute.
 * On mount: fetches the rider profile for the logged-in user.
 *   - If profile exists → show Dashboard
 *   - If not → show Registration (first-time setup)
 */
export default function RiderApp() {
    const auth       = useAuth();
    const isLoggedIn = auth.isLoggedIn ?? auth.isAuthenticated ?? false;
    const logout     = auth.logout;

    const navigate   = useNavigate();
    const [rider,    setRider]   = useState(null);
    const [loading,  setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { replace: true });
            return;
        }
        riderApi.getProfile()
            .then(raw => setRider(raw))
            .catch(() => setRider(null))    // 404 = no profile yet → show registration
            .finally(() => setLoading(false));
    }, [isLoggedIn, navigate]);

    if (loading) return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, background:"#f8fdf8" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", border:"3px solid #d6ebd6", borderTopColor:"#2d8a2d", animation:"spin .7s linear infinite" }} />
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:"#2d8a2d", fontSize:15 }}>Loading…</p>
            <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>
    );

    // No rider profile yet → first-time registration
    if (!rider) return <RiderRegister onSuccess={setRider} />;

    return <RiderDashboard initialRider={rider} onLogout={logout} />;
}