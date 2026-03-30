import { useState } from "react";
import { useToast } from "../../context/ToastContext";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here";

let paystackLoaded = false;
function loadPaystack() {
    if (paystackLoaded || document.getElementById("paystack-inline")) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.id      = "paystack-inline";
        s.src     = "https://js.paystack.co/v1/inline.js";
        s.onload  = () => { paystackLoaded = true; resolve(); };
        s.onerror = () => reject(new Error("Failed to load Paystack SDK"));
        document.head.appendChild(s);
    });
}

export const PaymentModal = ({ orderInfo, userEmail, onClose, onConfirm }) => {
    const [method,     setMethod]     = useState("card");
    const [processing, setProcessing] = useState(false);
    const [paid,       setPaid]       = useState(false);
    const toast = useToast();

    const handlePayWithPaystack = async () => {
        setProcessing(true);
        try {
            await loadPaystack();
            const handler = window.PaystackPop.setup({
                key:      PAYSTACK_PUBLIC_KEY,
                email:    userEmail || (orderInfo?.whatsapp + "@chopspot.ng"),
                amount:   Math.round((orderInfo?.orderTotal || 0) * 100),
                currency: "NGN",
                ref:      "cs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9),
                metadata: {
                    custom_fields: [
                        { display_name: "Customer Name", variable_name: "customer_name", value: orderInfo?.fullName || "" },
                        { display_name: "Delivery",      variable_name: "delivery",      value: orderInfo?.location?.label || "" },
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
        } catch {
            setProcessing(false);
            toast.error("Could not open payment. Check your connection and try again.");
        }
    };

    if (paid) return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 400, padding: "52px 40px", textAlign: "center", animation: "mIn 0.35s cubic-bezier(.34,1.56,.64,1)" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", marginBottom: 10 }}>Payment Confirmed!</h2>
                <p style={{ color: "#6a8a6a", fontSize: 14, lineHeight: 1.6 }}>Your order is placed and the restaurant has been notified. We'll WhatsApp you when it's ready!</p>
                <div style={{ marginTop: 20, background: "#e8f5e0", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <span style={{ fontSize: 18 }}>📧</span>
                    <span style={{ fontSize: 13, color: "#2d6a2d", fontWeight: 600 }}>Confirmation email sent!</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)", padding: "28px 28px 32px" }} onClick={e => e.stopPropagation()}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, margin: 0, color: "#1a2e1a" }}>Payment</h2>
                    <button onClick={onClose} style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>

                {/* Order summary */}
                <div style={{ background: "#f4f8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#5a7a5a" }}>Order Total</span>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#f97316" }}>₦{(orderInfo?.orderTotal || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "#8aaa8a" }}>Delivering to</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{orderInfo?.location?.label || "—"}</span>
                    </div>
                </div>

                {/* Payment method tabs */}
                <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                    {[["card","💳 Pay with Card"],["transfer","🏦 Bank Transfer"]].map(([val, label]) => (
                        <button key={val} onClick={() => setMethod(val)} style={{ flex: 1, padding: "12px 8px", borderRadius: 14, border: `2px solid ${method === val ? "#2d8a2d" : "#e8f0e8"}`, background: method === val ? "#eaf6ea" : "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", color: method === val ? "#1a4a1a" : "#5a7a5a", transition: "all 0.18s" }}>{label}</button>
                    ))}
                </div>

                {method === "card" ? (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20, padding: "10px 14px", background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #bbf7d0" }}>
                            <span style={{ fontSize: 16 }}>🔒</span>
                            <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>Secured by Paystack · 256-bit SSL</span>
                            <span style={{ fontSize: 16 }}>✅</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#5a7a5a", textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
                            Click below to open Paystack's secure window. Supports card, bank transfer, and USSD.
                        </p>
                        <button onClick={handlePayWithPaystack} disabled={processing} style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: processing ? "#6b9f6b" : "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: processing ? "not-allowed" : "pointer", boxShadow: processing ? "none" : "0 4px 20px rgba(45,138,45,0.35)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            {processing
                                ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Opening payment…</>
                                : <>🔒 Pay ₦{(orderInfo?.orderTotal || 0).toLocaleString()} with Paystack</>
                            }
                        </button>
                    </div>
                ) : (
                    <div style={{ background: "#f4f8f4", borderRadius: 16, padding: "20px", textAlign: "center" }}>
                        <p style={{ fontWeight: 800, fontSize: 16, color: "#1a2e1a", marginBottom: 6 }}>🏦 Bank Transfer</p>
                        <p style={{ fontSize: 13, color: "#5a7a5a", marginBottom: 16, lineHeight: 1.6 }}>Transfer the exact amount, then confirm on WhatsApp.</p>
                        <div style={{ background: "white", borderRadius: 12, padding: "16px", textAlign: "left", marginBottom: 14 }}>
                            {[["Bank","First Bank Nigeria"],["Account Name","ChopSpot Foods Ltd"],["Account No","3012345678"],["Amount", `₦${(orderInfo?.orderTotal || 0).toLocaleString()}`]].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, borderBottom: "1px solid #f0f7f0" }}>
                                    <span style={{ color: "#8aaa8a" }}>{k}</span>
                                    <span style={{ fontWeight: 700, color: "#1a2e1a" }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <a href="https://wa.me/2348000000000?text=I%20just%20made%20a%20transfer%20for%20my%20ChopSpot%20order"
                           target="_blank" rel="noreferrer"
                           style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "white", textDecoration: "none", padding: "12px 24px", borderRadius: 50, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
                            <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Confirm on WhatsApp
                        </a>
                        <p style={{ margin: "12px 0 0", fontSize: 11, color: "#94a3b8" }}>Orders confirmed within 5 minutes after transfer is received.</p>
                    </div>
                )}
            </div>
        </div>
    );
};