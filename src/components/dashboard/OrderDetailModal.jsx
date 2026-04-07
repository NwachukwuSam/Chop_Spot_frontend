/**
 * OrderDetailModal.jsx
 *
 * Drop-in replacement for the OrderDetailModal inside CustomerDashboard.jsx.
 *
 * HOW TO USE:
 *   1. Place this file at src/components/dashboard/OrderDetailModal.jsx
 *   2. In CustomerDashboard.jsx, add:
 *        import { OrderDetailModal } from "../components/dashboard/OrderDetailModal";
 *   3. Delete the local OrderDetailModal definition from CustomerDashboard.jsx.
 *
 * Map behaviour:
 *   • Geocodes the restaurant name/address from the order data.
 *   • Geocodes the delivery location label (e.g. "Porter's Lodge (₦300)")
 *     to place the customer pin — no hardcoded coordinates anywhere.
 *   • If the backend already stored pinLat/pinLng on the order, those are
 *     used directly and geocoding is skipped for the customer pin.
 *   • If the backend sends riderLat/riderLng, a rider pin is shown.
 *   • Set VITE_CAMPUS_HINT in .env so labels geocode to the right campus.
 */

import { useState, useEffect, useRef } from "react";
import { DeliveryMap }  from "../components/home/DeliveryMap";
import { useGeocoder }  from "../hooks/useGeocoder";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n)   => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

const STATUS_META = {
    PENDING:          { label: "Pending",          bg: "#fff8e1", color: "#b36a00", dot: "#f97316", icon: "🕐" },
    ACCEPTED:         { label: "Accepted",         bg: "#e8f5e0", color: "#1a6a1a", dot: "#4caf50", icon: "✅" },
    PREPARING:        { label: "Preparing",        bg: "#e3f4fb", color: "#1a6a8a", dot: "#2196f3", icon: "👨‍🍳" },
    READY_FOR_PICKUP: { label: "Ready for Pickup", bg: "#f3eeff", color: "#6a3ab2", dot: "#9c27b0", icon: "📦" },
    PICKED_UP:        { label: "Picked Up",        bg: "#fff3e0", color: "#e65100", dot: "#ff9800", icon: "🛵" },
    DELIVERED:        { label: "Delivered",        bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50", icon: "🎉" },
    CANCELLED:        { label: "Cancelled",        bg: "#fdecea", color: "#c0392b", dot: "#e74c3c", icon: "❌" },
};

const TRACKER_STEPS = ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "DELIVERED"];
const isActiveOrder = (status) => !["DELIVERED", "CANCELLED"].includes(status);

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

    if (status === "CANCELLED") return (
        <div style={{ background: "#fdecea", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "14px 16px", textAlign: "center", color: "#c0392b", fontWeight: 700, fontSize: 14 }}>
            ❌ This order was cancelled
        </div>
    );

    return (
        <div style={{ padding: "4px 0 8px" }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#1a2e1a", margin: "0 0 14px" }}>
                📍 Live Order Tracking
            </p>
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 2, background: "#e8f0e8", zIndex: 0 }} />
                <div style={{ position: "absolute", left: 15, top: 8, width: 2, background: "#2d8a2d", zIndex: 1, transition: "height 0.5s ease", height: `${Math.min(100, (currentIdx / (TRACKER_STEPS.length - 1)) * 100)}%` }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {TRACKER_STEPS.map((step, idx) => {
                        const meta   = STATUS_META[step];
                        const done   = idx < currentIdx;
                        const active = idx === currentIdx;
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

// ── Map legend ────────────────────────────────────────────────────────────────
const MapLegend = ({ hasRider }) => (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
        {[
            ["🟠", "Restaurant"],
            ["🟢", "Your location"],
            ...(hasRider ? [["🟡", "Rider"]] : []),
        ].map(([emoji, label]) => (
            <span key={label} style={{ fontSize: 11, color: "#8aaa8a", display: "flex", alignItems: "center", gap: 4 }}>
                {emoji} {label}
            </span>
        ))}
    </div>
);

// ── OrderDetailModal ──────────────────────────────────────────────────────────
export const OrderDetailModal = ({ order, onClose, onRefresh }) => {
    const { geocode } = useGeocoder();

    const [restaurantCoords, setRestaurantCoords] = useState(null);
    const [customerCoords,   setCustomerCoords]   = useState(
        // Use backend-stored pin immediately if available — no geocoding needed
        order?.pinLat && order?.pinLng
            ? { lat: order.pinLat, lng: order.pinLng }
            : null
    );

    const geocodedRef = useRef({ restaurant: false, customer: false });

    if (!order) return null;
    const meta = STATUS_META[order.status] || STATUS_META.PENDING;

    // ── Geocode restaurant from order data ────────────────────────────────────
    useEffect(() => {
        if (geocodedRef.current.restaurant) return;
        geocodedRef.current.restaurant = true;

        // Prefer stored coords from backend
        if (order.restaurantLat && order.restaurantLng) {
            setRestaurantCoords({ lat: order.restaurantLat, lng: order.restaurantLng });
            return;
        }

        // Geocode from any available address text
        const address = order.vendorAddress
            || order.restaurantAddress
            || order.vendorName
            || order.groups?.[0]?.vendor?.name
            || null;

        if (address) {
            geocode(address).then(coords => {
                if (coords) setRestaurantCoords(coords);
            });
        }
    }, [order.id, geocode]);

    // ── Geocode customer delivery location from the label on the order ────────
    useEffect(() => {
        // Already resolved from pinLat/pinLng — skip geocoding
        if (order?.pinLat && order?.pinLng) return;
        if (geocodedRef.current.customer)   return;
        geocodedRef.current.customer = true;

        const label = order.deliveryLocation;
        if (!label) return;

        geocode(label).then(coords => {
            if (coords) setCustomerCoords(coords);
        });
    }, [order.id, order.deliveryLocation, geocode]);

    // Rider coords — provided by backend in real time (optional)
    const riderCoords = order.riderLat && order.riderLng
        ? { lat: order.riderLat, lng: order.riderLng }
        : null;

    const showMap = Boolean(restaurantCoords || customerCoords);

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={onClose}
        >
            <div
                style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "dbIn 0.3s cubic-bezier(.34,1.56,.64,1)", overflow: "hidden" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#1a6a1a,#2d8a2d)", padding: "22px 24px 18px", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: "0 0 3px", letterSpacing: 1.2, textTransform: "uppercase" }}>Order ID</p>
                            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, margin: 0, color: "white" }}>{order.id}</h3>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {isActiveOrder(order.status) && (
                                <button onClick={onRefresh} title="Refresh status" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                </button>
                            )}
                            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                        <StatusBadge status={order.status} size="md" />
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>· {fmtDate(order.date)} at {fmtTime(order.date)}</span>
                    </div>
                </div>

                {/* Scrollable body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

                    {/* Step tracker */}
                    <div style={{ marginBottom: 20, background: "#f9fdf9", borderRadius: 16, padding: "16px 18px", border: "1px solid #e0eee0" }}>
                        <LiveTracker status={order.status} />
                    </div>

                    {/* Delivery map */}
                    {showMap && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#1a2e1a", margin: "0 0 10px" }}>
                                🗺️ Delivery Route
                            </p>
                            <DeliveryMap
                                mode="tracking"
                                restaurantCoords={restaurantCoords}
                                restaurantName={order.groups?.[0]?.vendor?.name || order.vendorName || "Restaurant"}
                                customerCoords={customerCoords}
                                riderCoords={riderCoords}
                                deliveryLabel={order.deliveryLocation || "Delivery location"}
                                orderStatus={order.status}
                                height={210}
                                borderRadius="14px"
                            />
                            <MapLegend hasRider={Boolean(riderCoords)} />
                        </div>
                    )}

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                        {[
                            ["📍 Delivered to",  order.deliveryLocation],
                            ["💳 Payment",       order.paymentMethod],
                            ["🏠 Hostel / Room", [order.hostel, order.room].filter(Boolean).join(", ") || "—"],
                            ["💰 Total Paid",    fmt(order.totalAmount)],
                        ].map(([label, val]) => (
                            <div key={label} style={{ background: "#f4f8f4", borderRadius: 12, padding: "12px 14px" }}>
                                <p style={{ margin: 0, fontSize: 11, color: "#8aaa8a", fontWeight: 600, marginBottom: 3 }}>{label}</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a2e1a" }}>{val || "—"}</p>
                            </div>
                        ))}
                    </div>

                    {/* WhatsApp */}
                    {order.whatsappNumber && (
                        <a
                            href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, "")}`}
                            target="_blank" rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 10, background: "#e8f5e0", borderRadius: 12, padding: "10px 14px", marginBottom: 20, textDecoration: "none", color: "#1a6a1a", fontWeight: 700, fontSize: 13 }}
                        >
                            <svg width="18" height="18" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Chat on WhatsApp about this order
                        </a>
                    )}

                    {/* Order items */}
                    <h4 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2e1a", margin: "0 0 12px" }}>🍽 Order Items</h4>
                    <div style={{ background: "#f9fdf9", borderRadius: 14, overflow: "hidden", border: "1px solid #e0eee0", marginBottom: 16 }}>
                        {order.packageName && (
                            <div style={{ background: "#e8f5e0", padding: "10px 16px", borderBottom: "1px solid #e0eee0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#1a6a1a" }}>📦 {order.packageName}</span>
                                <span style={{ fontSize: 13, color: "#2d6a2d", fontWeight: 600 }}>{fmt(order.packagePrice)}</span>
                            </div>
                        )}
                        {(order.groups?.[0]?.items || []).map((item, i, arr) => (
                            <div key={item.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f7f0" : "none" }}>
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

                </div>
            </div>
        </div>
    );
};