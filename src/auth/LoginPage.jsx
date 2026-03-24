import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://delichops-backend-akuq.onrender.com/api/auth/login";

// ─── Animated food orbs for the left panel ────────────────────────────────────
const FOOD_EMOJIS = ["🍛", "🍗", "🥗", "🥘", "🍜", "🫔", "🍔", "🌽"];

function FoodOrb({ emoji, style }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        backdropFilter: "blur(4px)",
        ...style,
      }}
    >
      {emoji}
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, icon, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const inputType = type === "password" ? (showPass ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: error ? "#dc2626" : "#64748b",
        transition: "color 0.2s",
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* Icon */}
        <div style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: focused ? "#2d8a2d" : error ? "#dc2626" : "#9ca3af",
          transition: "color 0.2s",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}>
          {icon}
        </div>

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "14px 44px 14px 42px",
            borderRadius: 12,
            border: `1.5px solid ${error ? "#fca5a5" : focused ? "#2d8a2d" : "#e2e8f0"}`,
            background: focused ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(45,138,45,0.12)" : error ? "0 0 0 3px rgba(220,38,38,0.08)" : "none",
          }}
        />

        {/* Password toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPass ? (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#dc2626",
          display: "flex",
          alignItems: "center",
          gap: 4,
          animation: "errFade 0.2s ease",
        }}>
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [shake, setShake]       = useState(false);
  const [success, setSuccess]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [debugResponse, setDebugResponse] = useState(null); // shows raw API response
  const formRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 4) errs.password = "Password must be at least 4 characters";
    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
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
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      // ── Debug: always capture raw response so we can inspect token field names ──
      setDebugResponse({ status: res.status, ok: res.ok, body: data });

      if (!res.ok) {
        // Normalise common API error shapes
        const msg =
          data?.message ||
          data?.error ||
          data?.msg ||
          (typeof data === "string" ? data : null) ||
          "Invalid email or password. Please try again.";
        setApiError(msg);
        triggerShake();
        return;
      }

      // ── Success ─────────────────────────────────────────────────────────────
      // Extract token — try every common field name Spring Boot / JWT APIs use
      const token =
        data?.token         ||   // most common shape: { token: "..." }
        data?.accessToken   ||   // camelCase: { accessToken: "..." }
        data?.access_token  ||   // snake_case: { access_token: "..." }
        data?.jwt           ||   // some use "jwt"
        data?.data?.token   ||   // nested: { data: { token: "..." } }
        data?.data?.accessToken ||
        null;

      const user =
        data?.user        ||
        data?.admin       ||
        data?.data?.user  ||
        data?.data?.admin ||
        (data?.data && typeof data.data === 'object' ? data.data : null) ||
        null;

      if (token) {
        // Store under both keys so api.js getToken() always finds it
        localStorage.setItem("chopspot_token", token);
        localStorage.setItem("adminToken", token);
      } else {
        // Token not found — log raw response so it's visible in DevTools
        console.warn("[ChopSpot] Token not found in login response:", JSON.stringify(data));
        localStorage.setItem("debug_login_response", JSON.stringify(data));
        setApiError("Login succeeded but no session token was returned. Please contact support.");
        triggerShake();
        return;
      }

      if (user) localStorage.setItem("chopspot_user", JSON.stringify(user));

      setSuccess(true);

      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1200);

    } catch (err) {
      setApiError("Network error — please check your connection and try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-16px) rotate(8deg); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(-6deg); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes errFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45,138,45,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(45,138,45,0); }
        }

        .panel-left  { animation: fadeIn 0.6s ease both; }
        .form-panel  { animation: fadeUp 0.7s ease 0.15s both; }
        .f-1  { animation: fadeUp 0.5s ease 0.2s  both; }
        .f-2  { animation: fadeUp 0.5s ease 0.3s  both; }
        .f-3  { animation: fadeUp 0.5s ease 0.4s  both; }
        .f-4  { animation: fadeUp 0.5s ease 0.5s  both; }
        .f-5  { animation: fadeUp 0.5s ease 0.6s  both; }
        .f-6  { animation: fadeUp 0.5s ease 0.7s  both; }

        input::placeholder { color: #94a3b8; }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: "#f8fafc",
      }}>

        {/* ── LEFT PANEL — Brand ────────────────────────────────────────── */}
        <div className="panel-left" style={{
          width: "44%",
          minWidth: 340,
          background: "linear-gradient(145deg, #1a2e1a 0%, #2d5a2d 55%, #1a4a1a 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 52px",
        }}>

          {/* Background texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.035,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none",
          }} />

          {/* Glow blob */}
          <div style={{
            position: "absolute", top: -80, right: -80,
            width: 320, height: 320, borderRadius: "50%",
            background: "rgba(74,207,80,0.12)",
            filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: -60,
            width: 260, height: 260, borderRadius: "50%",
            background: "rgba(249,115,22,0.08)",
            filter: "blur(50px)", pointerEvents: "none",
          }} />

          {/* Floating food orbs */}
          <FoodOrb emoji="🍛" style={{ top: "18%", right: "8%",  animation: "orbFloat1 5s ease-in-out infinite" }} />
          <FoodOrb emoji="🍗" style={{ top: "42%", right: "20%", animation: "orbFloat2 4.5s ease-in-out 0.8s infinite" }} />
          <FoodOrb emoji="🥘" style={{ top: "65%", right: "6%",  animation: "orbFloat3 5.5s ease-in-out 1.2s infinite" }} />
          <FoodOrb emoji="🫔" style={{ bottom: "20%", left: "12%", animation: "orbFloat2 4s ease-in-out 0.4s infinite" }} />
          <FoodOrb emoji="🥗" style={{ top: "28%", left: "8%",  animation: "orbFloat1 6s ease-in-out 1.5s infinite", width: 40, height: 40, fontSize: 18 }} />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg,#f97316,#fb923c)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>🍊</div>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontWeight: 800,
                fontSize: 26, color: "white", letterSpacing: -0.5,
              }}>
                Chop<span style={{ color: "#f97316" }}>Spot</span>
              </span>
            </div>
          </div>

          {/* Centre copy */}
          <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 60 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)", marginBottom: 16,
            }}>
              Admin Portal
            </p>
            <h1 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              color: "white", lineHeight: 1.1, marginBottom: 20,
            }}>
              The platform that feeds<br />
              <span style={{ color: "#4caf50" }}>campus</span>{" "}
              <span style={{ color: "#f97316", fontStyle: "italic" }}>hunger.</span>
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15,
              color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 320,
            }}>
              Manage vendors, track orders, handle payouts, and keep the food flowing — all from one command centre.
            </p>

            {/* Feature chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
              {["🏪 Vendors", "🏍️ Riders", "📦 Orders", "📊 Analytics"].map(chip => (
                <span key={chip} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 50, padding: "5px 14px",
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em",
            }}>
              © 2026 ChopSpot · All rights reserved
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — Form ────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          overflowY: "auto",
        }}>
          <div className="form-panel" style={{ width: "100%", maxWidth: 440 }}>

            {/* ── Success state ──────────────────────────────────────────── */}
            {success ? (
              <div style={{
                textAlign: "center",
                animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) both",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  animation: "pulseGreen 1s ease infinite",
                }}>
                  <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{
                  fontFamily: "'Sora', sans-serif", fontWeight: 800,
                  fontSize: 24, color: "#0f172a", marginBottom: 8,
                }}>Welcome back!</h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: "#64748b",
                }}>Login successful. Redirecting you now…</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="f-1" style={{ marginBottom: 36 }}>
                  <h2 style={{
                    fontFamily: "'Sora', sans-serif", fontWeight: 800,
                    fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                    color: "#0f172a", lineHeight: 1.15, marginBottom: 8,
                  }}>
                    Sign in to your account
                  </h2>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    color: "#64748b", lineHeight: 1.6,
                  }}>
                    Enter your credentials to access the ChopSpot dashboard.
                  </p>
                </div>

                {/* API Error banner */}
                {apiError && (
                  <div style={{
                    background: "#fef2f2", border: "1.5px solid #fca5a5",
                    borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "flex-start", gap: 10,
                    marginBottom: 24,
                    animation: "errFade 0.25s ease both",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "#fee2e2", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="16" height="16" fill="#dc2626" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                        fontSize: 13, color: "#991b1b", marginBottom: 2,
                      }}>Login failed</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#b91c1c" }}>
                        {apiError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  style={{
                    display: "flex", flexDirection: "column", gap: 20,
                    animation: shake ? "shake 0.45s ease" : "none",
                  }}
                >
                  {/* Email */}
                  <div className="f-2">
                    <Field
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); setApiError(""); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      error={fieldErrors.email}
                      icon={
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>

                  {/* Password */}
                  <div className="f-3">
                    <Field
                      label="Password"
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); setApiError(""); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      error={fieldErrors.password}
                      icon={
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      }
                    />
                  </div>

                  {/* Forgot password */}
                  <div className="f-4" style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                    <a href="#" style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                      color: "#2d8a2d", textDecoration: "none",
                      borderBottom: "1px solid transparent",
                      transition: "border-color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.borderColor = "#2d8a2d"}
                      onMouseLeave={e => e.target.style.borderColor = "transparent"}
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <div className="f-5">
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "15px",
                        borderRadius: 12,
                        border: "none",
                        background: loading
                          ? "#6b9f6b"
                          : "linear-gradient(135deg,#2d8a2d,#4caf50)",
                        color: "white",
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: "0.05em",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        boxShadow: loading ? "none" : "0 4px 20px rgba(45,138,45,0.35)",
                        transition: "all 0.2s",
                        transform: "scale(1)",
                      }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.015)"; }}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.99)"; }}
                      onMouseUp={e => { if (!loading) e.currentTarget.style.transform = "scale(1.015)"; }}
                    >
                      {loading ? (
                        <>
                          {/* Spinner */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            style={{ animation: "spinRing 0.8s linear infinite" }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign In
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider + help text */}
                <div className="f-6" style={{ marginTop: 28 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    marginBottom: 20,
                  }}>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                      color: "#94a3b8", whiteSpace: "nowrap",
                    }}>Need access?</span>
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  </div>

                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: "#64748b", textAlign: "center", lineHeight: 1.6,
                  }}>
                    Contact your ChopSpot administrator to request an account or reset your credentials at{" "}
                    <a href="mailto:admin@chopspot.ng" style={{
                      color: "#2d8a2d", fontWeight: 600, textDecoration: "none",
                    }}>
                      admin@chopspot.ng
                    </a>
                  </p>
                </div>

                {/* Debug panel — shows raw API response to help identify token field */}
                {debugResponse && !success && (
                  <div style={{
                    marginTop: 20, background: "#0f172a", borderRadius: 12,
                    padding: "14px 16px", border: "1px solid #1e293b",
                  }}>
                    <p style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800,
                      color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase",
                      margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ color: "#f97316" }}>◉</span> Login Response (HTTP {debugResponse.status})
                    </p>
                    <pre style={{
                      fontFamily: "monospace", fontSize: 11, color: "#94a3b8",
                      margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all",
                      maxHeight: 200, overflowY: "auto",
                    }}>
                      {JSON.stringify(debugResponse.body, null, 2)}
                    </pre>
                    <p style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#475569",
                      margin: "8px 0 0",
                    }}>
                      ↑ Share this with your developer to fix the token field name.
                    </p>
                  </div>
                )}

                {/* Trust badges */}
                <div style={{
                  marginTop: 28, display: "flex",
                  justifyContent: "center", gap: 20, flexWrap: "wrap",
                }}>
                  {[
                    { icon: "🔒", label: "SSL Encrypted" },
                    { icon: "🛡️", label: "Secure Login" },
                    { icon: "✅", label: "Verified Platform" },
                  ].map(({ icon, label }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                      color: "#94a3b8", fontWeight: 600,
                    }}>
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Responsive: hide left panel on small screens ───────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .panel-left { display: none !important; }
        }
      `}</style>
    </>
  );
}