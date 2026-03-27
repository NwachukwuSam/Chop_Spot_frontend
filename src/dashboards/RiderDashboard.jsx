// RiderDashboard.jsx
import { useState, useEffect } from "react";
import { riderApi, orderApi } from "../utils/Api.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "";
const timeAgo = (iso) => {
    if (!iso) return "";
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return fmtDate(iso);
};

// ── Shared input / label styles ───────────────────────────────────────────────
const inp = (extra = {}) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #d8eed8",
    background: "#f4f8f4",
    fontSize: 14,
    color: "#1a2e1a",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s",
    ...extra,
});

const lbl = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: "#5a7a5a",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 5,
};

const foc = (e) => {
    e.target.style.borderColor = "#2d8a2d";
    e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)";
    e.target.style.background = "#fff";
};

const blr = (e) => {
    e.target.style.borderColor = "#d8eed8";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#f4f8f4";
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
    Available: { bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50" },
    Accepted: { bg: "#e8f0ff", color: "#1a3a8a", dot: "#4070e0" },
    "Picked Up": { bg: "#fff5ef", color: "#b35000", dot: "#f97316" },
    Delivered: { bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50" },
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP.Available;
    return (
        <span
            style={{
                background: s.bg,
                color: s.color,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
            }}
        >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {status}
        </span>
    );
};

// ── Available Order Card ──────────────────────────────────────────────────────
const AvailableCard = ({ order, onAccept, onDecline }) => {
    const [expanded, setExpanded] = useState(false);

    // Format order data from backend
    const formattedOrder = {
        id: order._id || order.id,
        customer: order.customer?.firstName && order.customer?.lastName 
            ? `${order.customer.firstName} ${order.customer.lastName}`
            : order.customer?.fullName || order.customerName || "Customer",
        date: order.createdAt || new Date().toISOString(),
        deliveryFee: order.deliveryFee || 500,
        pickupFrom: order.pickupAddress || order.restaurant?.address || order.restaurantAddress || "Restaurant address",
        deliverTo: order.deliveryAddress || "Delivery address",
        items: order.items?.map(item => `${item.quantity}x ${item.name}`).join(", ") || "Food items",
        total: order.totalAmount || 0,
        phone: order.customer?.phone || order.phone || "",
        status: order.status
    };

    return (
        <div
            style={{
                background: "white",
                borderRadius: 20,
                overflow: "hidden",
                border: "1.5px solid #e0eee0",
                boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(45,138,45,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)")}
        >
            {/* Header */}
            <div
                style={{
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #f0f7f0",
                    cursor: "pointer",
                }}
                onClick={() => setExpanded((e) => !e)}
            >
                <div>
                    <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>{formattedOrder.customer}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>Order #{formattedOrder.id.slice(-6)} · {timeAgo(formattedOrder.date)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#f97316" }}>{fmt(formattedOrder.deliveryFee)}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#8aaa8a", fontWeight: 700, letterSpacing: 0.5 }}>YOUR EARN</p>
                </div>
            </div>

            {/* Route */}
            <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 3, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 6px rgba(76,175,80,0.5)" }} />
                        <div style={{ width: 1.5, height: 22, background: "linear-gradient(to bottom,#4caf50,#f97316)" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px rgba(249,115,22,0.4)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#4a6a4a" }}>
                            <span style={{ color: "#2d8a2d", fontWeight: 700 }}>Pickup: </span>
                            {formattedOrder.pickupFrom}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: "#4a6a4a" }}>
                            <span style={{ color: "#f97316", fontWeight: 700 }}>Deliver: </span>
                            {formattedOrder.deliverTo}
                        </p>
                    </div>
                </div>

                {/* Expandable details */}
                {expanded && (
                    <div style={{ marginTop: 10, padding: "12px 14px", background: "#f4f8f4", borderRadius: 12, border: "1px solid #e0eee0", fontSize: 13 }}>
                        {[
                            ["Items", formattedOrder.items],
                            ["Order Total", fmt(formattedOrder.total)],
                            ["Customer Phone", formattedOrder.phone],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ color: "#7a9a7a", fontWeight: 600 }}>{k}</span>
                                <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", maxWidth: "62%" }}>{v}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                        onClick={() => onDecline(order._id || order.id)}
                        style={{
                            flex: 1,
                            padding: "11px",
                            borderRadius: 50,
                            border: "1.5px solid #e0eee0",
                            background: "white",
                            color: "#8aaa8a",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#f5c5c5";
                            e.currentTarget.style.color = "#c0392b";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e0eee0";
                            e.currentTarget.style.color = "#8aaa8a";
                        }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => onAccept(order)}
                        style={{
                            flex: 2,
                            padding: "11px",
                            borderRadius: 50,
                            border: "none",
                            background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                            color: "white",
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: "pointer",
                            fontFamily: "'Sora',sans-serif",
                            boxShadow: "0 4px 16px rgba(45,138,45,0.3)",
                            transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        ⚡ Accept Order
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Active Delivery Card ──────────────────────────────────────────────────────
const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered }) => {
    const isPickedUp = order.riderStatus === "Picked Up";

    // Format order data
    const formattedOrder = {
        id: order._id || order.id,
        customer: order.customer?.firstName && order.customer?.lastName 
            ? `${order.customer.firstName} ${order.customer.lastName}`
            : order.customer?.fullName || order.customerName || "Customer",
        phone: order.customer?.phone || order.phone || "",
        deliveryFee: order.deliveryFee || 500,
        pickupFrom: order.pickupAddress || order.restaurant?.address || order.restaurantAddress || "Restaurant address",
        deliverTo: order.deliveryAddress || "Delivery address",
        items: order.items?.map(item => `${item.quantity}x ${item.name}`).join(", ") || "Food items"
    };

    return (
        <div
            style={{
                background: "white",
                borderRadius: 22,
                overflow: "hidden",
                border: `2px solid ${isPickedUp ? "#f97316" : "#2d8a2d"}`,
                boxShadow: `0 6px 28px ${isPickedUp ? "rgba(249,115,22,0.15)" : "rgba(45,138,45,0.15)"}`,
            }}
        >
            {/* Status bar */}
            <div
                style={{
                    background: isPickedUp ? "linear-gradient(135deg,#fff5ef,#ffe8d8)" : "linear-gradient(135deg,#e8f5e0,#d4edda)",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: isPickedUp ? "#f97316" : "#4caf50", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: isPickedUp ? "#b35000" : "#2d6a2d" }}>
                    {isPickedUp ? "🏍️ EN ROUTE — Heading to customer" : "⏳ ACCEPTED — Head to restaurant now"}
                </span>
            </div>

            <div style={{ padding: "20px" }}>
                {/* Customer + earn */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: "0 0 3px" }}>{formattedOrder.customer}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>Order #{formattedOrder.id.slice(-6)} · {formattedOrder.phone}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#f97316" }}>{fmt(formattedOrder.deliveryFee)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "#8aaa8a", fontWeight: 700 }}>YOUR EARN</p>
                    </div>
                </div>

                {/* Route block */}
                <div style={{ background: "#f4f8f4", borderRadius: 16, padding: "16px 18px", marginBottom: 18, border: "1px solid #e0eee0" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 3, flexShrink: 0 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 8px rgba(76,175,80,0.5)" }} />
                            <div style={{ width: 2, height: 26, background: "linear-gradient(to bottom,#4caf50,#f97316)" }} />
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px rgba(249,115,22,0.4)" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#8aaa8a", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Pickup from</p>
                                <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{formattedOrder.pickupFrom}</p>
                            </div>
                            <div>
                                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#8aaa8a", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Deliver to</p>
                                <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{formattedOrder.deliverTo}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: 12, borderTop: "1px solid #e0eee0", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#7a9a7a" }}>Items</span>
                        <span style={{ color: "#4a6a4a", maxWidth: "65%", textAlign: "right" }}>{formattedOrder.items}</span>
                    </div>
                </div>

                {/* Action button */}
                {!isPickedUp ? (
                    <button
                        onClick={() => onPickedUp(order._id || order.id)}
                        style={{
                            width: "100%",
                            padding: "17px",
                            borderRadius: 50,
                            border: "none",
                            background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                            color: "white",
                            fontFamily: "'Sora',sans-serif",
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 5px 20px rgba(45,138,45,0.35)",
                            transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        ✅ Order Picked Up
                    </button>
                ) : (
                    <button
                        onClick={() => onDelivered(order._id || order.id)}
                        style={{
                            width: "100%",
                            padding: "17px",
                            borderRadius: 50,
                            border: "none",
                            background: "linear-gradient(135deg,#f97316,#fb923c)",
                            color: "white",
                            fontFamily: "'Sora',sans-serif",
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 5px 20px rgba(249,115,22,0.38)",
                            transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        🎯 Mark as Delivered
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Delivery Complete Toast ───────────────────────────────────────────────────
const DeliveryToast = ({ order, onDismiss }) => (
    <div
        style={{
            position: "fixed",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            animation: "toastSlide 0.4s cubic-bezier(.34,1.56,.64,1)",
            width: "calc(100% - 32px)",
            maxWidth: 420,
        }}
    >
        <div
            style={{
                background: "white",
                border: "2px solid #4caf50",
                borderRadius: 20,
                padding: "16px 18px",
                boxShadow: "0 10px 40px rgba(45,138,45,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 14,
            }}
        >
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎉</div>
            <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a", margin: "0 0 2px" }}>Delivery Complete!</p>
                <p style={{ fontSize: 12, color: "#7a9a7a", margin: "0 0 3px" }}>Order #{order?.id?.slice(-6)} — {order?.customer}</p>
                <p style={{ fontSize: 14, color: "#f97316", fontWeight: 800, margin: 0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
            </div>
            <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#aaa", fontSize: 20, cursor: "pointer", padding: 0 }}>
                ×
            </button>
        </div>
    </div>
);

// ── History Tab ───────────────────────────────────────────────────────────────
const HistoryTab = ({ orders }) => {
    if (!orders.length) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8aaa8a" }}>
                <p style={{ fontSize: 44 }}>📭</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginTop: 12, color: "#5a7a5a" }}>No deliveries yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Accept your first order to get started</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...orders]
                .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
                .map((order, i) => (
                    <div
                        key={order.id}
                        style={{
                            background: "white",
                            borderRadius: 18,
                            padding: "15px 18px",
                            border: "1.5px solid #e0eee0",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                                <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>{order.customer}</p>
                                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8aaa8a" }}>Order #{order.id.slice(-6)}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontWeight: 800, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#10b981" }}>Delivered</p>
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>{timeAgo(order.completedAt || order.updatedAt)}</p>
                    </div>
                ))}
        </div>
    );
};

// ── Earnings Tab ──────────────────────────────────────────────────────────────
const EarningsTab = ({ completedOrders }) => {
    const totalEarned = completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalDeliveries = completedOrders.length;

    return (
        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1.5px solid #e2e8f0" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
                <p style={{ fontSize: 13, color: "#8aaa8a", margin: 0 }}>TOTAL EARNED</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 42, color: "#f97316", margin: "8px 0 0" }}>{fmt(totalEarned)}</p>
                <p style={{ fontSize: 14, color: "#10b981", marginTop: 4 }}>{totalDeliveries} deliveries</p>
            </div>

            <div style={{ background: "#f4f8f4", borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#5a7a5a", marginBottom: 12 }}>Recent Deliveries</p>
                {completedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #e0eee0" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 14 }}>{order.customer}</p>
                            <p style={{ margin: 2, fontSize: 12, color: "#8aaa8a" }}>{timeAgo(order.completedAt || order.updatedAt)}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ rider, onUpdate }) => {
    const [v, setV] = useState({
        fullName: `${rider.firstName || ""} ${rider.lastName || ""}`.trim() || rider.fullName || "",
        firstName: rider.firstName || "",
        lastName: rider.lastName || "",
        phone: rider.phone || "",
        email: rider.email || "",
        vehicleType: rider.vehicleType || "",
        vehicleNumber: rider.vehicleNumber || rider.driverLicenseNumber || "",
        bankName: rider.bankName || "",
        accountNumber: rider.accountNumber || "",
        accountName: rider.accountName || "",
    });

    const set = (key, value) => setV((prev) => ({ ...prev, [key]: value }));

    const save = async () => {
        try {
            const updateData = {
                firstName: v.firstName,
                lastName: v.lastName,
                phone: v.phone,
                email: v.email,
                vehicleType: v.vehicleType,
                vehicleNumber: v.vehicleNumber,
                bankName: v.bankName,
                accountNumber: v.accountNumber,
                accountName: v.accountName,
            };
            await riderApi.updateProfile(updateData);
            onUpdate({ ...rider, ...updateData, fullName: `${v.firstName} ${v.lastName}`.trim() });
            alert("Profile saved successfully!");
        } catch (e) {
            alert("Failed to save profile: " + e.message);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Avatar */}
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 40,
                        color: "white",
                        overflow: "hidden",
                    }}
                >
                    {rider.avatarPreview ? <img src={rider.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" /> : (v.firstName?.[0] || v.fullName?.[0] || "R")}
                </div>
            </div>

            {/* Personal Info */}
            <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1.5px solid #e0eee0" }}>
                <input 
                    value={v.firstName} 
                    onChange={(e) => set("firstName", e.target.value)} 
                    style={inp()} 
                    placeholder="First Name" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.lastName} 
                    onChange={(e) => set("lastName", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Last Name" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.phone} 
                    onChange={(e) => set("phone", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Phone Number" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.email} 
                    onChange={(e) => set("email", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Email" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
            </div>

            {/* Vehicle & Bank Info */}
            <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1.5px solid #e0eee0" }}>
                <input 
                    value={v.vehicleType} 
                    onChange={(e) => set("vehicleType", e.target.value)} 
                    style={inp()} 
                    placeholder="Vehicle Type (e.g., Motorcycle, Car)" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.vehicleNumber} 
                    onChange={(e) => set("vehicleNumber", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Plate / License Number" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.bankName} 
                    onChange={(e) => set("bankName", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Bank Name" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.accountName} 
                    onChange={(e) => set("accountName", e.target.value)} 
                    style={inp({ marginTop: 12 })} 
                    placeholder="Account Name" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
                <input 
                    value={v.accountNumber} 
                    onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} 
                    style={inp({ marginTop: 12, letterSpacing: 2 })} 
                    placeholder="Account Number" 
                    onFocus={foc} 
                    onBlur={blr} 
                />
            </div>

            <button
                onClick={save}
                style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 50,
                    border: "none",
                    background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                    color: "white",
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 5px 20px rgba(45,138,45,0.32)",
                }}
            >
                💾 Save Profile
            </button>
        </div>
    );
};

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
    { id: "orders", icon: "📋", label: "Orders" },
    { id: "history", icon: "📦", label: "History" },
    { id: "earnings", icon: "💰", label: "Earnings" },
    { id: "profile", icon: "👤", label: "Profile" },
];

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function RiderDashboard({ initialRider, onLogout }) {
    const [rider, setRider] = useState(initialRider);
    const [activeTab, setActiveTab] = useState("orders");
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [toast, setToast] = useState(null);
    const [declinedIds, setDeclinedIds] = useState([]);
    const [loading, setLoading] = useState(!initialRider);

    // Fetch available orders (pending orders not assigned to any rider)
    const fetchAvailableOrders = async () => {
        try {
            // Get all orders with status PENDING (not assigned to any rider)
            const allOrders = await orderApi.getAllOrders("PENDING");
            // Filter orders that are not assigned to any rider
            const unassigned = allOrders.filter(order => !order.riderId);
            setAvailableOrders(unassigned);
        } catch (err) {
            console.error("Failed to fetch available orders:", err);
            setAvailableOrders([]);
        }
    };

    // Fetch rider's assigned orders
    const fetchRiderOrders = async () => {
        try {
            const myOrders = await orderApi.getRiderOrders();
            
            // Separate active and completed orders
            const active = myOrders.filter(order => 
                order.status === "PICKED_UP" || 
                order.status === "PREPARING" || 
                order.status === "ACCEPTED"
            );
            const completed = myOrders.filter(order => 
                order.status === "DELIVERED"
            ).map(order => ({
                ...order,
                id: order._id,
                customer: order.customer?.firstName && order.customer?.lastName 
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : order.customer?.fullName || order.customerName,
                deliveryFee: order.deliveryFee,
                completedAt: order.updatedAt
            }));

            // If there's an active order, set it as active delivery
            if (active.length > 0) {
                const currentOrder = active[0];
                setActiveDelivery({
                    ...currentOrder,
                    id: currentOrder._id,
                    customer: currentOrder.customer?.firstName && currentOrder.customer?.lastName 
                        ? `${currentOrder.customer.firstName} ${currentOrder.customer.lastName}`
                        : currentOrder.customer?.fullName || currentOrder.customerName,
                    riderStatus: currentOrder.status === "PICKED_UP" ? "Picked Up" : "Accepted"
                });
            } else {
                setActiveDelivery(null);
            }

            setCompletedOrders(completed);
        } catch (err) {
            console.error("Failed to fetch rider orders:", err);
            setCompletedOrders([]);
        }
    };

    useEffect(() => {
        const loadRiderData = async () => {
            if (initialRider) {
                setRider(initialRider);
                setCompletedOrders(initialRider.completedOrders || []);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const profile = await riderApi.getProfile();
                // Format the profile data
                const formattedProfile = {
                    ...profile,
                    fullName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
                    vehicleNumber: profile.vehicleNumber || profile.driverLicenseNumber,
                };
                setRider(formattedProfile);
                await fetchRiderOrders();
            } catch (err) {
                console.error("Failed to load rider data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRiderData();
    }, [initialRider]);

    // Fetch available orders when online and not on active delivery
    useEffect(() => {
        if (rider?.availability === "ONLINE" && !activeDelivery) {
            fetchAvailableOrders();
            // Poll for new orders every 30 seconds
            const interval = setInterval(fetchAvailableOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [rider?.availability, activeDelivery]);

    const updateRider = (updated) => {
        const updatedWithFullName = {
            ...updated,
            fullName: `${updated.firstName || ""} ${updated.lastName || ""}`.trim()
        };
        setRider(updatedWithFullName);
        try {
            localStorage.setItem("chopspot_rider", JSON.stringify({ ...updatedWithFullName, completedOrders }));
        } catch (_) {}
    };

    const handleToggleOnline = async () => {
        const newStatus = rider.availability === "ONLINE" ? "OFFLINE" : "ONLINE";
        try {
            await riderApi.updateAvailability(newStatus);
            setRider((r) => ({ ...r, availability: newStatus }));
            if (newStatus === "OFFLINE") {
                setAvailableOrders([]);
            } else {
                fetchAvailableOrders();
            }
        } catch (e) {
            alert("Failed to update availability");
        }
    };

    const handleAccept = async (order) => {
        try {
            // Assign rider to order
            await orderApi.assignRider(order._id, rider.userId);
            
            // Update order status to PREPARING (accepted by rider)
            await orderApi.updateOrderStatus(order._id, "PREPARING");
            
            // Format customer name
            const customerName = order.customer?.firstName && order.customer?.lastName 
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : order.customer?.fullName || order.customerName;
            
            // Set as active delivery
            setActiveDelivery({ 
                ...order, 
                id: order._id,
                customer: customerName,
                riderStatus: "Accepted" 
            });
            setAvailableOrders((p) => p.filter((o) => o._id !== order._id));
            setActiveTab("orders");
            
            // Show success message
            alert("Order accepted! Head to the restaurant to pick up.");
        } catch (err) {
            console.error("Failed to accept order:", err);
            alert("Failed to accept order. Please try again.");
        }
    };

    const handleDecline = (id) => {
        setDeclinedIds((p) => [...p, id]);
        setAvailableOrders((p) => p.filter((o) => o._id !== id));
    };

    const handlePickedUp = async (orderId) => {
        try {
            await orderApi.updateOrderStatus(orderId, "PICKED_UP");
            setActiveDelivery((p) => ({ ...p, riderStatus: "Picked Up" }));
            alert("Order picked up! Deliver to customer.");
        } catch (err) {
            console.error("Failed to mark as picked up:", err);
            alert("Failed to update order status.");
        }
    };

    const handleDelivered = async (orderId) => {
        try {
            await orderApi.updateOrderStatus(orderId, "DELIVERED");
            
            const done = { 
                ...activeDelivery, 
                id: orderId,
                customer: activeDelivery.customer,
                deliveryFee: activeDelivery.deliveryFee,
                riderStatus: "Delivered", 
                completedAt: new Date().toISOString() 
            };
            const updated = [done, ...completedOrders];
            setCompletedOrders(updated);
            setActiveDelivery(null);
            setToast(done);

            updateRider({
                ...rider,
                totalDeliveries: (rider.totalDeliveries || 0) + 1,
                earnings: (rider.earnings || 0) + (done.deliveryFee || 0),
                completedOrders: updated,
            });

            setTimeout(() => setToast(null), 5000);
            
            // Refresh available orders
            if (rider.availability === "ONLINE") {
                fetchAvailableOrders();
            }
        } catch (err) {
            console.error("Failed to mark as delivered:", err);
            alert("Failed to complete delivery.");
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 48 }}>🏍️</p>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginTop: 12 }}>Loading Rider Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!rider) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 48 }}>🏍️</p>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginTop: 12 }}>No rider profile found</p>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            style={{
                                marginTop: 16,
                                padding: "12px 28px",
                                borderRadius: 50,
                                border: "none",
                                background: "#2d8a2d",
                                color: "white",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Sora',sans-serif",
                            }}
                        >
                            Register as Rider
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const isOnline = rider.availability === "ONLINE";
    const fullName = `${rider.firstName || ""} ${rider.lastName || ""}`.trim() || rider.fullName || "Rider";
    const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "R";
    const visibleOrders = availableOrders.filter((o) => !declinedIds.includes(o._id));
    const pendingCount = isOnline && !activeDelivery ? visibleOrders.length : 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                body{font-family:'DM Sans',sans-serif;background:#f0f6f0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
                @keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
                ::-webkit-scrollbar{width:5px}
                ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
                input::placeholder{color:#aac5aa}
                .tab-btn{transition:all 0.18s;}
            `}</style>

            {toast && <DeliveryToast order={toast} onDismiss={() => setToast(null)} />}

            <div style={{ minHeight: "100vh", background: "#f0f6f0", display: "flex", flexDirection: "column" }}>
                {/* Navbar */}
                <nav
                    style={{
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(18px)",
                        height: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 18px",
                        borderBottom: "1px solid rgba(45,138,45,0.12)",
                        position: "sticky",
                        top: 0,
                        zIndex: 500,
                        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏍️</div>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a6a1a" }}>
                            Chop<span style={{ color: "#f97316" }}>Spot</span>
                            <span style={{ color: "#9ab59a", fontWeight: 500, fontSize: 12, marginLeft: 6 }}>Rider</span>
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                background: isOnline ? "#e8f5e0" : "#f4f8f4",
                                border: `1px solid ${isOnline ? "#b8d8b8" : "#e0eee0"}`,
                                borderRadius: 50,
                                padding: "5px 13px 5px 9px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onClick={handleToggleOnline}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 18,
                                    borderRadius: 50,
                                    background: isOnline ? "#2d8a2d" : "#ccc",
                                    position: "relative",
                                    transition: "background 0.25s",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        background: "white",
                                        position: "absolute",
                                        top: 2,
                                        left: isOnline ? 16 : 2,
                                        transition: "left 0.25s",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#2d8a2d" : "#aaa" }}>{isOnline ? "Online" : "Offline"}</span>
                        </div>

                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 800,
                                color: "white",
                                fontFamily: "'Sora',sans-serif",
                                overflow: "hidden",
                                border: "2px solid #b8d8b8",
                            }}
                        >
                            {rider.avatarPreview ? <img src={rider.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" /> : initials}
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "20px 16px 100px" }}>
                    {!isOnline && (
                        <div
                            style={{
                                background: "white",
                                border: "1.5px solid #e0eee0",
                                borderRadius: 16,
                                padding: "14px 18px",
                                marginBottom: 18,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                animation: "fadeUp 0.3s ease",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            <span style={{ fontSize: 22 }}>😴</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>You're offline</p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8aaa8a" }}>Toggle to Online to start receiving orders</p>
                            </div>
                            <button onClick={handleToggleOnline} style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                                Go Online
                            </button>
                        </div>
                    )}

                    {activeDelivery && (
                        <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🔴 ACTIVE DELIVERY</p>
                            <ActiveDeliveryCard order={activeDelivery} onPickedUp={handlePickedUp} onDelivered={handleDelivered} />
                        </div>
                    )}

                    <div key={activeTab} style={{ animation: "fadeUp 0.28s ease" }}>
                        {activeTab === "orders" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>Available Orders</h2>
                                    <span style={{ fontSize: 12, color: "#7aaa7a", background: "white", border: "1px solid #e0eee0", padding: "4px 12px", borderRadius: 20 }}>
                                        {visibleOrders.length} near you
                                    </span>
                                </div>

                                {isOnline && !activeDelivery && visibleOrders.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "50px 0", color: "#8aaa8a" }}>
                                        <p style={{ fontSize: 40 }}>🔍</p>
                                        <p style={{ fontWeight: 700, fontSize: 15, marginTop: 10, color: "#5a7a5a" }}>No orders nearby right now</p>
                                        <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon!</p>
                                    </div>
                                )}

                                {isOnline && !activeDelivery &&
                                    visibleOrders.map((order, i) => (
                                        <div key={order._id} style={{ animation: `fadeUp 0.35s ease ${i * 0.07}s both` }}>
                                            <AvailableCard order={order} onAccept={handleAccept} onDecline={handleDecline} />
                                        </div>
                                    ))}
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>Delivery History</h2>
                                <HistoryTab orders={completedOrders} />
                            </div>
                        )}

                        {activeTab === "earnings" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>My Earnings</h2>
                                <EarningsTab completedOrders={completedOrders} />
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>My Profile</h2>
                                    {onLogout && (
                                        <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                            ← Back
                                        </button>
                                    )}
                                </div>
                                <ProfileTab rider={rider} onUpdate={updateRider} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Tab Bar */}
                <div
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(255,255,255,0.96)",
                        backdropFilter: "blur(20px)",
                        borderTop: "1px solid rgba(45,138,45,0.12)",
                        padding: "8px 16px 16px",
                        display: "flex",
                        justifyContent: "space-around",
                        zIndex: 500,
                        boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
                    }}
                >
                    {TABS.map((t) => {
                        const isActive = activeTab === t.id;
                        const hasBadge = t.id === "orders" && pendingCount > 0;
                        return (
                            <button
                                key={t.id}
                                className="tab-btn"
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 3,
                                    padding: "8px 16px",
                                    borderRadius: 14,
                                    border: "none",
                                    cursor: "pointer",
                                    background: isActive ? "#e8f5e0" : "transparent",
                                    position: "relative",
                                }}
                            >
                                <span style={{ fontSize: 22 }}>{t.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#2d8a2d" : "#8aaa8a", letterSpacing: 0.3 }}>{t.label}</span>
                                {isActive && <div style={{ position: "absolute", bottom: -2, width: 20, height: 3, borderRadius: 10, background: "#2d8a2d" }} />}
                                {hasBadge && <div style={{ position: "absolute", top: 5, right: 14, width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: "pulse 1.5s infinite" }} />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}