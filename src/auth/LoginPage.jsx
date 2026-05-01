import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";  // ← AuthContext, not hooks/useAuth
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import * as API from "../utils/Api";
import logo from "../assets/tasty.jpg.jpeg";

const FOOD_EMOJIS = ["🍛", "🍗", "🥗", "🥘", "🍜", "🫔", "🍔", "🌽"];

function FoodOrb({ emoji, style }) {
    return (
        <div style={{
            position: "absolute", width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, backdropFilter: "blur(4px)", ...style,
        }}>{emoji}</div>
    );
}

function Field({ label, type, value, onChange, placeholder, icon, error, autoComplete }) {
    const [focused,  setFocused]  = useState(false);
    const [showPass, setShowPass] = useState(false);
    const inputType = type === "password" ? (showPass ? "text" : "password") : type;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: error ? "#dc2626" : "#64748b", transition: "color 0.2s" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused ? "#1a5c1a" : error ? "#dc2626" : "#9ca3af", transition: "color 0.2s", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    {icon}
                </div>
                <input type={inputType} value={value} onChange={onChange} placeholder={placeholder}
                       autoComplete={autoComplete}
                       onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                       style={{
                           width: "100%", padding: "14px 44px 14px 42px", borderRadius: 12,
                           border: `1.5px solid ${error ? "#fca5a5" : focused ? "#1a5c1a" : "#e2e8f0"}`,
                           background: focused ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
                           fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#0f172a",
                           outline: "none", boxSizing: "border-box", transition: "all 0.2s",
                           boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.12)" : error ? "0 0 0 3px rgba(220,38,38,0.08)" : "none",
                       }}
                />
                {type === "password" && (
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex", alignItems: "center" }}>
                        {showPass
                            ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                    </button>
                )}
            </div>
            {error && (
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4, animation: "errFade 0.2s ease" }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── route resolver — maps role(s) to the correct dashboard path ───────────────
const resolveRedirect = (roles = [], returnTo = null) => {
    const upperRoles = roles.map(r => String(r).toUpperCase().replace("ROLE_", ""));

    if (upperRoles.some(r => ["ADMIN", "SUPER_ADMIN"].includes(r)))
        return "/admin-dashboard";

    if (upperRoles.includes("VENDOR")) return "/vendor-dashboard";
    if (upperRoles.includes("RIDER"))  return "/rider-dashboard";

    // Customer → go back to where they came from, or home
    return returnTo || "/";
};

// ════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE
// ════════════════════════════════════════════════════════════
export default function LoginPage() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const toast     = useToast();
    const { login: authLogin } = useAuth();

    // ← returnTo is passed via navigate("/login", { state: { returnTo: "/", openCheckout: true } })
    const returnTo        = location.state?.returnTo       || null;
    const openCheckout    = location.state?.openCheckout    || false;
    const registeredEmail = location.state?.registeredEmail || "";
    const sessionExpired  = location.state?.sessionExpired  || false;

    const [email,       setEmail]       = useState(registeredEmail);
    const [password,    setPassword]    = useState("");
    const [loading,     setLoading]     = useState(false);
    const [apiError,    setApiError]    = useState("");
    const [shake,       setShake]       = useState(false);
    const [success,     setSuccess]     = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [destination, setDestination] = useState("");
    const [roleLabel,   setRoleLabel]   = useState("Dashboard");

    useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

    const validate = () => {
        const errs = {};
        if (!email.trim())                                    errs.email    = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  errs.email    = "Enter a valid email address";
        if (!password)                                        errs.password = "Password is required";
        else if (password.length < 4)                         errs.password = "Password must be at least 4 characters";
        return errs;
    };

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setFieldErrors({});

        const errs = validate();
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            triggerShake();
            return;
        }

        setLoading(true);
        try {
            const result = await API.login({ email: email.trim(), password });

            const token = result.accessToken || result.token;
            if (!token) throw new Error("No access token received.");

            // Store tokens
            localStorage.setItem("chopspot_token", token);
            localStorage.setItem("token", token);
            if (result.refreshToken) localStorage.setItem("refreshToken", result.refreshToken);

            // Store user
            const roles = result.roles || (result.role ? [result.role] : []);
            const userData = {
                id:        result.userId,
                email:     result.email,
                firstName: result.firstName,
                lastName:  result.lastName,
                role:      roles[0] || "",
                roles,
            };
            authLogin(token, userData);

            localStorage.setItem("chopspot_user", JSON.stringify(userData));

            // Resolve where to go
            const redirectPath = resolveRedirect(roles, returnTo);

            // Show success screen
            setSuccess(true);

            // **Important**: Use replace + small delay to avoid race conditions
            setTimeout(() => {
                console.log("🚀 Final redirect to:", redirectPath);
                navigate(redirectPath, {
                    replace: true,
                    state: returnTo ? { openCheckout: true } : {}
                });
            }, 1200);

        } catch (err) {
            console.error("Login error:", err);
            const msg = err.response?.data?.message || err.message || "Invalid email or password.";
            setApiError(msg);
            toast.error(msg);
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes orbFloat1 { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-16px) rotate(8deg); } }
        @keyframes orbFloat2 { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-20px) rotate(-6deg); } }
        @keyframes orbFloat3 { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes spinRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes successPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes errFade  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(26,92,26,0.4)} 50%{box-shadow:0 0 0 12px rgba(26,92,26,0)} }
        .panel-left { animation: fadeIn 0.6s ease both; }
        .form-panel { animation: fadeUp 0.7s ease 0.15s both; }
        input::placeholder { color:#94a3b8; }
        @media (max-width: 768px) { .panel-left { display: none !important; } }
      `}</style>

            <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans',sans-serif" }}>

                {/* ── LEFT PANEL ── */}
                <div className="panel-left" style={{ flex: "0 0 46%", background: "linear-gradient(160deg,#0d2e0d 0%,#1a4a1a 50%,#0d2e0d 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 48px" }}>
                    <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
                        <svg width="100%" height="100%"><defs><pattern id="g" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="1.5" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
                    </div>
                    <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,45,0.25) 0%,transparent 70%)" }}/>
                    <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)" }}/>

                    {/* Food orbs */}
                    {FOOD_EMOJIS.map((emoji, i) => (
                        <FoodOrb key={i} emoji={emoji} style={{
                            top: `${[8,22,42,65,78,55,30,15][i]}%`,
                            left: `${[70,85,78,88,68,72,92,60][i]}%`,
                            animation: `orbFloat${(i % 3) + 1} ${3.5 + i * 0.4}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }} />
                    ))}

                    <div style={{ position: "relative", zIndex: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12,  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 16px " }}><img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "30%" }} /></div>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "white", letterSpacing: -0.5 }}>TastyCart</span>
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 10, maxWidth: 360 }}>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "white", lineHeight: 1.2, marginBottom: 20 }}>
                            Feed{" "}<span style={{ color: "#4caf50" }}>your</span>{" "}
                            <span style={{ color: "#f5920a", fontStyle: "italic" }}>customers.</span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 320 }}>
                            Manage your restaurant, track deliveries, and grow your business — all from one place.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
                            {["🏪 Vendors", "🏍️ Riders", "📦 Orders", "📊 Analytics"].map(chip => (
                                <span key={chip} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "5px 14px" }}>{chip}</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 10 }}>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© 2026 ChopSpot · All rights reserved</p>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Form ── */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px", overflowY: "auto", background: "#fff" }}>
                    <div className="form-panel" style={{ width: "100%", maxWidth: 440 }}>

                        {/* ── Session expired banner ── */}
                        {sessionExpired && !success && (
                            <div style={{ background: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "12px 16px", marginBottom: 28, display: "flex", alignItems: "center", gap: 10, animation: "fadeUp 0.4s ease" }}>
                                <span style={{ fontSize: 22 }}>⏰</span>
                                <div>
                                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#991b1b", margin: 0 }}>Session expired</p>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#b91c1c", margin: "2px 0 0" }}>Please sign in again to continue.</p>
                                </div>
                            </div>
                        )}

                        {/* ── Cart reminder banner (shown when redirected from checkout) ── */}
                        {returnTo && !sessionExpired && !success && (
                            <div style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "12px 16px", marginBottom: 28, display: "flex", alignItems: "center", gap: 10, animation: "fadeUp 0.4s ease" }}>
                                <span style={{ fontSize: 22 }}>🛒</span>
                                <div>
                                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#92400e", margin: 0 }}>You're almost there!</p>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#b45309", margin: "2px 0 0" }}>Sign in to complete your order. Your cart is saved.</p>
                                </div>
                            </div>
                        )}

                        {success ? (
                            <div style={{ textAlign: "center", animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
                                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulseGreen 1s ease infinite" }}>
                                    <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: "#0f172a", marginBottom: 8 }}>Welcome back!</h2>
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b" }}>
                                    {returnTo
                                        ? "Login successful. Taking you back to finish your order 🛒"
                                        : <>Login successful. Taking you to <strong>{roleLabel}</strong>…</>
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 36 }}>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.1rem)", color: "#0f172a", lineHeight: 1.15, marginBottom: 8 }}>
                                        Sign in to TastyCart
                                    </h2>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                                        {returnTo
                                            ? "Sign in to place your order. Your cart items are waiting."
                                            : "Enter your credentials to access your dashboard."
                                        }
                                    </p>
                                </div>

                                {apiError && (
                                    <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, animation: "errFade 0.25s ease both" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fee2e2", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="16" height="16" fill="#dc2626" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 2 }}>Login failed</p>
                                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#b91c1c" }}>{apiError}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20, animation: shake ? "shake 0.45s ease" : "none" }}>
                                    <Field label="Email Address" type="email" value={email}
                                           onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); setApiError(""); }}
                                           placeholder="you@example.com" autoComplete="email" error={fieldErrors.email}
                                           icon={<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                    />

                                    <Field label="Password" type="password" value={password}
                                           onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); setApiError(""); }}
                                           placeholder="Enter your password" autoComplete="current-password" error={fieldErrors.password}
                                           icon={<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                                    />

                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                                        <Link to="/forgot-password" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#1a5c1a", textDecoration: "none", borderBottom: "1px solid transparent" }}
                                              onMouseEnter={e => e.target.style.borderColor = "#1a5c1a"}
                                              onMouseLeave={e => e.target.style.borderColor = "transparent"}>
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: loading ? "#6b9f6b" : "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 4px 20px rgba(26,92,26,0.35)", transition: "all 0.2s" }}
                                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.015)"; }}
                                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        {loading
                                            ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spinRing 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Signing in…</>
                                            : <>{returnTo ? "Sign In & Continue Ordering" : "Sign In"} <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                                        }
                                    </button>
                                </form>

                                <div style={{ marginTop: 28 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>Need access?</span>
                                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                    </div>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 1.6 }}>
                                        Contact your ChopSpot administrator at{" "}
                                        <a href="mailto:admin@chopspot.ng" style={{ color: "#1a5c1a", fontWeight: 600, textDecoration: "none" }}>admin@chopspot.ng</a>
                                    </p>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 16 }}>
                                        New to ChopSpot?{" "}
                                        <Link to="/register" style={{ color: "#1a5c1a", fontWeight: 700, textDecoration: "none" }}>Create a free account</Link>
                                    </p>
                                </div>

                                <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                                    {[{ icon: "🔒", label: "SSL Encrypted" }, { icon: "🛡️", label: "Secure Login" }, { icon: "✅", label: "Verified Platform" }].map(({ icon, label }) => (
                                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                                            <span style={{ fontSize: 13 }}>{icon}</span>{label}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}