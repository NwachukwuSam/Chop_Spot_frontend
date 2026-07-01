import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

// ─── Script loader (module-level singleton) ───────────────────────────────────
let _scriptPromise = null;

function loadPaystack() {
    if (window.PaystackPop) return Promise.resolve();
    if (_scriptPromise)    return _scriptPromise;

    _scriptPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById("paystack-inline");
        if (existing) {
            existing.addEventListener("load",  resolve);
            existing.addEventListener("error", () => reject(new Error("Paystack load failed")));
            return;
        }
        const s   = document.createElement("script");
        s.id      = "paystack-inline";
        s.src     = "https://js.paystack.co/v1/inline.js";
        s.onload  = resolve;
        s.onerror = () => reject(new Error("Failed to load Paystack script"));
        document.head.appendChild(s);
    });

    return _scriptPromise;
}

// ─── Remove any Paystack iframe/overlay left in the DOM ──────────────────────
function forceClosePaystackIframe() {
    try {
        document.querySelectorAll("iframe").forEach((iframe) => {
            const src = iframe.src || "";
            if (src.includes("paystack")) {
                let node = iframe;
                while (node.parentElement && node.parentElement !== document.body) {
                    node = node.parentElement;
                }
                if (node && node !== document.body) node.remove();
                else iframe.remove();
            }
        });
        document.querySelectorAll("body > div").forEach((div) => {
            if (div.id === "root" || div.id === "app") return;
            const s = window.getComputedStyle(div);
            const z = parseInt(s.zIndex) || 0;
            if (s.position === "fixed" && z > 999) div.remove();
        });
    } catch (e) {
        console.warn("forceClosePaystackIframe:", e);
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PaymentModal = ({ orderInfo, orderReady, userEmail, onClose, onConfirm }) => {
    const [processing, setProcessing] = useState(false);
    const [paid,       setPaid]       = useState(false);
    const toast = useToast();

    const confirmedRef    = useRef(false);
    const safetyTimerRef  = useRef(null);

    // Preload Paystack script as early as possible
    useEffect(() => {
        loadPaystack().catch(err => console.warn("Paystack preload:", err));
    }, []);

    const clearSafetyTimer = useCallback(() => {
        if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
        }
    }, []);

    // Called immediately when Paystack's callback/onSuccess fires
// CORRECT
    const handleSuccess = useCallback((channel = "CARD") => {
        console.log("✅ Paystack SUCCESS — channel:", channel);
        clearSafetyTimer();
        confirmedRef.current = true;
        forceClosePaystackIframe();
        setProcessing(false);
        setPaid(true);

        setTimeout(() => {
            onConfirm(channel);
        }, 800);
    }, [onConfirm, clearSafetyTimer]);

    // Called when Paystack iframe closes without payment
    const handleClose = useCallback(() => {
        console.log("❌ Paystack CLOSED — confirmed:", confirmedRef.current);
        clearSafetyTimer();
        forceClosePaystackIframe();
        setProcessing(false);

        // Small delay lets the callback fire first if both fire simultaneously
        setTimeout(() => {
            if (!confirmedRef.current) {
                toast.info(
                    "Payment not detected yet. If you completed a bank transfer, it will be confirmed automatically."
                );
            }
        }, 250);
    }, [toast, clearSafetyTimer]);

    // postMessage fallback — catches success from popup mode or cross-origin iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (!event.data) return;
            let data = event.data;
            if (typeof data === "string") {
                try { data = JSON.parse(data); } catch { return; }
            }
            // CORRECT
            if ((data.type === "payment.success" || data.event === "successful") && !confirmedRef.current) {
                handleSuccess(data.channel || "CARD");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
            forceClosePaystackIframe();
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [handleSuccess]);

    const handlePay = useCallback(() => {
        if (!orderReady || processing) return;

        if (!PAYSTACK_PUBLIC_KEY) {
            toast.error("Payment is not configured. Please contact support.");
            return;
        }

        confirmedRef.current = false;
        setProcessing(true);

        // Safety net: clear spinner if Paystack goes completely silent
        safetyTimerRef.current = setTimeout(() => {
            console.warn("Paystack safety timeout — clearing processing state");
            forceClosePaystackIframe();
            setProcessing(false);
            toast.info("Payment window timed out. Please try again.");
        }, 3 * 60 * 1000);

        loadPaystack().then(() => {
            if (!window.PaystackPop?.setup) {
                clearSafetyTimer();
                setProcessing(false);
                toast.error("Payment script not ready — please try again in a moment.");
                return;
            }

            const config = {
                key:      PAYSTACK_PUBLIC_KEY,
                email:    userEmail || `cs_${Date.now()}@chopspot.ng`,
                amount:   Math.round((orderInfo?.orderTotal || 0) * 100),
                currency: "NGN",
                ref: orderInfo?.paystackRef,
                metadata: {
                    custom_fields: [
                        { display_name: "Customer Name", variable_name: "customer_name", value: orderInfo?.fullName || "" },
                        { display_name: "Delivery",      variable_name: "delivery",      value: orderInfo?.hostel || "" },
                        { display_name: "Hostel / Room", variable_name: "hostel_room",   value: [orderInfo?.hostel, orderInfo?.room].filter(Boolean).join(", ") || "" },
                    ],
                },
                // `callback` is the v1 inline API's success hook — more reliable than onSuccess// CORRECT
                callback: (transaction) => handleSuccess(transaction.channel || "CARD"),
                onClose:  handleClose,
            };

            try {
                const handler = window.PaystackPop.setup(config);
                handler.openIframe();
            } catch (err) {
                console.error("Paystack open failed:", err);
                clearSafetyTimer();
                setProcessing(false);
                toast.error("Could not open payment. Please try again.");
            }
        }).catch(err => {
            console.error("Paystack script load failed:", err);
            clearSafetyTimer();
            setProcessing(false);
            toast.error("Payment script failed to load. Please check your connection.");
        });
    }, [orderReady, processing, orderInfo, userEmail, handleSuccess, handleClose, clearSafetyTimer, toast]);

    // ── Success screen ─────────────────────────────────────────────────────────
    if (paid) {
        return (
            <div style={{ position: "fixed", inset: 0, zIndex: 1400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 420, padding: "52px 40px", textAlign: "center", animation: "mIn 0.35s cubic-bezier(.34,1.56,.64,1)" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", marginBottom: 10 }}>
                        Payment Confirmed!
                    </h2>
                    <p style={{ color: "#6a8a6a", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                        Your order is placed and the restaurant has been notified.<br />
                        We'll WhatsApp you when it's ready!
                    </p>
                    <div style={{ background: "#e8f5e0", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                        <span style={{ fontSize: 18 }}>📧</span>
                        <span style={{ fontSize: 13, color: "#2d6a2d", fontWeight: 600 }}>Confirmation email sent!</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", border: "none", borderRadius: 50, padding: "13px 32px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,138,45,0.35)" }}
                    >
                        Done ✓
                    </button>
                </div>
            </div>
        );
    }

    // ── Payment modal ──────────────────────────────────────────────────────────
    const btnDisabled = processing || !orderReady;
    const btnLabel    = processing
        ? "Opening payment…"
        : !orderReady
            ? "Preparing order…"
            : `🔒 Pay ₦${(orderInfo?.orderTotal || 0).toLocaleString()} Securely`;
    const btnBg = processing
        ? "#6b9f6b"
        : !orderReady
            ? "linear-gradient(135deg,#f97316,#fb923c)"
            : "linear-gradient(135deg,#1a5c1a,#2d8a2d)";

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={processing ? undefined : onClose}
        >
            <div
                style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)", padding: "28px 28px 32px" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, margin: "0 0 4px", color: "#1a2e1a" }}>Complete Payment</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>Secured by Paystack</p>
                    </div>
                    <button
                        onClick={processing ? undefined : onClose}
                        style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: processing ? "default" : "pointer", fontSize: 18, color: "#555", display: "flex", alignItems: "center", justifyContent: "center", opacity: processing ? 0.35 : 1 }}
                    >×</button>
                </div>

                {/* Order summary */}
                <div style={{ background: "#f4f8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#5a7a5a" }}>Order Total</span>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#f97316" }}>₦{(orderInfo?.orderTotal || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "#8aaa8a" }}>Delivering to</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{orderInfo?.hostel || "—"}</span>
                    </div>
                </div>

                {/* Payment methods */}
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
                    {[["💳","Card"], ["🏦","Bank"], ["📱","USSD"], ["🔄","Transfer"]].map(([icon, label]) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <span style={{ fontSize: 22 }}>{icon}</span>
                            <span style={{ fontSize: 10, color: "#8aaa8a", fontWeight: 600 }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Security badge */}
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span>🔒</span>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>256-bit SSL · PCI-DSS Compliant</span>
                </div>

                {/* Bank transfer note */}
                {processing && (
                    <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#7a5c00", lineHeight: 1.5, textAlign: "center" }}>
                        💡 If you selected <strong>bank transfer</strong>, Paystack is waiting for your transfer to arrive.
                        Once detected, this modal will close automatically. You can also close it now — your payment will still be confirmed via our webhook.
                    </div>
                )}

                {/* Pay button */}
                <button
                    onClick={handlePay}
                    disabled={btnDisabled}
                    style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: btnBg, color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: btnDisabled ? "not-allowed" : "pointer", boxShadow: btnDisabled ? "none" : "0 4px 20px rgba(26,92,26,0.38)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                    onMouseEnter={e => { if (!btnDisabled) e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    {btnDisabled ? (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                            {btnLabel}
                        </>
                    ) : btnLabel}
                </button>

                {/* Escape hatch for bank transfer users */}
                {processing && (
                    <button
                        onClick={onClose}
                        style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", fontSize: 12, color: "#8aaa8a", cursor: "pointer", textDecoration: "underline" }}
                    >
                        I've transferred — close this window
                    </button>
                )}
            </div>
        </div>
    );
};