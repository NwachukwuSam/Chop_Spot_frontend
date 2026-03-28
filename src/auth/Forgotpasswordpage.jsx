import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as API from "../utils/Api";
import { useToast } from "../context/ToastContext";

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
    { title: "Forgot password?",   sub: "Enter your email and we'll send a reset code."     },
    { title: "Check your email",   sub: "Enter the 6-digit code we just sent you."          },
    { title: "Set new password",   sub: "Choose a strong password for your account."        },
];

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, error, autoComplete, maxLength }) {
    const [focused,  setFocused]  = useState(false);
    const [showPass, setShowPass] = useState(false);
    const inputType = type === "password" ? (showPass ? "text" : "password") : type;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: error ? "#dc2626" : "#64748b" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <input
                    type={inputType} value={value} onChange={onChange}
                    placeholder={placeholder} autoComplete={autoComplete}
                    maxLength={maxLength}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: type === "password" ? "14px 44px 14px 16px" : "14px 16px",
                        borderRadius: 12,
                        border: `1.5px solid ${error ? "#fca5a5" : focused ? "#1a5c1a" : "#e2e8f0"}`,
                        background: focused ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
                        fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#0f172a",
                        outline: "none", boxSizing: "border-box", transition: "all 0.2s",
                        boxShadow: focused ? "0 0 0 3px rgba(26,92,26,0.12)" : "none",
                    }}
                />
                {type === "password" && (
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                        {showPass
                            ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                            : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        }
                    </button>
                )}
            </div>
            {error && (
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── OTP digit input ───────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
    const refs = useRef([]);
    const digits = value.split("");

    const handleKey = (e, idx) => {
        if (e.key === "Backspace" && !digits[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
    };

    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[idx] = val;
        onChange(next.join("").slice(0, 6));
        if (val && idx < 5) refs.current[idx + 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);
        refs.current[Math.min(pasted.length, 5)]?.focus();
        e.preventDefault();
    };

    return (
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {Array.from({ length: 6 }).map((_, idx) => (
                <input
                    key={idx}
                    ref={el => refs.current[idx] = el}
                    type="text" inputMode="numeric"
                    maxLength={1}
                    value={digits[idx] || ""}
                    onChange={e => handleChange(e, idx)}
                    onKeyDown={e => handleKey(e, idx)}
                    onPaste={handlePaste}
                    style={{
                        width: 48, height: 56, textAlign: "center",
                        fontSize: 22, fontWeight: 800, fontFamily: "'Sora',sans-serif",
                        border: `2px solid ${digits[idx] ? "#1a5c1a" : "#e2e8f0"}`,
                        borderRadius: 14,
                        background: digits[idx] ? "#f0fdf4" : "#f8fafc",
                        color: "#0f172a", outline: "none",
                        transition: "all 0.18s",
                        boxShadow: digits[idx] ? "0 0 0 3px rgba(26,92,26,0.1)" : "none",
                    }}
                />
            ))}
        </div>
    );
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function Countdown({ seconds, onExpire }) {
    const [left, setLeft] = useState(seconds);
    useEffect(() => {
        if (left <= 0) { onExpire?.(); return; }
        const t = setTimeout(() => setLeft(l => l - 1), 1000);
        return () => clearTimeout(t);
    }, [left]);
    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");
    return <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: left < 30 ? "#dc2626" : "#2d8a2d" }}>{mm}:{ss}</span>;
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const toast    = useToast();

    const [step,    setStep]    = useState(0);
    const [loading, setLoading] = useState(false);
    const [shake,   setShake]   = useState(false);

    // Step 0
    const [email,   setEmail]   = useState("");
    const [emailErr,setEmailErr]= useState("");

    // Step 1
    const [otp,      setOtp]      = useState("");
    const [otpToken, setOtpToken] = useState("");   // token returned by verify-otp
    const [expired,  setExpired]  = useState(false);
    const [resendKey, setResendKey] = useState(0);  // increment to reset countdown

    // Step 2
    const [password, setPassword] = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [passErr,  setPassErr]  = useState({});

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

    // ── Step 0: Send OTP ──────────────────────────────────────────────────────
    const handleSendOtp = async () => {
        if (!email.trim()) { setEmailErr("Email is required"); triggerShake(); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Enter a valid email"); triggerShake(); return; }
        setEmailErr("");
        setLoading(true);
        try {
            await API.forgotPassword({ email: email.trim() });
            toast.success("Reset code sent! Check your email 📧");
            setExpired(false);
            setResendKey(k => k + 1);
            setStep(1);
        } catch (err) {
            toast.error(err.message || "Could not send reset code. Try again.");
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1: Verify OTP ────────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (otp.length < 6) { toast.warning("Enter all 6 digits of your code"); triggerShake(); return; }
        setLoading(true);
        try {
            const result = await API.verifyOtp({ email: email.trim(), otp });
            // Backend returns a short-lived token to authorise the password reset
            setOtpToken(result.resetToken || result.token || "verified");
            toast.success("Code verified! Set your new password.");
            setStep(2);
        } catch (err) {
            toast.error(err.message || "Invalid or expired code.");
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await API.forgotPassword({ email: email.trim() });
            toast.info("New code sent 📧");
            setOtp("");
            setExpired(false);
            setResendKey(k => k + 1);
        } catch (err) {
            toast.error(err.message || "Could not resend code.");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Reset Password ─────────────────────────────────────────────────
    const handleResetPassword = async () => {
        const errs = {};
        if (!password)            errs.password = "Password is required";
        else if (password.length < 6) errs.password = "At least 6 characters";
        if (confirm !== password) errs.confirm  = "Passwords do not match";
        if (Object.keys(errs).length) { setPassErr(errs); triggerShake(); return; }
        setPassErr({});
        setLoading(true);
        try {
            await API.resetPassword({ email: email.trim(), otp, newPassword: password, resetToken: otpToken });
            toast.success("Password reset! You can now sign in 🎉", 5000);
            setTimeout(() => navigate("/login", { state: { registeredEmail: email.trim() } }), 1800);
        } catch (err) {
            toast.error(err.message || "Reset failed. Please try again.");
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // ── Shared button style ────────────────────────────────────────────────────
    const btnStyle = (disabled) => ({
        width: "100%", padding: "15px", borderRadius: 12, border: "none",
        background: disabled ? "#6b9f6b" : "linear-gradient(135deg,#1a5c1a,#2d7a2d)",
        color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: disabled ? "none" : "0 4px 20px rgba(26,92,26,0.35)",
        transition: "all 0.2s",
    });

    const spinner = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spinRing 0.8s linear infinite" }}>
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shake    { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
                @keyframes spinRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes successPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
                @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(26,92,26,0.4)} 50%{box-shadow:0 0 0 12px rgba(26,92,26,0)} }
                input::placeholder { color:#94a3b8; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#e8f5e0 0%,#d4edda 45%,#c3e6cb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.5s ease" }}>

                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(45,138,45,0.3)" }}>🍽️</div>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1a2e1a" }}>
                            Chop<span style={{ color: "#f97316" }}>Spot</span>
                        </span>
                    </div>

                    {/* Card */}
                    <div style={{ background: "white", borderRadius: 26, padding: "36px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.10)", border: "1px solid rgba(45,138,45,0.08)" }}>

                        {/* Step indicator */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
                            {STEPS.map((_, i) => (
                                <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#2d8a2d" : i < step ? "#86efac" : "#e2e8f0", transition: "all 0.3s" }}/>
                            ))}
                        </div>

                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,1.8rem)", color: "#0f172a", marginBottom: 6 }}>
                            {STEPS[step].title}
                        </h2>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
                            {STEPS[step].sub}
                        </p>

                        {/* ── Step 0: Email ── */}
                        {step === 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: shake ? "shake 0.45s ease" : "none" }}>
                                <Field
                                    label="Email Address" type="email" value={email}
                                    onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
                                    placeholder="you@example.com" autoComplete="email" error={emailErr}
                                />
                                <button onClick={handleSendOtp} disabled={loading} style={btnStyle(loading)}>
                                    {loading ? <>{spinner} Sending code…</> : <>Send Reset Code →</>}
                                </button>
                            </div>
                        )}

                        {/* ── Step 1: OTP ── */}
                        {step === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: shake ? "shake 0.45s ease" : "none" }}>
                                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#166534", textAlign: "center" }}>
                                    Code sent to <strong>{email}</strong>
                                </div>

                                <OtpInput value={otp} onChange={setOtp} />

                                {/* Countdown + resend */}
                                <div style={{ textAlign: "center" }}>
                                    {expired ? (
                                        <p style={{ fontSize: 13, color: "#64748b" }}>
                                            Code expired.{" "}
                                            <button onClick={handleResend} style={{ background: "none", border: "none", color: "#1a5c1a", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                                                Resend code
                                            </button>
                                        </p>
                                    ) : (
                                        <p style={{ fontSize: 13, color: "#64748b" }}>
                                            Code expires in{" "}
                                            <Countdown key={resendKey} seconds={300} onExpire={() => setExpired(true)} />
                                            {" · "}
                                            <button onClick={handleResend} disabled={loading} style={{ background: "none", border: "none", color: "#1a5c1a", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                                                Resend
                                            </button>
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setStep(0)} style={{ flex: "0 0 auto", padding: "15px 18px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
                                    <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6 || expired} style={{ ...btnStyle(loading || otp.length < 6 || expired), flex: 1 }}>
                                        {loading ? <>{spinner} Verifying…</> : <>Verify Code</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: New Password ── */}
                        {step === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: shake ? "shake 0.45s ease" : "none" }}>
                                <Field
                                    label="New Password" type="password" value={password}
                                    onChange={e => { setPassword(e.target.value); setPassErr(p => ({ ...p, password: "" })); }}
                                    placeholder="At least 6 characters" autoComplete="new-password" error={passErr.password}
                                />

                                {/* Password strength */}
                                {password && (
                                    <div style={{ display: "flex", gap: 12 }}>
                                        {[
                                            { label: "6+ chars",  met: password.length >= 6 },
                                            { label: "Number",    met: /\d/.test(password) },
                                            { label: "Symbol",    met: /[^a-zA-Z0-9]/.test(password) },
                                        ].map(({ label, met }) => (
                                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: met ? "#2d8a2d" : "#94a3b8" }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: met ? "#2d8a2d" : "#e2e8f0" }}/>
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Field
                                    label="Confirm Password" type="password" value={confirm}
                                    onChange={e => { setConfirm(e.target.value); setPassErr(p => ({ ...p, confirm: "" })); }}
                                    placeholder="Repeat your password" autoComplete="new-password" error={passErr.confirm}
                                />

                                <button onClick={handleResetPassword} disabled={loading} style={btnStyle(loading)}>
                                    {loading ? <>{spinner} Resetting…</> : <>Reset Password 🔐</>}
                                </button>
                            </div>
                        )}

                        {/* Back to login */}
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 24 }}>
                            Remember it now?{" "}
                            <Link to="/login" style={{ color: "#1a5c1a", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}