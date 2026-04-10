// TastycartRiderDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { riderApi, orderApi } from "../utils/Api.js";
import Logo from "../assets/tasty.jpg.jpeg";

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
    riderStatus:  o.riderStatus || (
        o.status==="PICKED_UP"                                   ? "Picked Up"
            : o.status==="DELIVERED"                                 ? "Delivered"
                : ["ACCEPTED","PREPARING","READY_FOR_PICKUP"].includes(o.status) ? "Accepted"
                    : "Available"
    ),
    completedAt:  o.completedAt || o.updatedAt,
});

// ─── Tastycart Logo SVG ───────────────────────────────────────────────────────
const TastycartLogo = ({ size = 32 }) => (
    <img
        src={Logo}
        width={size}
        height={size}
        alt="Tastycart Logo"
        style={{borderRadius : 7}}
    />
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

    // ── Logout handler ──
    const handleLogout = () => {
        // Clear stored rider data
        localStorage.removeItem("tastycart_rider");

        // Call the onLogout prop if provided
        if (onLogout) {
            onLogout();
        } else {
            // If no onLogout prop, redirect to login page
            window.location.href = "/login";
        }
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
            const active    = myOrders.filter(o => ["ACCEPTED","PREPARING","READY_FOR_PICKUP","PICKED_UP"].includes(o.status));
            const completed = myOrders.filter(o => o.status==="DELIVERED").map(o => ({ ...normaliseOrder(o), completedAt:o.updatedAt||o.completedAt }));
            if (active.length > 0) {
                const cur = active[0];
                setActiveDelivery({
                    ...normaliseOrder(cur),
                    riderStatus: cur.status==="PICKED_UP" ? "Picked Up" : "Accepted",
                });
            }
            setCompletedOrders(completed);
        } catch(e) { console.error("Failed to load rider orders:", e); }
    }, []);

    // ── Fetch available orders ──
    const fetchAvailable = useCallback(async () => {
        try {
            const all = await orderApi.getAllReadyForPickupOrders();
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
            await riderApi.setAvailability(newStatus);
            if (newStatus==="OFFLINE") setAvailableOrders([]);
            else await fetchAvailable();
        } catch(err) {
            setRider(prev => ({...prev, availability:rider.availability}));
            showToast("Failed to update availability","error");
        }
    };

    const handleAccept = async (order) => {
        if (!rider?.userId && !rider?.id) { showToast("Rider ID not found","error"); return; }
        const riderId = rider.userId || rider.id;
        try {
            // Assign this rider to the order then set status to ACCEPTED
            await orderApi.assignRider(order._id||order.id, riderId);
            await orderApi.updateOrderStatus(order._id||order.id, "ACCEPTED");
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
            showToast("Order picked up! Deliver to customer. 🏍️");
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

                        <button onClick={handleLogout} className="btn-outline" style={{ width:"100%", padding:"9px", fontSize:12, borderColor:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.4)", background:"transparent" }}>🚪 Logout</button>
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
                {/* Mobile Logout Button */}
                <button onClick={handleLogout} className="tab-btn"
                        style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:"transparent" }}>
                    <span style={{ fontSize:22 }}>🚪</span>
                    <span style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.3 }}>Logout</span>
                </button>
            </nav>
        </>
    );
}