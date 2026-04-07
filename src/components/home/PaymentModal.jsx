import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

// ─── Script loader (module-level singleton — fine here, no state involved) ───
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

// ─── Force-remove everything Paystack injected into the DOM ──────────────────
function forceClosePaystackIframe() {
    try {
        // Find by any Paystack iframe signature
        document.querySelectorAll("iframe").forEach(iframe => {
            const src   = iframe.src   || "";
            const name  = iframe.name  || "";
            const id    = iframe.id    || "";
            if (
                src.includes("paystack") ||
                name.includes("paystack") || name === "checkout-frame" ||
                id.includes("paystack")
            ) {
                let node = iframe;
                while (node.parentElement && node.parentElement !== document.body) {
                    node = node.parentElement;
                }
                if (node && node !== document.body) node.remove();
                else iframe.remove();
            }
        });

        // Remove any full-screen fixed overlay Paystack left behind
        document.querySelectorAll("body > div").forEach(div => {
            if (div.id === "root" || div.id === "app") return;
            const s = window.getComputedStyle(div);
            const z = parseInt(s.zIndex) || 0;
            if (
                s.position === "fixed" && z > 999 &&
                (s.width === "100%" || s.height === "100%" ||
                    parseInt(s.width) > window.innerWidth * 0.85)
            ) div.remove();
        });
    } catch (e) {
        console.warn("forceClosePaystackIframe:", e);
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * KEY FIXES IN THIS VERSION:
 *
 * 1. NO module-level _state / notify() pattern.
 *    Previous version used a mutable module-level object + forceUpdate trick.
 *    If the component re-rendered between openIframe() and the Paystack callback,
 *    _notify could be stale/null → state updates silently dropped → spinner stuck.
 *    Now uses plain React useState + useRef — no stale closure issues.
 *
 * 2. Safety timeout clears the spinner.
 *    For BANK TRANSFER: Paystack's onSuccess fires only after they detect the
 *    transfer on their end (seconds to minutes). During that wait, the Paystack
 *    iframe shows their own "waiting for transfer" UI. When the user closes it,
 *    onClose fires — but our code was ignoring it (because "confirmed" is false).
 *    Result: processing=true stuck forever.
 *    Fix: onClose ALWAYS clears processing=true. We rely on confirmedRef to
 *    distinguish "user abandoned" vs "payment completed then closed".
 *
 * 3. forceClosePaystackIframe() runs on every success AND on cleanup.
 *    Ensures no zombie iframes regardless of payment method.
 *
 * 4. onCancel / onClose both handled identically — both clear processing.
 */
export const PaymentModal = ({ orderInfo, orderReady, userEmail, onClose, onConfirm }) => {
    const [processing, setProcessing] = useState(false);
    const [paid,       setPaid]       = useState(false);
    const toast = useToast();

    // True once Paystack's onSuccess fires
    const confirmedRef = useRef(false);
    // Safety timeout ref
    const safetyTimerRef = useRef(null);

    const clearSafetyTimer = useCallback(() => {
        if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
        }
    }, []);

    // Called on BOTH success and close/cancel — always clears processing
    const handleSuccess = useCallback((reference) => {
        console.log("✅ Paystack SUCCESS fired");
        clearSafetyTimer();
        confirmedRef.current = true;

        setProcessing(false);
        setPaid(true);

        setTimeout(() => {
            onConfirm(reference, "CARD");
            onClose();
        }, 800);
    }, [onConfirm, clearSafetyTimer]);
    // Cleanup on unmount — clear any lingering Paystack DOM + timers
    useEffect(() => {
        loadPaystack().catch(err => console.warn("Paystack preload:", err));

        // Backup: catch Paystack's postMessage from popup/iframe
        const handleMessage = (event) => {
            console.log("📩 MESSAGE EVENT:", event.data);
            if (!event.data) return;
            const data = typeof event.data === "string"
                ? (() => { try { return JSON.parse(event.data); } catch { return null; } })()
                : event.data;

            if (!data) return;

            // Paystack signals success via this message type
            if (data.type === "payment.success" || data.event === "successful") {
                const ref = data.reference || data.data?.reference || data.trxref;
                if (ref && !confirmedRef.current) {
                    handleSuccess(ref);
                }
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
            forceClosePaystackIframe();
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [handleSuccess]); // add handleSuccess to deps
    // Called when Paystack closes WITHOUT payment (user dismissed, or bank
    // transfer timed out before detection). Also fires after bank transfer
    // success in some Paystack versions — confirmedRef guards against double-action.
    const handleClose = useCallback(() => {
        console.log("❌ Paystack CLOSED", {
            confirmed: confirmedRef.current
        });
        clearSafetyTimer();
        setProcessing(false); // ← ALWAYS clear spinner on close

        if (!confirmedRef.current) {
            // Genuinely cancelled — tell the user
            toast.info("Payment cancelled. Your cart is still saved.");
        }
        // If confirmedRef is true, handleSuccess already ran — nothing more to do
    }, [toast, clearSafetyTimer]);

    const handlePay = useCallback(() => {
        if (!orderReady || processing) return;

        if (!PAYSTACK_PUBLIC_KEY) {
            toast.error("Payment is not configured. Please contact support.");
            return;
        }
        if (!window.PaystackPop) {
            toast.error("Payment script not ready — please try again in a moment.");
            loadPaystack().then(() => toast.info("Ready — please click Pay again."));
            return;
        }

        confirmedRef.current = false;
        setProcessing(true);

        // Safety net: if Paystack goes completely silent for 3 minutes
        // (script crash, iframe removed by extension, etc.), clear our spinner
        // so the user isn't stuck. 3min is generous — normal flows complete in <30s.
        safetyTimerRef.current = setTimeout(() => {
            console.warn("Paystack safety timeout fired — clearing processing state");
            forceClosePaystackIframe();
            setProcessing(false);
            toast.info("Payment window timed out. Please try again.");
        }, 3 * 60 * 1000);

        const config = {
            key:      PAYSTACK_PUBLIC_KEY,
            email:    userEmail || `cs_${Date.now()}@chopspot.ng`,
            amount:   Math.round((orderInfo?.orderTotal || 0) * 100),
            currency: "NGN",
            ref:      "cs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9),
            metadata: {
                custom_fields: [
                    { display_name: "Customer Name", variable_name: "customer_name", value: orderInfo?.fullName || "" },
                    { display_name: "Delivery",      variable_name: "delivery",      value: orderInfo?.location?.label || "" },
                    { display_name: "Hostel / Room", variable_name: "hostel_room",   value: [orderInfo?.hostel, orderInfo?.room].filter(Boolean).join(", ") || "" },
                ],
            },
            callback: (transaction) => {
                console.log("✅ Paystack CALLBACK fired");
                handleSuccess(transaction.reference, transaction.channel);
            },
            onClose:   handleClose,
            onCancel:  handleClose,   // newTransaction uses onCancel
        };

        try {
            // NEVER use newTransaction — it opens a popup, breaking onSuccess in the parent window
            // Always use setup() + openIframe() to stay in iframe mode
            if (typeof window.PaystackPop.setup === "function") {
                const handler = window.PaystackPop.setup(config);
                handler.openIframe();
            } else {
                throw new Error("PaystackPop.setup is not available");
            }
        } catch (err) {
            console.error("Paystack open failed:", err);
            clearSafetyTimer();
            setProcessing(false);
            toast.error("Could not open payment. Please try again.");
        }
    }, [orderReady, processing, orderInfo, userEmail, handleSuccess, handleClose, clearSafetyTimer, toast]);

    // ── Success Screen ─────────────────────────────────────────────────────────
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

    // ── Payment Modal ──────────────────────────────────────────────────────────
    const btnDisabled  = processing || !orderReady;
    const btnLabel     = processing ? "Opening payment…" : !orderReady ? "Preparing order…" : `🔒 Pay ₦${(orderInfo?.orderTotal || 0).toLocaleString()} Securely`;
    const btnBg        = processing
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
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{orderInfo?.location?.label || "—"}</span>
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

                {/* Security */}
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span>🔒</span>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>256-bit SSL · PCI-DSS Compliant</span>
                </div>

                {/* Bank transfer note — only shown when processing (user is in Paystack's waiting screen) */}
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
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    {(processing || !orderReady) ? (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                            {btnLabel}
                        </>
                    ) : btnLabel}
                </button>

                {/* Escape hatch for bank transfer users whose Paystack popup already closed */}
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