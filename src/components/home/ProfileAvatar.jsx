import { useState, useEffect, useRef } from "react";
import { userProfileApi } from "../../utils/Api";
import { useToast } from "../../context/ToastContext";

export const ProfileAvatar = ({ profile, isLoggedIn, onDashboard, onClear, onLogout, onLogin }) => {
    const [open, setOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [cpForm, setCpForm] = useState({ current: "", next: "", confirm: "" });
    const [cpError, setCpError] = useState(null);
    const [cpLoading, setCpLoading] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const toast = useToast();
    const ref = useRef(null);

    // Build display name from profile — works whether it's a saved delivery
    // profile (fullName) or a real UserProfile (firstName + lastName)
    const displayName = profile?.fullName
        || (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : null)
        || profile?.firstName
        || null;

    const initials = displayName
        ? displayName.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : null;

    const hasProfile = Boolean(displayName);

    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleChangePassword = async () => {
        if (!cpForm.current.trim() || !cpForm.next.trim() || !cpForm.confirm.trim()) {
            setCpError("All fields are required.");
            return;
        }
        if (cpForm.next !== cpForm.confirm) {
            setCpError("New passwords do not match.");
            return;
        }
        if (cpForm.next.length < 6) {
            setCpError("New password must be at least 6 characters.");
            return;
        }
        setCpLoading(true);
        setCpError(null);
        try {
            await userProfileApi.changePassword({
                currentPassword: cpForm.current,
                newPassword:     cpForm.next,
                confirmPassword: cpForm.confirm,
            });
            toast.success("Password changed successfully.");
            setShowPasswordModal(false);
            setCpForm({ current: "", next: "", confirm: "" });
        } catch (err) {
            setCpError(err.message || "Failed to change password. Please try again.");
        } finally {
            setCpLoading(false);
        }
    };

    const closePasswordModal = () => {
        if (cpLoading) return;
        setShowPasswordModal(false);
        setCpForm({ current: "", next: "", confirm: "" });
        setCpError(null);
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
                    background: hasProfile ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "rgba(45,138,45,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: hasProfile ? "2px solid #2d8a2d" : "2px solid transparent",
                    boxShadow: hasProfile ? "0 2px 12px rgba(45,138,45,0.3)" : "none",
                    transition: "all 0.2s", fontSize: hasProfile ? 14 : 20, fontWeight: 800,
                    color: "white", fontFamily: "'Sora',sans-serif",
                }}
                title={displayName || "Profile"}
            >
                {hasProfile ? initials : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2d8a2d" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                )}
            </div>

            {open && (
                <div style={{
                    position: "absolute", top: 50, right: 0, width: 250,
                    background: "white", borderRadius: 18, zIndex: 999,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.15)", overflow: "hidden",
                    animation: "mIn 0.2s cubic-bezier(.34,1.56,.64,1)",
                    border: "1px solid rgba(45,138,45,0.1)"
                }}>
                    {isLoggedIn ? (
                        <>
                            {/* Header */}
                            <div style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", padding: "16px 18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                                        {initials || "👤"}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "white", fontFamily: "'Sora',sans-serif" }}>
                                            {displayName || "ChopSpot User"}
                                        </p>
                                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                                            {profile?.email || ""}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery details */}
                            <div style={{ padding: "12px 18px" }}>
                                {[
                                    ["📱", profile?.whatsapp   || profile?.phoneNumber || "—"],
                                    ["🏠", [profile?.hostel, profile?.room].filter(Boolean).join(", ") || "—"],
                                ].map(([icon, val]) => (
                                    <div key={icon} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12, color: "#5a7a5a" }}>
                                        <span>{icon}</span><span style={{ fontWeight: 500 }}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                                <button onClick={() => { setOpen(false); onDashboard(); }} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                                    📊 My Dashboard
                                </button>
                                <button onClick={() => { setOpen(false); setShowPasswordModal(true); setCpError(null); }} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1.5px solid #d8eed8", background: "white", color: "#2d8a2d", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                    🔒 Change Password
                                </button>
                                <button onClick={() => { onLogout(); setOpen(false); }} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1.5px solid #fee2e2", background: "white", color: "#dc2626", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: "20px 18px", textAlign: "center" }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
                            <p style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a", margin: "0 0 4px", fontFamily: "'Sora',sans-serif" }}>Not signed in</p>
                            <p style={{ fontSize: 12, color: "#8aaa8a", margin: "0 0 12px" }}>Sign in to track orders and save delivery details.</p>
                            <button onClick={() => { setOpen(false); onLogin(); }} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                                Sign In
                            </button>
                        </div>
                    )}
                </div>
            )}
            {showPasswordModal && (
                <div
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    }}
                    onClick={closePasswordModal}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "white", borderRadius: 22, padding: "28px 28px 24px",
                            width: "100%", maxWidth: 400,
                            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
                            animation: "mIn 0.22s cubic-bezier(.34,1.56,.64,1)",
                        }}
                    >
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a", margin: "0 0 6px" }}>
                            🔒 Change Password
                        </h3>
                        <p style={{ fontSize: 13, color: "#7a9a7a", margin: "0 0 22px", fontFamily: "'DM Sans',sans-serif" }}>
                            Enter your current password and choose a new one.
                        </p>

                        {cpError && (
                            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626", fontFamily: "'DM Sans',sans-serif" }}>
                                {cpError}
                            </div>
                        )}

                        {[
                            { key: "current", label: "Current Password",    placeholder: "Your current password" },
                            { key: "next",    label: "New Password",         placeholder: "At least 6 characters"  },
                            { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password"    },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#5a7a5a", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                                    {label}
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPw[key] ? "text" : "password"}
                                        value={cpForm[key]}
                                        onChange={e => setCpForm(p => ({ ...p, [key]: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                                        placeholder={placeholder}
                                        disabled={cpLoading}
                                        style={{
                                            width: "100%", padding: "11px 42px 11px 14px",
                                            borderRadius: 12, border: "1.5px solid #d8eed8",
                                            background: "#f4f8f4", fontSize: 14, color: "#1a2e1a",
                                            fontFamily: "'DM Sans',sans-serif", outline: "none",
                                            boxSizing: "border-box", transition: "border-color 0.2s",
                                            opacity: cpLoading ? 0.7 : 1,
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "#2d8a2d"; e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)"; e.target.style.background = "#fff"; }}
                                        onBlur={e =>  { e.target.style.borderColor = "#d8eed8"; e.target.style.boxShadow = "none"; e.target.style.background = "#f4f8f4"; }}
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#7a9a7a", padding: 0, lineHeight: 1 }}
                                    >
                                        {showPw[key] ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                            <button
                                onClick={closePasswordModal}
                                disabled={cpLoading}
                                style={{ flex: 1, padding: "11px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 700, fontSize: 13, cursor: cpLoading ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif", opacity: cpLoading ? 0.6 : 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={cpLoading}
                                style={{ flex: 2, padding: "11px", borderRadius: 50, border: "none", background: cpLoading ? "#e8e8e8" : "linear-gradient(135deg,#2d8a2d,#4caf50)", color: cpLoading ? "#aaa" : "white", fontWeight: 800, fontSize: 13, cursor: cpLoading ? "wait" : "pointer", fontFamily: "'Sora',sans-serif", transition: "all 0.2s", boxShadow: cpLoading ? "none" : "0 4px 16px rgba(45,138,45,0.3)" }}
                            >
                                {cpLoading ? "Saving…" : "Save Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};