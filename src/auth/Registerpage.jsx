import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as API from "../utils/Api";

// ── Reusable field (same as LoginPage) ───────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, icon, error, autoComplete }) {
    const [focused,  setFocused]  = useState(false);
    const [showPass, setShowPass] = useState(false);
    const inputType = type === "password" ? (showPass ? "text" : "password") : type;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: error ? "#dc2626" : "#64748b" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused ? "#1a5c1a" : error ? "#dc2626" : "#9ca3af", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    {icon}
                </div>
                <input
                    type={inputType} value={value} onChange={onChange}
                    placeholder={placeholder} autoComplete={autoComplete}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{
                        width: "100%", padding: "14px 44px 14px 42px", borderRadius: 12,
                        border: `1.5px solid ${error ? "#fca5a5" : focused ? "#1a5c1a" : "#e2e8f0"}`,
                        background: focused ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
                        fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#0f172a",
                        outline: "none", boxSizing: "border-box", transition: "all 0.2s",
                        boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.12)" : "none",
                    }}
                />
                {type === "password" && (
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex" }}>
                        {showPass
                            ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        }
                    </button>
                )}
            </div>
            {error && (
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUser     = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconEmail    = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconLock     = () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

// ── Steps progress bar ────────────────────────────────────────────────────────
const Steps = ({ current }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        {["Account", "Details", "Done"].map((label, i) => {
            const done   = i < current;
            const active = i === current;
            return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 2 ? 1 : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: done ? "#2d8a2d" : active ? "#1a5c1a" : "#e2e8f0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.3s",
                        }}>
                            {done
                                ? <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                : <span style={{ fontSize: 11, fontWeight: 800, color: active ? "white" : "#94a3b8", fontFamily: "'Sora',sans-serif" }}>{i + 1}</span>
                            }
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#0f172a" : done ? "#2d8a2d" : "#94a3b8", fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 2, background: done ? "#2d8a2d" : "#e2e8f0", borderRadius: 2, transition: "background 0.3s" }}/>}
                </div>
            );
        })}
    </div>
);

// ════════════════════════════════════════════════════════════
// MAIN REGISTER PAGE
// ════════════════════════════════════════════════════════════
export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep]           = useState(0);  // 0=account creds, 1=personal details, 2=success
    const [loading, setLoading]     = useState(false);
    const [apiError, setApiError]   = useState("");
    const [shake, setShake]         = useState(false);

    // Step 0 — credentials
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [confirm,  setConfirm]  = useState("");

    // Step 1 — personal details
    const [firstName, setFirstName] = useState("");
    const [lastName,  setLastName]  = useState("");
    const [username,  setUsername]  = useState("");

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    // ── Validation ────────────────────────────────────────────────────────────
    const validateStep0 = () => {
        const errs = {};
        if (!email.trim())                                     errs.email    = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   errs.email    = "Enter a valid email address";
        if (!password)                                         errs.password = "Password is required";
        else if (password.length < 6)                          errs.password = "Password must be at least 6 characters";
        if (!confirm)                                          errs.confirm  = "Please confirm your password";
        else if (confirm !== password)                         errs.confirm  = "Passwords do not match";
        return errs;
    };

    const validateStep1 = () => {
        const errs = {};
        if (!firstName.trim()) errs.firstName = "First name is required";
        if (!lastName.trim())  errs.lastName  = "Last name is required";
        if (!username.trim())  errs.username  = "Username is required";
        else if (username.length < 3) errs.username = "Username must be at least 3 characters";
        else if (/\s/.test(username)) errs.username = "Username cannot contain spaces";
        return errs;
    };

    // ── Step 0 → Step 1 ───────────────────────────────────────────────────────
    const handleNextStep = () => {
        setApiError("");
        const errs = validateStep0();
        if (Object.keys(errs).length) { setFieldErrors(errs); triggerShake(); return; }
        setFieldErrors({});
        setStep(1);
    };

    // ── Step 1 → Submit ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const errs = validateStep1();
        if (Object.keys(errs).length) { setFieldErrors(errs); triggerShake(); return; }

        setLoading(true);
        try {
            await API.register({
                email:     email.trim(),
                password,
                firstName: firstName.trim(),
                lastName:  lastName.trim(),
                username:  username.trim(),
            });

            setStep(2);
            // Auto-navigate to login after 2.5s
            setTimeout(() => navigate("/login", { state: { registeredEmail: email.trim() } }), 2500);
        } catch (err) {
            console.error("❌ Registration error:", err);
            setApiError(err.message || "Registration failed. Please try again.");
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const panelStyle = { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px", overflowY: "auto", background: "#fff" };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
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

            <div style={{ minHeight: "100vh", display: "flex" }}>

                {/* ── LEFT PANEL ── */}
                <div className="panel-left" style={{ flex: "0 0 46%", background: "linear-gradient(160deg,#0d2e0d 0%,#1a4a1a 50%,#0d2e0d 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 48px" }}>
                    <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
                        <svg width="100%" height="100%"><defs><pattern id="g" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="1.5" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
                    </div>
                    <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,45,0.25) 0%,transparent 70%)" }}/>
                    <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)" }}/>

                    <div style={{ position: "relative", zIndex: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "white" }}>ChopSpot</span>
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 10, maxWidth: 360 }}>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "white", lineHeight: 1.2, marginBottom: 20 }}>
                            Your next<br/>
                            <span style={{ color: "#4caf50" }}>favourite meal</span><br/>
                            <span style={{ color: "#f5920a", fontStyle: "italic" }}>is one tap away.</span>
                        </h1>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                            Order from the best restaurants on campus. Track your delivery in real-time. Pay securely.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
                            {["🍛 Local dishes", "🍔 Fast food", "🥗 Healthy eats", "🛵 Fast delivery"].map(chip => (
                                <span key={chip} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "5px 14px" }}>{chip}</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 10 }}>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© 2026 ChopSpot · All rights reserved</p>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div style={panelStyle}>
                    <div className="form-panel" style={{ width: "100%", maxWidth: 460 }}>

                        {/* ── Success screen ── */}
                        {step === 2 ? (
                            <div style={{ textAlign: "center", animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
                                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "pulseGreen 1s ease infinite" }}>
                                    <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#0f172a", marginBottom: 8 }}>Account created! 🎉</h2>
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b" }}>Taking you to sign in…</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 28 }}>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", color: "#0f172a", marginBottom: 6 }}>
                                        {step === 0 ? "Create your account" : "A little about you"}
                                    </h2>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b" }}>
                                        {step === 0 ? "Set up your login credentials." : "Tell us your name and choose a username."}
                                    </p>
                                </div>

                                <Steps current={step} />

                                {/* API error banner */}
                                {apiError && (
                                    <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, marginBottom: 24, animation: "errFade 0.25s ease both" }}>
                                        <svg width="16" height="16" fill="#dc2626" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#b91c1c", margin: 0 }}>{apiError}</p>
                                    </div>
                                )}

                                {/* ── Step 0: Credentials ── */}
                                {step === 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: shake ? "shake 0.45s ease" : "none" }}>
                                        <Field label="Email Address" type="email" value={email}
                                               onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); setApiError(""); }}
                                               placeholder="you@example.com" autoComplete="email" error={fieldErrors.email}
                                               icon={<IconEmail />}
                                        />
                                        <Field label="Password" type="password" value={password}
                                               onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); }}
                                               placeholder="At least 6 characters" autoComplete="new-password" error={fieldErrors.password}
                                               icon={<IconLock />}
                                        />
                                        <Field label="Confirm Password" type="password" value={confirm}
                                               onChange={e => { setConfirm(e.target.value); setFieldErrors(p => ({ ...p, confirm: "" })); }}
                                               placeholder="Repeat your password" autoComplete="new-password" error={fieldErrors.confirm}
                                               icon={<IconLock />}
                                        />

                                        {/* Password strength hint */}
                                        {password && (
                                            <div style={{ display: "flex", gap: 4 }}>
                                                {[
                                                    { label: "Too short",   met: password.length >= 6 },
                                                    { label: "Has number",  met: /\d/.test(password) },
                                                    { label: "Has symbol",  met: /[^a-zA-Z0-9]/.test(password) },
                                                ].map(({ label, met }) => (
                                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: met ? "#2d8a2d" : "#94a3b8", fontFamily: "'DM Sans',sans-serif" }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: met ? "#2d8a2d" : "#e2e8f0" }}/>
                                                        {label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button onClick={handleNextStep} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(26,92,26,0.35)", marginTop: 4 }}>
                                            Continue <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    </div>
                                )}

                                {/* ── Step 1: Personal details ── */}
                                {step === 1 && (
                                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20, animation: shake ? "shake 0.45s ease" : "none" }}>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <Field label="First Name" value={firstName}
                                                       onChange={e => { setFirstName(e.target.value); setFieldErrors(p => ({ ...p, firstName: "" })); }}
                                                       placeholder="Ada" autoComplete="given-name" error={fieldErrors.firstName}
                                                       icon={<IconUser />}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Field label="Last Name" value={lastName}
                                                       onChange={e => { setLastName(e.target.value); setFieldErrors(p => ({ ...p, lastName: "" })); }}
                                                       placeholder="Okonkwo" autoComplete="family-name" error={fieldErrors.lastName}
                                                       icon={<IconUser />}
                                                />
                                            </div>
                                        </div>

                                        <Field label="Username" value={username}
                                               onChange={e => { setUsername(e.target.value.toLowerCase()); setFieldErrors(p => ({ ...p, username: "" })); }}
                                               placeholder="adaokonkwo" autoComplete="username" error={fieldErrors.username}
                                               icon={<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                                        />

                                        {/* Summary of what they entered in step 0 */}
                                        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#166534" }}>
                                            📧 Registering with <strong>{email}</strong>
                                        </div>

                                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                            <button type="button" onClick={() => setStep(0)} style={{ flex: "0 0 auto", padding: "15px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                                                ← Back
                                            </button>
                                            <button type="submit" disabled={loading} style={{ flex: 1, padding: "15px", borderRadius: 12, border: "none", background: loading ? "#6b9f6b" : "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : "0 4px 20px rgba(26,92,26,0.35)" }}>
                                                {loading
                                                    ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spinRing 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Creating account…</>
                                                    : <>Create Account 🎉</>
                                                }
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 28 }}>
                                    Already have an account?{" "}
                                    <Link to="/login" style={{ color: "#1a5c1a", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}