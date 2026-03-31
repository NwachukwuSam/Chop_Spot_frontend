// // RiderDashboard.jsx
// import { useState, useEffect, useCallback } from "react";
// import { riderApi, orderApi } from "../utils/Api.js";

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;
// const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "";
// const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "";
// const timeAgo = (iso) => {
//     if (!iso) return "";
//     const m = Math.floor((Date.now() - new Date(iso)) / 60000);
//     if (m < 1) return "just now";
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     return fmtDate(iso);
// };

// // Helper to format customer name from different possible structures
// const formatCustomerName = (customer) => {
//     if (!customer) return "Customer";
//     if (typeof customer === 'string') return customer;
//     if (customer.firstName && customer.lastName) {
//         return `${customer.firstName} ${customer.lastName}`;
//     }
//     if (customer.fullName) return customer.fullName;
//     if (customer.name) return customer.name;
//     return "Customer";
// };

// // Helper to format order data consistently
// const formatOrderData = (order) => ({
//     id: order._id || order.id,
//     customer: formatCustomerName(order.customer),
//     customerPhone: order.customer?.phone || order.phone || "",
//     date: order.createdAt || new Date().toISOString(),
//     deliveryFee: order.deliveryFee || 500,
//     pickupFrom: order.pickupAddress || order.restaurant?.address || order.restaurantAddress || "Restaurant address",
//     deliverTo: order.deliveryAddress || "Delivery address",
//     items: order.items?.map(item => `${item.quantity}x ${item.name}`).join(", ") || "Food items",
//     total: order.totalAmount || order.total || 0,
//     status: order.status,
//     riderStatus: order.riderStatus || (order.status === "PICKED_UP" ? "Picked Up" : order.status === "ACCEPTED" || order.status === "PREPARING" ? "Accepted" : "Available")
// });

// // ── Shared input / label styles ───────────────────────────────────────────────
// const inp = (extra = {}) => ({
//     width: "100%",
//     padding: "12px 14px",
//     borderRadius: 12,
//     border: "1.5px solid #d8eed8",
//     background: "#f4f8f4",
//     fontSize: 14,
//     color: "#1a2e1a",
//     fontFamily: "'DM Sans', sans-serif",
//     outline: "none",
//     boxSizing: "border-box",
//     transition: "all 0.2s",
//     ...extra,
// });

// const lbl = {
//     fontSize: 11,
//     fontWeight: 800,
//     letterSpacing: 1.4,
//     color: "#5a7a5a",
//     textTransform: "uppercase",
//     display: "block",
//     marginBottom: 5,
// };

// const foc = (e) => {
//     e.target.style.borderColor = "#2d8a2d";
//     e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)";
//     e.target.style.background = "#fff";
// };

// const blr = (e) => {
//     e.target.style.borderColor = "#d8eed8";
//     e.target.style.boxShadow = "none";
//     e.target.style.background = "#f4f8f4";
// };

// // ── Status config ─────────────────────────────────────────────────────────────
// const STATUS_MAP = {
//     Available: { bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50" },
//     Accepted: { bg: "#e8f0ff", color: "#1a3a8a", dot: "#4070e0" },
//     "Picked Up": { bg: "#fff5ef", color: "#b35000", dot: "#f97316" },
//     Delivered: { bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50" },
// };

// // ── Status badge ──────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//     const s = STATUS_MAP[status] || STATUS_MAP.Available;
//     return (
//         <span
//             style={{
//                 background: s.bg,
//                 color: s.color,
//                 fontSize: 11,
//                 fontWeight: 700,
//                 padding: "3px 10px",
//                 borderRadius: 20,
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: 5,
//             }}
//         >
//             <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
//             {status}
//         </span>
//     );
// };

// // ── Available Order Card ──────────────────────────────────────────────────────
// const AvailableCard = ({ order, onAccept, onDecline }) => {
//     const [expanded, setExpanded] = useState(false);
//     const formattedOrder = formatOrderData(order);

//     return (
//         <div
//             style={{
//                 background: "white",
//                 borderRadius: 20,
//                 overflow: "hidden",
//                 border: "1.5px solid #e0eee0",
//                 boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
//                 transition: "box-shadow 0.2s",
//             }}
//             onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(45,138,45,0.12)")}
//             onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)")}
//         >
//             {/* Header */}
//             <div
//                 style={{
//                     padding: "14px 18px",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     borderBottom: "1px solid #f0f7f0",
//                     cursor: "pointer",
//                 }}
//                 onClick={() => setExpanded((e) => !e)}
//             >
//                 <div>
//                     <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>{formattedOrder.customer}</p>
//                     <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>Order #{formattedOrder.id?.slice(-6)} · {timeAgo(formattedOrder.date)}</p>
//                 </div>
//                 <div style={{ textAlign: "right" }}>
//                     <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#f97316" }}>{fmt(formattedOrder.deliveryFee)}</p>
//                     <p style={{ margin: "2px 0 0", fontSize: 10, color: "#8aaa8a", fontWeight: 700, letterSpacing: 0.5 }}>YOUR EARN</p>
//                 </div>
//             </div>

//             {/* Route */}
//             <div style={{ padding: "14px 18px" }}>
//                 <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
//                     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 3, flexShrink: 0 }}>
//                         <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 6px rgba(76,175,80,0.5)" }} />
//                         <div style={{ width: 1.5, height: 22, background: "linear-gradient(to bottom,#4caf50,#f97316)" }} />
//                         <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 6px rgba(249,115,22,0.4)" }} />
//                     </div>
//                     <div style={{ flex: 1 }}>
//                         <p style={{ margin: "0 0 12px", fontSize: 13, color: "#4a6a4a" }}>
//                             <span style={{ color: "#2d8a2d", fontWeight: 700 }}>Pickup: </span>
//                             {formattedOrder.pickupFrom}
//                         </p>
//                         <p style={{ margin: 0, fontSize: 13, color: "#4a6a4a" }}>
//                             <span style={{ color: "#f97316", fontWeight: 700 }}>Deliver: </span>
//                             {formattedOrder.deliverTo}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Expandable details */}
//                 {expanded && (
//                     <div style={{ marginTop: 10, padding: "12px 14px", background: "#f4f8f4", borderRadius: 12, border: "1px solid #e0eee0", fontSize: 13 }}>
//                         {[
//                             ["Items", formattedOrder.items],
//                             ["Order Total", fmt(formattedOrder.total)],
//                             ["Customer Phone", formattedOrder.customerPhone],
//                         ].map(([k, v]) => (
//                             <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//                                 <span style={{ color: "#7a9a7a", fontWeight: 600 }}>{k}</span>
//                                 <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", maxWidth: "62%" }}>{v}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Actions */}
//                 <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
//                     <button
//                         onClick={() => onDecline(order)}
//                         style={{
//                             flex: 1,
//                             padding: "11px",
//                             borderRadius: 50,
//                             border: "1.5px solid #e0eee0",
//                             background: "white",
//                             color: "#8aaa8a",
//                             fontWeight: 700,
//                             fontSize: 13,
//                             cursor: "pointer",
//                             transition: "all 0.18s",
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.borderColor = "#f5c5c5";
//                             e.currentTarget.style.color = "#c0392b";
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.borderColor = "#e0eee0";
//                             e.currentTarget.style.color = "#8aaa8a";
//                         }}
//                     >
//                         Decline
//                     </button>
//                     <button
//                         onClick={() => onAccept(order)}
//                         style={{
//                             flex: 2,
//                             padding: "11px",
//                             borderRadius: 50,
//                             border: "none",
//                             background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
//                             color: "white",
//                             fontWeight: 800,
//                             fontSize: 14,
//                             cursor: "pointer",
//                             fontFamily: "'Sora',sans-serif",
//                             boxShadow: "0 4px 16px rgba(45,138,45,0.3)",
//                             transition: "transform 0.15s",
//                         }}
//                         onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//                         onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//                     >
//                         ⚡ Accept Order
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ── Active Delivery Card ──────────────────────────────────────────────────────
// const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered }) => {
//     const isPickedUp = order.riderStatus === "Picked Up";
//     const formattedOrder = formatOrderData(order);

//     return (
//         <div
//             style={{
//                 background: "white",
//                 borderRadius: 22,
//                 overflow: "hidden",
//                 border: `2px solid ${isPickedUp ? "#f97316" : "#2d8a2d"}`,
//                 boxShadow: `0 6px 28px ${isPickedUp ? "rgba(249,115,22,0.15)" : "rgba(45,138,45,0.15)"}`,
//             }}
//         >
//             {/* Status bar */}
//             <div
//                 style={{
//                     background: isPickedUp ? "linear-gradient(135deg,#fff5ef,#ffe8d8)" : "linear-gradient(135deg,#e8f5e0,#d4edda)",
//                     padding: "10px 20px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 10,
//                 }}
//             >
//                 <div style={{ width: 9, height: 9, borderRadius: "50%", background: isPickedUp ? "#f97316" : "#4caf50", animation: "pulse 1.5s infinite" }} />
//                 <span style={{ fontWeight: 700, fontSize: 13, color: isPickedUp ? "#b35000" : "#2d6a2d" }}>
//                     {isPickedUp ? "🏍️ EN ROUTE — Heading to customer" : "⏳ ACCEPTED — Head to restaurant now"}
//                 </span>
//             </div>

//             <div style={{ padding: "20px" }}>
//                 {/* Customer + earn */}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
//                     <div>
//                         <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: "0 0 3px" }}>{formattedOrder.customer}</h3>
//                         <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>Order #{formattedOrder.id?.slice(-6)} · {formattedOrder.customerPhone}</p>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                         <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#f97316" }}>{fmt(formattedOrder.deliveryFee)}</p>
//                         <p style={{ margin: "2px 0 0", fontSize: 10, color: "#8aaa8a", fontWeight: 700 }}>YOUR EARN</p>
//                     </div>
//                 </div>

//                 {/* Route block */}
//                 <div style={{ background: "#f4f8f4", borderRadius: 16, padding: "16px 18px", marginBottom: 18, border: "1px solid #e0eee0" }}>
//                     <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
//                         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 3, flexShrink: 0 }}>
//                             <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 8px rgba(76,175,80,0.5)" }} />
//                             <div style={{ width: 2, height: 26, background: "linear-gradient(to bottom,#4caf50,#f97316)" }} />
//                             <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 8px rgba(249,115,22,0.4)" }} />
//                         </div>
//                         <div style={{ flex: 1 }}>
//                             <div style={{ marginBottom: 14 }}>
//                                 <p style={{ margin: "0 0 2px", fontSize: 10, color: "#8aaa8a", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Pickup from</p>
//                                 <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{formattedOrder.pickupFrom}</p>
//                             </div>
//                             <div>
//                                 <p style={{ margin: "0 0 2px", fontSize: 10, color: "#8aaa8a", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Deliver to</p>
//                                 <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{formattedOrder.deliverTo}</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div style={{ paddingTop: 12, borderTop: "1px solid #e0eee0", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
//                         <span style={{ color: "#7a9a7a" }}>Items</span>
//                         <span style={{ color: "#4a6a4a", maxWidth: "65%", textAlign: "right" }}>{formattedOrder.items}</span>
//                     </div>
//                 </div>

//                 {/* Action button */}
//                 {!isPickedUp ? (
//                     <button
//                         onClick={() => onPickedUp(order.id || order._id)}
//                         style={{
//                             width: "100%",
//                             padding: "17px",
//                             borderRadius: 50,
//                             border: "none",
//                             background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
//                             color: "white",
//                             fontFamily: "'Sora',sans-serif",
//                             fontWeight: 800,
//                             fontSize: 16,
//                             cursor: "pointer",
//                             boxShadow: "0 5px 20px rgba(45,138,45,0.35)",
//                             transition: "transform 0.15s",
//                         }}
//                         onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//                         onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//                     >
//                         ✅ Order Picked Up
//                     </button>
//                 ) : (
//                     <button
//                         onClick={() => onDelivered(order.id || order._id)}
//                         style={{
//                             width: "100%",
//                             padding: "17px",
//                             borderRadius: 50,
//                             border: "none",
//                             background: "linear-gradient(135deg,#f97316,#fb923c)",
//                             color: "white",
//                             fontFamily: "'Sora',sans-serif",
//                             fontWeight: 800,
//                             fontSize: 16,
//                             cursor: "pointer",
//                             boxShadow: "0 5px 20px rgba(249,115,22,0.38)",
//                             transition: "transform 0.15s",
//                         }}
//                         onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//                         onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//                     >
//                         🎯 Mark as Delivered
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// // ── Delivery Complete Toast ───────────────────────────────────────────────────
// const DeliveryToast = ({ order, onDismiss }) => (
//     <div
//         style={{
//             position: "fixed",
//             top: 70,
//             left: "50%",
//             transform: "translateX(-50%)",
//             zIndex: 9999,
//             animation: "toastSlide 0.4s cubic-bezier(.34,1.56,.64,1)",
//             width: "calc(100% - 32px)",
//             maxWidth: 420,
//         }}
//     >
//         <div
//             style={{
//                 background: "white",
//                 border: "2px solid #4caf50",
//                 borderRadius: 20,
//                 padding: "16px 18px",
//                 boxShadow: "0 10px 40px rgba(45,138,45,0.2)",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 14,
//             }}
//         >
//             <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎉</div>
//             <div style={{ flex: 1 }}>
//                 <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a", margin: "0 0 2px" }}>Delivery Complete!</p>
//                 <p style={{ fontSize: 12, color: "#7a9a7a", margin: "0 0 3px" }}>Order #{order?.id?.slice(-6)} — {order?.customer}</p>
//                 <p style={{ fontSize: 14, color: "#f97316", fontWeight: 800, margin: 0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
//             </div>
//             <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#aaa", fontSize: 20, cursor: "pointer", padding: 0 }}>
//                 ×
//             </button>
//         </div>
//     </div>
// );

// // ── History Tab ───────────────────────────────────────────────────────────────
// const HistoryTab = ({ orders }) => {
//     if (!orders || orders.length === 0) {
//         return (
//             <div style={{ textAlign: "center", padding: "60px 0", color: "#8aaa8a" }}>
//                 <p style={{ fontSize: 44 }}>📭</p>
//                 <p style={{ fontWeight: 700, fontSize: 15, marginTop: 12, color: "#5a7a5a" }}>No deliveries yet</p>
//                 <p style={{ fontSize: 13, marginTop: 4 }}>Accept your first order to get started</p>
//             </div>
//         );
//     }

//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//             {[...orders]
//                 .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
//                 .map((order, i) => (
//                     <div
//                         key={order.id || order._id}
//                         style={{
//                             background: "white",
//                             borderRadius: 18,
//                             padding: "15px 18px",
//                             border: "1.5px solid #e0eee0",
//                             boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
//                             animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
//                         }}
//                     >
//                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
//                             <div>
//                                 <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15 }}>{formatCustomerName(order.customer)}</p>
//                                 <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8aaa8a" }}>Order #{(order.id || order._id)?.slice(-6)}</p>
//                             </div>
//                             <div style={{ textAlign: "right" }}>
//                                 <p style={{ margin: 0, fontWeight: 800, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
//                                 <p style={{ margin: "2px 0 0", fontSize: 11, color: "#10b981" }}>Delivered</p>
//                             </div>
//                         </div>
//                         <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>{timeAgo(order.completedAt || order.updatedAt)}</p>
//                     </div>
//                 ))}
//         </div>
//     );
// };

// // ── Earnings Tab ──────────────────────────────────────────────────────────────
// const EarningsTab = ({ completedOrders }) => {
//     const totalEarned = completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
//     const totalDeliveries = completedOrders.length;

//     return (
//         <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1.5px solid #e2e8f0" }}>
//             <div style={{ textAlign: "center", marginBottom: 30 }}>
//                 <p style={{ fontSize: 13, color: "#8aaa8a", margin: 0 }}>TOTAL EARNED</p>
//                 <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 42, color: "#f97316", margin: "8px 0 0" }}>{fmt(totalEarned)}</p>
//                 <p style={{ fontSize: 14, color: "#10b981", marginTop: 4 }}>{totalDeliveries} deliveries</p>
//             </div>

//             <div style={{ background: "#f4f8f4", borderRadius: 16, padding: 16 }}>
//                 <p style={{ fontSize: 13, fontWeight: 700, color: "#5a7a5a", marginBottom: 12 }}>Recent Deliveries</p>
//                 {completedOrders.slice(0, 5).map((order, idx) => (
//                     <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #e0eee0" }}>
//                         <div>
//                             <p style={{ margin: 0, fontSize: 14 }}>{formatCustomerName(order.customer)}</p>
//                             <p style={{ margin: 2, fontSize: 12, color: "#8aaa8a" }}>{timeAgo(order.completedAt || order.updatedAt)}</p>
//                         </div>
//                         <p style={{ fontWeight: 700, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // ── Profile Tab ───────────────────────────────────────────────────────────────
// const ProfileTab = ({ rider, onUpdate }) => {
//     const [v, setV] = useState({
//         firstName: rider.firstName || "",
//         lastName: rider.lastName || "",
//         phone: rider.phone || "",
//         email: rider.email || "",
//         vehicleType: rider.vehicleType || "",
//         vehicleNumber: rider.vehicleNumber || rider.driverLicenseNumber || "",
//         bankName: rider.bankName || "",
//         accountNumber: rider.accountNumber || "",
//         accountName: rider.accountName || "",
//     });
//     const [saving, setSaving] = useState(false);

//     const set = (key, value) => setV((prev) => ({ ...prev, [key]: value }));

//     const save = async () => {
//         try {
//             setSaving(true);
//             const updateData = {
//                 firstName: v.firstName,
//                 lastName: v.lastName,
//                 phone: v.phone,
//                 email: v.email,
//                 vehicleType: v.vehicleType,
//                 vehicleNumber: v.vehicleNumber,
//                 bankName: v.bankName,
//                 accountNumber: v.accountNumber,
//                 accountName: v.accountName,
//             };
//             const updatedProfile = await riderApi.updateProfile(updateData);
//             onUpdate({ ...rider, ...updatedProfile, ...updateData });
//             alert("Profile saved successfully!");
//         } catch (e) {
//             alert("Failed to save profile: " + (e.message || "Please try again"));
//         } finally {
//             setSaving(false);
//         }
//     };

//     const fullName = `${v.firstName} ${v.lastName}`.trim();
//     const initials = fullName ? fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "R";

//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             {/* Avatar */}
//             <div style={{ textAlign: "center" }}>
//                 <div
//                     style={{
//                         width: 100,
//                         height: 100,
//                         borderRadius: "50%",
//                         background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
//                         margin: "0 auto 12px",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: 40,
//                         color: "white",
//                         overflow: "hidden",
//                     }}
//                 >
//                     {rider.avatarPreview ? <img src={rider.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" /> : initials}
//                 </div>
//             </div>

//             {/* Personal Info */}
//             <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1.5px solid #e0eee0" }}>
//                 <input 
//                     value={v.firstName} 
//                     onChange={(e) => set("firstName", e.target.value)} 
//                     style={inp()} 
//                     placeholder="First Name" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.lastName} 
//                     onChange={(e) => set("lastName", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Last Name" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.phone} 
//                     onChange={(e) => set("phone", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Phone Number" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.email} 
//                     onChange={(e) => set("email", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Email" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//             </div>

//             {/* Vehicle & Bank Info */}
//             <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1.5px solid #e0eee0" }}>
//                 <input 
//                     value={v.vehicleType} 
//                     onChange={(e) => set("vehicleType", e.target.value)} 
//                     style={inp()} 
//                     placeholder="Vehicle Type (e.g., Motorcycle, Car)" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.vehicleNumber} 
//                     onChange={(e) => set("vehicleNumber", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Plate / License Number" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.bankName} 
//                     onChange={(e) => set("bankName", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Bank Name" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.accountName} 
//                     onChange={(e) => set("accountName", e.target.value)} 
//                     style={inp({ marginTop: 12 })} 
//                     placeholder="Account Name" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//                 <input 
//                     value={v.accountNumber} 
//                     onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} 
//                     style={inp({ marginTop: 12, letterSpacing: 2 })} 
//                     placeholder="Account Number" 
//                     onFocus={foc} 
//                     onBlur={blr} 
//                 />
//             </div>

//             <button
//                 onClick={save}
//                 disabled={saving}
//                 style={{
//                     width: "100%",
//                     padding: "16px",
//                     borderRadius: 50,
//                     border: "none",
//                     background: saving ? "#ccc" : "linear-gradient(135deg,#2d8a2d,#4caf50)",
//                     color: "white",
//                     fontFamily: "'Sora',sans-serif",
//                     fontWeight: 800,
//                     fontSize: 16,
//                     cursor: saving ? "not-allowed" : "pointer",
//                     boxShadow: saving ? "none" : "0 5px 20px rgba(45,138,45,0.32)",
//                 }}
//             >
//                 {saving ? "Saving..." : "💾 Save Profile"}
//             </button>
//         </div>
//     );
// };

// // ── TABS ──────────────────────────────────────────────────────────────────────
// const TABS = [
//     { id: "orders", icon: "📋", label: "Orders" },
//     { id: "history", icon: "📦", label: "History" },
//     { id: "earnings", icon: "💰", label: "Earnings" },
//     { id: "profile", icon: "👤", label: "Profile" },
// ];

// // ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
// export default function RiderDashboard({ initialRider, onLogout }) {
//     const [rider, setRider] = useState(initialRider || null);
//     const [activeTab, setActiveTab] = useState("orders");
//     const [availableOrders, setAvailableOrders] = useState([]);
//     const [activeDelivery, setActiveDelivery] = useState(null);
//     const [completedOrders, setCompletedOrders] = useState([]);
//     const [toast, setToast] = useState(null);
//     const [declinedOrders, setDeclinedOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Fetch available orders (pending orders not assigned to any rider)
//     const fetchAvailableOrders = useCallback(async () => {
//         if (!rider?.availability === "ONLINE") return;
        
//         try {
//             setError(null);
//             // Get all orders with status PENDING
//             const allOrders = await orderApi.getAllOrders("PENDING");
            
//             // Filter: not assigned to any rider AND not declined
//             const available = allOrders.filter(order => 
//                 !order.riderId && !declinedOrders.includes(order._id)
//             );
            
//             setAvailableOrders(available);
//         } catch (err) {
//             console.error("Failed to fetch available orders:", err);
//             setError("Could not load available orders");
//         }
//     }, [rider?.availability, declinedOrders]);

//     // Fetch rider's assigned orders
//     const fetchRiderOrders = useCallback(async () => {
//         try {
//             const myOrders = await orderApi.getRiderOrders();
            
//             if (!myOrders || !Array.isArray(myOrders)) {
//                 setCompletedOrders([]);
//                 setActiveDelivery(null);
//                 return;
//             }

//             // Separate active and completed orders
//             const active = myOrders.filter(order => 
//                 order.status === "PICKED_UP" || 
//                 order.status === "PREPARING" || 
//                 order.status === "ACCEPTED"
//             );
            
//             const completed = myOrders
//                 .filter(order => order.status === "DELIVERED")
//                 .map(order => ({
//                     ...order,
//                     id: order._id,
//                     customer: formatCustomerName(order.customer),
//                     deliveryFee: order.deliveryFee,
//                     completedAt: order.updatedAt
//                 }));

//             // Set active delivery if exists
//             if (active.length > 0) {
//                 const currentOrder = active[0];
//                 setActiveDelivery({
//                     ...currentOrder,
//                     id: currentOrder._id,
//                     customer: formatCustomerName(currentOrder.customer),
//                     riderStatus: currentOrder.status === "PICKED_UP" ? "Picked Up" : "Accepted"
//                 });
//             } else {
//                 setActiveDelivery(null);
//             }

//             setCompletedOrders(completed);
//         } catch (err) {
//             console.error("Failed to fetch rider orders:", err);
//             setCompletedOrders([]);
//         }
//     }, []);

//     // Load rider profile
//     const loadRiderProfile = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);
            
//             let profile;
//             if (initialRider) {
//                 profile = initialRider;
//             } else {
//                 profile = await riderApi.getProfile();
//             }
            
//             // Format profile data
//             const formattedProfile = {
//                 ...profile,
//                 fullName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
//                 availability: profile.availability || "OFFLINE",
//                 vehicleNumber: profile.vehicleNumber || profile.driverLicenseNumber,
//                 userId: profile.userId || profile._id,
//                 totalDeliveries: profile.totalDeliveries || 0,
//                 earnings: profile.earnings || 0
//             };
            
//             setRider(formattedProfile);
            
//             // Store in localStorage for persistence
//             try {
//                 localStorage.setItem("chopspot_rider", JSON.stringify(formattedProfile));
//             } catch (e) {
//                 console.error("Failed to save to localStorage");
//             }
            
//         } catch (err) {
//             console.error("Failed to load rider profile:", err);
//             setError("Could not load your profile. Please try again.");
            
//             // Try to load from localStorage as fallback
//             try {
//                 const stored = localStorage.getItem("chopspot_rider");
//                 if (stored) {
//                     const parsed = JSON.parse(stored);
//                     setRider(parsed);
//                     setError(null);
//                 }
//             } catch (e) {
//                 console.error("Failed to parse stored rider data");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [initialRider]);

//     // Initial load
//     useEffect(() => {
//         loadRiderProfile();
//     }, [loadRiderProfile]);

//     // Load orders when rider is loaded
//     useEffect(() => {
//         if (rider) {
//             fetchRiderOrders();
//         }
//     }, [rider, fetchRiderOrders]);

//     // Fetch available orders when online and not on active delivery
//     useEffect(() => {
//         if (rider?.availability === "ONLINE" && !activeDelivery) {
//             fetchAvailableOrders();
            
//             // Poll for new orders every 30 seconds
//             const interval = setInterval(fetchAvailableOrders, 30000);
//             return () => clearInterval(interval);
//         }
//     }, [rider?.availability, activeDelivery, fetchAvailableOrders]);

//     // Update rider and persist to localStorage
//     const updateRider = useCallback((updated) => {
//         const updatedWithFullName = {
//             ...updated,
//             fullName: `${updated.firstName || ""} ${updated.lastName || ""}`.trim()
//         };
//         setRider(updatedWithFullName);
//         try {
//             localStorage.setItem("chopspot_rider", JSON.stringify(updatedWithFullName));
//         } catch (e) {
//             console.error("Failed to save to localStorage");
//         }
//     }, []);

//     // Toggle online/offline status
//     const handleToggleOnline = async () => {
//         if (!rider) return;
        
//         const newStatus = rider.availability === "ONLINE" ? "OFFLINE" : "ONLINE";
//         const oldStatus = rider.availability;
        
//         // Optimistic update
//         setRider(prev => ({ ...prev, availability: newStatus }));
        
//         try {
//             await riderApi.updateAvailability(newStatus);
            
//             if (newStatus === "OFFLINE") {
//                 setAvailableOrders([]);
//             } else {
//                 await fetchAvailableOrders();
//             }
//         } catch (err) {
//             console.error("Failed to update availability:", err);
//             // Rollback on error
//             setRider(prev => ({ ...prev, availability: oldStatus }));
//             alert("Failed to update availability. Please try again.");
//         }
//     };

//     // Accept an order
//     const handleAccept = async (order) => {
//         if (!rider?.userId) {
//             alert("Unable to accept order: Rider ID not found");
//             return;
//         }
        
//         try {
//             // Assign rider to order
//             await orderApi.assignRider(order._id, rider.userId);
            
//             // Update order status to PREPARING (accepted by rider)
//             await orderApi.updateOrderStatus(order._id, "PREPARING");
            
//             // Format and set as active delivery
//             const customerName = formatCustomerName(order.customer);
//             setActiveDelivery({ 
//                 ...order, 
//                 id: order._id,
//                 customer: customerName,
//                 riderStatus: "Accepted" 
//             });
            
//             // Remove from available orders
//             setAvailableOrders(prev => prev.filter(o => o._id !== order._id));
//             setActiveTab("orders");
            
//             alert("Order accepted! Head to the restaurant to pick up.");
//         } catch (err) {
//             console.error("Failed to accept order:", err);
//             alert("Failed to accept order. Please try again.");
//         }
//     };

//     // Decline an order
//     const handleDecline = (order) => {
//         const orderId = order._id || order.id;
//         setDeclinedOrders(prev => [...prev, orderId]);
//         setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
//     };

//     // Mark order as picked up
//     const handlePickedUp = async (orderId) => {
//         try {
//             await orderApi.updateOrderStatus(orderId, "PICKED_UP");
//             setActiveDelivery(prev => ({ ...prev, riderStatus: "Picked Up" }));
//             alert("Order picked up! Deliver to customer.");
//         } catch (err) {
//             console.error("Failed to mark as picked up:", err);
//             alert("Failed to update order status.");
//         }
//     };

//     // Mark order as delivered
//     const handleDelivered = async (orderId) => {
//         try {
//             await orderApi.updateOrderStatus(orderId, "DELIVERED");
            
//             const completedOrder = { 
//                 ...activeDelivery, 
//                 id: orderId,
//                 customer: activeDelivery.customer,
//                 deliveryFee: activeDelivery.deliveryFee,
//                 completedAt: new Date().toISOString() 
//             };
            
//             const updatedCompleted = [completedOrder, ...completedOrders];
//             setCompletedOrders(updatedCompleted);
//             setActiveDelivery(null);
//             setToast(completedOrder);

//             // Update rider stats
//             updateRider({
//                 ...rider,
//                 totalDeliveries: (rider.totalDeliveries || 0) + 1,
//                 earnings: (rider.earnings || 0) + (completedOrder.deliveryFee || 0)
//             });

//             setTimeout(() => setToast(null), 5000);
            
//             // Refresh available orders if online
//             if (rider.availability === "ONLINE") {
//                 fetchAvailableOrders();
//             }
//         } catch (err) {
//             console.error("Failed to mark as delivered:", err);
//             alert("Failed to complete delivery.");
//         }
//     };

//     if (loading) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)" }}>
//                 <div style={{ textAlign: "center" }}>
//                     <p style={{ fontSize: 48 }}>🏍️</p>
//                     <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginTop: 12 }}>Loading Rider Dashboard...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error && !rider) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
//                 <div style={{ textAlign: "center", background: "white", padding: 32, borderRadius: 24, maxWidth: 400 }}>
//                     <p style={{ fontSize: 48 }}>⚠️</p>
//                     <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 16, color: "#c0392b", marginBottom: 24 }}>{error}</p>
//                     <button
//                         onClick={loadRiderProfile}
//                         style={{
//                             padding: "12px 28px",
//                             borderRadius: 50,
//                             border: "none",
//                             background: "#2d8a2d",
//                             color: "white",
//                             fontWeight: 700,
//                             cursor: "pointer",
//                             fontFamily: "'Sora',sans-serif",
//                             marginRight: 12
//                         }}
//                     >
//                         Try Again
//                     </button>
//                     {onLogout && (
//                         <button
//                             onClick={onLogout}
//                             style={{
//                                 padding: "12px 28px",
//                                 borderRadius: 50,
//                                 border: "1.5px solid #d0e8d0",
//                                 background: "white",
//                                 color: "#2d8a2d",
//                                 fontWeight: 600,
//                                 cursor: "pointer"
//                             }}
//                         >
//                             Back to Login
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     }

//     if (!rider) {
//         return (
//             <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
//                 <div style={{ textAlign: "center" }}>
//                     <p style={{ fontSize: 48 }}>🏍️</p>
//                     <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginTop: 12 }}>No rider profile found</p>
//                     {onLogout && (
//                         <button
//                             onClick={onLogout}
//                             style={{
//                                 marginTop: 16,
//                                 padding: "12px 28px",
//                                 borderRadius: 50,
//                                 border: "none",
//                                 background: "#2d8a2d",
//                                 color: "white",
//                                 fontWeight: 700,
//                                 cursor: "pointer",
//                                 fontFamily: "'Sora',sans-serif",
//                             }}
//                         >
//                             Register as Rider
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     }

//     const isOnline = rider.availability === "ONLINE";
//     const fullName = `${rider.firstName || ""} ${rider.lastName || ""}`.trim() || rider.fullName || "Rider";
//     const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "R";
//     const visibleOrders = availableOrders.filter((o) => !declinedOrders.includes(o._id));
//     const pendingCount = isOnline && !activeDelivery ? visibleOrders.length : 0;

//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
//                 *{box-sizing:border-box;margin:0;padding:0;}
//                 body{font-family:'DM Sans',sans-serif;background:#f0f6f0;}
//                 @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
//                 @keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
//                 @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
//                 ::-webkit-scrollbar{width:5px}
//                 ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
//                 input::placeholder{color:#aac5aa}
//                 .tab-btn{transition:all 0.18s;}
//             `}</style>

//             {toast && <DeliveryToast order={toast} onDismiss={() => setToast(null)} />}

//             <div style={{ minHeight: "100vh", background: "#f0f6f0", display: "flex", flexDirection: "column" }}>
//                 {/* Navbar */}
//                 <nav
//                     style={{
//                         background: "rgba(255,255,255,0.92)",
//                         backdropFilter: "blur(18px)",
//                         height: 60,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         padding: "0 18px",
//                         borderBottom: "1px solid rgba(45,138,45,0.12)",
//                         position: "sticky",
//                         top: 0,
//                         zIndex: 500,
//                         boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
//                     }}
//                 >
//                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                         <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏍️</div>
//                         <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a6a1a" }}>
//                             Chop<span style={{ color: "#f97316" }}>Spot</span>
//                             <span style={{ color: "#9ab59a", fontWeight: 500, fontSize: 12, marginLeft: 6 }}>Rider</span>
//                         </span>
//                     </div>

//                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                         <div
//                             style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 7,
//                                 background: isOnline ? "#e8f5e0" : "#f4f8f4",
//                                 border: `1px solid ${isOnline ? "#b8d8b8" : "#e0eee0"}`,
//                                 borderRadius: 50,
//                                 padding: "5px 13px 5px 9px",
//                                 cursor: "pointer",
//                                 transition: "all 0.2s",
//                             }}
//                             onClick={handleToggleOnline}
//                         >
//                             <div
//                                 style={{
//                                     width: 32,
//                                     height: 18,
//                                     borderRadius: 50,
//                                     background: isOnline ? "#2d8a2d" : "#ccc",
//                                     position: "relative",
//                                     transition: "background 0.25s",
//                                     flexShrink: 0,
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         width: 14,
//                                         height: 14,
//                                         borderRadius: "50%",
//                                         background: "white",
//                                         position: "absolute",
//                                         top: 2,
//                                         left: isOnline ? 16 : 2,
//                                         transition: "left 0.25s",
//                                         boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
//                                     }}
//                                 />
//                             </div>
//                             <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#2d8a2d" : "#aaa" }}>{isOnline ? "Online" : "Offline"}</span>
//                         </div>

//                         <div
//                             style={{
//                                 width: 36,
//                                 height: 36,
//                                 borderRadius: "50%",
//                                 background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 fontSize: 13,
//                                 fontWeight: 800,
//                                 color: "white",
//                                 fontFamily: "'Sora',sans-serif",
//                                 overflow: "hidden",
//                                 border: "2px solid #b8d8b8",
//                             }}
//                         >
//                             {rider.avatarPreview ? <img src={rider.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" /> : initials}
//                         </div>
//                     </div>
//                 </nav>

//                 {/* Content */}
//                 <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "20px 16px 100px" }}>
//                     {!isOnline && (
//                         <div
//                             style={{
//                                 background: "white",
//                                 border: "1.5px solid #e0eee0",
//                                 borderRadius: 16,
//                                 padding: "14px 18px",
//                                 marginBottom: 18,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 12,
//                                 animation: "fadeUp 0.3s ease",
//                                 boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
//                             }}
//                         >
//                             <span style={{ fontSize: 22 }}>😴</span>
//                             <div style={{ flex: 1 }}>
//                                 <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>You're offline</p>
//                                 <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8aaa8a" }}>Toggle to Online to start receiving orders</p>
//                             </div>
//                             <button onClick={handleToggleOnline} style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
//                                 Go Online
//                             </button>
//                         </div>
//                     )}

//                     {activeDelivery && (
//                         <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
//                             <p style={{ fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🔴 ACTIVE DELIVERY</p>
//                             <ActiveDeliveryCard order={activeDelivery} onPickedUp={handlePickedUp} onDelivered={handleDelivered} />
//                         </div>
//                     )}

//                     <div key={activeTab} style={{ animation: "fadeUp 0.28s ease" }}>
//                         {activeTab === "orders" && (
//                             <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                                     <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>Available Orders</h2>
//                                     <span style={{ fontSize: 12, color: "#7aaa7a", background: "white", border: "1px solid #e0eee0", padding: "4px 12px", borderRadius: 20 }}>
//                                         {visibleOrders.length} near you
//                                     </span>
//                                 </div>

//                                 {isOnline && !activeDelivery && visibleOrders.length === 0 && (
//                                     <div style={{ textAlign: "center", padding: "50px 0", color: "#8aaa8a" }}>
//                                         <p style={{ fontSize: 40 }}>🔍</p>
//                                         <p style={{ fontWeight: 700, fontSize: 15, marginTop: 10, color: "#5a7a5a" }}>No orders nearby right now</p>
//                                         <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon!</p>
//                                     </div>
//                                 )}

//                                 {isOnline && !activeDelivery &&
//                                     visibleOrders.map((order, i) => (
//                                         <div key={order._id} style={{ animation: `fadeUp 0.35s ease ${i * 0.07}s both` }}>
//                                             <AvailableCard order={order} onAccept={handleAccept} onDecline={handleDecline} />
//                                         </div>
//                                     ))}
//                             </div>
//                         )}

//                         {activeTab === "history" && (
//                             <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                                 <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>Delivery History</h2>
//                                 <HistoryTab orders={completedOrders} />
//                             </div>
//                         )}

//                         {activeTab === "earnings" && (
//                             <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                                 <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>My Earnings</h2>
//                                 <EarningsTab completedOrders={completedOrders} />
//                             </div>
//                         )}

//                         {activeTab === "profile" && (
//                             <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                                     <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>My Profile</h2>
//                                     {onLogout && (
//                                         <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
//                                             ← Back
//                                         </button>
//                                     )}
//                                 </div>
//                                 <ProfileTab rider={rider} onUpdate={updateRider} />
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Bottom Tab Bar */}
//                 <div
//                     style={{
//                         position: "fixed",
//                         bottom: 0,
//                         left: 0,
//                         right: 0,
//                         background: "rgba(255,255,255,0.96)",
//                         backdropFilter: "blur(20px)",
//                         borderTop: "1px solid rgba(45,138,45,0.12)",
//                         padding: "8px 16px 16px",
//                         display: "flex",
//                         justifyContent: "space-around",
//                         zIndex: 500,
//                         boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
//                     }}
//                 >
//                     {TABS.map((t) => {
//                         const isActive = activeTab === t.id;
//                         const hasBadge = t.id === "orders" && pendingCount > 0;
//                         return (
//                             <button
//                                 key={t.id}
//                                 className="tab-btn"
//                                 onClick={() => setActiveTab(t.id)}
//                                 style={{
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     alignItems: "center",
//                                     gap: 3,
//                                     padding: "8px 16px",
//                                     borderRadius: 14,
//                                     border: "none",
//                                     cursor: "pointer",
//                                     background: isActive ? "#e8f5e0" : "transparent",
//                                     position: "relative",
//                                 }}
//                             >
//                                 <span style={{ fontSize: 22 }}>{t.icon}</span>
//                                 <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#2d8a2d" : "#8aaa8a", letterSpacing: 0.3 }}>{t.label}</span>
//                                 {isActive && <div style={{ position: "absolute", bottom: -2, width: 20, height: 3, borderRadius: 10, background: "#2d8a2d" }} />}
//                                 {hasBadge && <div style={{ position: "absolute", top: 5, right: 14, width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: "pulse 1.5s infinite" }} />}
//                             </button>
//                         );
//                     })}
//                 </div>
//             </div>
//         </>
//     );
// }

// TastycartRiderDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { riderApi, orderApi } from "../utils/Api.js";

// ─── Brand tokens (matches Tastycart vendor dashboard) ────────────────────────
const T = {
  green:      "#1a5c1a",
  greenMid:   "#2d8a2d",
  greenLight: "#e8f5e0",
  greenPale:  "#f2faf2",
  orange:     "#f28c00",
  orangeLight:"#fff7e6",
  orangeDark: "#c97000",
  dark:       "#0f2410",
  ink:        "#1c2e1c",
  muted:      "#5a7a5a",
  border:     "#d6ebd6",
  white:      "#ffffff",
  offWhite:   "#f8fdf8",
  red:        "#c0392b",
  redLight:   "#fdecea",
  blue:       "#1a4a8a",
  blueLight:  "#e8f0ff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = n => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" }) : "";
const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" }) : "";
const timeAgo = iso => {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(iso);
};

const getCustomerName = c => {
  if (!c) return "Customer";
  if (typeof c === "string") return c;
  if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
  return c.fullName || c.name || "Customer";
};

const normaliseOrder = o => ({
  id:           o._id || o.id,
  customer:     getCustomerName(o.customer),
  customerPhone:o.customer?.phone || o.phone || "",
  date:         o.createdAt || new Date().toISOString(),
  deliveryFee:  o.deliveryFee || 500,
  pickupFrom:   o.pickupAddress || o.restaurant?.address || o.restaurantAddress || "Restaurant",
  deliverTo:    o.deliveryAddress || "Customer address",
  items:        (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(", ") || "Food items",
  total:        o.totalAmount || o.total || 0,
  status:       o.status,
  riderStatus:  o.riderStatus || (o.status==="PICKED_UP" ? "Picked Up" : o.status==="ACCEPTED"||o.status==="PREPARING" ? "Accepted" : "Available"),
  completedAt:  o.completedAt || o.updatedAt,
});

// ─── Tastycart Logo SVG ───────────────────────────────────────────────────────
const TastycartLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 30 Q10 30 8 35 L20 35" stroke={T.green} strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M6 38 L8 38 M4 42 L7 42" stroke={T.green} strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M20 35 Q22 20 55 20 L75 20 L80 35 L20 35Z" stroke={T.green} strokeWidth="3.5" fill="none"/>
    <path d="M20 35 L80 35" stroke={T.green} strokeWidth="3.5"/>
    <path d="M25 35 L30 58 L70 58 L75 35" stroke={T.green} strokeWidth="3.5" fill="none"/>
    <path d="M46 22 Q50 14 54 22" stroke={T.orange} strokeWidth="3" fill="none"/>
    <circle cx="50" cy="21" r="2.5" fill={T.green}/>
    <path d="M47 16 Q49 10 50 8 Q51 10 52 16" stroke={T.orange} strokeWidth="2.5" fill="none"/>
    <path d="M44 14 Q47 8 49 7" stroke={T.green} strokeWidth="2" fill="none"/>
    <circle cx="35" cy="64" r="6" stroke={T.green} strokeWidth="3.5" fill="none"/>
    <circle cx="65" cy="64" r="6" stroke={T.green} strokeWidth="3.5" fill="none"/>
    <path d="M26 54 L74 54" stroke={T.orange} strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M28 58 L72 58" stroke={T.orange} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 28, color = T.greenMid }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", border:`3px solid ${T.border}`, borderTopColor:color, animation:"spin .7s linear infinite", flexShrink:0 }} />
);

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${T.offWhite}; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:4px; }
  input::placeholder, textarea::placeholder { color:#aabcaa; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes modalIn  { from{opacity:0;transform:scale(.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes toastIn  { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes routeDash{ to{stroke-dashoffset:0} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 6px 2px rgba(242,140,0,.4)} 50%{box-shadow:0 0 14px 5px rgba(242,140,0,.7)} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }

  .card { background:white; border-radius:20px; border:1px solid ${T.border}; }
  .btn-primary { background:linear-gradient(135deg,${T.green},${T.greenMid}); color:white; border:none; cursor:pointer; font-weight:700; border-radius:50px; font-family:'DM Sans',sans-serif; transition:all .2s; }
  .btn-primary:hover { box-shadow:0 6px 20px rgba(26,92,26,.35); transform:translateY(-1px); }
  .btn-primary:disabled { background:#c8dcc8; color:#8aaa8a; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
  .btn-outline { background:white; border:1.5px solid ${T.border}; color:${T.muted}; cursor:pointer; font-weight:600; border-radius:50px; font-family:'DM Sans',sans-serif; transition:all .2s; }
  .btn-outline:hover { border-color:${T.greenMid}; color:${T.green}; }
  .btn-danger { background:white; border:1.5px solid #fcc; color:${T.red}; cursor:pointer; font-weight:600; border-radius:50px; font-family:'DM Sans',sans-serif; transition:all .2s; }
  .btn-danger:hover { background:${T.redLight}; border-color:#f5a5a5; }
  .input-field { width:100%; padding:11px 14px; border-radius:12px; border:1.5px solid ${T.border}; background:${T.offWhite}; font-family:'DM Sans',sans-serif; font-size:14px; color:${T.ink}; outline:none; transition:all .2s; }
  .input-field:focus { border-color:${T.greenMid}; box-shadow:0 0 0 3px rgba(45,138,45,.1); background:white; }
  .label { display:block; font-size:11px; font-weight:700; letter-spacing:1.2px; color:${T.muted}; text-transform:uppercase; margin-bottom:5px; }
  .tab-btn { transition:all .18s; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .tab-btn:hover:not(.active) { background:${T.greenLight} !important; }
  .order-card { transition:box-shadow .2s, transform .18s; }
  .order-card:hover { box-shadow:0 8px 28px rgba(26,92,26,.14) !important; transform:translateY(-2px); }
  .nav-item { transition:all .18s; }
  .nav-item.active { background:linear-gradient(135deg,${T.green},${T.greenMid}) !important; color:white !important; box-shadow:0 4px 16px rgba(26,92,26,.28) !important; }
  .nav-item:not(.active):hover { background:${T.greenLight} !important; color:${T.green} !important; }

  @media (min-width: 769px) {
    .bottom-nav { display:none !important; }
    .desktop-sidebar { display:flex !important; }
    .main-with-sidebar { margin-left:230px !important; }
    .mobile-topbar-toggle { display:none !important; }
  }
  @media (max-width: 768px) {
    .desktop-sidebar { display:none !important; }
    .main-with-sidebar { margin-left:0 !important; }
  }
`;

// ─── Route Visualiser (animated SVG path) ────────────────────────────────────
const RouteViz = ({ from, to, compact = false }) => (
  <div style={{ position:"relative", padding: compact ? "12px 14px" : "16px 18px", background:T.offWhite, borderRadius:16, border:`1px solid ${T.border}` }}>
    <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
      {/* Animated route line */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:3, flexShrink:0, gap:0 }}>
        <div style={{ width:12, height:12, borderRadius:"50%", background:T.greenMid, boxShadow:`0 0 8px ${T.greenMid}88`, flexShrink:0 }} />
        <svg width="2" height={compact?22:30} viewBox={`0 0 2 ${compact?22:30}`} style={{ overflow:"visible" }}>
          <line x1="1" y1="0" x2="1" y2={compact?22:30}
            stroke={`url(#routeGrad)`} strokeWidth="2" strokeDasharray="4 3"
            style={{ animation:"routeDash 1.2s ease infinite" }}
          />
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.greenMid}/>
              <stop offset="100%" stopColor={T.orange}/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{ width:12, height:12, borderRadius:"50%", background:T.orange, boxShadow:`0 0 8px ${T.orange}88`, flexShrink:0 }} />
      </div>
      {/* Addresses */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ marginBottom: compact?10:14 }}>
          <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.greenMid, letterSpacing:1.2, textTransform:"uppercase" }}>Pickup</p>
          <p style={{ margin:0, fontSize:compact?12:13, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{from}</p>
        </div>
        <div>
          <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.orange, letterSpacing:1.2, textTransform:"uppercase" }}>Deliver to</p>
          <p style={{ margin:0, fontSize:compact?12:13, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{to}</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const SBADGE = {
  Available: { bg:T.greenLight,   color:T.green,      dot:T.greenMid   },
  Accepted:  { bg:T.blueLight,    color:T.blue,       dot:"#4a80e0"    },
  "Picked Up":{ bg:T.orangeLight, color:T.orangeDark, dot:T.orange     },
  Delivered: { bg:T.greenLight,   color:T.green,      dot:T.greenMid   },
  ONLINE:    { bg:T.greenLight,   color:T.green,      dot:T.greenMid   },
  OFFLINE:   { bg:"#f5f5f5",      color:"#999",       dot:"#ccc"       },
};
const StatusBadge = ({ status }) => {
  const s = SBADGE[status] || SBADGE.Available;
  return (
    <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }}/>
      {status}
    </span>
  );
};

// ─── Online Toggle ────────────────────────────────────────────────────────────
const OnlineToggle = ({ isOnline, onToggle, size = "md" }) => {
  const sm = size === "sm";
  return (
    <div onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:sm?6:8, cursor:"pointer", userSelect:"none", padding:sm?"5px 11px":"6px 14px", borderRadius:50, background:isOnline?T.greenLight:"#f5f5f5", border:`1.5px solid ${isOnline?T.border:"#e0e0e0"}`, transition:"all .2s" }}>
      <div style={{ width:sm?30:36, height:sm?17:20, borderRadius:50, background:isOnline?T.greenMid:"#ccc", position:"relative", transition:"background .25s", flexShrink:0 }}>
        <div style={{ width:sm?12:15, height:sm?12:15, borderRadius:"50%", background:"white", position:"absolute", top:sm?2.5:2.5, left:isOnline?sm?15:19:sm?2:2, transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
      </div>
      <span style={{ fontSize:sm?11:12, fontWeight:700, color:isOnline?T.green:"#aaa", whiteSpace:"nowrap" }}>{isOnline?"Online":"Offline"}</span>
    </div>
  );
};

// ─── Available Order Card ─────────────────────────────────────────────────────
const AvailableCard = ({ order, onAccept, onDecline, delay = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const o = normaliseOrder(order);

  return (
    <div className="card order-card" style={{ overflow:"hidden", boxShadow:"0 2px 14px rgba(0,0,0,.06)", animation:`fadeUp .4s ease ${delay}s both` }}>
      {/* Earn stripe */}
      <div style={{ background:`linear-gradient(135deg, ${T.dark}, ${T.green})`, padding:"11px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:T.orange, animation:"pulse 1.5s infinite" }}/>
          <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.65)", letterSpacing:.8 }}>NEW ORDER</span>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.orange, lineHeight:1 }}>{fmt(o.deliveryFee)}</p>
          <p style={{ margin:0, fontSize:9, color:"rgba(255,255,255,.4)", fontWeight:700, letterSpacing:.8 }}>YOUR EARN</p>
        </div>
      </div>

      <div style={{ padding:"16px 18px" }}>
        {/* Customer row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>{o.customer}</p>
            <p style={{ margin:"3px 0 0", fontSize:12, color:T.muted }}>#{o.id?.slice(-6)} · {timeAgo(o.date)}</p>
          </div>
          <button onClick={() => setExpanded(e => !e)} style={{ background:T.offWhite, border:`1px solid ${T.border}`, borderRadius:10, padding:"5px 11px", fontSize:11, fontWeight:700, color:T.muted, cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background=T.greenLight; e.currentTarget.style.color=T.green; }}
            onMouseLeave={e => { e.currentTarget.style.background=T.offWhite; e.currentTarget.style.color=T.muted; }}>
            {expanded?"▲ Less":"▼ Details"}
          </button>
        </div>

        <RouteViz from={o.pickupFrom} to={o.deliverTo} compact />

        {expanded && (
          <div style={{ marginTop:12, padding:"12px 14px", background:T.offWhite, borderRadius:12, border:`1px solid ${T.border}`, animation:"fadeUp .2s ease" }}>
            {[["Items",o.items],["Order Total",fmt(o.total)],o.customerPhone&&["Phone",o.customerPhone]].filter(Boolean).map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ color:T.muted, fontWeight:500 }}>{k}</span>
                <span style={{ color:T.ink, fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:14 }}>
          <button className="btn-danger" onClick={() => onDecline(order)} style={{ flex:1, padding:"11px", fontSize:13 }}>Decline</button>
          <button className="btn-primary" onClick={() => onAccept(order)} style={{ flex:2, padding:"11px", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span>⚡</span> Accept Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Active Delivery Card ─────────────────────────────────────────────────────
const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered }) => {
  const o = normaliseOrder(order);
  const isPickedUp = order.riderStatus === "Picked Up";

  return (
    <div style={{ borderRadius:22, overflow:"hidden", border:`2px solid ${isPickedUp?T.orange:T.greenMid}`, boxShadow:`0 8px 32px ${isPickedUp?"rgba(242,140,0,.2)":"rgba(26,92,26,.18)"}`, background:"white" }}>
      {/* Animated status banner */}
      <div style={{ background:isPickedUp?`linear-gradient(135deg,${T.dark},#7a3800)`:`linear-gradient(135deg,${T.dark},${T.green})`, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:isPickedUp?T.orange:T.greenMid, animation:"pulse 1.2s infinite", flexShrink:0 }}/>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:800, color:"rgba(255,255,255,.5)", letterSpacing:1.2 }}>ACTIVE DELIVERY</p>
          <p style={{ margin:"2px 0 0", fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:"white" }}>
            {isPickedUp ? "🏍️ En route to customer" : "⏳ Head to restaurant"}
          </p>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.orange }}>{fmt(o.deliveryFee)}</p>
          <p style={{ margin:0, fontSize:9, color:"rgba(255,255,255,.4)", fontWeight:700, letterSpacing:.8 }}>YOUR EARN</p>
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {/* Customer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:20, color:T.ink }}>{o.customer}</p>
            <p style={{ margin:"3px 0 0", fontSize:13, color:T.muted }}>#{o.id?.slice(-6)}{o.customerPhone?` · ${o.customerPhone}`:""}</p>
          </div>
          <StatusBadge status={o.riderStatus||"Accepted"}/>
        </div>

        <RouteViz from={o.pickupFrom} to={o.deliverTo}/>

        {/* Items */}
        {o.items && (
          <div style={{ marginTop:12, padding:"10px 14px", background:T.offWhite, borderRadius:12, border:`1px solid ${T.border}`, fontSize:13, display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:T.muted }}>Items</span>
            <span style={{ color:T.ink, fontWeight:600, textAlign:"right", maxWidth:"65%" }}>{o.items}</span>
          </div>
        )}

        {/* Progress steps */}
        <div style={{ display:"flex", alignItems:"center", gap:0, margin:"18px 0 20px" }}>
          {[["Accepted","✓"],["Picked Up","📦"],["Delivered","🎯"]].map(([label, icon], i) => {
            const stepDone = (isPickedUp && i <= 1) || (!isPickedUp && i === 0);
            const isCurrent = (!isPickedUp && i===1) || (isPickedUp && i===2);
            return (
              <div key={label} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:30, height:30, borderRadius:"50%", background:stepDone?T.greenMid:isCurrent?T.orange:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all .3s", border:isCurrent?`2px solid ${T.orange}66`:"none", animation:isCurrent?"glow 2s infinite":undefined }}>
                    {stepDone ? <span style={{ color:"white", fontSize:14, fontWeight:800 }}>✓</span> : <span style={{ fontSize:14 }}>{icon}</span>}
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, color:stepDone?T.greenMid:isCurrent?T.orange:T.muted, letterSpacing:.5, whiteSpace:"nowrap" }}>{label}</span>
                </div>
                {i < 2 && <div style={{ flex:1, height:2, background:stepDone?T.greenMid:"#eee", margin:"0 4px 16px", borderRadius:1, transition:"background .3s" }}/>}
              </div>
            );
          })}
        </div>

        {/* Action */}
        {!isPickedUp ? (
          <button className="btn-primary" onClick={() => onPickedUp(o.id)} style={{ width:"100%", padding:"16px", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 5px 20px rgba(26,92,26,.3)" }}>
            <span style={{ fontSize:20 }}>✅</span> I've Picked Up the Order
          </button>
        ) : (
          <button onClick={() => onDelivered(o.id)} style={{ width:"100%", padding:"16px", borderRadius:50, border:"none", background:`linear-gradient(135deg, ${T.orange}, #fb9a10)`, color:"white", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:16, cursor:"pointer", boxShadow:"0 5px 20px rgba(242,140,0,.38)", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onMouseEnter={e => { e.currentTarget.style.transform="scale(1.02)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(242,140,0,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 5px 20px rgba(242,140,0,.38)"; }}>
            <span style={{ fontSize:20 }}>🎯</span> Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Delivery Complete Toast ──────────────────────────────────────────────────
const DeliveryToast = ({ order, onDismiss }) => (
  <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99999, width:"calc(100% - 32px)", maxWidth:400, animation:"toastIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
    <div style={{ background:"white", border:`2px solid ${T.greenMid}`, borderRadius:20, padding:"16px 18px", boxShadow:"0 12px 40px rgba(26,92,26,.2)", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${T.green},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🎉</div>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:16, color:T.ink, margin:"0 0 2px" }}>Delivery Complete!</p>
        <p style={{ fontSize:12, color:T.muted, margin:"0 0 4px" }}>#{order?.id?.slice(-6)} — {order?.customer}</p>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:T.orange, margin:0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
      </div>
      <button onClick={onDismiss} style={{ background:"none", border:"none", color:T.muted, fontSize:22, cursor:"pointer", padding:0, lineHeight:1 }}>×</button>
    </div>
  </div>
);

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = ({ isOnline, activeDelivery, visibleOrders, onAccept, onDecline, onPickedUp, onDelivered, onToggleOnline }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
    {/* Active delivery always on top */}
    {activeDelivery && (
      <div style={{ animation:"scaleIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
        <ActiveDeliveryCard order={activeDelivery} onPickedUp={onPickedUp} onDelivered={onDelivered}/>
      </div>
    )}

    {/* Offline banner */}
    {!isOnline && (
      <div className="card" style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16, borderLeft:`4px solid ${T.orange}` }}>
        <div style={{ width:46, height:46, borderRadius:14, background:T.orangeLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>😴</div>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>You're offline</p>
          <p style={{ margin:"3px 0 0", fontSize:13, color:T.muted }}>Go online to start receiving delivery orders</p>
        </div>
        <button className="btn-primary" onClick={onToggleOnline} style={{ padding:"10px 18px", fontSize:13, whiteSpace:"nowrap", flexShrink:0 }}>Go Online</button>
      </div>
    )}

    {/* Available orders */}
    {isOnline && !activeDelivery && (
      <>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>Available Orders</h2>
            <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>{visibleOrders.length} order{visibleOrders.length!==1?"s":""} near you</p>
          </div>
          {visibleOrders.length > 0 && (
            <span style={{ background:T.orangeLight, color:T.orangeDark, fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, border:`1px solid ${T.orange}44`, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
              Live
            </span>
          )}
        </div>
        {visibleOrders.length === 0
          ? <div className="card" style={{ padding:"60px 20px", textAlign:"center", color:T.muted }}>
              <p style={{ fontSize:48, marginBottom:12 }}>🔍</p>
              <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.ink }}>No orders nearby</p>
              <p style={{ fontSize:13, marginTop:6 }}>New orders will appear here automatically</p>
            </div>
          : visibleOrders.map((o, i) => <AvailableCard key={o._id||o.id} order={o} onAccept={onAccept} onDecline={onDecline} delay={i*0.07}/>)
        }
      </>
    )}

    {/* Online but on active delivery */}
    {isOnline && activeDelivery && visibleOrders.length > 0 && (
      <p style={{ textAlign:"center", fontSize:12, color:T.muted, padding:"8px 0" }}>
        {visibleOrders.length} more order{visibleOrders.length!==1?"s":""} waiting — complete current delivery first
      </p>
    )}
  </div>
);

// ─── History Tab ──────────────────────────────────────────────────────────────
const HistoryTab = ({ orders }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp .35s ease" }}>
    <div>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>Delivery History</h2>
      <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>{orders.length} completed</p>
    </div>
    {orders.length === 0
      ? <div className="card" style={{ padding:"60px 0", textAlign:"center", color:T.muted }}>
          <p style={{ fontSize:48 }}>📭</p>
          <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.ink, marginTop:12 }}>No deliveries yet</p>
          <p style={{ fontSize:13, marginTop:6 }}>Accept your first order to get started</p>
        </div>
      : [...orders].sort((a,b) => new Date(b.completedAt||b.date)-new Date(a.completedAt||a.date)).map((o, i) => {
          const norm = normaliseOrder(o);
          return (
            <div key={norm.id} className="card" style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14, animation:`fadeUp .35s ease ${i*.05}s both` }}>
              <div style={{ width:44, height:44, borderRadius:14, background:T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>✅</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontWeight:700, fontSize:15, color:T.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{norm.customer}</p>
                <p style={{ margin:"3px 0 0", fontSize:12, color:T.muted }}>#{norm.id?.slice(-6)} · {timeAgo(norm.completedAt)}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.orange }}>{fmt(norm.deliveryFee)}</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:T.greenMid, fontWeight:600 }}>Delivered</p>
              </div>
            </div>
          );
        })
    }
  </div>
);

// ─── Earnings Tab ─────────────────────────────────────────────────────────────
const EarningsTab = ({ completedOrders }) => {
  const total     = completedOrders.reduce((s,o) => s+(o.deliveryFee||normaliseOrder(o).deliveryFee||0), 0);
  const count     = completedOrders.length;
  const todayStr  = new Date().toDateString();
  const todayEarn = completedOrders.filter(o => new Date(o.completedAt||o.date||o.updatedAt).toDateString()===todayStr).reduce((s,o) => s+(o.deliveryFee||normaliseOrder(o).deliveryFee||0), 0);
  const avgEarn   = count > 0 ? Math.round(total/count) : 0;

  const stats = [
    { label:"Today", value:fmt(todayEarn), icon:"☀️", color:T.orange, bg:T.orangeLight },
    { label:"Average", value:fmt(avgEarn), icon:"📊", color:T.blue,   bg:T.blueLight   },
    { label:"Deliveries", value:count,     icon:"🏍️", color:T.green,  bg:T.greenLight  },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Earnings</h2>

      {/* Big total */}
      <div style={{ borderRadius:22, overflow:"hidden", background:`linear-gradient(135deg, ${T.dark}, ${T.green})`, padding:"28px 24px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 8px" }}>Total Earned</p>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:48, color:T.orange, margin:"0 0 4px", lineHeight:1 }}>{fmt(total)}</p>
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:13 }}>from {count} deliveries</p>
      </div>

      {/* Mini stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {stats.map((s,i) => (
          <div key={s.label} className="card" style={{ padding:"14px 12px", textAlign:"center", animation:`fadeUp .4s ease ${i*.08}s both` }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:17, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize:11, color:T.muted, fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${T.border}` }}>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink, margin:0 }}>Recent Deliveries</h3>
        </div>
        {completedOrders.length === 0
          ? <p style={{ padding:"24px", textAlign:"center", color:T.muted, fontSize:13 }}>No deliveries yet</p>
          : completedOrders.slice(0,6).map((o, i) => {
              const norm = normaliseOrder(o);
              return (
                <div key={norm.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:i<Math.min(completedOrders.length,6)-1?`1px solid ${T.border}`:"none" }}>
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:14, color:T.ink }}>{norm.customer}</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>{timeAgo(norm.completedAt)}</p>
                  </div>
                  <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, color:T.orange, fontSize:15 }}>{fmt(norm.deliveryFee)}</p>
                </div>
              );
            })
        }
      </div>
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ rider, onUpdate, onToast }) => {
  const [v, setV] = useState({
    firstName:     rider.firstName || "",
    lastName:      rider.lastName  || "",
    phone:         rider.phone     || "",
    email:         rider.email     || "",
    vehicleType:   rider.vehicleType   || "",
    vehicleNumber: rider.vehicleNumber || rider.driverLicenseNumber || "",
    bankName:      rider.bankName      || "",
    accountNumber: rider.accountNumber || "",
    accountName:   rider.accountName   || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, val) => setV(p => ({...p,[k]:val}));

  const save = async () => {
    setSaving(true);
    try {
      const dto = { firstName:v.firstName, lastName:v.lastName, phone:v.phone, email:v.email, vehicleType:v.vehicleType, vehicleNumber:v.vehicleNumber, bankName:v.bankName, accountNumber:v.accountNumber, accountName:v.accountName };
      const updated = await riderApi.updateProfile(dto);
      onUpdate({ ...rider, ...updated, ...dto });
      onToast("Profile saved!");
    } catch(e) { onToast("Failed: "+e.message, "error"); }
    finally { setSaving(false); }
  };

  const fullName = `${v.firstName} ${v.lastName}`.trim();
  const initials = fullName ? fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "R";

  const Section = ({ title, children }) => (
    <div className="card" style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
      <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.ink, margin:0, paddingBottom:10, borderBottom:`2px solid ${T.greenLight}` }}>{title}</h3>
      {children}
    </div>
  );
  const Field = ({ label, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"fadeUp .35s ease" }}>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Profile</h2>

      {/* Avatar */}
      <div style={{ display:"flex", justifyContent:"center" }}>
        <div style={{ width:88, height:88, borderRadius:"50%", background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:32, color:"white", border:`4px solid ${T.greenLight}`, boxShadow:`0 8px 24px rgba(26,92,26,.2)` }}>
          {initials}
        </div>
      </div>

      <Section title="👤 Personal Info">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="First Name"><input className="input-field" value={v.firstName} onChange={e => set("firstName",e.target.value)} placeholder="First" /></Field>
          <Field label="Last Name"><input className="input-field" value={v.lastName} onChange={e => set("lastName",e.target.value)} placeholder="Last" /></Field>
        </div>
        <Field label="Phone"><input className="input-field" value={v.phone} onChange={e => set("phone",e.target.value)} placeholder="+234…" /></Field>
        <Field label="Email"><input className="input-field" value={v.email} onChange={e => set("email",e.target.value)} placeholder="you@example.com" /></Field>
      </Section>

      <Section title="🏍️ Vehicle Info">
        <Field label="Vehicle Type"><input className="input-field" value={v.vehicleType} onChange={e => set("vehicleType",e.target.value)} placeholder="e.g. Motorcycle, Bicycle" /></Field>
        <Field label="Plate / License No."><input className="input-field" value={v.vehicleNumber} onChange={e => set("vehicleNumber",e.target.value)} placeholder="e.g. ABC-123XY" /></Field>
      </Section>

      <Section title="🏦 Bank Details">
        <Field label="Bank Name"><input className="input-field" value={v.bankName} onChange={e => set("bankName",e.target.value)} placeholder="e.g. First Bank" /></Field>
        <Field label="Account Name"><input className="input-field" value={v.accountName} onChange={e => set("accountName",e.target.value)} placeholder="Full account name" /></Field>
        <Field label="Account Number">
          <input className="input-field" value={v.accountNumber} onChange={e => set("accountNumber",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="0000000000" style={{ letterSpacing:2 }} />
        </Field>
      </Section>

      <button className="btn-primary" onClick={save} disabled={saving} style={{ width:"100%", padding:16, fontSize:15, boxShadow:"0 6px 20px rgba(26,92,26,.3)" }}>
        {saving ? "Saving…" : "💾 Save Profile"}
      </button>
    </div>
  );
};

// ─── TABS config ──────────────────────────────────────────────────────────────
const TABS = [
  { id:"orders",   label:"Orders",   icon:"📋" },
  { id:"history",  label:"History",  icon:"📦" },
  { id:"earnings", label:"Earnings", icon:"💰" },
  { id:"profile",  label:"Profile",  icon:"👤" },
];

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function RiderDashboard({ initialRider, onLogout }) {
  const [rider,           setRider]           = useState(initialRider || null);
  const [tab,             setTab]             = useState("orders");
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery,  setActiveDelivery]  = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [declinedIds,     setDeclinedIds]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [toast,           setToast]           = useState(null);
  const [toastMsg,        setToastMsg]        = useState(null); // { msg, type }
  const [error,           setError]           = useState(null);

  const showToast = (msg, type="success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3200);
  };

  // ── Load profile ──
  const loadProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const profile = initialRider || await riderApi.getProfile();
      const formatted = { ...profile, fullName:`${profile.firstName||""} ${profile.lastName||""}`.trim(), availability:profile.availability||"OFFLINE", totalDeliveries:profile.totalDeliveries||0, earnings:profile.earnings||0 };
      setRider(formatted);
      try { localStorage.setItem("tastycart_rider", JSON.stringify(formatted)); } catch(_) {}
    } catch(err) {
      setError("Could not load your profile.");
      try { const stored = localStorage.getItem("tastycart_rider"); if (stored) { setRider(JSON.parse(stored)); setError(null); } } catch(_) {}
    } finally { setLoading(false); }
  }, [initialRider]);

  // ── Load rider orders ──
  const loadRiderOrders = useCallback(async () => {
    try {
      const myOrders = await orderApi.getRiderOrders();
      if (!Array.isArray(myOrders)) return;
      const active    = myOrders.filter(o => ["PICKED_UP","PREPARING","ACCEPTED"].includes(o.status));
      const completed = myOrders.filter(o => o.status==="DELIVERED").map(o => ({ ...normaliseOrder(o), completedAt:o.updatedAt }));
      if (active.length > 0) {
        const cur = active[0];
        setActiveDelivery({ ...normaliseOrder(cur), riderStatus:cur.status==="PICKED_UP"?"Picked Up":"Accepted" });
      }
      setCompletedOrders(completed);
    } catch(e) { console.error("Failed to load rider orders:", e); }
  }, []);

  // ── Fetch available orders ──
  const fetchAvailable = useCallback(async () => {
    try {
      const all = await orderApi.getAllOrders("PENDING");
      const available = Array.isArray(all) ? all.filter(o => !o.riderId && !declinedIds.includes(o._id||o.id)) : [];
      setAvailableOrders(available);
    } catch(e) { console.error("fetch available:", e); }
  }, [declinedIds]);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { if (rider) loadRiderOrders(); }, [rider?.id, loadRiderOrders]);
  useEffect(() => {
    if (rider?.availability==="ONLINE" && !activeDelivery) {
      fetchAvailable();
      const iv = setInterval(fetchAvailable, 30000);
      return () => clearInterval(iv);
    }
  }, [rider?.availability, activeDelivery, fetchAvailable]);

  const updateRider = useCallback(updated => {
    const r = { ...updated, fullName:`${updated.firstName||""} ${updated.lastName||""}`.trim() };
    setRider(r);
    try { localStorage.setItem("tastycart_rider", JSON.stringify(r)); } catch(_) {}
  }, []);

  const handleToggleOnline = async () => {
    if (!rider) return;
    const newStatus = rider.availability==="ONLINE" ? "OFFLINE" : "ONLINE";
    setRider(prev => ({...prev, availability:newStatus}));
    try {
      await riderApi.updateAvailability(newStatus);
      if (newStatus==="OFFLINE") setAvailableOrders([]);
      else await fetchAvailable();
    } catch(err) {
      setRider(prev => ({...prev, availability:rider.availability}));
      showToast("Failed to update availability","error");
    }
  };

  const handleAccept = async (order) => {
    if (!rider?.userId) { showToast("Rider ID not found","error"); return; }
    try {
      await orderApi.assignRider(order._id||order.id, rider.userId);
      await orderApi.updateOrderStatus(order._id||order.id, "PREPARING");
      const norm = normaliseOrder(order);
      setActiveDelivery({ ...norm, riderStatus:"Accepted" });
      setAvailableOrders(prev => prev.filter(o => (o._id||o.id)!==(order._id||order.id)));
      setTab("orders");
      showToast("Order accepted! Head to the restaurant.");
    } catch(err) { showToast("Failed to accept: "+err.message,"error"); }
  };

  const handleDecline = order => {
    const id = order._id||order.id;
    setDeclinedIds(prev => [...prev, id]);
    setAvailableOrders(prev => prev.filter(o => (o._id||o.id)!==id));
  };

  const handlePickedUp = async id => {
    try {
      await orderApi.updateOrderStatus(id, "PICKED_UP");
      setActiveDelivery(prev => prev ? {...prev, riderStatus:"Picked Up"} : prev);
      showToast("Order picked up! Deliver to customer.");
    } catch(err) { showToast("Failed: "+err.message,"error"); }
  };

  const handleDelivered = async id => {
    try {
      await orderApi.updateOrderStatus(id, "DELIVERED");
      const completed = { ...activeDelivery, completedAt:new Date().toISOString() };
      setCompletedOrders(prev => [completed, ...prev]);
      setActiveDelivery(null);
      setToast(completed);
      updateRider({ ...rider, totalDeliveries:(rider.totalDeliveries||0)+1, earnings:(rider.earnings||0)+(completed.deliveryFee||0) });
      setTimeout(() => setToast(null), 5000);
      if (rider?.availability==="ONLINE") fetchAvailable();
    } catch(err) { showToast("Failed: "+err.message,"error"); }
  };

  const isOnline      = rider?.availability==="ONLINE";
  const visibleOrders = availableOrders.filter(o => !declinedIds.includes(o._id||o.id));
  const pendingCount  = isOnline && !activeDelivery ? visibleOrders.length : 0;
  const fullName      = rider ? `${rider.firstName||""} ${rider.lastName||""}`.trim()||rider.fullName||"Rider" : "Rider";
  const initials      = fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"R";

  // ── Loading ──
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:18 }}>
        <TastycartLogo size={64}/>
        <Spinner size={32}/>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.green }}>Loading your dashboard…</p>
      </div>
    </>
  );

  if (error && !rider) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16, padding:24 }}>
        <TastycartLogo size={64}/>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:18, color:T.red }}>{error}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-primary" onClick={loadProfile} style={{ padding:"12px 24px" }}>Try Again</button>
          {onLogout && <button className="btn-outline" onClick={onLogout} style={{ padding:"12px 24px" }}>← Back</button>}
        </div>
      </div>
    </>
  );

  if (!rider) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16 }}>
        <TastycartLogo size={72}/>
        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:20, color:T.ink }}>No rider profile found</p>
        {onLogout && <button className="btn-primary" onClick={onLogout} style={{ padding:"12px 28px" }}>← Register</button>}
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Delivery complete toast */}
      {toast && <DeliveryToast order={toast} onDismiss={() => setToast(null)}/>}

      {/* Status toast */}
      {toastMsg && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:99998, background:toastMsg.type==="error"?T.redLight:T.greenLight, color:toastMsg.type==="error"?T.red:T.green, border:`1.5px solid ${toastMsg.type==="error"?"#f5a5a5":"#a8d5a8"}`, borderRadius:14, padding:"11px 17px", fontSize:14, fontWeight:600, boxShadow:"0 6px 28px rgba(0,0,0,.1)", animation:"fadeUp .25s ease", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:20, height:20, borderRadius:"50%", background:toastMsg.type==="error"?T.red:T.greenMid, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{toastMsg.type==="error"?"!":"✓"}</span>
          {toastMsg.msg}
        </div>
      )}

      <div style={{ minHeight:"100vh", display:"flex", background:T.offWhite }}>

        {/* ── Desktop Sidebar ── */}
        <aside className="desktop-sidebar" style={{ width:230, flexShrink:0, background:`linear-gradient(180deg, ${T.dark} 0%, #0d1f0d 100%)`, flexDirection:"column", padding:"24px 14px", position:"fixed", top:0, left:0, height:"100vh", overflowY:"auto", zIndex:800 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, paddingLeft:4, marginBottom:28 }}>
            <TastycartLogo size={38}/>
            <div>
              <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:"white", margin:0 }}>Tasty<span style={{ color:T.orange }}>cart</span></p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", margin:0, letterSpacing:.5 }}>RIDER</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`nav-item${tab===t.id?" active":""}`}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:"rgba(255,255,255,.55)", fontWeight:600, fontFamily:"'DM Sans',sans-serif", fontSize:14, background:"transparent", position:"relative" }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <span>{t.label}</span>
                {t.id==="orders" && pendingCount>0 && (
                  <span style={{ marginLeft:"auto", background:T.orange, color:"white", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{pendingCount}</span>
                )}
                {t.id==="orders" && activeDelivery && (
                  <span style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:T.orange, animation:"pulse 1.2s infinite" }}/>
                )}
              </button>
            ))}
          </nav>

          {/* Online toggle */}
          <div style={{ marginTop:"auto", paddingTop:16, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ background:"rgba(255,255,255,.07)", borderRadius:14, padding:"12px 14px" }}>
              <p style={{ margin:"0 0 8px", fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Availability</p>
              <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline}/>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,.05)", borderRadius:14 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:T.greenMid, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white", flexShrink:0, fontFamily:"'Fraunces',serif" }}>{initials}</div>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:"white", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fullName}</p>
                <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,.35)" }}>{rider.vehicleType||"Rider"}</p>
              </div>
            </div>

            {onLogout && <button onClick={onLogout} className="btn-outline" style={{ width:"100%", padding:"9px", fontSize:12, borderColor:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.4)", background:"transparent" }}>← Back to Home</button>}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="main-with-sidebar" style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

          {/* Top bar */}
          <header style={{ background:"white", borderBottom:`1px solid ${T.border}`, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", position:"sticky", top:0, zIndex:500, boxShadow:"0 1px 8px rgba(0,0,0,.05)" }}>
            {/* Mobile: logo + brand */}
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <TastycartLogo size={30}/>
              <div>
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:16, color:T.ink, margin:0 }}>Tasty<span style={{ color:T.orange }}>cart</span> <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>Rider</span></p>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {activeDelivery && (
                <div onClick={() => setTab("orders")} style={{ display:"flex", alignItems:"center", gap:6, background:T.orangeLight, border:`1.5px solid ${T.orange}44`, borderRadius:50, padding:"5px 12px", cursor:"pointer" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:T.orangeDark }}>Active delivery</span>
                </div>
              )}
              <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} size="sm"/>
              <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>{initials}</div>
            </div>
          </header>

          {/* Page */}
          <main style={{ flex:1, padding:"24px 20px 100px", maxWidth:720, width:"100%", margin:"0 auto" }}>
            <div key={tab} style={{ animation:"fadeUp .3s ease" }}>
              {tab==="orders" && (
                <OrdersTab
                  isOnline={isOnline}
                  activeDelivery={activeDelivery}
                  visibleOrders={visibleOrders}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onPickedUp={handlePickedUp}
                  onDelivered={handleDelivered}
                  onToggleOnline={handleToggleOnline}
                />
              )}
              {tab==="history"  && <HistoryTab orders={completedOrders}/>}
              {tab==="earnings" && <EarningsTab completedOrders={completedOrders}/>}
              {tab==="profile"  && <ProfileTab rider={rider} onUpdate={updateRider} onToast={showToast}/>}
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${T.border}`, padding:"8px 8px 16px", display:"flex", justifyContent:"space-around", zIndex:600, boxShadow:"0 -2px 20px rgba(0,0,0,.07)" }}>
        {TABS.map(t => {
          const active = tab===t.id;
          const hasBadge = t.id==="orders" && pendingCount>0;
          const hasActive = t.id==="orders" && !!activeDelivery;
          return (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:active?T.greenLight:"transparent", position:"relative" }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:10, fontWeight:700, color:active?T.green:T.muted, letterSpacing:.3 }}>{t.label}</span>
              {active && <div style={{ position:"absolute", bottom:0, width:18, height:3, borderRadius:10, background:T.greenMid }}/>}
              {hasBadge && <div style={{ position:"absolute", top:5, right:12, width:8, height:8, borderRadius:"50%", background:T.orange, animation:"pulse 1.5s infinite" }}/>}
              {hasActive && !hasBadge && <div style={{ position:"absolute", top:5, right:12, width:8, height:8, borderRadius:"50%", background:T.orange, animation:"glow 2s infinite" }}/>}
            </button>
          );
        })}
      </nav>
    </>
  );
}