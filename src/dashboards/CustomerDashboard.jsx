import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate }   from "react-router-dom";
import { orderApi, reviewApi } from "../utils/Api";
import {useAuth} from "../auth/AuthContext.jsx";
import { useUserProfile } from "../hooks/useUserProfile";
import { useToast } from "../context/ToastContext";
import { useSse } from "../hooks/useSse";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n)   => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

const DELIVERY_LOCATIONS = [
    { label: "Porter's Lodge (₦300)", value: "porters", fee: 300 },
    { label: "Hall 1 (₦350)",         value: "hall1",   fee: 350 },
    { label: "Hall 2 (₦350)",         value: "hall2",   fee: 350 },
    { label: "Main Gate (₦400)",       value: "maingate",fee: 400 },
    { label: "Faculty Area (₦450)",    value: "faculty", fee: 450 },
];

// ── All backend OrderStatus values — covers both snake_case and UPPER variations ──
const STATUS_META = {
    // Standard uppercase
    PENDING:            { label: "Pending",            bg: "#fff8e1", color: "#b36a00", dot: "#f97316", icon: "🕐" },
    ACCEPTED:           { label: "Accepted",           bg: "#e8f5e0", color: "#1a6a1a", dot: "#4caf50", icon: "✅" },
    CONFIRMED:          { label: "Confirmed",          bg: "#e8f5e0", color: "#1a6a1a", dot: "#4caf50", icon: "✅" },
    PREPARING:          { label: "Preparing",          bg: "#e3f4fb", color: "#1a6a8a", dot: "#2196f3", icon: "👨‍🍳" },
    READY:              { label: "Ready",              bg: "#f3eeff", color: "#6a3ab2", dot: "#9c27b0", icon: "📦" },
    READY_FOR_PICKUP:   { label: "Ready for Pickup",   bg: "#f3eeff", color: "#6a3ab2", dot: "#9c27b0", icon: "📦" },
    OUT_FOR_DELIVERY:   { label: "Out for Delivery",   bg: "#fff3e0", color: "#e65100", dot: "#ff9800", icon: "🛵" },
    PICKED_UP:          { label: "Picked Up",          bg: "#fff3e0", color: "#e65100", dot: "#ff9800", icon: "🛵" },
    DELIVERED:          { label: "Delivered",          bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50", icon: "🎉" },
    COMPLETED:          { label: "Completed",          bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50", icon: "🎉" },
    CANCELLED:          { label: "Cancelled",          bg: "#fdecea", color: "#c0392b", dot: "#e74c3c", icon: "❌" },
    REJECTED:           { label: "Rejected",           bg: "#fdecea", color: "#c0392b", dot: "#e74c3c", icon: "❌" },
    PAYMENT_PENDING:    { label: "Payment Pending",    bg: "#fff8e1", color: "#b36a00", dot: "#f97316", icon: "💳" },
    PAYMENT_CONFIRMED:  { label: "Payment Confirmed",  bg: "#e8f5e0", color: "#1a6a1a", dot: "#4caf50", icon: "💳" },
};

// Normalise any casing the backend might send
function resolveStatus(raw) {
    if (!raw) return "PENDING";
    const upper = String(raw).toUpperCase().replace(/-/g, "_").replace(/ /g, "_");
    return STATUS_META[upper] ? upper : "PENDING";
}

// Steps shown in tracker — subset of STATUS_META
const TRACKER_STEPS = [
    "PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY", "DELIVERED",
];

const isActiveOrder = (status) =>
    !["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(status);

// ── Normalise backend Order → UI shape ────────────────────────────────────────
function normaliseOrder(o) {
    const status = resolveStatus(o.status);
    const items  = (o.items || []).map(i => ({
        id:    i.menuItemId || i.id,
        name:  i.menuItemName || i.itemName || i.name || "Item",
        price: i.unitPrice || i.price || 0,
        qty:   i.quantity  || i.qty   || 1,
    }));
    return {
        ...o,
        status,
        date:             o.createdAt || o.placedAt || o.date,
        totalAmount:      o.totalAmount || o.total   || 0,
        subtotal:         o.subtotal    || 0,
        deliveryFee:      o.deliveryFee || 0,
        deliveryLocation: o.deliveryLocation || o.location || "",
        groups: [{
            vendor: { id: o.vendorId, name: o.vendorName || "Restaurant" },
            pack:   o.packageName ? { name: o.packageName, price: o.packagePrice || 0 } : null,
            items,
        }],
    };
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = "sm" }) => {
    const meta = STATUS_META[status] || STATUS_META.PENDING;
    return (
        <span style={{ background: meta.bg, color: meta.color, fontSize: size === "sm" ? 11 : 13, fontWeight: 700, padding: size === "sm" ? "3px 10px" : "5px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
            {meta.icon} {meta.label}
        </span>
    );
};

// ── LiveTracker ───────────────────────────────────────────────────────────────
const LiveTracker = ({ status }) => {
    const currentIdx = TRACKER_STEPS.indexOf(status);
    // For statuses not in tracker steps, find the nearest equivalent
    const displayIdx = currentIdx >= 0 ? currentIdx
        : status === "ACCEPTED"  || status === "CONFIRMED"       ? 1
            : status === "READY"                                     ? 3
                : status === "PICKED_UP"                                 ? 4
                    : status === "COMPLETED"                                 ? 5
                        : 0;

    if (status === "CANCELLED" || status === "REJECTED") return (
        <div style={{ background: "#fdecea", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "14px 16px", textAlign: "center", color: "#c0392b", fontWeight: 700, fontSize: 14 }}>
            ❌ {STATUS_META[status]?.label || "Order cancelled"}
        </div>
    );

    return (
        <div style={{ padding: "4px 0 8px" }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#1a2e1a", margin: "0 0 14px" }}>📍 Live Order Tracking</p>
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 2, background: "#e8f0e8", zIndex: 0 }} />
                <div style={{ position: "absolute", left: 15, top: 8, width: 2, background: "#2d8a2d", zIndex: 1, height: `${Math.min(100, (displayIdx / (TRACKER_STEPS.length - 1)) * 100)}%`, transition: "height 0.5s ease" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {TRACKER_STEPS.map((step, idx) => {
                        const meta   = STATUS_META[step];
                        const done   = idx < displayIdx;
                        const active = idx === displayIdx;
                        return (
                            <div key={step} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", position: "relative", zIndex: 2 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: done ? "#2d8a2d" : active ? meta.bg : "#f4f8f4", border: `2px solid ${done || active ? meta.dot : "#e0eee0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: active ? `0 0 0 4px ${meta.bg}` : "none", transition: "all 0.3s" }}>
                                    {done
                                        ? <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                        : <span>{meta.icon}</span>
                                    }
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: active ? 800 : done ? 600 : 500, fontSize: 13, color: active ? "#1a2e1a" : done ? "#2d8a2d" : "#aaa", fontFamily: active ? "'Sora',sans-serif" : "'DM Sans',sans-serif" }}>
                                        {meta.label}
                                    </p>
                                    {active && <p style={{ margin: "2px 0 0", fontSize: 11, color: meta.color, fontWeight: 600 }}>Current status</p>}
                                </div>
                                {active && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: meta.dot, animation: "ping 1.4s ease-in-out infinite" }} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ── Star Selector ─────────────────────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button" onClick={() => onChange(star)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 28, color: star <= value ? "#f97316" : "#ddd", padding: "0 2px", lineHeight: 1, transition: "color 0.1s" }}>
                ★
            </button>
        ))}
    </div>
);

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ order, onClose, onSubmitted }) => {
    const [vendorStars,    setVendorStars]    = useState(0);
    const [riderStars,     setRiderStars]     = useState(0);
    const [vendorComment,  setVendorComment]  = useState("");
    const [riderComment,   setRiderComment]   = useState("");
    const [submitting,     setSubmitting]     = useState(false);
    const [error,          setError]          = useState(null);

    const hasRider = Boolean(order?.riderId);

    const handleSubmit = async () => {
        if (vendorStars === 0) { setError("Please rate the restaurant before submitting."); return; }
        setSubmitting(true);
        setError(null);
        try {
            const dto = {
                orderId:       order.id,
                vendorId:      order.vendorId,
                vendorRating:  vendorStars,
                vendorComment: vendorComment.trim() || null,
            };
            if (hasRider && riderStars > 0) {
                dto.riderId      = order.riderId;
                dto.riderRating  = riderStars;
                dto.riderComment = riderComment.trim() || null;
            }
            await reviewApi.submitReview(dto);
            onSubmitted(order.id);
        } catch (err) {
            setError(err.message || "Failed to submit review. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 440, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "dbIn 0.28s cubic-bezier(.34,1.56,.64,1)", overflow: "hidden" }}>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#1a6a1a,#2d8a2d)", padding: "20px 22px 16px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white", margin: 0 }}>Rate Your Order</h3>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "3px 0 0" }}>{order?.groups?.[0]?.vendor?.name || "Restaurant"}</p>
                    </div>
                    <button onClick={onClose} disabled={submitting} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>

                {/* Body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "20px 22px" }}>
                    {error && (
                        <div style={{ background: "#fdecea", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b", fontFamily: "'DM Sans',sans-serif" }}>
                            {error}
                        </div>
                    )}

                    {/* Vendor rating */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a2e1a", margin: "0 0 6px" }}>🍽 Restaurant Rating <span style={{ color: "#e74c3c" }}>*</span></p>
                        <StarSelector value={vendorStars} onChange={setVendorStars} />
                        <textarea
                            value={vendorComment}
                            onChange={e => setVendorComment(e.target.value.slice(0, 300))}
                            placeholder="How was the food? (optional)"
                            rows={3}
                            style={{ marginTop: 10, width: "100%", padding: "11px 13px", borderRadius: 12, border: "1.5px solid #d8eed8", background: "#f4f8f4", fontSize: 13, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                            onFocus={e => e.target.style.borderColor = "#2d8a2d"}
                            onBlur={e => e.target.style.borderColor = "#d8eed8"}
                        />
                        <p style={{ fontSize: 11, color: "#8aaa8a", margin: "4px 0 0", textAlign: "right" }}>{vendorComment.length}/300</p>
                    </div>

                    {/* Rider rating (conditional) */}
                    {hasRider && (
                        <div style={{ paddingTop: 16, borderTop: "1px solid #e8f0e8" }}>
                            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a2e1a", margin: "0 0 6px" }}>🛵 Rider Rating <span style={{ fontSize: 11, color: "#8aaa8a", fontWeight: 400 }}>(optional)</span></p>
                            <StarSelector value={riderStars} onChange={setRiderStars} />
                            <textarea
                                value={riderComment}
                                onChange={e => setRiderComment(e.target.value.slice(0, 300))}
                                placeholder="How was the delivery? (optional)"
                                rows={2}
                                style={{ marginTop: 10, width: "100%", padding: "11px 13px", borderRadius: 12, border: "1.5px solid #d8eed8", background: "#f4f8f4", fontSize: 13, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                                onFocus={e => e.target.style.borderColor = "#2d8a2d"}
                                onBlur={e => e.target.style.borderColor = "#d8eed8"}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 22px 20px", flexShrink: 0, display: "flex", gap: 10 }}>
                    <button onClick={onClose} disabled={submitting} style={{ flex: 1, padding: "12px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 700, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif", opacity: submitting ? 0.6 : 1 }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: "12px", borderRadius: 50, border: "none", background: submitting ? "#e8e8e8" : "linear-gradient(135deg,#2d8a2d,#4caf50)", color: submitting ? "#aaa" : "white", fontWeight: 800, fontSize: 13, cursor: submitting ? "wait" : "pointer", fontFamily: "'Sora',sans-serif", boxShadow: submitting ? "none" : "0 4px 16px rgba(45,138,45,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {submitting ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Submitting…</>
                        ) : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onRefresh, isReviewed, onRateClick }) => {
    if (!order) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "dbIn 0.3s cubic-bezier(.34,1.56,.64,1)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#1a6a1a,#2d8a2d)", padding: "22px 24px 18px", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: "0 0 3px", letterSpacing: 1.2, textTransform: "uppercase" }}>Order ID</p>
                            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, margin: 0, color: "white" }}>{order.id}</h3>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {isActiveOrder(order.status) && (
                                <button onClick={onRefresh} title="Refresh" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                </button>
                            )}
                            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                        <StatusBadge status={order.status} size="md" />
                        {order.date && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>· {fmtDate(order.date)} at {fmtTime(order.date)}</span>}
                    </div>
                </div>

                {/* Body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
                    <div style={{ marginBottom: 20, background: "#f9fdf9", borderRadius: 16, padding: "16px 18px", border: "1px solid #e0eee0" }}>
                        <LiveTracker status={order.status} />
                    </div>

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                        {[
                            ["📍 Delivered to",  order.deliveryLocation || "—"],
                            ["💳 Payment",       order.paymentMethod    || "—"],
                            ["🏠 Hostel / Room", [order.hostel, order.room].filter(Boolean).join(", ") || "—"],
                            ["💰 Total Paid",    fmt(order.totalAmount)],
                        ].map(([label, val]) => (
                            <div key={label} style={{ background: "#f4f8f4", borderRadius: 12, padding: "12px 14px" }}>
                                <p style={{ margin: 0, fontSize: 11, color: "#8aaa8a", fontWeight: 600, marginBottom: 3 }}>{label}</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a2e1a" }}>{val}</p>
                            </div>
                        ))}
                    </div>

                    {/* WhatsApp */}
                    {order.whatsappNumber && (
                        <a href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                           style={{ display: "flex", alignItems: "center", gap: 10, background: "#e8f5e0", borderRadius: 12, padding: "10px 14px", marginBottom: 20, textDecoration: "none", color: "#1a6a1a", fontWeight: 700, fontSize: 13 }}>
                            <svg width="18" height="18" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Chat on WhatsApp about this order
                        </a>
                    )}

                    {/* Items */}
                    <h4 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2e1a", margin: "0 0 12px" }}>🍽 Order Items</h4>
                    <div style={{ background: "#f9fdf9", borderRadius: 14, overflow: "hidden", border: "1px solid #e0eee0", marginBottom: 16 }}>
                        {order.packageName && (
                            <div style={{ background: "#e8f5e0", padding: "10px 16px", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a" }}>📦 {order.packageName}</span>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a" }}>{fmt(order.packagePrice)}</span>
                            </div>
                        )}
                        {(order.groups?.[0]?.items || []).map((item, i, arr) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f7f0" : "none" }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#1a2e1a" }}>{item.name}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8aaa8a" }}>× {item.qty}</p>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a" }}>{fmt(item.price * item.qty)}</span>
                            </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: "2px solid #e8f0e8", background: "#f4f8f4" }}>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#1a2e1a" }}>Total</span>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#f97316" }}>{fmt(order.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Price breakdown */}
                    {(order.subtotal > 0 || order.deliveryFee > 0) && (
                        <div style={{ background: "#f4f8f4", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                            {[["Subtotal", fmt(order.subtotal)], ["Delivery Fee", fmt(order.deliveryFee)]].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#5a7a5a" }}>
                                    <span>{l}</span><span style={{ fontWeight: 600, color: "#1a2e1a" }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rate this order */}
                    {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                        isReviewed ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 16px", background: "#e8f5e0", borderRadius: 12, color: "#2d6a2d", fontSize: 13, fontWeight: 700 }}>
                                ✅ You reviewed this order
                            </div>
                        ) : (
                            <button onClick={onRateClick} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid #f97316", background: "#fff7f0", color: "#f97316", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#f97316"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#fff7f0"; e.currentTarget.style.color = "#f97316"; }}>
                                ⭐ Rate this order
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Edit Profile Modal ────────────────────────────────────────────────────────
const EditProfileModal = ({ profile, onClose, onSave, saving }) => {
    const [form, setForm] = useState({
        firstName: profile?.firstName || "",
        lastName:  profile?.lastName  || "",
        fullName:  profile?.fullName  || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : ""),
        whatsapp:  profile?.whatsapp  || profile?.phoneNumber || "",
        location:  profile?.defaultDeliveryLocation || DELIVERY_LOCATIONS[0].value,
        hostel:    profile?.hostel    || "",
        room:      profile?.room      || "",
    });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const iStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #d8eed8", background: "#f4f8f4", fontSize: 14, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
    const lStyle = { fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: "#5a7a5a", textTransform: "uppercase", display: "block", marginBottom: 5 };

    const handleSubmit = () => {
        const nameParts = form.fullName.trim().split(" ");
        onSave({
            firstName:               nameParts[0]           || form.firstName,
            lastName:                nameParts.slice(1).join(" ") || form.lastName,
            whatsapp:                form.whatsapp,
            hostel:                  form.hostel,
            room:                    form.room,
            defaultDeliveryLocation: form.location,
        });
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 440, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 80px rgba(0,0,0,0.2)", animation: "dbIn 0.28s cubic-bezier(.34,1.56,.64,1)" }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: "20px 22px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, margin: 0, color: "#1a2e1a" }}>Edit Profile</h3>
                    <button onClick={onClose} style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: "4px 22px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={lStyle}>Full Name</label>
                        <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Your full name" style={iStyle}
                               onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"} />
                    </div>
                    <div>
                        <label style={lStyle}>WhatsApp Number</label>
                        <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+234..." style={iStyle}
                               onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"} />
                    </div>
                    <div>
                        <label style={lStyle}>Default Delivery Location</label>
                        <select value={form.location} onChange={e => set("location", e.target.value)} style={{ ...iStyle, appearance: "none" }}>
                            {DELIVERY_LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label style={lStyle}>Hostel / Building</label>
                            <input value={form.hostel} onChange={e => set("hostel", e.target.value)} placeholder="e.g. Block C" style={iStyle}
                                   onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={lStyle}>Room / Flat</label>
                            <input value={form.room} onChange={e => set("room", e.target.value)} placeholder="e.g. Room 204" style={iStyle}
                                   onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"} />
                        </div>
                    </div>
                </div>
                <div style={{ padding: "14px 22px 20px", flexShrink: 0 }}>
                    <button onClick={handleSubmit} disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: 50, border: "none", background: saving ? "#9dc89d" : "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 18px rgba(45,138,45,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {saving ? (
                            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Saving…</>
                        ) : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const navigate = useNavigate();

    // Normalise auth hook shape
    const auth     = useAuth();
    const logout   = auth.logout;
    const toast    = useToast();

    const { profile: fetchedProfile, saveProfile } = useUserProfile({ isLoggedIn: true });
    const [profile,           setProfile]           = useState(null);
    const [orders,            setOrders]            = useState([]);
    const [selectedOrder,     setSelectedOrder]     = useState(null);
    const [showEdit,          setShowEdit]          = useState(false);
    const [savingProfile,     setSavingProfile]     = useState(false);
    const [activeTab,         setActiveTab]         = useState("all");
    const [loading,           setLoading]           = useState(true);
    const [error,             setError]             = useState(null);
    const [reviewedOrderIds,  setReviewedOrderIds]  = useState(new Set());
    const [reviewOrder,       setReviewOrder]       = useState(null);
    const [orderHasNext,      setOrderHasNext]      = useState(false);
    const [orderPage,         setOrderPage]         = useState(0);
    const [loadingMore,       setLoadingMore]       = useState(false);
    const pollRef = useRef(null);

    // ── SSE real-time updates ─────────────────────────────────────────────────
    const { subscribe, unsubscribe, isConnected: sseConnected, status: sseStatus } = useSse({
        userId: auth.user?.id || auth.user?.userId,
        isAuthenticated: auth.isAuthenticated,
    });

    // Sync profile once fetched
    useEffect(() => {
        if (fetchedProfile) setProfile(fetchedProfile);
    }, [fetchedProfile]);

    // ── Fetch orders ──────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const raw  = await orderApi.getMyOrders(0, 10);
            const list = Array.isArray(raw)           ? raw
                : Array.isArray(raw?.content)  ? raw.content
                    : Array.isArray(raw?.orders)   ? raw.orders
                        : [];
            const normalised = list.map(normaliseOrder);
            setOrders(normalised);
            setOrderPage(0);
            setOrderHasNext(raw?.last === false || raw?.hasNext === true);
            setSelectedOrder(prev => {
                if (!prev) return prev;
                return normalised.find(o => o.id === prev.id) || prev;
            });
        } catch (err) {
            console.error("Failed to load orders:", err);
            if (!silent) setError("Could not load your orders. Please try again.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const loadMoreOrders = useCallback(async () => {
        setLoadingMore(true);
        try {
            const nextPage = orderPage + 1;
            const raw = await orderApi.getMyOrders(nextPage, 10);
            const list = Array.isArray(raw)          ? raw
                : Array.isArray(raw?.content) ? raw.content
                    : Array.isArray(raw?.orders)  ? raw.orders
                        : [];
            setOrders(prev => [...prev, ...list.map(normaliseOrder)]);
            setOrderPage(nextPage);
            setOrderHasNext(raw?.last === false || raw?.hasNext === true);
        } catch (err) {
            console.error("Failed to load more orders:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [orderPage]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Load reviewed order IDs ───────────────────────────────────────────────
    useEffect(() => {
        reviewApi.getMyReviews()
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.content ?? res?.data ?? res?.reviews ?? []);
                setReviewedOrderIds(new Set(list.map(r => r.orderId).filter(Boolean)));
            })
            .catch(() => {});
    }, []);

    // ── SSE event handlers ────────────────────────────────────────────────────
    useEffect(() => {
        const handleStatusUpdate = (data) => {
            const orderId = data.orderId || data.id;
            const newStatus = data.status;
            if (!orderId || !newStatus) return;
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: resolveStatus(newStatus) } : o
            ));
            setSelectedOrder(prev =>
                prev?.id === orderId ? { ...prev, status: resolveStatus(newStatus) } : prev
            );
        };
        subscribe("ORDER_STATUS_UPDATED", handleStatusUpdate);
        subscribe("ORDER_CONFIRMED",      handleStatusUpdate);
        return () => {
            unsubscribe("ORDER_STATUS_UPDATED");
            unsubscribe("ORDER_CONFIRMED");
        };
    }, [subscribe, unsubscribe]);

    // ── Poll active orders every 60s (fallback when SSE disconnected)  ────────
    useEffect(() => {
        const hasActive = orders.some(o => isActiveOrder(o.status));
        clearInterval(pollRef.current);
        if (hasActive) pollRef.current = setInterval(() => fetchOrders(true), 60_000);
        return () => clearInterval(pollRef.current);
    }, [orders, fetchOrders]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const totalSpent  = orders.reduce((a, o) => a + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const delivered   = orders.filter(o => ["DELIVERED","COMPLETED"].includes(o.status)).length;
    const avgOrder    = totalOrders ? Math.round(totalSpent / totalOrders) : 0;

    const displayName = profile?.fullName
        || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : null);
    const initials = displayName
        ? displayName.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const TAB_FILTER = {
        all:       () => true,
        active:    o => isActiveOrder(o.status),
        delivered: o => ["DELIVERED","COMPLETED"].includes(o.status),
        cancelled: o => ["CANCELLED","REJECTED"].includes(o.status),
    };
    const filteredOrders = orders.filter(TAB_FILTER[activeTab] || TAB_FILTER.all);

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleSaveProfile = async (updated) => {
        setSavingProfile(true);
        try {
            await saveProfile(updated);
            setProfile(prev => ({ ...prev, ...updated }));
            setShowEdit(false);
        } catch (err) {
            console.error("Profile save failed:", err);
            // Still close and apply locally so the user isn't stuck
            setProfile(prev => ({ ...prev, ...updated }));
            setShowEdit(false);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'DM Sans', sans-serif; background: #f2f7f2; }
                @keyframes dbIn   { from { opacity:0; transform:scale(0.94) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes ping   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.4} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #b0d5b0; border-radius: 10px; }
                .stat-card { animation: fadeUp 0.4s ease both; }
                .stat-card:nth-child(1){animation-delay:0.05s}
                .stat-card:nth-child(2){animation-delay:0.10s}
                .stat-card:nth-child(3){animation-delay:0.15s}
                .stat-card:nth-child(4){animation-delay:0.20s}
                .order-row:hover { background: #f0f7f0 !important; }
                .mob-nav { display: none; }
                @media (max-width: 700px) {
                    .mob-nav { display: flex !important; }
                    body { padding-bottom: 72px; }
                }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#f2f7f2" }}>

                {/* Top Nav */}
                <nav style={{ background: "white", borderBottom: "1px solid #e0eee0", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#2d8a2d", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif", padding: "6px 10px", borderRadius: 10, transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e8f5e0"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        Back to Home
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a6a1a" }}>
                            Tasty<span style={{ color: "#f97316" }}>Cart</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", padding: "2px 8px", borderRadius: 20, background: sseStatus === "connected" ? "#e8f5e0" : "#f0f0f0", color: sseStatus === "connected" ? "#1a6a1a" : "#888", border: `1px solid ${sseStatus === "connected" ? "#b0d5b0" : "#ddd"}` }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sseStatus === "connected" ? "#2d8a2d" : "#aaa", display: "inline-block", animation: sseStatus === "connected" ? "ping 2s ease-in-out infinite" : "none" }}/>
                            {sseStatus === "connected" ? "Live" : sseStatus === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                        </span>
                    </div>

                    <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px solid #fee2e2", cursor: "pointer", color: "#dc2626", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans',sans-serif", padding: "6px 14px", borderRadius: 10 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                    </button>
                </nav>

                <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px" }}>

                    {/* Profile Card */}
                    <div style={{ background: "linear-gradient(135deg,#1a6a1a,#2d8a2d,#3da03d)", borderRadius: 24, padding: "28px 28px 24px", marginBottom: 24, position: "relative", overflow: "hidden", animation: "fadeUp 0.35s ease" }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}/>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                                {initials}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: "0 0 3px", letterSpacing: 1.2, textTransform: "uppercase" }}>My Profile</p>
                                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(18px,3vw,26px)", color: "white", margin: "0 0 6px" }}>
                                    {displayName || "Complete your profile"}
                                </h2>
                                {profile && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                                        {[
                                            ["📱", profile.whatsapp || profile.phoneNumber || "—"],
                                            ["📍", profile.defaultDeliveryLocation || "—"],
                                            ["🏠", [profile.hostel, profile.room].filter(Boolean).join(", ") || "—"],
                                        ].map(([icon, val]) => (
                                            <span key={icon} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 4 }}>{icon} {val}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowEdit(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "8px 16px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.25)"}
                                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                                ✏️ Edit
                            </button>
                        </div>
                    </div>

                    {/* Active orders banner */}
                    {orders.filter(o => isActiveOrder(o.status)).length > 0 && (
                        <div style={{ background: "linear-gradient(135deg,#fff8e1,#fef3c7)", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", animation: "ping 1.4s ease-in-out infinite", flexShrink: 0 }}/>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#92400e", margin: 0 }}>
                                    {orders.filter(o => isActiveOrder(o.status)).length} active order{orders.filter(o => isActiveOrder(o.status)).length > 1 ? "s" : ""} in progress
                                </p>
                                <p style={{ fontSize: 12, color: "#b45309", margin: "2px 0 0" }}>{sseConnected ? "● Live updates enabled" : "Refreshing every 60 seconds"}</p>
                            </div>
                            <button onClick={() => setActiveTab("active")} style={{ background: "#f97316", border: "none", borderRadius: 10, padding: "6px 14px", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Track</button>
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
                        {[
                            { label: "Total Orders", value: totalOrders,    icon: "📦", color: "#2d8a2d", bg: "#e8f5e0" },
                            { label: "Total Spent",  value: fmt(totalSpent), icon: "💳", color: "#f97316", bg: "#fff5ef" },
                            { label: "Avg Order",    value: fmt(avgOrder),   icon: "📊", color: "#7b3fd4", bg: "#f3eeff" },
                            { label: "Delivered",    value: delivered,       icon: "✅", color: "#1a6a8a", bg: "#e3f4fb" },
                        ].map(stat => (
                            <div key={stat.label} className="stat-card" style={{ background: "white", borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #eef5ee" }}>
                                <div style={{ width: 46, height: 46, borderRadius: 14, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{stat.icon}</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 11, color: "#8aaa8a", fontWeight: 600 }}>{stat.label}</p>
                                    <p style={{ margin: "2px 0 0", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(15px,2.5vw,20px)", color: stat.color }}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order History */}
                    <div style={{ background: "white", borderRadius: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #eef5ee", animation: "fadeUp 0.45s ease 0.1s both" }}>
                        <div style={{ padding: "20px 22px 0", borderBottom: "1px solid #f0f7f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a", margin: 0 }}>Order History</h3>
                                <button onClick={() => fetchOrders()} style={{ background: "#f4f8f4", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#5a7a5a", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    Refresh
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                {[["all","All"],["active","Active 🔴"],["delivered","Delivered"],["cancelled","Cancelled"]].map(([key, label]) => (
                                    <button key={key} onClick={() => setActiveTab(key)} style={{ padding: "8px 14px", borderRadius: "10px 10px 0 0", border: "none", background: activeTab === key ? "#f4f8f4" : "transparent", color: activeTab === key ? "#2d8a2d" : "#8aaa8a", fontWeight: activeTab === key ? 700 : 500, fontSize: 13, cursor: "pointer", borderBottom: activeTab === key ? "2px solid #2d8a2d" : "2px solid transparent" }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: "80px 20px", textAlign: "center", color: "#8aaa8a" }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px", display: "block" }}><circle cx="12" cy="12" r="10" stroke="#d4e8d4" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="#2d8a2d" strokeWidth="3" strokeLinecap="round"/></svg>
                                Loading your orders…
                            </div>
                        ) : error ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#dc2626" }}>
                                <p style={{ fontSize: 32, marginBottom: 10 }}>⚠️</p>
                                <p style={{ fontWeight: 600 }}>{error}</p>
                                <button onClick={() => fetchOrders()} style={{ marginTop: 12, padding: "8px 20px", background: "#2d8a2d", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Retry</button>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "50px 0", color: "#aaa" }}>
                                <p style={{ fontSize: 36 }}>📭</p>
                                <p style={{ fontWeight: 600, fontSize: 15, marginTop: 10 }}>No orders here yet</p>
                            </div>
                        ) : filteredOrders.map((order, idx) => {
                            const meta       = STATUS_META[order.status] || STATUS_META.PENDING;
                            const vendorName = order.groups?.[0]?.vendor?.name || "Restaurant";
                            const itemCount  = order.groups?.[0]?.items?.length || 0;
                            return (
                                <div key={order.id} className="order-row" onClick={() => setSelectedOrder(order)}
                                     style={{ padding: "16px 22px", borderBottom: idx < filteredOrders.length - 1 ? "1px solid #f0f7f0" : "none", cursor: "pointer", transition: "background 0.18s", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "white" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>
                                    <div style={{ flex: 1, minWidth: 140 }}>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a", fontFamily: "'Sora',sans-serif" }}>{vendorName}</p>
                                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>
                                            {order.date ? fmtDate(order.date) : "—"} · {itemCount} item{itemCount !== 1 ? "s" : ""} · {order.deliveryLocation || "—"}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a" }}>{fmt(order.totalAmount)}</span>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load more */}
                    {orderHasNext && activeTab === "all" && !loading && !error && (
                        <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                            <button
                                onClick={loadMoreOrders}
                                disabled={loadingMore}
                                style={{ padding: "11px 32px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: loadingMore ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8, opacity: loadingMore ? 0.7 : 1, transition: "all 0.18s" }}
                                onMouseEnter={e => { if (!loadingMore) { e.currentTarget.style.background = "#e8f5e0"; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                            >
                                {loadingMore ? (
                                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(45,138,45,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="#2d8a2d" strokeWidth="3" strokeLinecap="round"/></svg>Loading…</>
                                ) : "Load more orders"}
                            </button>
                        </div>
                    )}

                    {/* Favourites */}
                    {orders.length > 0 && (() => {
                        const freq = {};
                        orders.forEach(o => o.groups?.forEach(g => {
                            const n = g.vendor?.name;
                            if (n) freq[n] = (freq[n] || 0) + 1;
                        }));
                        const faves = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
                        if (!faves.length) return null;
                        return (
                            <div style={{ marginTop: 20, background: "white", borderRadius: 22, padding: "20px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #eef5ee", animation: "fadeUp 0.5s ease 0.15s both" }}>
                                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a", margin: "0 0 16px" }}>⭐ Your Favourites</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {faves.map(([name, count], i) => (
                                        <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#f9fdf9", borderRadius: 14, border: "1px solid #e8f0e8" }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 10, background: ["#e8f5e0","#fff5ef","#f3eeff","#e3f4fb"][i]||"#f4f8f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                                {["🥇","🥈","🥉","🏅"][i]||"⭐"}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>{name}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8aaa8a" }}>{count} order{count > 1 ? "s" : ""}</p>
                                            </div>
                                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#2d8a2d" }}>#{i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Mobile bottom nav */}
            <nav className="mob-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 900, background: "white", borderTop: "1px solid #e0eee0", height: 64, alignItems: "center", justifyContent: "space-around", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
                {[
                    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, label: "Home",    action: () => navigate("/"),     color: "#2d8a2d" },
                    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>, label: "Orders",   action: () => setActiveTab("all"), color: "#f97316" },
                    { icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>, label: "Sign Out", action: handleLogout,          color: "#dc2626" },
                ].map(({ icon, label, action, color }) => (
                    <button key={label} onClick={action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color, padding: "8px 20px" }}>
                        {icon}
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
                    </button>
                ))}
            </nav>

            {/* Modals */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onRefresh={() => fetchOrders(true)}
                    isReviewed={reviewedOrderIds.has(selectedOrder.id)}
                    onRateClick={() => setReviewOrder(selectedOrder)}
                />
            )}
            {reviewOrder && (
                <ReviewModal
                    order={reviewOrder}
                    onClose={() => setReviewOrder(null)}
                    onSubmitted={(orderId) => {
                        setReviewedOrderIds(prev => new Set([...prev, orderId]));
                        setReviewOrder(null);
                        toast.success("Review submitted! Thank you for your feedback.");
                    }}
                />
            )}
            {showEdit && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEdit(false)}
                    onSave={handleSaveProfile}
                    saving={savingProfile}
                />
            )}
        </>
    );
}