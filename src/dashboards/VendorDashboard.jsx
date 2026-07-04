import { useState, useEffect, useCallback, useRef } from "react";
import { vendorApi, orderApi, publicApi } from "../utils/Api.js";
import Logo from "../assets/tasty.jpg.jpeg";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const T = {
    green:      "#1a5c1a",
    greenMid:   "#2d8a2d",
    greenLight: "#e8f5e0",
    greenPale:  "#f2faf2",
    orange:     "#f28c00",
    orangeLight:"#fff7e6",
    orangePale: "#fff3d6",
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
const fmtDate = iso => new Date(iso).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" });
const fmtTime = iso => new Date(iso).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" });
const timeAgo = iso => {
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return fmtDate(iso);
};

const normaliseVendor = raw => ({
    id:          raw.id || raw._id,
    name:        raw.restaurantName || raw.name || "My Restaurant",
    description: raw.restaurantDescription || raw.description || "",
    category:    raw.category || "",
    logoUrl:     raw.logoUrl || "",
    phone:       raw.restaurantPhone || raw.phone || "",
    email:       raw.restaurantEmail || raw.email || "",
    address:     raw.restaurantAddress || raw.address || "",
    landmark:    raw.landmark || "",
    openDays:    raw.openDays || [],
    openTime:    raw.openTime || "08:00",
    closeTime:   raw.closeTime || "20:00",
    deliveryFrom:raw.deliveryFromPrice || raw.deliveryFrom || 0,
    packages:    (raw.packages || []).map(p => ({ ...p, id: p.id || p._id })),
    isOpen:      raw.isOpen ?? raw.open ?? false,
    rating:      raw.rating || 0,
    totalOrders: raw.totalOrders || 0,
    status:        (raw.status || "PENDING").toUpperCase(),
    bankName:      raw.bankName      || "",
    accountNumber: raw.accountNumber || "",
    accountName:   raw.accountName   || "",
});

const normaliseOrder = raw => ({
    id:            raw.id || raw._id || `ORD-${Date.now()}`,
    customer:      raw.customerName || raw.customer || raw.fullName || "Customer",
    whatsapp:      raw.customerPhone || raw.whatsapp || "—",
    location:      raw.deliveryLocation || raw.location || "—",
    paymentMethod: raw.paymentMethod || "Card",
    status:        resolveStatus(raw.status),
    date:          raw.createdAt || raw.date || new Date().toISOString(),
    total:         raw.subtotal || raw.totalAmount || 0,
    items:         (raw.items || raw.orderItems || []).map(i => ({
        id:    i.menuItemId || i.id || i._id,
        name:  i.name || i.itemName || "Item",
        price: i.price || i.unitPrice || 0,
        qty:   i.quantity || i.qty || 1,
    })),
    packageName: raw.packageName || null,
    packagePrice: raw.packagePrice || null,
});

// Covers every OrderStatus enum value the backend can send
const STATUS_MAP = {
    // Pre-payment (customer hasn't paid yet — vendor sees these briefly)
    PENDING_PAYMENT:   { bg: "#f5f5f5",     color: "#777",      dot: "#bbb",       label: "Awaiting Payment" },
    PAYMENT_FAILED:    { bg: T.redLight,    color: T.red,       dot: T.red,        label: "Payment Failed"   },
    PAYMENT_CANCELLED: { bg: T.redLight,    color: T.red,       dot: "#e88",       label: "Pmt Cancelled"    },
    // Active order lifecycle
    PENDING:           { bg: T.orangeLight, color: "#9a5a00",   dot: T.orange,     label: "Pending"          },
    ACCEPTED:          { bg: "#e8f5e0",     color: "#1a6a1a",   dot: "#4caf50",    label: "Accepted"         },
    PREPARING:         { bg: T.blueLight,   color: T.blue,      dot: "#4a80e0",    label: "Preparing"        },
    READY_FOR_PICKUP:  { bg: "#f3eeff",     color: "#6a3ab2",   dot: "#9c27b0",    label: "Ready for Pickup" },
    PICKED_UP:         { bg: "#fff3e0",     color: "#e65100",   dot: "#ff9800",    label: "Picked Up"        },
    DELIVERED:         { bg: T.greenLight,  color: T.green,     dot: T.greenMid,   label: "Delivered"        },
    CANCELLED:         { bg: T.redLight,    color: T.red,       dot: T.red,        label: "Cancelled"        },
};
// Normalise any casing the backend might send
const resolveStatus = raw => {
    if (!raw) return "PENDING";
    const up = String(raw).toUpperCase().replace(/-/g,"_").replace(/ /g,"_");
    return STATUS_MAP[up] ? up : "PENDING";
};

const DAYS       = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CATEGORIES = ["Nigerian","Continental","Fast Food","Grills & BBQ","Street Food","Soups & Swallow","Pastries & Drinks","Healthy Bowls","Seafood","Snacks & Sides"];
const PRESET_PACKAGES = [
    { id:"plastic",    name:"Plastic Container",  price:200 },
    { id:"disposable", name:"Disposable Takeaway", price:100 },
    { id:"nylon",      name:"Just Nylon",          price:0   },
    { id:"foil",       name:"Foil Wrap",           price:50  },
    { id:"styrofoam",  name:"Styrofoam Pack",      price:150 },
    { id:"luxury",     name:"Luxury Box",          price:500 },
];

// ─── useIsMobile hook ─────────────────────────────────────────────────────────
const useIsMobile = (bp = 768) => {
    const [mobile, setMobile] = useState(() => window.innerWidth <= bp);
    useEffect(() => {
        const fn = () => setMobile(window.innerWidth <= bp);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, [bp]);
    return mobile;
};

// ─── Tastycart Logo SVG ───────────────────────────────────────────────────────
const TastycartLogo = ({ size = 36 }) => (
    <img
        src={Logo}
        width={size}
        height={size}
        alt="Tastycart Logo"
        style={{borderRadius : 7}}
    />
);

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: ${T.offWhite}; color: ${T.ink}; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
  input::placeholder, textarea::placeholder { color: #aabcaa; }
  select { cursor: pointer; }
  button { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }
  @keyframes modalIn  { from { opacity:0; transform:scale(.94) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }
  @keyframes toastIn  { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin     { to { transform: rotate(360deg) } }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes sideSlideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }

  .tab-btn { transition: all .18s ease; }
  .tab-btn:hover { background: ${T.greenLight} !important; color: ${T.green} !important; }
  .nav-item { transition: all .18s; }
  .nav-item.active { background: linear-gradient(135deg, ${T.green}, ${T.greenMid}) !important; color: white !important; box-shadow: 0 4px 16px rgba(26,92,26,.28) !important; }
  .nav-item:not(.active):hover { background: ${T.greenLight} !important; color: ${T.green} !important; }
  .card { background: white; border-radius: 18px; border: 1px solid ${T.border}; }
  .btn-primary { background: linear-gradient(135deg, ${T.green}, ${T.greenMid}); color: white; border: none; cursor: pointer; font-weight: 700; border-radius: 50px; transition: all .2s; }
  .btn-primary:hover { box-shadow: 0 6px 20px rgba(26,92,26,.35); transform: translateY(-1px); }
  .btn-primary:disabled { background: #c8dcc8; color: #8aaa8a; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-outline { background: white; border: 1.5px solid ${T.border}; color: ${T.muted}; cursor: pointer; font-weight: 600; border-radius: 50px; transition: all .2s; }
  .btn-outline:hover { border-color: ${T.greenMid}; color: ${T.green}; }
  .btn-danger { background: ${T.redLight}; border: 1.5px solid #f5a5a5; color: ${T.red}; cursor: pointer; font-weight: 600; border-radius: 50px; transition: all .2s; }
  .btn-danger:hover { background: ${T.red}; color: white; }
  .input-field { width:100%; padding:11px 14px; border-radius:12px; border:1.5px solid ${T.border}; background:${T.offWhite}; font-family:'DM Sans',sans-serif; font-size:14px; color:${T.ink}; outline:none; transition:all .2s; }
  .input-field:focus { border-color:${T.greenMid}; box-shadow:0 0 0 3px rgba(45,138,45,.1); background:white; }
  .label { display:block; font-size:11px; font-weight:700; letter-spacing:1.2px; color:${T.muted}; text-transform:uppercase; margin-bottom:5px; }
  .stat-card { animation: fadeUp .4s ease both; }
  .order-row { transition: background .15s; cursor: pointer; }
  .order-row:hover { background: ${T.greenPale}; }
  .menu-row { transition: background .15s; }
  .menu-row:hover { background: ${T.offWhite}; }
  .toggle-wrap { display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; }
  .toggle { width:42px; height:22px; border-radius:11px; position:relative; transition:background .25s; flex-shrink:0; }
  .toggle-knob { width:16px; height:16px; border-radius:50%; background:white; position:absolute; top:3px; transition:left .25s; box-shadow:0 1px 4px rgba(0,0,0,.2); }
  .pkg-row { border-radius:12px; padding:11px 14px; cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:space-between; margin-bottom:7px; }
  .day-btn { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:11px; font-weight:700; transition:all .18s; user-select:none; }
  .img-preview { width:100%; height:120px; object-fit:cover; border-radius:10px; border:1.5px solid ${T.border}; }
  .img-placeholder { width:100%; height:120px; border-radius:10px; border:2px dashed ${T.border}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; background:${T.offWhite}; color:${T.muted}; font-size:12px; font-weight:600; }

  /* Bottom nav for mobile */
  .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 700; background: white; border-top: 1.5px solid ${T.border}; padding: 8px 0 max(8px, env(safe-area-inset-bottom)); box-shadow: 0 -4px 20px rgba(0,0,0,.08); }
  .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 0; flex: 1; border: none; background: none; cursor: pointer; color: ${T.muted}; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; transition: color .15s; position: relative; }
  .bottom-nav-item.active { color: ${T.green}; }
  .bottom-nav-item .nav-icon { font-size: 20px; line-height: 1; }
  .bottom-nav-badge { position: absolute; top: 2px; right: calc(50% - 16px); background: ${T.orange}; color: white; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 20px; min-width: 16px; text-align: center; }

  @media (max-width: 768px) {
    .bottom-nav { display: flex; }
    .desktop-sidebar { display: none !important; }
    .main-content-area { margin-left: 0 !important; }
    main { padding: 16px 14px 90px !important; }
    .header-title { font-size: 16px !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .info-grid { grid-template-columns: 1fr !important; }
    .profile-grid { grid-template-columns: 1fr !important; }
    .form-row { flex-direction: column !important; }
    .order-modal { padding: 10px !important; }
    .pending-badge { display: none !important; }
  }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .menu-item-actions { gap: 6px !important; }
    .order-customer { max-width: 130px !important; }
  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type = "success" }) => {
    const colors = {
        success: { bg: T.greenLight, color: T.green,  border: "#a8d5a8", icon: "✓" },
        error:   { bg: T.redLight,   color: T.red,    border: "#f5a5a5", icon: "!" },
        info:    { bg: T.blueLight,  color: T.blue,   border: "#a0bce0", icon: "i" },
    };
    const c = colors[type] || colors.success;
    return (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99999, background:c.bg, color:c.color, border:`1.5px solid ${c.border}`, borderRadius:14, padding:"12px 18px", fontSize:14, fontWeight:600, boxShadow:"0 6px 28px rgba(0,0,0,.15)", animation:"toastIn .3s ease", display:"flex", alignItems:"center", gap:8, maxWidth:340, width:"calc(100% - 32px)" }}>
            <span style={{ width:22, height:22, borderRadius:"50%", background:c.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>{c.icon}</span>
            {msg}
        </div>
    );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 24 }) => (
    <div style={{ width:size, height:size, borderRadius:"50%", border:`3px solid ${T.border}`, borderTopColor:T.greenMid, animation:"spin .7s linear infinite" }} />
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const key = resolveStatus(status);
    const s = STATUS_MAP[key] || STATUS_MAP.PENDING;
    return (
        <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
            {s.label}
    </span>
    );
};

// ─── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;
    // Vendor controls: PENDING → ACCEPTED → PREPARING → READY_FOR_PICKUP
    // (PICKED_UP and DELIVERED are set by rider/system — vendor cannot advance past READY_FOR_PICKUP)
    const nextMap = {
        PENDING:          "ACCEPTED",
        ACCEPTED:         "PREPARING",
        PREPARING:        "READY_FOR_PICKUP",
    };
    const labelMap = {
        PENDING:          "Accept Order",
        ACCEPTED:         "Start Preparing",
        PREPARING:        "Mark Ready for Pickup",
    };
    const canAdvance = !!nextMap[order.status];
    const canCancel  = ["PENDING","ACCEPTED","PREPARING"].includes(order.status);

    return (
        <div onClick={onClose} className="order-modal" style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"0" }}>
            <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 40px rgba(0,0,0,.2)", animation:"modalIn .3s cubic-bezier(.34,1.56,.64,1)", overflow:"hidden" }}>
                {/* Drag handle */}
                <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"12px auto 0", flexShrink:0 }} />

                {/* Header */}
                <div style={{ background:`linear-gradient(135deg, ${T.dark}, ${T.green})`, padding:"18px 20px 16px", flexShrink:0, marginTop:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                            <p style={{ color:"rgba(255,255,255,.55)", fontSize:10, letterSpacing:1.5, margin:"0 0 2px" }}>ORDER ID</p>
                            <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:18, color:"white", margin:"0 0 3px" }}>{order.id}</h3>
                            <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, margin:0 }}>{fmtDate(order.date)} · {fmtTime(order.date)}</p>
                        </div>
                        <button onClick={onClose} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                    </div>
                    <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
                        <StatusBadge status={order.status} />
                        <span style={{ color:"rgba(255,255,255,.45)", fontSize:12 }}>· {timeAgo(order.date)}</span>
                    </div>
                </div>

                {/* Body */}
                <div style={{ overflowY:"auto", flex:1, padding:"16px 20px" }}>
                    {/* Customer */}
                    <div style={{ background:T.offWhite, borderRadius:14, padding:"12px 14px", marginBottom:14 }}>
                        <p className="label" style={{ marginBottom:8 }}>Customer Details</p>
                        {[["👤 Name",order.customer],["📱 WhatsApp",order.whatsapp],["📍 Deliver to",order.location],["💳 Payment",order.paymentMethod]].map(([k,v]) => (
                            <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"5px 0", borderBottom:`1px solid ${T.border}` }}>
                                <span style={{ color:T.muted, fontWeight:500 }}>{k}</span>
                                <span style={{ color:T.ink, fontWeight:600, maxWidth:"58%", textAlign:"right" }}>{v || "—"}</span>
                            </div>
                        ))}
                    </div>
                    {/* Items */}
                    <p className="label" style={{ marginBottom:8 }}>Order Items</p>
                    <div style={{ border:`1.5px solid ${T.border}`, borderRadius:14, overflow:"hidden", marginBottom:12 }}>
                        {order.packageName && (
                            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:T.greenLight, borderBottom:`1px solid ${T.border}` }}>
                                <span style={{ fontSize:13, color:T.green, fontWeight:600 }}>📦 {order.packageName}</span>
                                <span style={{ fontWeight:700, color:T.greenMid }}>{fmt(order.packagePrice)}</span>
                            </div>
                        )}
                        {(order.items || []).map((item, i) => (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", borderBottom:i < order.items.length-1 ? `1px solid ${T.border}` : "none" }}>
                                <span style={{ fontSize:14, color:T.ink }}>{item.name} <span style={{ color:T.muted }}>×{item.qty}</span></span>
                                <span style={{ fontWeight:700, fontSize:13 }}>{fmt(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ background:T.greenLight, borderRadius:14, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15 }}>Total</span>
                        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:22, color:T.orange }}>{fmt(order.total)}</span>
                    </div>
                </div>

                {/* Actions */}
                {(canAdvance || canCancel) && (
                    <div style={{ padding:"12px 20px 20px", borderTop:`1px solid ${T.border}`, flexShrink:0, display:"flex", gap:10 }}>
                        {canCancel && <button className="btn-danger" onClick={() => { onUpdateStatus(order.id,"CANCELLED"); onClose(); }} style={{ flex:1, padding:"12px" }}>Cancel Order</button>}
                        {canAdvance && <button className="btn-primary" onClick={() => { onUpdateStatus(order.id, nextMap[order.status]); onClose(); }} style={{ flex:2, padding:"12px", fontSize:14 }}>
                            ✓ {labelMap[order.status]}
                        </button>}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ vendor, orders, onViewOrder }) => {
    const todayStr    = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === todayStr);
    const todayRev    = todayOrders.filter(o => !["CANCELLED","PAYMENT_CANCELLED","PAYMENT_FAILED"].includes(o.status)).reduce((a,o) => a+o.total, 0);
    const totalRev    = orders.filter(o => !["CANCELLED","PAYMENT_CANCELLED","PAYMENT_FAILED"].includes(o.status)).reduce((a,o) => a+o.total, 0);
    const pending     = orders.filter(o => o.status === "PENDING").length;
    const delivered   = orders.filter(o => o.status === "DELIVERED").length;
    const recent      = [...orders].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6);

    const stats = [
        { label:"Today's Orders",  value:todayOrders.length,               icon:"📦", color:T.green,   bg:T.greenLight  },
        { label:"Today's Revenue", value:fmt(todayRev),                    icon:"💰", color:"#b36000",  bg:T.orangeLight },
        { label:"Pending",         value:pending,                          icon:"⏳", color:"#9a5a00",  bg:T.orangePale  },
        { label:"Total Revenue",   value:fmt(totalRev),                    icon:"📈", color:"#5a1a9a",  bg:"#f0e8ff"    },
        { label:"Delivered",       value:delivered,                        icon:"✅", color:T.blue,     bg:T.blueLight   },
        { label:"All Orders",      value:vendor.totalOrders||orders.length, icon:"🍽️", color:T.green,  bg:T.greenLight  },
    ];

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
            {/* Hero banner */}
            <div style={{ borderRadius:20, overflow:"hidden", background:`linear-gradient(135deg, ${T.dark} 0%, ${T.green} 60%, ${T.greenMid} 100%)`, padding:"22px 20px", position:"relative" }}>
                <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />
                <div style={{ position:"absolute", bottom:-50, right:60, width:120, height:120, borderRadius:"50%", background:"rgba(242,140,0,.12)" }} />
                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:14 }}>
                    {vendor.logoUrl
                        ? <img src={vendor.logoUrl} alt="logo" style={{ width:52, height:52, borderRadius:14, objectFit:"cover", border:"2.5px solid rgba(255,255,255,.3)", flexShrink:0 }} />
                        : <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><TastycartLogo size={30} /></div>
                    }
                    <div style={{ minWidth:0 }}>
                        <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, margin:"0 0 2px" }}>Good {new Date().getHours()<12?"Morning":"Afternoon"} 👋</p>
                        <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:"clamp(16px,4vw,24px)", color:"white", margin:"0 0 8px", letterSpacing:-.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{vendor.name}</h2>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {vendor.status==="APPROVED" && <span style={{ background:"rgba(255,255,255,.18)", color:"white", fontSize:10, fontWeight:600, padding:"2px 9px", borderRadius:20 }}>✓ Verified</span>}
                            <span style={{ background:vendor.isOpen?"rgba(255,255,255,.18)":"rgba(180,40,40,.5)", color:"white", fontSize:10, fontWeight:600, padding:"2px 9px", borderRadius:20 }}>{vendor.isOpen?"🟢 Open":"🔴 Closed"}</span>
                            {vendor.category && <span style={{ background:"rgba(255,255,255,.18)", color:"white", fontSize:10, fontWeight:600, padding:"2px 9px", borderRadius:20 }}>{vendor.category}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick info */}
            <div className="info-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {[["📍","Address",vendor.address],["🕐","Hours",`${vendor.openTime} – ${vendor.closeTime}`],["📱","Phone",vendor.phone],["📅","Open Days",(vendor.openDays||[]).join(", ")||"—"]].map(([icon,label,val]) => (
                    <div key={label} className="card" style={{ padding:"11px 13px" }}>
                        <p style={{ margin:"0 0 2px", fontSize:10, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>{icon} {label}</p>
                        <p style={{ margin:0, fontSize:13, color:T.ink, fontWeight:600, wordBreak:"break-word" }}>{val||"—"}</p>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:10 }}>
                {stats.map((s,i) => (
                    <div key={s.label} className="card stat-card" style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:11, animationDelay:`${i*.07}s` }}>
                        <div style={{ width:42, height:42, borderRadius:13, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{s.icon}</div>
                        <div style={{ minWidth:0 }}>
                            <p style={{ margin:0, fontSize:10, color:T.muted, fontWeight:600, letterSpacing:.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.label}</p>
                            <p style={{ margin:"2px 0 0", fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:"clamp(14px,2vw,18px)", color:s.color }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent orders */}
            <div className="card" style={{ overflow:"hidden" }}>
                <div style={{ padding:"14px 18px 11px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink, margin:0 }}>Recent Orders</h3>
                    <span style={{ fontSize:12, color:T.muted }}>{recent.length} latest</span>
                </div>
                {recent.length === 0
                    ? <div style={{ padding:"40px 0", textAlign:"center", color:T.muted }}><p style={{ fontSize:36 }}>📭</p><p style={{ marginTop:8, fontWeight:600 }}>No orders yet</p></div>
                    : recent.map((o,i) => (
                        <div key={o.id} className="order-row" onClick={() => onViewOrder(o)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 18px", borderBottom:i<recent.length-1?`1px solid ${T.border}`:"none" }}>
                            <div style={{ width:38, height:38, borderRadius:11, background:T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🍱</div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <p className="order-customer" style={{ margin:0, fontWeight:700, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{o.customer}</p>
                                <p style={{ margin:"2px 0 0", fontSize:11, color:T.muted }}>{timeAgo(o.date)}</p>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                                <span style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:14, color:T.ink }}>{fmt(o.total)}</span>
                                <StatusBadge status={o.status} />
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = ({ orders, onViewOrder, onUpdateStatus }) => {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const filters = ["All","PENDING","ACCEPTED","PREPARING","READY_FOR_PICKUP","DELIVERED","CANCELLED"];
    const filterLabel = f => f === "All" ? "All" : (STATUS_MAP[f]?.label || f);
    const countFor = f => f === "All" ? orders.length : orders.filter(o => o.status === f).length;
    const shown = orders
        .filter(o => filter === "All" || o.status === filter)
        .filter(o => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
        .sort((a,b) => new Date(b.date)-new Date(a.date));

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .35s ease" }}>
            {/* Search */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:"white", borderRadius:50, border:`1.5px solid ${T.border}` }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" style={{ border:"none", flex:1, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"transparent", color:T.ink }} />
                {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:18, lineHeight:1, padding:0 }}>×</button>}
            </div>

            {/* Filter pills */}
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, WebkitOverflowScrolling:"touch" }}>
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} className="tab-btn" style={{ padding:"7px 14px", borderRadius:50, border:"none", whiteSpace:"nowrap", background:filter===f?T.green:"white", color:filter===f?"white":T.muted, fontWeight:700, fontSize:12, cursor:"pointer", boxShadow:filter===f?"0 3px 12px rgba(26,92,26,.3)":"none", flexShrink:0 }}>
                        {filterLabel(f)} <span style={{ opacity:.75 }}>({countFor(f)})</span>
                    </button>
                ))}
            </div>

            {/* List */}
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {shown.length === 0
                    ? <div style={{ textAlign:"center", padding:"50px 0", color:T.muted }}><p style={{ fontSize:44 }}>📭</p><p style={{ fontWeight:600, marginTop:10 }}>No orders found</p></div>
                    : shown.map(o => (
                        <div key={o.id} className="card order-row" onClick={() => onViewOrder(o)} style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:13, background:STATUS_MAP[o.status]?.bg||T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                                {o.status==="DELIVERED"?"✅":o.status==="CANCELLED"||o.status==="PAYMENT_CANCELLED"?"❌":o.status==="READY_FOR_PICKUP"?"📦":o.status==="PICKED_UP"?"🛵":"⏳"}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                                    <p className="order-customer" style={{ margin:0, fontWeight:700, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{o.customer}</p>
                                    <span style={{ fontFamily:"'Fraunces',serif", fontWeight:800, color:T.orange, fontSize:14, flexShrink:0 }}>{fmt(o.total)}</span>
                                </div>
                                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:5, flexWrap:"wrap", gap:4 }}>
                                    <span style={{ fontSize:11, color:T.muted }}>{timeAgo(o.date)}</span>
                                    <StatusBadge status={o.status} />
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

// ─── Image URL Input with Preview ─────────────────────────────────────────────
const ImageUrlInput = ({ value, onChange, label = "Image URL" }) => {
    const [preview, setPreview] = useState(value || "");
    const [error, setError]     = useState(false);

    const handleChange = e => {
        const v = e.target.value;
        onChange(v);
        setPreview(v);
        setError(false);
    };

    return (
        <div>
            <label className="label">{label}</label>
            <input
                className="input-field"
                value={value}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                style={{ marginBottom:8 }}
            />
            {preview && !error ? (
                <img
                    src={preview}
                    alt="Preview"
                    className="img-preview"
                    onError={() => setError(true)}
                />
            ) : error ? (
                <div className="img-placeholder">
                    <span style={{ fontSize:24 }}>🖼️</span>
                    <span>Invalid image URL</span>
                </div>
            ) : (
                <div className="img-placeholder">
                    <span style={{ fontSize:24 }}>🖼️</span>
                    <span>Paste an image URL to preview</span>
                </div>
            )}
        </div>
    );
};

// ─── Menu Tab ─────────────────────────────────────────────────────────────────
const MenuTab = ({ vendor, onToast }) => {
    const [items,    setItems]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [showAdd,  setShowAdd]  = useState(false);
    const [newItem,  setNewItem]  = useState({
        name: "", price: "", category: "", description: "", imageUrl: "", available: true,
    });

    const loadMenu = useCallback(async () => {
        setLoading(true);
        try {
            let data;
            try { data = await vendorApi.getMenu(); }
            catch {
                if (vendor?.id) data = await publicApi.getRestaurantMenu(vendor.id);
                else throw new Error("No vendor ID");
            }
            let arr = [];
            if (Array.isArray(data))                 arr = data;
            else if (Array.isArray(data?.data))      arr = data.data;
            else if (Array.isArray(data?.items))     arr = data.items;
            else if (Array.isArray(data?.menuItems)) arr = data.menuItems;
            else if (Array.isArray(data?.content))   arr = data.content;
            setItems(arr.map(i => ({
                id:          i._id || i.id,
                name:        i.name,
                price:       i.price,
                category:    i.category || "Uncategorized",
                available:   i.available !== false,
                description: i.description || "",
                imageUrl:    i.imageUrl || "",
            })));
        } catch(e) {
            onToast("Failed to load menu: " + e.message, "error");
            setItems([]);
        } finally { setLoading(false); }
    }, [vendor?.id, onToast]);

    useEffect(() => { loadMenu(); }, [loadMenu]);

    const resetNew = () => setNewItem({ name:"", price:"", category:"", description:"", imageUrl:"", available:true });

    const addItem = async () => {
        if (!newItem.name.trim() || !newItem.price) { onToast("Name and price required","error"); return; }
        if (!vendor?.id) { onToast("Vendor profile not loaded — please refresh","error"); return; }
        setSaving(true);
        try {
            await vendorApi.addMenuItem({
                vendorId:    vendor.id,
                name:        newItem.name.trim(),
                price:       Number(newItem.price),
                category:    newItem.category || "Main Dish",
                available:   newItem.available,
                description: newItem.description || "",
                imageUrl:    newItem.imageUrl || "",
            });
            onToast("Item added!");
            resetNew();
            setShowAdd(false);
            await loadMenu();
        } catch(e) { onToast("Failed: "+e.message,"error"); }
        finally { setSaving(false); }
    };

    const updateItem = async item => {
        if (!item.name.trim() || !item.price) { onToast("Name and price required","error"); return; }
        setSaving(true);
        try {
            await vendorApi.updateMenuItem(item.id, {
                vendorId:    vendor.id,
                name:        item.name,
                price:       Number(item.price),
                category:    item.category,
                available:   item.available,
                description: item.description || "",
                imageUrl:    item.imageUrl || "",
            });
            onToast("Item updated!");
            setEditing(null);
            await loadMenu();
        } catch(e) { onToast("Failed: "+e.message,"error"); }
        finally { setSaving(false); }
    };

    const deleteItem = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            await vendorApi.deleteMenuItem(id);
            onToast("Item deleted!");
            await loadMenu();
        } catch(e) { onToast("Failed: "+e.message,"error"); }
    };

    const toggleAvail = async item => {
        try {
            await vendorApi.updateMenuItem(item.id, { ...item, vendorId: vendor.id, available:!item.available });
            setItems(prev => prev.map(i => i.id===item.id ? { ...i, available:!i.available } : i));
            onToast(`${item.name} is now ${!item.available?"available":"hidden"}`);
        } catch(e) { onToast("Failed","error"); }
    };

    const grouped = {};
    items.forEach(item => {
        const c = item.category || "Uncategorized";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(item);
    });

    if (loading) return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:16, color:T.muted }}>
            <Spinner size={36} />
            <p style={{ fontWeight:600 }}>Loading menu…</p>
        </div>
    );

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .35s ease" }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                    <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:18, color:T.ink, margin:0 }}>Menu Items</h3>
                    <p style={{ color:T.muted, fontSize:13, margin:"2px 0 0" }}>{items.length} item{items.length!==1?"s":""} total</p>
                </div>
                <button className="btn-primary" onClick={() => { setShowAdd(s => !s); if (showAdd) resetNew(); }} style={{ padding:"10px 18px", fontSize:13 }}>
                    {showAdd ? "✕ Cancel" : "+ Add Item"}
                </button>
            </div>

            {/* ── Add Item Form ── */}
            {showAdd && (
                <div className="card" style={{ padding:20, animation:"fadeUp .25s ease", borderLeft:`4px solid ${T.orange}` }}>
                    <h4 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink, margin:"0 0 18px", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:22 }}>🍽️</span> New Menu Item
                    </h4>

                    {/* Row 1: Name + Price */}
                    <div className="form-row" style={{ display:"flex", gap:10, marginBottom:12 }}>
                        <div style={{ flex:"2 1 180px" }}>
                            <label className="label">Item Name *</label>
                            <input className="input-field" value={newItem.name} onChange={e => setNewItem(p => ({...p,name:e.target.value}))} placeholder="e.g. Jollof Rice" />
                        </div>
                        <div style={{ flex:"1 1 110px" }}>
                            <label className="label">Price (₦) *</label>
                            <input className="input-field" type="number" min="0" value={newItem.price} onChange={e => setNewItem(p => ({...p,price:e.target.value}))} placeholder="1500" />
                        </div>
                    </div>

                    {/* Row 2: Category */}
                    <div style={{ marginBottom:12 }}>
                        <label className="label">Category</label>
                        <select className="input-field" value={newItem.category} onChange={e => setNewItem(p => ({...p,category:e.target.value}))}>
                            <option value="">Select category…</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Main Dish">Main Dish</option>
                            <option value="Sides">Sides</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Desserts">Desserts</option>
                        </select>
                    </div>

                    {/* Row 3: Description */}
                    <div style={{ marginBottom:12 }}>
                        <label className="label">Description</label>
                        <textarea className="input-field" value={newItem.description} onChange={e => setNewItem(p => ({...p,description:e.target.value}))} rows={2} style={{ resize:"none" }} placeholder="Optional short description…" />
                    </div>

                    {/* Row 4: Image URL with preview */}
                    <div style={{ marginBottom:16 }}>
                        <ImageUrlInput
                            value={newItem.imageUrl}
                            onChange={v => setNewItem(p => ({...p,imageUrl:v}))}
                            label="Food Image URL"
                        />
                    </div>

                    {/* Footer: toggle + submit */}
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                        <label className="toggle-wrap">
                            <div className="toggle" style={{ background:newItem.available?T.greenMid:"#ccc" }} onClick={() => setNewItem(p => ({...p,available:!p.available}))}>
                                <div className="toggle-knob" style={{ left:newItem.available?22:3 }} />
                            </div>
                            <span style={{ fontSize:13, color:T.muted }}>Available immediately</span>
                        </label>
                        <button
                            className="btn-primary"
                            onClick={addItem}
                            disabled={saving || !newItem.name.trim() || !newItem.price}
                            style={{ marginLeft:"auto", padding:"11px 26px", fontSize:13 }}
                        >
                            {saving ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><Spinner size={14} /> Adding…</span> : "✓ Add to Menu"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Edit Inline Form ── */}
            {editing && (
                <div className="card" style={{ padding:20, animation:"fadeUp .2s ease", borderLeft:`4px solid ${T.greenMid}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <h4 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:T.ink, margin:0 }}>✏️ Editing: {editing.name}</h4>
                        <button onClick={() => setEditing(null)} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:20 }}>×</button>
                    </div>
                    <div className="form-row" style={{ display:"flex", gap:10, marginBottom:10 }}>
                        <div style={{ flex:"2 1 160px" }}>
                            <label className="label">Name *</label>
                            <input className="input-field" value={editing.name} onChange={e => setEditing({...editing,name:e.target.value})} />
                        </div>
                        <div style={{ flex:"1 1 100px" }}>
                            <label className="label">Price (₦) *</label>
                            <input className="input-field" type="number" min="0" value={editing.price} onChange={e => setEditing({...editing,price:e.target.value})} />
                        </div>
                    </div>
                    <div style={{ marginBottom:10 }}>
                        <label className="label">Category</label>
                        <select className="input-field" value={editing.category} onChange={e => setEditing({...editing,category:e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Main Dish">Main Dish</option>
                            <option value="Sides">Sides</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Desserts">Desserts</option>
                        </select>
                    </div>
                    <div style={{ marginBottom:10 }}>
                        <label className="label">Description</label>
                        <textarea className="input-field" value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})} rows={2} style={{ resize:"none" }} />
                    </div>
                    <div style={{ marginBottom:14 }}>
                        <ImageUrlInput
                            value={editing.imageUrl || ""}
                            onChange={v => setEditing({...editing,imageUrl:v})}
                            label="Food Image URL"
                        />
                    </div>
                    <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                        <button className="btn-outline" onClick={() => setEditing(null)} style={{ padding:"10px 20px" }}>Cancel</button>
                        <button className="btn-primary" onClick={() => updateItem(editing)} disabled={saving} style={{ padding:"10px 24px" }}>
                            {saving ? "Saving…" : "💾 Save Changes"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Menu list ── */}
            {items.length === 0
                ? <div className="card" style={{ padding:"60px 0", textAlign:"center", color:T.muted }}>
                    <p style={{ fontSize:52 }}>📋</p>
                    <p style={{ fontWeight:700, fontSize:16, marginTop:10 }}>Your menu is empty</p>
                    <p style={{ fontSize:13, marginTop:6 }}>Tap "+ Add Item" to get started!</p>
                </div>
                : Object.keys(grouped).sort().map(cat => (
                    <div key={cat} className="card" style={{ overflow:"hidden" }}>
                        <div style={{ background:`linear-gradient(135deg, ${T.greenLight}, ${T.offWhite})`, padding:"10px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <span style={{ fontWeight:800, fontSize:12, color:T.green, textTransform:"uppercase", letterSpacing:1 }}>🍽 {cat}</span>
                            <span style={{ fontSize:12, color:T.muted }}>{grouped[cat].length} item{grouped[cat].length!==1?"s":""}</span>
                        </div>
                        {grouped[cat].map((item, i) => (
                            <div key={item.id} className="menu-row" style={{ padding:"13px 16px", borderBottom:i<grouped[cat].length-1?`1px solid ${T.border}`:"none" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                    {/* Thumbnail */}
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            style={{ width:52, height:52, borderRadius:12, objectFit:"cover", border:`1.5px solid ${T.border}`, flexShrink:0 }}
                                            onError={e => { e.target.style.display="none"; }}
                                        />
                                    ) : (
                                        <div style={{ width:52, height:52, borderRadius:12, background:T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🍽️</div>
                                    )}
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                            <p style={{ margin:0, fontWeight:700, fontSize:14, color:item.available?T.ink:"#bbb" }}>{item.name}</p>
                                            {!item.available && <span style={{ fontSize:10, background:T.redLight, color:T.red, padding:"1px 7px", borderRadius:10, fontWeight:700 }}>Hidden</span>}
                                        </div>
                                        {item.description && <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.description}</p>}
                                        <p style={{ margin:"3px 0 0", fontWeight:800, fontSize:13, color:item.available?T.orange:"#ccc", fontFamily:"'Fraunces',serif" }}>{fmt(item.price)}</p>
                                    </div>
                                    <div className="menu-item-actions" style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                                        {/* Toggle */}
                                        <div className="toggle-wrap" onClick={() => toggleAvail(item)} title={item.available?"Hide item":"Show item"}>
                                            <div className="toggle" style={{ background:item.available?T.greenMid:"#ccc" }}>
                                                <div className="toggle-knob" style={{ left:item.available?22:3 }} />
                                            </div>
                                        </div>
                                        {/* Edit */}
                                        <button
                                            onClick={() => { setEditing({...item}); setShowAdd(false); window.scrollTo({ top:0, behavior:"smooth" }); }}
                                            title="Edit item"
                                            style={{ background:"none", border:"none", cursor:"pointer", width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}
                                            onMouseEnter={e => e.currentTarget.style.background=T.greenLight}
                                            onMouseLeave={e => e.currentTarget.style.background="none"}
                                        >✏️</button>
                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteItem(item.id, item.name)}
                                            title="Delete item"
                                            style={{ background:"none", border:"none", cursor:"pointer", width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}
                                            onMouseEnter={e => e.currentTarget.style.background=T.redLight}
                                            onMouseLeave={e => e.currentTarget.style.background="none"}
                                        >🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            }
        </div>
    );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ vendor, onUpdate, onToast }) => {
    const [v, setV]           = useState(vendor);
    const [saving, setSaving] = useState(false);
    const set = (k, val) => setV(prev => ({...prev,[k]:val}));
    const toggleDay = d => set("openDays", (v.openDays||[]).includes(d) ? (v.openDays||[]).filter(x=>x!==d) : [...(v.openDays||[]),d]);
    const togglePkg = pkg => set("packages", (v.packages||[]).find(p=>p.id===pkg.id) ? (v.packages||[]).filter(p=>p.id!==pkg.id) : [...(v.packages||[]),pkg]);

    const save = async () => {
        setSaving(true);
        try {
            await vendorApi.updateProfile({
                restaurantName:        v.name,
                restaurantDescription: v.description,
                category:              v.category,
                restaurantPhone:       v.phone,
                restaurantEmail:       v.email,
                restaurantAddress:     v.address,
                landmark:              v.landmark,
                openDays:              v.openDays,
                openTime:              v.openTime,
                closeTime:             v.closeTime,
                deliveryFromPrice:     Number(v.deliveryFrom)||0,
                packages:              (v.packages||[]).map(p => ({ id:p.id||p._id, name:p.name, price:p.price })),
                logoUrl:               v.logoUrl,
                bankName:              v.bankName      || null,
                accountNumber:         v.accountNumber || null,
                accountName:           v.accountName   || null,
            });
            onUpdate(v);
            onToast("Profile saved!");
        } catch(e) { onToast("Failed: "+e.message,"error"); }
        finally { setSaving(false); }
    };

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
        <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
            {v.logoUrl && (
                <Section title="🖼️ Logo">
                    <img src={v.logoUrl} alt="logo" style={{ width:72, height:72, borderRadius:16, objectFit:"cover", border:`2px solid ${T.border}` }} />
                    <p style={{ fontSize:12, color:T.muted, margin:0 }}>To update your logo, contact support.</p>
                </Section>
            )}

            <Section title="🏪 Business Info">
                <Field label="Restaurant Name *">
                    <input className="input-field" value={v.name||""} onChange={e => set("name",e.target.value)} />
                </Field>
                <Field label="Description">
                    <textarea className="input-field" value={v.description||""} onChange={e => set("description",e.target.value)} rows={3} style={{ resize:"none", lineHeight:1.6 }} />
                </Field>
                <Field label="Category *">
                    <select className="input-field" value={v.category||""} onChange={e => set("category",e.target.value)}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>
                <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Field label="Phone *"><input className="input-field" value={v.phone||""} onChange={e => set("phone",e.target.value)} placeholder="+234…" /></Field>
                    <Field label="Email"><input className="input-field" value={v.email||""} onChange={e => set("email",e.target.value)} placeholder="you@example.com" /></Field>
                </div>
            </Section>

            <Section title="🏦 Payout Details">
                <p style={{ fontSize:12, color:T.muted, margin:"0 0 4px" }}>Required to receive weekly earnings payouts.</p>
                <Field label="Bank Name">
                    <input className="input-field" value={v.bankName||""} onChange={e => set("bankName",e.target.value)} placeholder="e.g. GTBank, First Bank, Opay" />
                </Field>
                <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Field label="Account Number">
                        <input className="input-field" type="tel" value={v.accountNumber||""} onChange={e => set("accountNumber", e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="0123456789" style={{ letterSpacing:2 }} />
                    </Field>
                    <Field label="Account Name">
                        <input className="input-field" value={v.accountName||""} onChange={e => set("accountName",e.target.value)} placeholder="As on your bank account" />
                    </Field>
                </div>
            </Section>

            <Section title="📍 Location & Hours">
                <Field label="Address *"><input className="input-field" value={v.address||""} onChange={e => set("address",e.target.value)} /></Field>
                <Field label="Landmark"><input className="input-field" value={v.landmark||""} onChange={e => set("landmark",e.target.value)} placeholder="e.g. Opposite the main gate" /></Field>
                <Field label="Open Days *">
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:4 }}>
                        {DAYS.map(d => {
                            const on = (v.openDays||[]).includes(d);
                            return (
                                <div key={d} className="day-btn" onClick={() => toggleDay(d)}
                                     style={{ background:on?T.green:T.offWhite, color:on?"white":T.muted, border:`1.5px solid ${on?T.green:T.border}` }}>
                                    {d}
                                </div>
                            );
                        })}
                    </div>
                </Field>
                <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <Field label="Opening Time *"><input className="input-field" type="time" value={v.openTime||"08:00"} onChange={e => set("openTime",e.target.value)} /></Field>
                    <Field label="Closing Time *"><input className="input-field" type="time" value={v.closeTime||"20:00"} onChange={e => set("closeTime",e.target.value)} /></Field>
                </div>
                <Field label="Delivery From (₦) *">
                    <input className="input-field" type="number" value={v.deliveryFrom||""} onChange={e => set("deliveryFrom",e.target.value)} placeholder="500" />
                </Field>
            </Section>

            <Section title="📦 Packaging Options">
                {PRESET_PACKAGES.map(pkg => {
                    const on = !!(v.packages||[]).find(p => p.id===pkg.id);
                    return (
                        <div key={pkg.id} className="pkg-row" onClick={() => togglePkg(pkg)}
                             style={{ background:on?T.greenLight:T.offWhite, border:`2px solid ${on?T.greenMid:T.border}` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${on?T.green:T.border}`, background:on?T.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .18s" }}>
                                    {on && <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                                </div>
                                <span style={{ fontWeight:600, fontSize:14, color:T.ink }}>{pkg.name}</span>
                            </div>
                            <span style={{ fontWeight:700, color:T.orange, fontSize:13 }}>{pkg.price===0?"Free":fmt(pkg.price)}</span>
                        </div>
                    );
                })}
            </Section>

            <button className="btn-primary" onClick={save} disabled={saving} style={{ width:"100%", padding:16, fontSize:15 }}>
                {saving ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><Spinner size={16} /> Saving…</span> : "💾 Save Profile"}
            </button>
        </div>
    );
};

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
    { id:"overview", label:"Overview", icon:"📊" },
    { id:"orders",   label:"Orders",   icon:"🛒" },
    { id:"menu",     label:"Menu",     icon:"🍽️" },
    { id:"profile",  label:"Profile",  icon:"🏪" },
];

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
const DesktopSidebar = ({ vendor, tab, setTab, onLogout, toggleOpen, pendingCount }) => {
    const initials = vendor?.name?.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "V";

    const handleLogout = () => {
        localStorage.removeItem("tastycart_vendor");
        if (onLogout) onLogout();
        else window.location.href = "/login";
    };

    return (
        <aside className="desktop-sidebar" style={{
            width:224, flexShrink:0, background:`linear-gradient(180deg, ${T.dark} 0%, #0d1f0d 100%)`,
            display:"flex", flexDirection:"column", padding:"22px 12px",
            position:"fixed", top:0, left:0, height:"100vh", overflowY:"auto", zIndex:800,
        }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:9, paddingLeft:4, marginBottom:28 }}>
                <TastycartLogo size={34} />
                <div>
                    <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:17, color:"white", margin:0, letterSpacing:-.3 }}>Tasty<span style={{ color:T.orange }}>cart</span></p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", margin:0, letterSpacing:.5 }}>VENDOR</p>
                </div>
            </div>

            <nav style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                            className={`nav-item${tab===t.id?" active":""}`}
                            style={{ display:"flex", alignItems:"center", gap:11, padding:"11px 13px", borderRadius:13, border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:"rgba(255,255,255,.55)", fontWeight:600, fontFamily:"'DM Sans',sans-serif", fontSize:13, background:"transparent", position:"relative" }}>
                        <span style={{ fontSize:17 }}>{t.icon}</span>
                        <span>{t.label}</span>
                        {t.id==="orders" && pendingCount>0 && (
                            <span style={{ marginLeft:"auto", background:T.orange, color:"white", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop:"auto", paddingTop:14, display:"flex", flexDirection:"column", gap:9 }}>
                <div style={{ background:"rgba(255,255,255,.07)", borderRadius:13, padding:"11px 13px" }}>
                    <p style={{ margin:"0 0 7px", fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Status</p>
                    <div className="toggle-wrap" onClick={toggleOpen}>
                        <div className="toggle" style={{ background:vendor.isOpen?T.greenMid:"#555" }}>
                            <div className="toggle-knob" style={{ left:vendor.isOpen?22:3 }} />
                        </div>
                        <span style={{ fontSize:13, color:vendor.isOpen?"#7de07d":"rgba(255,255,255,.4)", fontWeight:700 }}>{vendor.isOpen?"Open":"Closed"}</span>
                    </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 11px", background:"rgba(255,255,255,.05)", borderRadius:13 }}>
                    {vendor.logoUrl
                        ? <img src={vendor.logoUrl} alt="" style={{ width:32, height:32, borderRadius:9, objectFit:"cover", flexShrink:0 }} />
                        : <div style={{ width:32, height:32, borderRadius:9, background:T.greenMid, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"white", flexShrink:0 }}>{initials}</div>
                    }
                    <div style={{ minWidth:0 }}>
                        <p style={{ margin:0, fontSize:12, fontWeight:700, color:"white", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{vendor.name}</p>
                        <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,.35)" }}>{vendor.category||"Vendor"}</p>
                    </div>
                </div>

                <button onClick={handleLogout} className="btn-outline" style={{ width:"100%", padding:"8px", fontSize:12, borderColor:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.4)", background:"transparent" }}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
};

// ─── Bottom Nav (Mobile) ──────────────────────────────────────────────────────
const BottomNav = ({ tab, setTab, pendingCount, onLogout }) => {
    const handleLogout = () => {
        localStorage.removeItem("tastycart_vendor");
        if (onLogout) onLogout();
        else window.location.href = "/login";
    };

    return (
        <nav className="bottom-nav">
            {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`bottom-nav-item${tab===t.id?" active":""}`}>
                    {t.id==="orders" && pendingCount>0 && <span className="bottom-nav-badge">{pendingCount}</span>}
                    <span className="nav-icon">{t.icon}</span>
                    <span>{t.label}</span>
                </button>
            ))}
            {/* Mobile Logout Button */}
            <button onClick={handleLogout} className="bottom-nav-item">
                <span className="nav-icon">🚪</span>
                <span>Logout</span>
            </button>
        </nav>
    );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function VendorDashboard({ onLogout }) {
    const [vendor,    setVendor]    = useState(null);
    const [orders,    setOrders]    = useState([]);
    const [tab,       setTab]       = useState("overview");
    const [viewOrder, setViewOrder] = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [toast,     setToast]     = useState(null);
    const isMobile = useIsMobile(768);

    const showToast = (msg, type="success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const raw = await vendorApi.getProfile();
                if (!raw) { showToast("Profile not found","error"); setLoading(false); return; }
                const v = normaliseVendor(raw);
                setVendor(v);
                if (v.status === "APPROVED") {
                    const rawOrders = await orderApi.getVendorOrders();
                    const list = Array.isArray(rawOrders) ? rawOrders : rawOrders?.orders||rawOrders?.data||rawOrders?.content||[];
                    setOrders(list.map(normaliseOrder));
                }
            } catch(err) {
                if (err.status===401 || err.message?.includes("401")) {
                    showToast("Session expired, please log in again","error");
                    if (onLogout) setTimeout(onLogout, 2000);
                } else {
                    showToast("Failed to load: "+err.message,"error");
                }
            } finally { setLoading(false); }
        })();
    }, [onLogout]);

    const updateVendor = v => {
        setVendor(v);
        try { localStorage.setItem("tastycart_vendor", JSON.stringify(v)); } catch(_) {}
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await orderApi.updateOrderStatus(id, status);
            setOrders(prev => prev.map(o => o.id===id ? {...o,status} : o));
            showToast("Order updated!");
        } catch(err) { showToast("Failed: "+err.message,"error"); }
    };

    const toggleOpen = async () => {
        try {
            await vendorApi.toggleOpen();
            setVendor(prev => ({...prev, isOpen:!prev.isOpen}));
            showToast(vendor?.isOpen ? "Restaurant closed" : "Restaurant is now open!");
        } catch(e) { showToast("Failed to toggle","error"); }
    };

    const pendingCount = orders.filter(o => o.status === "PENDING").length;

    // ── Loading ──
    if (loading) return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:18 }}>
                <TastycartLogo size={60} />
                <Spinner size={28} />
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.green }}>Loading dashboard…</p>
            </div>
        </>
    );

    if (!vendor) return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16, padding:24 }}>
                <TastycartLogo size={68} />
                <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:21, color:T.ink }}>No profile found</h2>
                <p style={{ color:T.muted, fontSize:14, textAlign:"center" }}>Complete your vendor registration to get started.</p>
                {onLogout && <button className="btn-primary" onClick={onLogout} style={{ padding:"12px 28px", marginTop:8 }}>← Go Back</button>}
            </div>
        </>
    );

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            <div style={{ minHeight:"100vh", display:"flex", background:T.offWhite }}>

                {/* ── Desktop Sidebar ── */}
                <DesktopSidebar
                    vendor={vendor}
                    tab={tab}
                    setTab={setTab}
                    onLogout={onLogout}
                    toggleOpen={toggleOpen}
                    pendingCount={pendingCount}
                />

                {/* ── Main content ── */}
                <div className="main-content-area" style={{ marginLeft: isMobile ? 0 : 224, flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
                    {/* Top bar */}
                    <header style={{ background:"white", borderBottom:`1px solid ${T.border}`, height:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", position:"sticky", top:0, zIndex:500, boxShadow:"0 1px 8px rgba(0,0,0,.05)" }}>
                        <div>
                            <h1 className="header-title" style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:17, color:T.ink, margin:0, letterSpacing:-.3 }}>
                                {TABS.find(t => t.id===tab)?.icon} {TABS.find(t => t.id===tab)?.label}
                            </h1>
                            <p style={{ margin:0, fontSize:11, color:T.muted }}>
                                {new Date().toLocaleDateString("en-NG", { weekday:"long", day:"numeric", month:"long" })}
                            </p>
                        </div>

                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {pendingCount > 0 && (
                                <div className="pending-badge" onClick={() => setTab("orders")} style={{ display:"flex", alignItems:"center", gap:6, background:T.orangeLight, border:`1.5px solid #ffd080`, borderRadius:50, padding:"5px 12px", cursor:"pointer" }}>
                                    <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.5s infinite" }} />
                                    <span style={{ fontWeight:700, fontSize:12, color:"#9a5a00" }}>{pendingCount} pending</span>
                                </div>
                            )}
                            {/* Open/Closed indicator on mobile */}
                            {isMobile && (
                                <div onClick={toggleOpen} style={{ display:"flex", alignItems:"center", gap:5, background:vendor.isOpen?T.greenLight:T.redLight, borderRadius:50, padding:"5px 11px", cursor:"pointer", border:`1.5px solid ${vendor.isOpen?"#a8d5a8":"#f5a5a5"}` }}>
                                    <div style={{ width:7, height:7, borderRadius:"50%", background:vendor.isOpen?T.greenMid:T.red }} />
                                    <span style={{ fontSize:11, fontWeight:700, color:vendor.isOpen?T.green:T.red }}>{vendor.isOpen?"Open":"Closed"}</span>
                                </div>
                            )}
                            {!isMobile && (
                                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                    <div style={{ width:8, height:8, borderRadius:"50%", background:vendor.isOpen?T.greenMid:"#ccc" }} />
                                    <span style={{ fontSize:12, fontWeight:600, color:T.muted }}>{vendor.isOpen?"Open":"Closed"}</span>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Page content */}
                    <main style={{ flex:1, padding:"22px 20px 60px", maxWidth:960, width:"100%", margin:"0 auto" }}>
                        <div key={tab}>
                            {tab==="overview" && <OverviewTab vendor={vendor} orders={orders} onViewOrder={setViewOrder} />}
                            {tab==="orders"   && <OrdersTab orders={orders} onViewOrder={setViewOrder} onUpdateStatus={updateOrderStatus} />}
                            {tab==="menu" && (
                                vendor.status !== "APPROVED"
                                    ? <div className="card" style={{ padding:"40px 24px", textAlign:"center", color:T.muted }}>
                                        <p style={{ fontSize:48 }}>🔒</p>
                                        <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:18, color:T.ink, margin:"12px 0 8px" }}>
                                            Account Pending Approval
                                        </h3>
                                        <p style={{ fontSize:14, lineHeight:1.6 }}>
                                            Your vendor account status is <strong>{vendor.status}</strong>.<br/>
                                            Menu management is available once your account is approved.
                                        </p>
                                    </div>
                                    : <MenuTab vendor={vendor} onToast={showToast} />
                            )}
                            {tab==="profile"  && <ProfileTab vendor={vendor} onUpdate={updateVendor} onToast={showToast} />}
                        </div>
                    </main>
                </div>
            </div>

            {/* ── Mobile bottom nav ── */}
            <BottomNav tab={tab} setTab={setTab} pendingCount={pendingCount} onLogout={onLogout} />

            {/* ── Order detail modal (bottom sheet) ── */}
            {viewOrder && (
                <OrderModal
                    order={viewOrder}
                    onClose={() => setViewOrder(null)}
                    onUpdateStatus={updateOrderStatus}
                />
            )}
        </>
    );
}