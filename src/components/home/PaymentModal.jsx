import { useState } from "react";
import { useToast } from "../../context/ToastContext";

// Paystack Public Key (from .env)
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

let paystackLoaded = false;

function loadPaystack() {
    if (paystackLoaded || document.getElementById("paystack-inline")) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.id = "paystack-inline";
        s.src = "https://js.paystack.co/v1/inline.js";
        s.onload = () => { paystackLoaded = true; resolve(); };
        s.onerror = () => reject(new Error("Failed to load Paystack"));
        document.head.appendChild(s);
    });
}

export const PaymentModal = ({ orderInfo, userEmail, onClose, onConfirm }) => {
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false);
    const toast = useToast();

    // ── Paystack Payment Handler ─────────────────────────────────────
    const handlePaystack = async () => {
        if (!PAYSTACK_PUBLIC_KEY) {
            toast.error("Payment is not configured yet. Please contact support.");
            return;
        }

        setProcessing(true);

        try {
            await loadPaystack();

            const handler = window.PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: userEmail || `cs_${Date.now()}@chopspot.ng`,
                amount: Math.round((orderInfo?.orderTotal || 0) * 100), // in kobo
                currency: "NGN",
                ref: "cs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9),
                metadata: {
                    custom_fields: [
                        { display_name: "Customer Name", variable_name: "customer_name", value: orderInfo?.fullName || "" },
                        { display_name: "Delivery",      variable_name: "delivery",      value: orderInfo?.location?.label || "" },
                        { display_name: "Hostel / Room", variable_name: "hostel_room",   value: [orderInfo?.hostel, orderInfo?.room].filter(Boolean).join(", ") || "" },
                    ],
                },
                onSuccess: async (transaction) => {
                    setProcessing(false);
                    setPaid(true);
                    await onConfirm(transaction.reference, "CARD");
                },
                onClose: () => {
                    setProcessing(false);
                    toast.info("Payment cancelled. Your cart is still saved.");
                },
            });

            handler.openIframe();
        } catch (err) {
            setProcessing(false);
            toast.error("Could not open payment. Check your connection and try again.");
        }
    };

    // ── Success Screen ───────────────────────────────────────────────
    if (paid) {
        return (
            <div style={{ position: "fixed", inset: 0, zIndex: 1400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 400, padding: "52px 40px", textAlign: "center", animation: "mIn 0.35s cubic-bezier(.34,1.56,.64,1)" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", marginBottom: 10 }}>Payment Confirmed!</h2>
                    <p style={{ color: "#6a8a6a", fontSize: 14, lineHeight: 1.6 }}>
                        Your order is placed and the restaurant has been notified. We'll WhatsApp you when it's ready!
                    </p>
                    <div style={{ marginTop: 20, background: "#e8f5e0", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        <span style={{ fontSize: 18 }}>📧</span>
                        <span style={{ fontSize: 13, color: "#2d6a2d", fontWeight: 600 }}>Confirmation email sent!</span>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Payment Modal ───────────────────────────────────────────
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 26,
                    width: "100%",
                    maxWidth: 460,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 28px 90px rgba(0,0,0,0.22)",
                    animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)",
                    padding: "28px 28px 32px"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, margin: "0 0 4px", color: "#1a2e1a" }}>Complete Payment</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>Secured by Paystack</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        ×
                    </button>
                </div>

                {/* Order Summary */}
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

                {/* Paystack Section */}
                <div>
                    {/* Payment method icons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
                        {[["💳","Card"], ["🏦","Bank"], ["📱","USSD"], ["🔄","Transfer"]].map(([icon, label]) => (
                            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                <span style={{ fontSize: 22 }}>{icon}</span>
                                <span style={{ fontSize: 10, color: "#8aaa8a", fontWeight: 600 }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                        <span>🔒</span>
                        <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>256-bit SSL · PCI-DSS Compliant</span>
                    </div>

                    <button
                        onClick={handlePaystack}
                        disabled={processing}
                        style={{
                            width: "100%",
                            padding: "17px",
                            borderRadius: 50,
                            border: "none",
                            background: processing ? "#6b9f6b" : "linear-gradient(135deg,#1a5c1a,#2d8a2d)",
                            color: "white",
                            fontFamily: "'Sora',sans-serif",
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: processing ? "not-allowed" : "pointer",
                            boxShadow: processing ? "none" : "0 4px 20px rgba(26,92,26,0.38)",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10
                        }}
                        onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = "scale(1.02)"; }}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                        {processing ? (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                                Opening payment…
                            </>
                        ) : (
                            <>🔒 Pay ₦{(orderInfo?.orderTotal || 0).toLocaleString()} Securely</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};