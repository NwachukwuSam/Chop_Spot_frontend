import { useState, useEffect, useRef } from "react";

export const ProfileAvatar = ({ profile, isLoggedIn, onDashboard, onClear, onLogout, onLogin }) => {
    const [open, setOpen] = useState(false);
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
        </div>
    );
};