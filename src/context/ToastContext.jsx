import { createContext, useContext, useState, useCallback, useRef } from "react";

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Toast types config ────────────────────────────────────────────────────────
const TOAST_STYLES = {
    success: { bg: "#f0fdf4", border: "#86efac", icon: "✅", color: "#166534", dot: "#22c55e" },
    error:   { bg: "#fef2f2", border: "#fca5a5", icon: "❌", color: "#991b1b", dot: "#ef4444" },
    warning: { bg: "#fffbeb", border: "#fcd34d", icon: "⚠️", color: "#92400e", dot: "#f59e0b" },
    info:    { bg: "#eff6ff", border: "#93c5fd", icon: "ℹ️", color: "#1e40af", dot: "#3b82f6" },
    loading: { bg: "#f8fafc", border: "#cbd5e1", icon: "⏳", color: "#475569", dot: "#94a3b8" },
};

let idCounter = 0;

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        // Trigger exit animation first
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            clearTimeout(timers.current[id]);
        }, 320);
    }, []);

    const show = useCallback((message, type = "info", duration = 4000) => {
        const id = ++idCounter;
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);

        if (duration > 0) {
            timers.current[id] = setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    // Convenience methods
    const toast = {
        success: (msg, dur)  => show(msg, "success", dur),
        error:   (msg, dur)  => show(msg, "error",   dur ?? 6000),
        warning: (msg, dur)  => show(msg, "warning", dur),
        info:    (msg, dur)  => show(msg, "info",    dur),
        loading: (msg)       => show(msg, "loading", 0),   // persists until dismissed
        dismiss,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

// ── ToastContainer ────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes toastIn  { from { opacity:0; transform:translateY(16px) scale(0.94); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-10px) scale(0.94); } }
                @keyframes toastSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>
            <div style={{
                position: "fixed",
                top: 76,           // just below the sticky nav
                right: 20,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 380,
                width: "calc(100vw - 40px)",
                pointerEvents: "none",
            }}>
                {toasts.map(toast => {
                    const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
                    return (
                        <div
                            key={toast.id}
                            style={{
                                background: s.bg,
                                border: `1.5px solid ${s.border}`,
                                borderRadius: 16,
                                padding: "13px 16px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 11,
                                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                pointerEvents: "all",
                                animation: toast.exiting
                                    ? "toastOut 0.32s ease forwards"
                                    : "toastIn 0.32s cubic-bezier(.34,1.56,.64,1) forwards",
                                cursor: "pointer",
                            }}
                            onClick={() => onDismiss(toast.id)}
                        >
                            {/* Icon / spinner */}
                            <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                                {toast.type === "loading"
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "toastSpin 0.8s linear infinite", display:"block" }}><circle cx="12" cy="12" r="10" stroke={s.border} strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke={s.dot} strokeWidth="3" strokeLinecap="round"/></svg>
                                    : s.icon
                                }
                            </div>

                            {/* Message */}
                            <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: s.color, lineHeight: 1.5, flex: 1 }}>
                                {toast.message}
                            </p>

                            {/* Dismiss × */}
                            <button
                                onClick={e => { e.stopPropagation(); onDismiss(toast.id); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: s.color, opacity: 0.5, fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0, marginTop: -1 }}
                            >×</button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}