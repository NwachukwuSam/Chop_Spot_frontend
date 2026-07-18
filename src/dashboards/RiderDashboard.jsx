// import { useState, useEffect, useCallback } from "react";
// import { riderApi, orderApi } from "../utils/Api.js";
// import Logo from "../assets/tasty.jpg.jpeg";

// // ─── Brand tokens ─────────────────────────────────────────────────────────────
// const T = {
//     green:      "#1a5c1a",
//     greenMid:   "#2d8a2d",
//     greenLight: "#e8f5e0",
//     greenPale:  "#f2faf2",
//     orange:     "#f28c00",
//     orangeLight:"#fff7e6",
//     orangeDark: "#c97000",
//     dark:       "#0f2410",
//     ink:        "#1c2e1c",
//     muted:      "#5a7a5a",
//     border:     "#d6ebd6",
//     white:      "#ffffff",
//     offWhite:   "#f8fdf8",
//     red:        "#c0392b",
//     redLight:   "#fdecea",
//     blue:       "#1a4a8a",
//     blueLight:  "#e8f0ff",
// };

// const STATUS_META = {
//     PENDING:           { name:"PENDING",           label:"Pending",          bg:"#fff8e1", color:"#b36a00", dot:"#f97316", icon:"🕐" },
//     ACCEPTED:          { name:"ACCEPTED",           label:"Accepted",         bg:"#e8f5e0", color:"#1a6a1a", dot:"#4caf50", icon:"✅" },
//     PREPARING:         { name:"PREPARING",          label:"Preparing",        bg:"#e3f4fb", color:"#1a6a8a", dot:"#2196f3", icon:"👨‍🍳" },
//     READY_FOR_PICKUP:  { name:"READY_FOR_PICKUP",   label:"Ready for Pickup", bg:"#f3eeff", color:"#6a3ab2", dot:"#9c27b0", icon:"📦" },
//     PICKED_UP:         { name:"PICKED_UP",          label:"Picked Up",        bg:"#fff3e0", color:"#e65100", dot:"#ff9800", icon:"🛵" },
//     DELIVERED:         { name:"DELIVERED",          label:"Delivered",        bg:"#e8f5e0", color:"#2d6a2d", dot:"#4caf50", icon:"🎉" },
//     CANCELLED:         { name:"CANCELLED",          label:"Cancelled",        bg:"#fdecea", color:"#c0392b", dot:"#e74c3c", icon:"❌" },
// };

// const ACTIVE_STATUSES = [
//     STATUS_META.ACCEPTED.name,
//     STATUS_META.READY_FOR_PICKUP.name,
//     STATUS_META.PICKED_UP.name,
// ];

// const resolveStatus = (raw) => {
//     if (!raw) return "PENDING";
//     const upper = String(raw).toUpperCase().replace(/-/g,"_").replace(/ /g,"_");
//     return STATUS_META[upper] ? upper : "PENDING";
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt     = n  => `₦${Number(n||0).toLocaleString()}`;
// const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-NG",{ day:"numeric", month:"short", year:"numeric" }) : "";
// const timeAgo = iso => {
//     if (!iso) return "";
//     const m = Math.floor((Date.now()-new Date(iso))/60000);
//     if (m<1)  return "just now";
//     if (m<60) return `${m}m ago`;
//     const h = Math.floor(m/60);
//     if (h<24) return `${h}h ago`;
//     return fmtDate(iso);
// };

// const getCustomerName = c => {
//     if (!c) return "Customer";
//     if (typeof c==="string") return c;
//     if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
//     return c.fullName||c.name||"Customer";
// };

// const normaliseOrder = (o) => {
//     const status = resolveStatus(o.status||o.riderStatus);
//     let itemsStr = "Food items";
//     if (Array.isArray(o.items)) {
//         itemsStr = o.items.map(i=>`${i.quantity||i.qty||1}x ${i.name||i.itemName||"Item"}`).join(", ");
//     } else if (typeof o.items==="string") {
//         itemsStr = o.items;
//     }
//     return {
//         id:            o.id,
//         customer:      getCustomerName(o.customer),
//         customerPhone: o.customer?.phone||o.customerPhone||o.whatsappNumber||o.phone||"",
//         date:          o.createdAt||o.date||new Date().toISOString(),
//         deliveryFee:   o.deliveryFee||0,
//         pickupFrom:    o.pickupFrom||o.pickupAddress||o.restaurant?.address||o.restaurantAddress||"Restaurant",
//         deliverTo:     o.deliverTo||o.deliveryLocation||o.deliveryAddress||"Customer address",
//         items:         itemsStr,
//         total:         o.totalAmount||o.total||0,
//         status,
//         completedAt:   o.completedAt||o.updatedAt,
//     };
// };

// // ─── Logo ─────────────────────────────────────────────────────────────────────
// const TastycartLogo = ({ size=32 }) => (
//     <img src={Logo} width={size} height={size} alt="Tastycart" style={{ borderRadius:7 }}/>
// );

// // ─── Spinner ──────────────────────────────────────────────────────────────────
// const Spinner = ({ size=28, color=T.greenMid }) => (
//     <div style={{ width:size, height:size, borderRadius:"50%", border:`3px solid ${T.border}`, borderTopColor:color, animation:"spin .7s linear infinite", flexShrink:0 }}/>
// );

// // ─── Global CSS ───────────────────────────────────────────────────────────────
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
//   *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
//   body{font-family:'DM Sans',sans-serif;background:${T.offWhite};-webkit-font-smoothing:antialiased;}
//   ::-webkit-scrollbar{width:4px;}
//   ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px;}
//   input::placeholder,textarea::placeholder{color:#aabcaa;}

//   @keyframes fadeUp   {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
//   @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
//   @keyframes toastIn  {from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
//   @keyframes pulse    {0%,100%{opacity:1}50%{opacity:.35}}
//   @keyframes spin     {to{transform:rotate(360deg)}}
//   @keyframes routeDash{to{stroke-dashoffset:0}}
//   @keyframes glow     {0%,100%{box-shadow:0 0 6px 2px rgba(242,140,0,.4)}50%{box-shadow:0 0 14px 5px rgba(242,140,0,.7)}}
//   @keyframes scaleIn  {from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}

//   .card{background:white;border-radius:20px;border:1px solid ${T.border};}
//   .btn-primary{background:linear-gradient(135deg,${T.green},${T.greenMid});color:white;border:none;cursor:pointer;font-weight:700;border-radius:50px;font-family:'DM Sans',sans-serif;transition:all .2s;}
//   .btn-primary:hover{box-shadow:0 6px 20px rgba(26,92,26,.35);transform:translateY(-1px);}
//   .btn-primary:disabled{background:#c8dcc8;color:#8aaa8a;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
//   .btn-outline{background:white;border:1.5px solid ${T.border};color:${T.muted};cursor:pointer;font-weight:600;border-radius:50px;font-family:'DM Sans',sans-serif;transition:all .2s;}
//   .btn-outline:hover{border-color:${T.greenMid};color:${T.green};}
//   .input-field{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid ${T.border};background:${T.offWhite};font-family:'DM Sans',sans-serif;font-size:14px;color:${T.ink};outline:none;transition:all .2s;}
//   .input-field:focus{border-color:${T.greenMid};box-shadow:0 0 0 3px rgba(45,138,45,.1);background:white;}
//   .label{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;color:${T.muted};text-transform:uppercase;margin-bottom:5px;}
//   .tab-btn{transition:all .18s;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
//   .tab-btn:hover:not(.active){background:${T.greenLight}!important;}
//   .order-card{transition:box-shadow .2s,transform .18s;}
//   .order-card:hover{box-shadow:0 8px 28px rgba(26,92,26,.14)!important;transform:translateY(-2px);}
//   .nav-item{transition:all .18s;}
//   .nav-item.active{background:linear-gradient(135deg,${T.green},${T.greenMid})!important;color:white!important;box-shadow:0 4px 16px rgba(26,92,26,.28)!important;}
//   .nav-item:not(.active):hover{background:${T.greenLight}!important;color:${T.green}!important;}
//   .next-card{opacity:.88;transition:opacity .2s,transform .2s,box-shadow .2s;}
//   .next-card:hover{opacity:1;}

//   @media(min-width:769px){
//     .bottom-nav{display:none!important;}
//     .desktop-sidebar{display:flex!important;}
//     .main-with-sidebar{margin-left:230px!important;}
//   }
//   @media(max-width:768px){
//     .desktop-sidebar{display:none!important;}
//     .main-with-sidebar{margin-left:0!important;}
//   }
// `;

// // ─── Route Visualiser ─────────────────────────────────────────────────────────
// const RouteViz = ({ from, to, compact=false }) => (
//     <div style={{ padding:compact?"10px 12px":"14px 16px", background:T.offWhite, borderRadius:14, border:`1px solid ${T.border}` }}>
//         <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
//             <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:3, flexShrink:0 }}>
//                 <div style={{ width:10, height:10, borderRadius:"50%", background:T.greenMid, boxShadow:`0 0 6px ${T.greenMid}88`, flexShrink:0 }}/>
//                 <svg width="2" height={compact?18:26} viewBox={`0 0 2 ${compact?18:26}`} style={{ overflow:"visible" }}>
//                     <defs>
//                         <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="0%" stopColor={T.greenMid}/>
//                             <stop offset="100%" stopColor={T.orange}/>
//                         </linearGradient>
//                     </defs>
//                     <line x1="1" y1="0" x2="1" y2={compact?18:26} stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="4 3"/>
//                 </svg>
//                 <div style={{ width:10, height:10, borderRadius:"50%", background:T.orange, boxShadow:`0 0 6px ${T.orange}88`, flexShrink:0 }}/>
//             </div>
//             <div style={{ flex:1, minWidth:0 }}>
//                 <div style={{ marginBottom:compact?8:12 }}>
//                     <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.greenMid, letterSpacing:1.2, textTransform:"uppercase" }}>Pickup</p>
//                     <p style={{ margin:0, fontSize:compact?11:12, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{from}</p>
//                 </div>
//                 <div>
//                     <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.orange, letterSpacing:1.2, textTransform:"uppercase" }}>Deliver to</p>
//                     <p style={{ margin:0, fontSize:compact?11:12, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{to}</p>
//                 </div>
//             </div>
//         </div>
//     </div>
// );

// // ─── Status Badge ─────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//     const meta = STATUS_META[resolveStatus(status)]||STATUS_META.PENDING;
//     return (
//         <span style={{ background:meta.bg, color:meta.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5 }}>
//             <span style={{ width:6, height:6, borderRadius:"50%", background:meta.dot }}/>
//             {meta.label}
//         </span>
//     );
// };

// // ─── Online Toggle ────────────────────────────────────────────────────────────
// const OnlineToggle = ({ isOnline, onToggle, size="md" }) => {
//     const sm = size==="sm";
//     return (
//         <div onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:sm?6:8, cursor:"pointer", userSelect:"none", padding:sm?"5px 11px":"6px 14px", borderRadius:50, background:isOnline?T.greenLight:"#f5f5f5", border:`1.5px solid ${isOnline?T.border:"#e0e0e0"}`, transition:"all .2s" }}>
//             <div style={{ width:sm?30:36, height:sm?17:20, borderRadius:50, background:isOnline?T.greenMid:"#ccc", position:"relative", transition:"background .25s", flexShrink:0 }}>
//                 <div style={{ width:sm?12:15, height:sm?12:15, borderRadius:"50%", background:"white", position:"absolute", top:sm?2.5:2.5, left:isOnline?sm?15:19:sm?2:2, transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
//             </div>
//             <span style={{ fontSize:sm?11:12, fontWeight:700, color:isOnline?T.green:"#aaa", whiteSpace:"nowrap" }}>{isOnline?"Online":"Offline"}</span>
//         </div>
//     );
// };

// // ─── Available Order Card ─────────────────────────────────────────────────────
// // hasActive = rider already has an active delivery — dims slightly + changes CTA to "Queue"
// const AvailableCard = ({ order, onAccept, onDecline, hasActive=false, index=0 }) => {
//     const o = normaliseOrder(order);
//     return (
//         <div
//             className={`order-card${hasActive?" next-card":""}`}
//             style={{
//                 borderRadius:18,
//                 padding:"15px",
//                 background:"white",
//                 border:`1px solid ${hasActive?T.orange+"44":T.border}`,
//                 boxShadow:`0 3px 14px rgba(0,0,0,.05)`,
//                 animation:`fadeUp .35s ease ${index*.06}s both`,
//                 position:"relative",
//                 overflow:"hidden",
//             }}
//         >
//             {/* "Next possible" ribbon */}
//             {hasActive && (
//                 <div style={{ position:"absolute", top:0, right:0, background:`linear-gradient(135deg,${T.orange},${T.orangeDark})`, color:"white", fontSize:9, fontWeight:800, letterSpacing:.8, padding:"4px 12px 4px 10px", borderBottomLeftRadius:10, textTransform:"uppercase" }}>
//                     Next possible
//                 </div>
//             )}

//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:11, paddingRight:hasActive?80:0 }}>
//                 <div>
//                     <p style={{ margin:0, fontSize:12, color:T.muted, fontWeight:600 }}>#{o.id?.slice(-8)}</p>
//                     <p style={{ margin:"3px 0 0", fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>{o.customer}</p>
//                 </div>
//                 <div style={{ textAlign:"right" }}>
//                     <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:T.orange }}>{fmt(o.deliveryFee)}</p>
//                     <p style={{ margin:"1px 0 0", fontSize:10, color:T.muted, fontWeight:600 }}>delivery fee</p>
//                 </div>
//             </div>

//             <RouteViz from={o.pickupFrom} to={o.deliverTo} compact/>

//             <div style={{ display:"flex", gap:8, marginTop:12 }}>
//                 {onDecline && (
//                     <button
//                         className="btn-outline"
//                         onClick={() => onDecline(order)}
//                         style={{ flex:1, padding:"11px", fontSize:13 }}
//                     >
//                         Skip
//                     </button>
//                 )}
//                 <button
//                     onClick={() => onAccept(order)}
//                     style={{
//                         flex:2,
//                         padding:"11px",
//                         background:hasActive
//                             ? `linear-gradient(135deg,${T.orange},${T.orangeDark})`
//                             : `linear-gradient(135deg,${T.green},${T.greenMid})`,
//                         color:"white",
//                         border:"none",
//                         borderRadius:50,
//                         fontWeight:800,
//                         fontSize:14,
//                         cursor:"pointer",
//                         transition:"all .2s",
//                         fontFamily:"'DM Sans',sans-serif",
//                         boxShadow:hasActive?"0 4px 14px rgba(242,140,0,.3)":"0 4px 14px rgba(26,92,26,.25)",
//                     }}
//                 >
//                     {hasActive ? "Queue this order" : "Accept Delivery"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// // ─── Active Delivery Card ─────────────────────────────────────────────────────
// const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered, queuePosition=0 }) => {
//     const o = normaliseOrder(order);
//     const status = o.status;
//     const isPickedUp = status===STATUS_META.PICKED_UP.name;

//     const progressSteps = [
//         { key:"ACCEPTED",  label:"Accepted",  icon:"✅" },
//         { key:"PICKED_UP", label:"Picked Up", icon:"📦" },
//         { key:"DELIVERED", label:"Delivered", icon:"🎯" },
//     ];
//     const currentStepIndex = progressSteps.findIndex(s=>s.key===status);

//     return (
//         <div style={{
//             borderRadius:22,
//             overflow:"hidden",
//             border:`2px solid ${isPickedUp?T.orange:T.greenMid}`,
//             boxShadow:`0 8px 28px ${isPickedUp?"rgba(242,140,0,.18)":"rgba(26,92,26,.16)"}`,
//             background:"white",
//             animation:"scaleIn .35s cubic-bezier(.34,1.56,.64,1)",
//         }}>
//             {/* Banner */}
//             <div style={{
//                 background:isPickedUp
//                     ? `linear-gradient(135deg,${T.dark},#7a3800)`
//                     : `linear-gradient(135deg,${T.dark},${T.green})`,
//                 padding:"12px 18px",
//                 display:"flex",
//                 alignItems:"center",
//                 gap:12,
//             }}>
//                 <div style={{ width:9, height:9, borderRadius:"50%", background:isPickedUp?T.orange:T.greenMid, animation:"pulse 1.2s infinite", flexShrink:0 }}/>
//                 <div style={{ flex:1 }}>
//                     <p style={{ margin:0, fontSize:10, fontWeight:800, color:"rgba(255,255,255,.45)", letterSpacing:1.2 }}>
//                         {queuePosition===0 ? "ACTIVE DELIVERY" : `QUEUED · #${queuePosition+1}`}
//                     </p>
//                     <p style={{ margin:"2px 0 0", fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, color:"white" }}>
//                         {isPickedUp ? "🏍️ En route to customer" : "⏳ Head to restaurant"}
//                     </p>
//                 </div>
//                 <div style={{ textAlign:"right" }}>
//                     <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:19, color:T.orange }}>{fmt(o.deliveryFee)}</p>
//                     <p style={{ margin:0, fontSize:9, color:"rgba(255,255,255,.35)", fontWeight:700, letterSpacing:.8 }}>YOUR EARN</p>
//                 </div>
//             </div>

//             <div style={{ padding:"16px 18px" }}>
//                 {/* Customer row */}
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
//                     <div>
//                         <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:18, color:T.ink }}>{o.customer}</p>
//                         <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>
//                             #{o.id?.slice(-6)}{o.customerPhone?` · ${o.customerPhone}`:""}
//                         </p>
//                     </div>
//                     <StatusBadge status={status}/>
//                 </div>

//                 <RouteViz from={o.pickupFrom} to={o.deliverTo} compact/>

//                 {/* Progress steps */}
//                 <div style={{ display:"flex", alignItems:"center", margin:"15px 0 17px" }}>
//                     {progressSteps.map((step, i) => {
//                         const isDone    = i < currentStepIndex;
//                         const isCurrent = i === currentStepIndex;
//                         return (
//                             <div key={step.key} style={{ display:"flex", alignItems:"center", flex:i<progressSteps.length-1?1:"none" }}>
//                                 <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
//                                     <div style={{ width:28, height:28, borderRadius:"50%", background:isDone?T.greenMid:isCurrent?T.orange:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, border:isCurrent?`2px solid ${T.orange}55`:"none", animation:isCurrent?"glow 2s infinite":undefined, transition:"all .3s" }}>
//                                         {isDone?"✓":step.icon}
//                                     </div>
//                                     <span style={{ fontSize:9, fontWeight:700, color:isDone?T.greenMid:isCurrent?T.orange:T.muted, letterSpacing:.5, whiteSpace:"nowrap" }}>{step.label}</span>
//                                 </div>
//                                 {i<progressSteps.length-1 && (
//                                     <div style={{ flex:1, height:2, background:isDone?T.greenMid:"#eee", margin:"0 4px 14px", borderRadius:1, transition:"background .3s" }}/>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Action button */}
//                 {status !== STATUS_META.DELIVERED.name && (
//                     (status===STATUS_META.ACCEPTED.name || status===STATUS_META.READY_FOR_PICKUP.name) ? (
//                         <button
//                             className="btn-primary"
//                             onClick={() => onPickedUp(o.id)}
//                             style={{ width:"100%", padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 5px 18px rgba(26,92,26,.28)" }}
//                         >
//                             <span style={{ fontSize:18 }}>✅</span> I've Picked Up the Order
//                         </button>
//                     ) : (
//                         <button
//                             onClick={() => onDelivered(o.id)}
//                             style={{ width:"100%", padding:"14px", borderRadius:50, border:"none", background:`linear-gradient(135deg,${T.orange},#fb9a10)`, color:"white", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:15, cursor:"pointer", boxShadow:"0 5px 18px rgba(242,140,0,.36)", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
//                         >
//                             <span style={{ fontSize:18 }}>🎯</span> Mark as Delivered
//                         </button>
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// // ─── Delivery Complete Toast ──────────────────────────────────────────────────
// const DeliveryToast = ({ order, onDismiss }) => (
//     <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99999, width:"calc(100% - 32px)", maxWidth:400, animation:"toastIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
//         <div style={{ background:"white", border:`2px solid ${T.greenMid}`, borderRadius:20, padding:"14px 16px", boxShadow:"0 12px 40px rgba(26,92,26,.2)", display:"flex", alignItems:"center", gap:12 }}>
//             <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${T.green},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🎉</div>
//             <div style={{ flex:1 }}>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.ink, margin:"0 0 1px" }}>Delivery Complete!</p>
//                 <p style={{ fontSize:12, color:T.muted, margin:"0 0 3px" }}>#{order?.id?.slice(-6)} — {order?.customer}</p>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:17, color:T.orange, margin:0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
//             </div>
//             <button onClick={onDismiss} style={{ background:"none", border:"none", color:T.muted, fontSize:22, cursor:"pointer", padding:0, lineHeight:1 }}>×</button>
//         </div>
//     </div>
// );

// // ─── Orders Tab ───────────────────────────────────────────────────────────────
// const OrdersTab = ({
//                        isOnline,
//                        activeDeliveries,
//                        visibleOrders,
//                        onAccept,
//                        onDecline,
//                        onPickedUp,
//                        onDelivered,
//                        onToggleOnline,
//                    }) => {
//     const hasActive = activeDeliveries.length > 0;

//     return (
//         <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

//             {/* ── Summary bar (only when rider has active + is online) ── */}
//             {hasActive && isOnline && (
//                 <div style={{ background:`linear-gradient(135deg,${T.dark},${T.green})`, borderRadius:16, padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", animation:"slideDown .3s ease" }}>
//                     <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                         <span style={{ width:8, height:8, borderRadius:"50%", background:T.orange, animation:"pulse 1.2s infinite", display:"inline-block" }}/>
//                         <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, color:"white" }}>
//                             {activeDeliveries.length} active deliver{activeDeliveries.length!==1?"ies":"y"}
//                         </span>
//                     </div>
//                     {visibleOrders.length > 0 && (
//                         <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.55)" }}>
//                             {visibleOrders.length} more available ↓
//                         </span>
//                     )}
//                 </div>
//             )}

//             {/* ── All active deliveries (each as its own card) ── */}
//             {activeDeliveries.map((order, i) => (
//                 <ActiveDeliveryCard
//                     key={order.id}
//                     order={order}
//                     onPickedUp={onPickedUp}
//                     onDelivered={onDelivered}
//                     queuePosition={i}
//                 />
//             ))}

//             {/* ── Offline banner ── */}
//             {!isOnline && (
//                 <div className="card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, borderLeft:`4px solid ${T.orange}` }}>
//                     <div style={{ width:44, height:44, borderRadius:14, background:T.orangeLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>😴</div>
//                     <div style={{ flex:1 }}>
//                         <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:T.ink }}>You're offline</p>
//                         <p style={{ margin:"3px 0 0", fontSize:13, color:T.muted }}>Go online to start receiving delivery orders</p>
//                     </div>
//                     <button className="btn-primary" onClick={onToggleOnline} style={{ padding:"10px 16px", fontSize:13, whiteSpace:"nowrap", flexShrink:0 }}>Go Online</button>
//                 </div>
//             )}

//             {/* ── Available orders — ALWAYS shown when online, regardless of active deliveries ── */}
//             {isOnline && (
//                 <div>
//                     {/* Section header */}
//                     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
//                         <div>
//                             <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:19, color:T.ink, margin:0 }}>
//                                 {hasActive ? "Available Nearby" : "Available Orders"}
//                             </h2>
//                             <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>
//                                 {visibleOrders.length} order{visibleOrders.length!==1?"s":""} near you
//                                 {hasActive && visibleOrders.length > 0 && " · tap any to queue"}
//                             </p>
//                         </div>
//                         {visibleOrders.length > 0 && (
//                             <span style={{ background:T.orangeLight, color:T.orangeDark, fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, border:`1px solid ${T.orange}44`, display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
//                                 <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
//                                 Live
//                             </span>
//                         )}
//                     </div>

//                     {/* Cards or empty state */}
//                     {visibleOrders.length === 0 ? (
//                         <div className="card" style={{ padding:"48px 20px", textAlign:"center", color:T.muted }}>
//                             <p style={{ fontSize:40, marginBottom:10 }}>🔍</p>
//                             <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>No orders nearby</p>
//                             <p style={{ fontSize:13, marginTop:5 }}>New orders will appear here automatically</p>
//                         </div>
//                     ) : (
//                         <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//                             {visibleOrders.map((o, i) => (
//                                 <AvailableCard
//                                     key={o.id}
//                                     order={o}
//                                     onAccept={onAccept}
//                                     onDecline={onDecline}
//                                     hasActive={hasActive}
//                                     index={i}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// // ─── History Tab ──────────────────────────────────────────────────────────────
// const HistoryTab = ({ orders }) => (
//     <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp .35s ease" }}>
//         <div>
//             <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>Delivery History</h2>
//             <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>{orders.length} completed</p>
//         </div>
//         {orders.length===0 ? (
//             <div className="card" style={{ padding:"60px 0", textAlign:"center", color:T.muted }}>
//                 <p style={{ fontSize:48 }}>📭</p>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.ink, marginTop:12 }}>No deliveries yet</p>
//                 <p style={{ fontSize:13, marginTop:6 }}>Accept your first order to get started</p>
//             </div>
//         ) : (
//             [...orders]
//                 .sort((a,b)=>new Date(b.completedAt||b.date)-new Date(a.completedAt||a.date))
//                 .map((o, i) => {
//                     const norm = normaliseOrder(o);
//                     return (
//                         <div key={norm.id} className="card" style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:13, animation:`fadeUp .35s ease ${i*.05}s both` }}>
//                             <div style={{ width:42, height:42, borderRadius:13, background:T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✅</div>
//                             <div style={{ flex:1, minWidth:0 }}>
//                                 <p style={{ margin:0, fontWeight:700, fontSize:14, color:T.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{norm.customer}</p>
//                                 <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>#{norm.id?.slice(-6)} · {timeAgo(norm.completedAt)}</p>
//                             </div>
//                             <div style={{ textAlign:"right", flexShrink:0 }}>
//                                 <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.orange }}>{fmt(norm.deliveryFee)}</p>
//                                 <p style={{ margin:"2px 0 0", fontSize:11, color:T.greenMid, fontWeight:600 }}>Delivered</p>
//                             </div>
//                         </div>
//                     );
//                 })
//         )}
//     </div>
// );

// // ─── Earnings Tab ─────────────────────────────────────────────────────────────
// const EarningsTab = ({ completedOrders }) => {
//     const total     = completedOrders.reduce((s,o)=>s+(normaliseOrder(o).deliveryFee||0),0);
//     const count     = completedOrders.length;
//     const todayStr  = new Date().toDateString();
//     const todayEarn = completedOrders
//         .filter(o=>new Date(o.completedAt||o.date||o.updatedAt).toDateString()===todayStr)
//         .reduce((s,o)=>s+(normaliseOrder(o).deliveryFee||0),0);
//     const avgEarn   = count>0 ? Math.round(total/count) : 0;
//     const stats     = [
//         { label:"Today",      value:fmt(todayEarn), icon:"☀️", color:T.orange, bg:T.orangeLight },
//         { label:"Average",    value:fmt(avgEarn),   icon:"📊", color:T.blue,   bg:T.blueLight   },
//         { label:"Deliveries", value:count,           icon:"🏍️", color:T.green,  bg:T.greenLight  },
//     ];
//     return (
//         <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
//             <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Earnings</h2>
//             <div style={{ borderRadius:22, overflow:"hidden", background:`linear-gradient(135deg,${T.dark},${T.green})`, padding:"26px 22px", textAlign:"center", position:"relative" }}>
//                 <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
//                 <p style={{ color:"rgba(255,255,255,.45)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 6px" }}>Total Earned</p>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:46, color:T.orange, margin:"0 0 3px", lineHeight:1 }}>{fmt(total)}</p>
//                 <p style={{ color:"rgba(255,255,255,.45)", fontSize:12 }}>from {count} deliveries</p>
//             </div>
//             <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
//                 {stats.map((s,i)=>(
//                     <div key={s.label} className="card" style={{ padding:"13px 10px", textAlign:"center", animation:`fadeUp .4s ease ${i*.08}s both` }}>
//                         <div style={{ fontSize:20, marginBottom:5 }}>{s.icon}</div>
//                         <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:16, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
//                         <p style={{ fontSize:11, color:T.muted, fontWeight:600 }}>{s.label}</p>
//                     </div>
//                 ))}
//             </div>
//             <div className="card" style={{ overflow:"hidden" }}>
//                 <div style={{ padding:"13px 16px 9px", borderBottom:`1px solid ${T.border}` }}>
//                     <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:T.ink, margin:0 }}>Recent Deliveries</h3>
//                 </div>
//                 {completedOrders.length===0
//                     ? <p style={{ padding:"22px", textAlign:"center", color:T.muted, fontSize:13 }}>No deliveries yet</p>
//                     : completedOrders.slice(0,6).map((o,i)=>{
//                         const norm = normaliseOrder(o);
//                         return (
//                             <div key={norm.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<Math.min(completedOrders.length,6)-1?`1px solid ${T.border}`:"none" }}>
//                                 <div>
//                                     <p style={{ margin:0, fontWeight:600, fontSize:13, color:T.ink }}>{norm.customer}</p>
//                                     <p style={{ margin:"2px 0 0", fontSize:11, color:T.muted }}>{timeAgo(norm.completedAt)}</p>
//                                 </div>
//                                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, color:T.orange, fontSize:14 }}>{fmt(norm.deliveryFee)}</p>
//                             </div>
//                         );
//                     })
//                 }
//             </div>
//         </div>
//     );
// };

// // ─── Profile Tab ──────────────────────────────────────────────────────────────
// const ProfileTab = ({ rider, onUpdate, onToast }) => {
//     const [v, setV] = useState({
//         firstName:     rider.firstName     || "",
//         lastName:      rider.lastName      || "",
//         phone:         rider.phone         || "",
//         email:         rider.email         || "",
//         vehicleType:   rider.vehicleType   || "",
//         vehicleNumber: rider.vehicleNumber || rider.driverLicenseNumber || "",
//         bankName:      rider.bankName      || "",
//         accountNumber: rider.accountNumber || "",
//         accountName:   rider.accountName   || "",
//     });
//     const [saving, setSaving] = useState(false);
//     const set = (k,val) => setV(p=>({...p,[k]:val}));

//     const save = async () => {
//         setSaving(true);
//         try {
//             const dto = { firstName:v.firstName, lastName:v.lastName, phone:v.phone, email:v.email, vehicleType:v.vehicleType, vehicleNumber:v.vehicleNumber, bankName:v.bankName, accountNumber:v.accountNumber, accountName:v.accountName };
//             const updated = await riderApi.updateProfile(dto);
//             onUpdate({ ...rider, ...updated, ...dto });
//             onToast("Profile saved!");
//         } catch(e) { onToast("Failed: "+e.message,"error"); }
//         finally { setSaving(false); }
//     };

//     const fullName = `${v.firstName} ${v.lastName}`.trim();
//     const initials = fullName ? fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "R";

//     const Section = ({ title, children }) => (
//         <div className="card" style={{ padding:18, display:"flex", flexDirection:"column", gap:13 }}>
//             <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:14, color:T.ink, margin:0, paddingBottom:9, borderBottom:`2px solid ${T.greenLight}` }}>{title}</h3>
//             {children}
//         </div>
//     );
//     const Field = ({ label, children }) => (
//         <div><label className="label">{label}</label>{children}</div>
//     );

//     return (
//         <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
//             <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Profile</h2>
//             <div style={{ display:"flex", justifyContent:"center" }}>
//                 <div style={{ width:84, height:84, borderRadius:"50%", background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:30, color:"white", border:`4px solid ${T.greenLight}`, boxShadow:`0 8px 24px rgba(26,92,26,.18)` }}>
//                     {initials}
//                 </div>
//             </div>
//             <Section title="👤 Personal Info">
//                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
//                     <Field label="First Name"><input className="input-field" value={v.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="First"/></Field>
//                     <Field label="Last Name"><input  className="input-field" value={v.lastName}  onChange={e=>set("lastName",e.target.value)}  placeholder="Last"/></Field>
//                 </div>
//                 <Field label="Phone"><input className="input-field" value={v.phone} onChange={e=>set("phone",e.target.value)} placeholder="+234…"/></Field>
//                 <Field label="Email"><input className="input-field" value={v.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com"/></Field>
//             </Section>
//             <Section title="🏍️ Vehicle Info">
//                 <Field label="Vehicle Type"><input    className="input-field" value={v.vehicleType}   onChange={e=>set("vehicleType",e.target.value)}   placeholder="e.g. Motorcycle, Bicycle"/></Field>
//                 <Field label="Plate / License No."><input className="input-field" value={v.vehicleNumber} onChange={e=>set("vehicleNumber",e.target.value)} placeholder="e.g. ABC-123XY"/></Field>
//             </Section>
//             <Section title="🏦 Bank Details">
//                 <Field label="Bank Name"><input     className="input-field" value={v.bankName}      onChange={e=>set("bankName",e.target.value)}      placeholder="e.g. First Bank"/></Field>
//                 <Field label="Account Name"><input  className="input-field" value={v.accountName}   onChange={e=>set("accountName",e.target.value)}   placeholder="Full account name"/></Field>
//                 <Field label="Account Number"><input className="input-field" value={v.accountNumber} onChange={e=>set("accountNumber",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="0000000000" style={{ letterSpacing:2 }}/></Field>
//             </Section>
//             <button className="btn-primary" onClick={save} disabled={saving} style={{ width:"100%", padding:15, fontSize:14, boxShadow:"0 6px 18px rgba(26,92,26,.28)" }}>
//                 {saving?"Saving…":"💾 Save Profile"}
//             </button>
//         </div>
//     );
// };

// // ─── TABS ─────────────────────────────────────────────────────────────────────
// const TABS = [
//     { id:"orders",   label:"Orders",   icon:"📋" },
//     { id:"history",  label:"History",  icon:"📦" },
//     { id:"earnings", label:"Earnings", icon:"💰" },
//     { id:"profile",  label:"Profile",  icon:"👤" },
// ];

// // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
// export default function RiderDashboard({ initialRider, onLogout }) {
//     const [rider,            setRider]            = useState(initialRider||null);
//     const [tab,              setTab]              = useState("orders");
//     const [availableOrders,  setAvailableOrders]  = useState([]);
//     const [activeDeliveries, setActiveDeliveries] = useState([]);   // ← now an array
//     const [completedOrders,  setCompletedOrders]  = useState([]);
//     const [declinedIds,      setDeclinedIds]      = useState([]);
//     const [loading,          setLoading]          = useState(true);
//     const [toast,            setToast]            = useState(null);
//     const [toastMsg,         setToastMsg]         = useState(null);
//     const [error,            setError]            = useState(null);

//     const showToast = (msg, type="success") => {
//         setToastMsg({ msg, type });
//         setTimeout(()=>setToastMsg(null), 3200);
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("tastycart_rider");
//         if (onLogout) onLogout();
//         else window.location.href="/login";
//     };

//     // ── Load profile ──────────────────────────────────────────────────────────
//     const loadProfile = useCallback(async () => {
//         setLoading(true); setError(null);
//         try {
//             const profile = initialRider||await riderApi.getProfile();
//             const formatted = {
//                 ...profile,
//                 fullName:`${profile.firstName||""} ${profile.lastName||""}`.trim(),
//                 availability:profile.availability||"OFFLINE",
//                 totalDeliveries:profile.totalDeliveries||0,
//                 earnings:profile.earnings||0,
//             };
//             setRider(formatted);
//             try { localStorage.setItem("tastycart_rider",JSON.stringify(formatted)); } catch(_) {}
//         } catch(err) {
//             setError("Could not load your profile.");
//             try {
//                 const s = localStorage.getItem("tastycart_rider");
//                 if (s) { setRider(JSON.parse(s)); setError(null); }
//             } catch(_) {}
//         } finally { setLoading(false); }
//     }, [initialRider]);

//     // ── Load this rider's own orders (active + completed) ─────────────────────
//     const loadRiderOrders = useCallback(async () => {
//         try {
//             const myOrders = await orderApi.getRiderOrders();
//             if (!Array.isArray(myOrders)) return;

//             const active = myOrders.filter(o => ACTIVE_STATUSES.includes(resolveStatus(o.status)));
//             const completed = myOrders
//                 .filter(o => resolveStatus(o.status)===STATUS_META.DELIVERED.name)
//                 .map(o => ({ ...normaliseOrder(o), completedAt:o.updatedAt||o.completedAt }));

//             setActiveDeliveries(active.map(o => normaliseOrder(o)));
//             setCompletedOrders(completed);
//         } catch(e) { console.error("Failed to load rider orders:", e); }
//     }, []);

//     // ── Fetch available orders for pickup ─────────────────────────────────────
//     const fetchAvailable = useCallback(async () => {
//         try {
//             const all = await orderApi.getAllReadyForPickupOrders();
//             const activeIds = new Set(activeDeliveries.map(o=>o.id));
//             const available = Array.isArray(all)
//                 ? all.filter(o => !o.riderId && !declinedIds.includes(o.id) && !activeIds.has(o.id))
//                 : [];
//             setAvailableOrders(available);
//         } catch(e) { console.error("fetchAvailable:", e); }
//     }, [declinedIds, activeDeliveries]);

//     useEffect(()=>{ loadProfile(); },[loadProfile]);
//     useEffect(()=>{ if(rider) loadRiderOrders(); },[rider?.id, loadRiderOrders]);

//     // Poll continuously when ONLINE — no longer gated by activeDeliveries
//     useEffect(()=>{
//         if (rider?.availability==="ONLINE") {
//             fetchAvailable();
//             const iv = setInterval(fetchAvailable, 30000);
//             return ()=>clearInterval(iv);
//         }
//     }, [rider?.availability, fetchAvailable]);

//     const updateRider = useCallback(updated => {
//         const r = { ...updated, fullName:`${updated.firstName||""} ${updated.lastName||""}`.trim() };
//         setRider(r);
//         try { localStorage.setItem("tastycart_rider",JSON.stringify(r)); } catch(_) {}
//     }, []);

//     const handleToggleOnline = async () => {
//         if (!rider) return;
//         const newStatus = rider.availability==="ONLINE" ? "OFFLINE" : "ONLINE";
//         setRider(prev=>({...prev, availability:newStatus}));
//         try {
//             await riderApi.setAvailability(newStatus);
//             if (newStatus==="OFFLINE") setAvailableOrders([]);
//             else await fetchAvailable();
//         } catch(err) {
//             setRider(prev=>({...prev, availability:rider.availability}));
//             showToast("Failed to update availability","error");
//         }
//     };

//     // ── Accept an order (adds to active queue) ────────────────────────────────
//     const handleAccept = async (order) => {
//         if (!rider?.id) { showToast("Rider ID not found","error"); return; }
//         try {
//             await orderApi.assignRider(order.id, rider.id);
//             const norm = normaliseOrder({ ...order, status:"ACCEPTED" });
//             setActiveDeliveries(prev=>[...prev, norm]);
//             setAvailableOrders(prev=>prev.filter(o=>o.id!==order.id));
//             setTab("orders");
//             const alreadyHasActive = activeDeliveries.length > 0;
//             showToast(
//                 alreadyHasActive
//                     ? "Order queued! Finish your current delivery first. 📋"
//                     : "Order accepted! Head to the restaurant. 🏍️"
//             );
//         } catch(err) { showToast("Failed to accept: "+err.message,"error"); }
//     };

//     const handleDecline = (order) => {
//         setDeclinedIds(prev=>[...prev, order.id]);
//         setAvailableOrders(prev=>prev.filter(o=>o.id!==order.id));
//     };

//     // ── Picked up ─────────────────────────────────────────────────────────────
//     const handlePickedUp = async (id) => {
//         try {
//             await orderApi.updateOrderStatus(id, STATUS_META.PICKED_UP.name);
//             setActiveDeliveries(prev =>
//                 prev.map(o => o.id===id ? { ...o, status:STATUS_META.PICKED_UP.name } : o)
//             );
//             showToast("Order picked up! Deliver to customer. 🏍️");
//         } catch(err) { showToast("Failed: "+err.message,"error"); }
//     };

//     // ── Delivered ─────────────────────────────────────────────────────────────
//     const handleDelivered = async (id) => {
//         try {
//             await orderApi.updateOrderStatus(id, "DELIVERED");
//             const deliveredOrder = activeDeliveries.find(o=>o.id===id);
//             const completed = { ...deliveredOrder, completedAt:new Date().toISOString() };
//             setActiveDeliveries(prev=>prev.filter(o=>o.id!==id));
//             setCompletedOrders(prev=>[completed, ...prev]);
//             setToast(completed);
//             updateRider({ ...rider, totalDeliveries:(rider.totalDeliveries||0)+1, earnings:(rider.earnings||0)+(completed.deliveryFee||0) });
//             setTimeout(()=>setToast(null), 5000);
//             if (rider?.availability==="ONLINE") fetchAvailable();
//         } catch(err) { showToast("Failed: "+err.message,"error"); }
//     };

//     // ── Derived ───────────────────────────────────────────────────────────────
//     const isOnline      = rider?.availability==="ONLINE";
//     const visibleOrders = availableOrders.filter(o=>!declinedIds.includes(o.id));
//     const activeCount   = activeDeliveries.length;
//     const pendingCount  = isOnline ? visibleOrders.length : 0;
//     const totalBadge    = activeCount + pendingCount;
//     const fullName      = rider ? `${rider.firstName||""} ${rider.lastName||""}`.trim()||rider.fullName||"Rider" : "Rider";
//     const initials      = fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"R";

//     // ── Loading ───────────────────────────────────────────────────────────────
//     if (loading) return (
//         <>
//             <style>{CSS}</style>
//             <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:18 }}>
//                 <TastycartLogo size={64}/>
//                 <Spinner size={32}/>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.green }}>Loading your dashboard…</p>
//             </div>
//         </>
//     );

//     if (error&&!rider) return (
//         <>
//             <style>{CSS}</style>
//             <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16, padding:24 }}>
//                 <TastycartLogo size={64}/>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:18, color:T.red }}>{error}</p>
//                 <div style={{ display:"flex", gap:10 }}>
//                     <button className="btn-primary" onClick={loadProfile} style={{ padding:"12px 24px" }}>Try Again</button>
//                     {onLogout && <button className="btn-outline" onClick={onLogout} style={{ padding:"12px 24px" }}>← Back</button>}
//                 </div>
//             </div>
//         </>
//     );

//     if (!rider) return (
//         <>
//             <style>{CSS}</style>
//             <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16 }}>
//                 <TastycartLogo size={72}/>
//                 <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:20, color:T.ink }}>No rider profile found</p>
//                 {onLogout && <button className="btn-primary" onClick={onLogout} style={{ padding:"12px 28px" }}>← Register</button>}
//             </div>
//         </>
//     );

//     return (
//         <>
//             <style>{CSS}</style>

//             {/* Delivery complete toast */}
//             {toast && <DeliveryToast order={toast} onDismiss={()=>setToast(null)}/>}

//             {/* Status toast */}
//             {toastMsg && (
//                 <div style={{ position:"fixed", top:20, right:20, zIndex:99998, background:toastMsg.type==="error"?T.redLight:T.greenLight, color:toastMsg.type==="error"?T.red:T.green, border:`1.5px solid ${toastMsg.type==="error"?"#f5a5a5":"#a8d5a8"}`, borderRadius:14, padding:"11px 16px", fontSize:13, fontWeight:600, boxShadow:"0 6px 28px rgba(0,0,0,.1)", animation:"fadeUp .25s ease", display:"flex", alignItems:"center", gap:8, maxWidth:320 }}>
//                     <span style={{ width:20, height:20, borderRadius:"50%", background:toastMsg.type==="error"?T.red:T.greenMid, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{toastMsg.type==="error"?"!":"✓"}</span>
//                     {toastMsg.msg}
//                 </div>
//             )}

//             <div style={{ minHeight:"100vh", display:"flex", background:T.offWhite }}>

//                 {/* ── Desktop Sidebar ─────────────────────────────────────── */}
//                 <aside className="desktop-sidebar" style={{ width:230, flexShrink:0, background:`linear-gradient(180deg,${T.dark} 0%,#0d1f0d 100%)`, flexDirection:"column", padding:"24px 14px", position:"fixed", top:0, left:0, height:"100vh", overflowY:"auto", zIndex:800 }}>
//                     <div style={{ display:"flex", alignItems:"center", gap:10, paddingLeft:4, marginBottom:28 }}>
//                         <TastycartLogo size={38}/>
//                         <div>
//                             <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:"white", margin:0 }}>Tasty<span style={{ color:T.orange }}>cart</span></p>
//                             <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", margin:0, letterSpacing:.5 }}>RIDER</p>
//                         </div>
//                     </div>

//                     <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
//                         {TABS.map(t => (
//                             <button key={t.id} onClick={()=>setTab(t.id)}
//                                     className={`nav-item${tab===t.id?" active":""}`}
//                                     style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:"rgba(255,255,255,.55)", fontWeight:600, fontFamily:"'DM Sans',sans-serif", fontSize:14, background:"transparent" }}>
//                                 <span style={{ fontSize:18 }}>{t.icon}</span>
//                                 <span>{t.label}</span>
//                                 {t.id==="orders" && totalBadge>0 && (
//                                     <span style={{ marginLeft:"auto", background:activeCount>0?T.orange:T.greenMid, color:"white", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20, minWidth:20, textAlign:"center" }}>
//                                         {totalBadge}
//                                     </span>
//                                 )}
//                             </button>
//                         ))}
//                     </nav>

//                     <div style={{ marginTop:"auto", paddingTop:16, display:"flex", flexDirection:"column", gap:10 }}>
//                         <div style={{ background:"rgba(255,255,255,.07)", borderRadius:14, padding:"12px 14px" }}>
//                             <p style={{ margin:"0 0 8px", fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Availability</p>
//                             <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline}/>
//                         </div>
//                         <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,.05)", borderRadius:14 }}>
//                             <div style={{ width:34, height:34, borderRadius:10, background:T.greenMid, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white", flexShrink:0, fontFamily:"'Fraunces',serif" }}>{initials}</div>
//                             <div style={{ minWidth:0 }}>
//                                 <p style={{ margin:0, fontSize:12, fontWeight:700, color:"white", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fullName}</p>
//                                 <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,.35)" }}>{rider.vehicleType||"Rider"}</p>
//                             </div>
//                         </div>
//                         <button onClick={handleLogout} className="btn-outline" style={{ width:"100%", padding:"9px", fontSize:12, borderColor:"rgba(255,255,255,.15)", color:"rgba(255,255,255,.4)", background:"transparent" }}>🚪 Logout</button>
//                     </div>
//                 </aside>

//                 {/* ── Main content ─────────────────────────────────────────── */}
//                 <div className="main-with-sidebar" style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

//                     {/* Top bar */}
//                     <header style={{ background:"white", borderBottom:`1px solid ${T.border}`, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", position:"sticky", top:0, zIndex:500, boxShadow:"0 1px 8px rgba(0,0,0,.05)" }}>
//                         <div style={{ display:"flex", alignItems:"center", gap:9 }}>
//                             <TastycartLogo size={30}/>
//                             <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:16, color:T.ink, margin:0 }}>
//                                 Tasty<span style={{ color:T.orange }}>cart</span>{" "}
//                                 <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>Rider</span>
//                             </p>
//                         </div>
//                         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                             {activeCount > 0 && (
//                                 <div onClick={()=>setTab("orders")} style={{ display:"flex", alignItems:"center", gap:6, background:T.orangeLight, border:`1.5px solid ${T.orange}44`, borderRadius:50, padding:"5px 12px", cursor:"pointer" }}>
//                                     <span style={{ width:7, height:7, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
//                                     <span style={{ fontSize:11, fontWeight:700, color:T.orangeDark }}>
//                                         {activeCount} active deliver{activeCount!==1?"ies":"y"}
//                                     </span>
//                                 </div>
//                             )}
//                             <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} size="sm"/>
//                             <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>{initials}</div>
//                         </div>
//                     </header>

//                     {/* Page content */}
//                     <main style={{ flex:1, padding:"24px 20px 100px", maxWidth:720, width:"100%", margin:"0 auto" }}>
//                         <div key={tab} style={{ animation:"fadeUp .3s ease" }}>
//                             {tab==="orders" && (
//                                 <OrdersTab
//                                     isOnline={isOnline}
//                                     activeDeliveries={activeDeliveries}
//                                     visibleOrders={visibleOrders}
//                                     onAccept={handleAccept}
//                                     onDecline={handleDecline}
//                                     onPickedUp={handlePickedUp}
//                                     onDelivered={handleDelivered}
//                                     onToggleOnline={handleToggleOnline}
//                                 />
//                             )}
//                             {tab==="history"  && <HistoryTab orders={completedOrders}/>}
//                             {tab==="earnings" && <EarningsTab completedOrders={completedOrders}/>}
//                             {tab==="profile"  && <ProfileTab rider={rider} onUpdate={updateRider} onToast={showToast}/>}
//                         </div>
//                     </main>
//                 </div>
//             </div>

//             {/* ── Mobile Bottom Nav ───────────────────────────────────────── */}
//             <nav className="bottom-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${T.border}`, padding:"8px 8px 16px", display:"flex", justifyContent:"space-around", zIndex:600, boxShadow:"0 -2px 20px rgba(0,0,0,.07)" }}>
//                 {TABS.map(t => {
//                     const active   = tab===t.id;
//                     const badgeNum = t.id==="orders" ? totalBadge : 0;
//                     return (
//                         <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
//                                 style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:active?T.greenLight:"transparent", position:"relative" }}>
//                             <span style={{ fontSize:22 }}>{t.icon}</span>
//                             <span style={{ fontSize:10, fontWeight:700, color:active?T.green:T.muted, letterSpacing:.3 }}>{t.label}</span>
//                             {active && <div style={{ position:"absolute", bottom:0, width:18, height:3, borderRadius:10, background:T.greenMid }}/>}
//                             {badgeNum > 0 && (
//                                 <div style={{ position:"absolute", top:5, right:10, background:activeCount>0?T.orange:T.greenMid, color:"white", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:20, minWidth:16, textAlign:"center" }}>
//                                     {badgeNum}
//                                 </div>
//                             )}
//                         </button>
//                     );
//                 })}
//                 <button onClick={handleLogout} className="tab-btn"
//                         style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:"transparent" }}>
//                     <span style={{ fontSize:22 }}>🚪</span>
//                     <span style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.3 }}>Logout</span>
//                 </button>
//             </nav>
//         </>
//     );
// }


import { useState, useEffect, useCallback } from "react";
import { riderApi, orderApi } from "../utils/Api.js";
import Logo from "../assets/tasty.jpg.jpeg";
import { useSse } from "../hooks/useSse.js";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
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

const STATUS_META = {
    PENDING:           { name:"PENDING",           label:"Pending",          bg:"#fff8e1", color:"#b36a00", dot:"#f97316", icon:"🕐" },
    ACCEPTED:          { name:"ACCEPTED",           label:"Accepted",         bg:"#e8f5e0", color:"#1a6a1a", dot:"#4caf50", icon:"✅" },
    PREPARING:         { name:"PREPARING",          label:"Preparing",        bg:"#e3f4fb", color:"#1a6a8a", dot:"#2196f3", icon:"👨‍🍳" },
    READY_FOR_PICKUP:  { name:"READY_FOR_PICKUP",   label:"Ready for Pickup", bg:"#f3eeff", color:"#6a3ab2", dot:"#9c27b0", icon:"📦" },
    PICKED_UP:         { name:"PICKED_UP",          label:"Picked Up",        bg:"#fff3e0", color:"#e65100", dot:"#ff9800", icon:"🛵" },
    DELIVERED:         { name:"DELIVERED",          label:"Delivered",        bg:"#e8f5e0", color:"#2d6a2d", dot:"#4caf50", icon:"🎉" },
    CANCELLED:         { name:"CANCELLED",          label:"Cancelled",        bg:"#fdecea", color:"#c0392b", dot:"#e74c3c", icon:"❌" },
};

const ACTIVE_STATUSES = [
    STATUS_META.ACCEPTED.name,
    STATUS_META.READY_FOR_PICKUP.name,
    STATUS_META.PICKED_UP.name,
];

const resolveStatus = (raw) => {
    if (!raw) return "PENDING";
    const upper = String(raw).toUpperCase().replace(/-/g,"_").replace(/ /g,"_");
    return STATUS_META[upper] ? upper : "PENDING";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = n  => `₦${Number(n||0).toLocaleString()}`;
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-NG",{ day:"numeric", month:"short", year:"numeric" }) : "";
const timeAgo = iso => {
    if (!iso) return "";
    const m = Math.floor((Date.now()-new Date(iso))/60000);
    if (m<1)  return "just now";
    if (m<60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h<24) return `${h}h ago`;
    return fmtDate(iso);
};

const getCustomerName = c => {
    if (!c) return "Customer";
    if (typeof c==="string") return c;
    if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
    return c.fullName||c.name||"Customer";
};

// ─── FIX: normaliseOrder now extracts hostel (full address) and room (landmark) ──
const normaliseOrder = (o) => {
    const status = resolveStatus(o.status||o.riderStatus);
    let itemsStr = "Food items";
    if (Array.isArray(o.items)) {
        itemsStr = o.items.map(i=>`${i.quantity||i.qty||1}x ${i.name||i.itemName||"Item"}`).join(", ");
    } else if (typeof o.items==="string") {
        itemsStr = o.items;
    }

    // hostel = full delivery address, room = landmark, deliveryLocation = mirror of hostel
    const mainAddress = o.hostel || o.deliveryLocation || o.deliveryAddress || "";
    const landmark    = o.room   || "";

    return {
        id:            o.id,
        customer:      getCustomerName(o.customer||o.customerName),
        customerPhone: o.customer?.phone||o.customerPhone||o.whatsappNumber||o.phone||"",
        date:          o.createdAt||o.date||new Date().toISOString(),
        deliveryFee:   o.deliveryFee||0,
        pickupFrom:    o.pickupFrom||o.pickupAddress||o.restaurant?.address||o.restaurantAddress||o.vendorName||"Restaurant",
        deliverTo:     mainAddress || "Customer address",
        landmark,
        items:         itemsStr,
        total:         o.totalAmount||o.total||0,
        status,
        completedAt:   o.completedAt||o.updatedAt,
    };
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
const TastycartLogo = ({ size=32 }) => (
    <img src={Logo} width={size} height={size} alt="Tastycart" style={{ borderRadius:7 }}/>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size=28, color=T.greenMid }) => (
    <div style={{ width:size, height:size, borderRadius:"50%", border:`3px solid ${T.border}`, borderTopColor:color, animation:"spin .7s linear infinite", flexShrink:0 }}/>
);

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;background:${T.offWhite};-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px;}
  input::placeholder,textarea::placeholder{color:#aabcaa;}

  @keyframes fadeUp   {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes toastIn  {from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes pulse    {0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes spin     {to{transform:rotate(360deg)}}
  @keyframes routeDash{to{stroke-dashoffset:0}}
  @keyframes glow     {0%,100%{box-shadow:0 0 6px 2px rgba(242,140,0,.4)}50%{box-shadow:0 0 14px 5px rgba(242,140,0,.7)}}
  @keyframes scaleIn  {from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}

  .card{background:white;border-radius:20px;border:1px solid ${T.border};}
  .btn-primary{background:linear-gradient(135deg,${T.green},${T.greenMid});color:white;border:none;cursor:pointer;font-weight:700;border-radius:50px;font-family:'DM Sans',sans-serif;transition:all .2s;}
  .btn-primary:hover{box-shadow:0 6px 20px rgba(26,92,26,.35);transform:translateY(-1px);}
  .btn-primary:disabled{background:#c8dcc8;color:#8aaa8a;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
  .btn-outline{background:white;border:1.5px solid ${T.border};color:${T.muted};cursor:pointer;font-weight:600;border-radius:50px;font-family:'DM Sans',sans-serif;transition:all .2s;}
  .btn-outline:hover{border-color:${T.greenMid};color:${T.green};}
  .input-field{width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid ${T.border};background:${T.offWhite};font-family:'DM Sans',sans-serif;font-size:14px;color:${T.ink};outline:none;transition:all .2s;}
  .input-field:focus{border-color:${T.greenMid};box-shadow:0 0 0 3px rgba(45,138,45,.1);background:white;}
  .label{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;color:${T.muted};text-transform:uppercase;margin-bottom:5px;}
  .tab-btn{transition:all .18s;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .tab-btn:hover:not(.active){background:${T.greenLight}!important;}
  .order-card{transition:box-shadow .2s,transform .18s;}
  .order-card:hover{box-shadow:0 8px 28px rgba(26,92,26,.14)!important;transform:translateY(-2px);}
  .nav-item{transition:all .18s;}
  .nav-item.active{background:linear-gradient(135deg,${T.green},${T.greenMid})!important;color:white!important;box-shadow:0 4px 16px rgba(26,92,26,.28)!important;}
  .nav-item:not(.active):hover{background:${T.greenLight}!important;color:${T.green}!important;}
  .next-card{opacity:.88;transition:opacity .2s,transform .2s,box-shadow .2s;}
  .next-card:hover{opacity:1;}

  @media(min-width:769px){
    .bottom-nav{display:none!important;}
    .desktop-sidebar{display:flex!important;}
    .main-with-sidebar{margin-left:230px!important;}
  }
  @media(max-width:768px){
    .desktop-sidebar{display:none!important;}
    .main-with-sidebar{margin-left:0!important;}
  }
`;

// ─── Route Visualiser — FIX: now accepts landmark prop ───────────────────────
const RouteViz = ({ from, to, landmark="", compact=false }) => (
    <div style={{ padding:compact?"10px 12px":"14px 16px", background:T.offWhite, borderRadius:14, border:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:3, flexShrink:0 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:T.greenMid, boxShadow:`0 0 6px ${T.greenMid}88`, flexShrink:0 }}/>
                <svg width="2" height={compact?18:26} viewBox={`0 0 2 ${compact?18:26}`} style={{ overflow:"visible" }}>
                    <defs>
                        <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={T.greenMid}/>
                            <stop offset="100%" stopColor={T.orange}/>
                        </linearGradient>
                    </defs>
                    <line x1="1" y1="0" x2="1" y2={compact?18:26} stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="4 3"/>
                </svg>
                <div style={{ width:10, height:10, borderRadius:"50%", background:T.orange, boxShadow:`0 0 6px ${T.orange}88`, flexShrink:0 }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ marginBottom:compact?8:12 }}>
                    <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.greenMid, letterSpacing:1.2, textTransform:"uppercase" }}>Pickup</p>
                    <p style={{ margin:0, fontSize:compact?11:12, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{from}</p>
                </div>
                <div>
                    <p style={{ margin:"0 0 1px", fontSize:9, fontWeight:800, color:T.orange, letterSpacing:1.2, textTransform:"uppercase" }}>Deliver to</p>
                    <p style={{ margin:0, fontSize:compact?11:12, color:T.ink, fontWeight:600, lineHeight:1.4 }}>{to}</p>
                    {/* FIX: show landmark (room field) below delivery address */}
                    {landmark && (
                        <p style={{ margin:"4px 0 0", fontSize:compact?10:11, color:T.muted, fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                            <span>📍</span>{landmark}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const meta = STATUS_META[resolveStatus(status)]||STATUS_META.PENDING;
    return (
        <span style={{ background:meta.bg, color:meta.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:meta.dot }}/>
            {meta.label}
        </span>
    );
};

// ─── Online Toggle ────────────────────────────────────────────────────────────
const OnlineToggle = ({ isOnline, onToggle, size="md" }) => {
    const sm = size==="sm";
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
const AvailableCard = ({ order, onAccept, onDecline, hasActive=false, index=0 }) => {
    const o = normaliseOrder(order);
    return (
        <div
            className={`order-card${hasActive?" next-card":""}`}
            style={{
                borderRadius:18,
                padding:"15px",
                background:"white",
                border:`1px solid ${hasActive?T.orange+"44":T.border}`,
                boxShadow:`0 3px 14px rgba(0,0,0,.05)`,
                animation:`fadeUp .35s ease ${index*.06}s both`,
                position:"relative",
                overflow:"hidden",
            }}
        >
            {hasActive && (
                <div style={{ position:"absolute", top:0, right:0, background:`linear-gradient(135deg,${T.orange},${T.orangeDark})`, color:"white", fontSize:9, fontWeight:800, letterSpacing:.8, padding:"4px 12px 4px 10px", borderBottomLeftRadius:10, textTransform:"uppercase" }}>
                    Next possible
                </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:11, paddingRight:hasActive?80:0 }}>
                <div>
                    <p style={{ margin:0, fontSize:12, color:T.muted, fontWeight:600 }}>#{o.id?.slice(-8)}</p>
                    <p style={{ margin:"3px 0 0", fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>{o.customer}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:T.orange }}>{fmt(o.deliveryFee)}</p>
                    <p style={{ margin:"1px 0 0", fontSize:10, color:T.muted, fontWeight:600 }}>delivery fee</p>
                </div>
            </div>

            {/* FIX: pass landmark so rider sees full address + landmark */}
            <RouteViz from={o.pickupFrom} to={o.deliverTo} landmark={o.landmark} compact/>

            <div style={{ display:"flex", gap:8, marginTop:12 }}>
                {onDecline && (
                    <button className="btn-outline" onClick={() => onDecline(order)} style={{ flex:1, padding:"11px", fontSize:13 }}>
                        Skip
                    </button>
                )}
                <button
                    onClick={() => onAccept(order)}
                    style={{
                        flex:2, padding:"11px",
                        background:hasActive?`linear-gradient(135deg,${T.orange},${T.orangeDark})`:`linear-gradient(135deg,${T.green},${T.greenMid})`,
                        color:"white", border:"none", borderRadius:50, fontWeight:800, fontSize:14, cursor:"pointer",
                        transition:"all .2s", fontFamily:"'DM Sans',sans-serif",
                        boxShadow:hasActive?"0 4px 14px rgba(242,140,0,.3)":"0 4px 14px rgba(26,92,26,.25)",
                    }}
                >
                    {hasActive ? "Queue this order" : "Accept Delivery"}
                </button>
            </div>
        </div>
    );
};

// ─── Active Delivery Card ─────────────────────────────────────────────────────
const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered, queuePosition=0 }) => {
    const o = normaliseOrder(order);
    const status = o.status;
    const isPickedUp = status===STATUS_META.PICKED_UP.name;

    const progressSteps = [
        { key:"ACCEPTED",  label:"Accepted",  icon:"✅" },
        { key:"PICKED_UP", label:"Picked Up", icon:"📦" },
        { key:"DELIVERED", label:"Delivered", icon:"🎯" },
    ];
    const currentStepIndex = progressSteps.findIndex(s=>s.key===status);

    return (
        <div style={{
            borderRadius:22, overflow:"hidden",
            border:`2px solid ${isPickedUp?T.orange:T.greenMid}`,
            boxShadow:`0 8px 28px ${isPickedUp?"rgba(242,140,0,.18)":"rgba(26,92,26,.16)"}`,
            background:"white", animation:"scaleIn .35s cubic-bezier(.34,1.56,.64,1)",
        }}>
            <div style={{
                background:isPickedUp?`linear-gradient(135deg,${T.dark},#7a3800)`:`linear-gradient(135deg,${T.dark},${T.green})`,
                padding:"12px 18px", display:"flex", alignItems:"center", gap:12,
            }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:isPickedUp?T.orange:T.greenMid, animation:"pulse 1.2s infinite", flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:10, fontWeight:800, color:"rgba(255,255,255,.45)", letterSpacing:1.2 }}>
                        {queuePosition===0 ? "ACTIVE DELIVERY" : `QUEUED · #${queuePosition+1}`}
                    </p>
                    <p style={{ margin:"2px 0 0", fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, color:"white" }}>
                        {isPickedUp ? "🏍️ En route to customer" : "⏳ Head to restaurant"}
                    </p>
                </div>
                <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:19, color:T.orange }}>{fmt(o.deliveryFee)}</p>
                    <p style={{ margin:0, fontSize:9, color:"rgba(255,255,255,.35)", fontWeight:700, letterSpacing:.8 }}>YOUR EARN</p>
                </div>
            </div>

            <div style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
                    <div>
                        <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:18, color:T.ink }}>{o.customer}</p>
                        <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>#{o.id?.slice(-6)}</p>
                    </div>
                    <StatusBadge status={status}/>
                </div>

                <a
                    href={o.customerPhone ? `tel:${o.customerPhone}` : undefined}
                    style={{
                        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                        width:"100%", padding:"11px 0", marginBottom:14,
                        borderRadius:50, border:`2px solid ${o.customerPhone ? T.greenMid : "#ccc"}`,
                        background: o.customerPhone ? T.greenLight : "#f5f5f5",
                        color: o.customerPhone ? T.green : "#aaa",
                        fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:14,
                        textDecoration:"none", cursor: o.customerPhone ? "pointer" : "default",
                        pointerEvents: o.customerPhone ? "auto" : "none",
                    }}
                >
                    <span style={{ fontSize:16 }}>📞</span>
                    {o.customerPhone || "No number on file"}
                </a>

                {/* FIX: pass landmark so rider sees full address + landmark */}
                <RouteViz from={o.pickupFrom} to={o.deliverTo} landmark={o.landmark} compact/>

                <div style={{ display:"flex", alignItems:"center", margin:"15px 0 17px" }}>
                    {progressSteps.map((step, i) => {
                        const isDone    = i < currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        return (
                            <div key={step.key} style={{ display:"flex", alignItems:"center", flex:i<progressSteps.length-1?1:"none" }}>
                                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                                    <div style={{ width:28, height:28, borderRadius:"50%", background:isDone?T.greenMid:isCurrent?T.orange:"#eee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, border:isCurrent?`2px solid ${T.orange}55`:"none", animation:isCurrent?"glow 2s infinite":undefined, transition:"all .3s" }}>
                                        {isDone?"✓":step.icon}
                                    </div>
                                    <span style={{ fontSize:9, fontWeight:700, color:isDone?T.greenMid:isCurrent?T.orange:T.muted, letterSpacing:.5, whiteSpace:"nowrap" }}>{step.label}</span>
                                </div>
                                {i<progressSteps.length-1 && (
                                    <div style={{ flex:1, height:2, background:isDone?T.greenMid:"#eee", margin:"0 4px 14px", borderRadius:1, transition:"background .3s" }}/>
                                )}
                            </div>
                        );
                    })}
                </div>

                {status !== STATUS_META.DELIVERED.name && (
                    (status===STATUS_META.ACCEPTED.name || status===STATUS_META.READY_FOR_PICKUP.name) ? (
                        <button className="btn-primary" onClick={() => onPickedUp(o.id)}
                            style={{ width:"100%", padding:"14px", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 5px 18px rgba(26,92,26,.28)" }}>
                            <span style={{ fontSize:18 }}>✅</span> I've Picked Up the Order
                        </button>
                    ) : (
                        <button onClick={() => onDelivered(o.id)}
                            style={{ width:"100%", padding:"14px", borderRadius:50, border:"none", background:`linear-gradient(135deg,${T.orange},#fb9a10)`, color:"white", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:15, cursor:"pointer", boxShadow:"0 5px 18px rgba(242,140,0,.36)", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <span style={{ fontSize:18 }}>🎯</span> Mark as Delivered
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

// ─── Delivery Complete Toast ──────────────────────────────────────────────────
const DeliveryToast = ({ order, onDismiss }) => (
    <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99999, width:"calc(100% - 32px)", maxWidth:400, animation:"toastIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ background:"white", border:`2px solid ${T.greenMid}`, borderRadius:20, padding:"14px 16px", boxShadow:"0 12px 40px rgba(26,92,26,.2)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${T.green},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>🎉</div>
            <div style={{ flex:1 }}>
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.ink, margin:"0 0 1px" }}>Delivery Complete!</p>
                <p style={{ fontSize:12, color:T.muted, margin:"0 0 3px" }}>#{order?.id?.slice(-6)} — {order?.customer}</p>
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:17, color:T.orange, margin:0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
            </div>
            <button onClick={onDismiss} style={{ background:"none", border:"none", color:T.muted, fontSize:22, cursor:"pointer", padding:0, lineHeight:1 }}>×</button>
        </div>
    </div>
);

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = ({ isOnline, activeDeliveries, visibleOrders, onAccept, onDecline, onPickedUp, onDelivered, onToggleOnline }) => {
    const hasActive = activeDeliveries.length > 0;
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {hasActive && isOnline && (
                <div style={{ background:`linear-gradient(135deg,${T.dark},${T.green})`, borderRadius:16, padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", animation:"slideDown .3s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:T.orange, animation:"pulse 1.2s infinite", display:"inline-block" }}/>
                        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:14, color:"white" }}>
                            {activeDeliveries.length} active deliver{activeDeliveries.length!==1?"ies":"y"}
                        </span>
                    </div>
                    {visibleOrders.length > 0 && (
                        <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.55)" }}>
                            {visibleOrders.length} more available ↓
                        </span>
                    )}
                </div>
            )}

            {activeDeliveries.map((order, i) => (
                <ActiveDeliveryCard key={order.id} order={order} onPickedUp={onPickedUp} onDelivered={onDelivered} queuePosition={i}/>
            ))}

            {!isOnline && (
                <div className="card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, borderLeft:`4px solid ${T.orange}` }}>
                    <div style={{ width:44, height:44, borderRadius:14, background:T.orangeLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>😴</div>
                    <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:T.ink }}>You're offline</p>
                        <p style={{ margin:"3px 0 0", fontSize:13, color:T.muted }}>Go online to start receiving delivery orders</p>
                    </div>
                    <button className="btn-primary" onClick={onToggleOnline} style={{ padding:"10px 16px", fontSize:13, whiteSpace:"nowrap", flexShrink:0 }}>Go Online</button>
                </div>
            )}

            {isOnline && (
                <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                        <div>
                            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:19, color:T.ink, margin:0 }}>
                                {hasActive ? "Available Nearby" : "Available Orders"}
                            </h2>
                            <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>
                                {visibleOrders.length} order{visibleOrders.length!==1?"s":""} near you
                                {hasActive && visibleOrders.length > 0 && " · tap any to queue"}
                            </p>
                        </div>
                        {visibleOrders.length > 0 && (
                            <span style={{ background:T.orangeLight, color:T.orangeDark, fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, border:`1px solid ${T.orange}44`, display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                                <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
                                Live
                            </span>
                        )}
                    </div>

                    {visibleOrders.length === 0 ? (
                        <div className="card" style={{ padding:"48px 20px", textAlign:"center", color:T.muted }}>
                            <p style={{ fontSize:40, marginBottom:10 }}>🔍</p>
                            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:16, color:T.ink }}>No orders nearby</p>
                            <p style={{ fontSize:13, marginTop:5 }}>New orders will appear here automatically</p>
                        </div>
                    ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {visibleOrders.map((o, i) => (
                                <AvailableCard key={o.id} order={o} onAccept={onAccept} onDecline={onDecline} hasActive={hasActive} index={i}/>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── History Tab ──────────────────────────────────────────────────────────────
const HistoryTab = ({ orders }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp .35s ease" }}>
        <div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>Delivery History</h2>
            <p style={{ color:T.muted, fontSize:13, margin:"3px 0 0" }}>{orders.length} completed</p>
        </div>
        {orders.length===0 ? (
            <div className="card" style={{ padding:"60px 0", textAlign:"center", color:T.muted }}>
                <p style={{ fontSize:48 }}>📭</p>
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.ink, marginTop:12 }}>No deliveries yet</p>
                <p style={{ fontSize:13, marginTop:6 }}>Accept your first order to get started</p>
            </div>
        ) : (
            [...orders]
                .sort((a,b)=>new Date(b.completedAt||b.date)-new Date(a.completedAt||a.date))
                .map((o, i) => {
                    const norm = normaliseOrder(o);
                    return (
                        <div key={norm.id} className="card" style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:13, animation:`fadeUp .35s ease ${i*.05}s both` }}>
                            <div style={{ width:42, height:42, borderRadius:13, background:T.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✅</div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ margin:0, fontWeight:700, fontSize:14, color:T.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{norm.customer}</p>
                                <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>#{norm.id?.slice(-6)} · {timeAgo(norm.completedAt)}</p>
                                {/* FIX: show delivery address in history too */}
                                {norm.deliverTo && norm.deliverTo !== "Customer address" && (
                                    <p style={{ margin:"2px 0 0", fontSize:11, color:T.muted, display:"flex", alignItems:"center", gap:3 }}>
                                        <span>📍</span>{norm.deliverTo}{norm.landmark ? ` · ${norm.landmark}` : ""}
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign:"right", flexShrink:0 }}>
                                <p style={{ margin:0, fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:15, color:T.orange }}>{fmt(norm.deliveryFee)}</p>
                                <p style={{ margin:"2px 0 0", fontSize:11, color:T.greenMid, fontWeight:600 }}>Delivered</p>
                            </div>
                        </div>
                    );
                })
        )}
    </div>
);

// ─── Earnings Tab ─────────────────────────────────────────────────────────────
const EarningsTab = ({ completedOrders }) => {
    const total     = completedOrders.reduce((s,o)=>s+(normaliseOrder(o).deliveryFee||0),0);
    const count     = completedOrders.length;
    const todayStr  = new Date().toDateString();
    const todayEarn = completedOrders
        .filter(o=>new Date(o.completedAt||o.date||o.updatedAt).toDateString()===todayStr)
        .reduce((s,o)=>s+(normaliseOrder(o).deliveryFee||0),0);
    const avgEarn   = count>0 ? Math.round(total/count) : 0;
    const stats     = [
        { label:"Today",      value:fmt(todayEarn), icon:"☀️", color:T.orange, bg:T.orangeLight },
        { label:"Average",    value:fmt(avgEarn),   icon:"📊", color:T.blue,   bg:T.blueLight   },
        { label:"Deliveries", value:count,           icon:"🏍️", color:T.green,  bg:T.greenLight  },
    ];
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Earnings</h2>
            <div style={{ borderRadius:22, overflow:"hidden", background:`linear-gradient(135deg,${T.dark},${T.green})`, padding:"26px 22px", textAlign:"center", position:"relative" }}>
                <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
                <p style={{ color:"rgba(255,255,255,.45)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 6px" }}>Total Earned</p>
                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:46, color:T.orange, margin:"0 0 3px", lineHeight:1 }}>{fmt(total)}</p>
                <p style={{ color:"rgba(255,255,255,.45)", fontSize:12 }}>from {count} deliveries</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {stats.map((s,i)=>(
                    <div key={s.label} className="card" style={{ padding:"13px 10px", textAlign:"center", animation:`fadeUp .4s ease ${i*.08}s both` }}>
                        <div style={{ fontSize:20, marginBottom:5 }}>{s.icon}</div>
                        <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:16, color:s.color, margin:"0 0 2px" }}>{s.value}</p>
                        <p style={{ fontSize:11, color:T.muted, fontWeight:600 }}>{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="card" style={{ overflow:"hidden" }}>
                <div style={{ padding:"13px 16px 9px", borderBottom:`1px solid ${T.border}` }}>
                    <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:15, color:T.ink, margin:0 }}>Recent Deliveries</h3>
                </div>
                {completedOrders.length===0
                    ? <p style={{ padding:"22px", textAlign:"center", color:T.muted, fontSize:13 }}>No deliveries yet</p>
                    : completedOrders.slice(0,6).map((o,i)=>{
                        const norm = normaliseOrder(o);
                        return (
                            <div key={norm.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<Math.min(completedOrders.length,6)-1?`1px solid ${T.border}`:"none" }}>
                                <div>
                                    <p style={{ margin:0, fontWeight:600, fontSize:13, color:T.ink }}>{norm.customer}</p>
                                    <p style={{ margin:"2px 0 0", fontSize:11, color:T.muted }}>{timeAgo(norm.completedAt)}</p>
                                </div>
                                <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, color:T.orange, fontSize:14 }}>{fmt(norm.deliveryFee)}</p>
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
        firstName:     rider.firstName     || "",
        lastName:      rider.lastName      || "",
        phone:         rider.phone         || "",
        email:         rider.email         || "",
        vehicleType:   rider.vehicleType   || "",
        vehicleNumber: rider.vehicleNumber || rider.driverLicenseNumber || "",
        bankName:      rider.bankName      || "",
        accountNumber: rider.accountNumber || "",
        accountName:   rider.accountName   || "",
    });
    const [saving, setSaving] = useState(false);
    const set = (k,val) => setV(p=>({...p,[k]:val}));

    const save = async () => {
        setSaving(true);
        try {
            const dto = { firstName:v.firstName, lastName:v.lastName, phone:v.phone, email:v.email, vehicleType:v.vehicleType, vehicleNumber:v.vehicleNumber, bankName:v.bankName, accountNumber:v.accountNumber, accountName:v.accountName };
            const updated = await riderApi.updateProfile(dto);
            onUpdate({ ...rider, ...updated, ...dto });
            onToast("Profile saved!");
        } catch(e) { onToast("Failed: "+e.message,"error"); }
        finally { setSaving(false); }
    };

    const fullName = `${v.firstName} ${v.lastName}`.trim();
    const initials = fullName ? fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "R";

    const Section = ({ title, children }) => (
        <div className="card" style={{ padding:18, display:"flex", flexDirection:"column", gap:13 }}>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:14, color:T.ink, margin:0, paddingBottom:9, borderBottom:`2px solid ${T.greenLight}` }}>{title}</h3>
            {children}
        </div>
    );
    const Field = ({ label, children }) => (
        <div><label className="label">{label}</label>{children}</div>
    );

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp .35s ease" }}>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:20, color:T.ink, margin:0 }}>My Profile</h2>
            <div style={{ display:"flex", justifyContent:"center" }}>
                <div style={{ width:84, height:84, borderRadius:"50%", background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:30, color:"white", border:`4px solid ${T.greenLight}`, boxShadow:`0 8px 24px rgba(26,92,26,.18)` }}>
                    {initials}
                </div>
            </div>
            <Section title="👤 Personal Info">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <Field label="First Name"><input className="input-field" value={v.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="First"/></Field>
                    <Field label="Last Name"><input  className="input-field" value={v.lastName}  onChange={e=>set("lastName",e.target.value)}  placeholder="Last"/></Field>
                </div>
                <Field label="Phone"><input className="input-field" value={v.phone} onChange={e=>set("phone",e.target.value)} placeholder="+234…"/></Field>
                <Field label="Email"><input className="input-field" value={v.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com"/></Field>
            </Section>
            <Section title="🏍️ Vehicle Info">
                <Field label="Vehicle Type"><input    className="input-field" value={v.vehicleType}   onChange={e=>set("vehicleType",e.target.value)}   placeholder="e.g. Motorcycle, Bicycle"/></Field>
                <Field label="Plate / License No."><input className="input-field" value={v.vehicleNumber} onChange={e=>set("vehicleNumber",e.target.value)} placeholder="e.g. ABC-123XY"/></Field>
            </Section>
            <Section title="🏦 Bank Details">
                <Field label="Bank Name"><input     className="input-field" value={v.bankName}      onChange={e=>set("bankName",e.target.value)}      placeholder="e.g. First Bank"/></Field>
                <Field label="Account Name"><input  className="input-field" value={v.accountName}   onChange={e=>set("accountName",e.target.value)}   placeholder="Full account name"/></Field>
                <Field label="Account Number"><input className="input-field" value={v.accountNumber} onChange={e=>set("accountNumber",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="0000000000" style={{ letterSpacing:2 }}/></Field>
            </Section>
            <button className="btn-primary" onClick={save} disabled={saving} style={{ width:"100%", padding:15, fontSize:14, boxShadow:"0 6px 18px rgba(26,92,26,.28)" }}>
                {saving?"Saving…":"💾 Save Profile"}
            </button>
        </div>
    );
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
    { id:"orders",   label:"Orders",   icon:"📋" },
    { id:"history",  label:"History",  icon:"📦" },
    { id:"earnings", label:"Earnings", icon:"💰" },
    { id:"profile",  label:"Profile",  icon:"👤" },
];

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function RiderDashboard({ initialRider, onLogout }) {
    const [rider,            setRider]            = useState(initialRider||null);
    const [tab,              setTab]              = useState("orders");
    const [availableOrders,  setAvailableOrders]  = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [completedOrders,  setCompletedOrders]  = useState([]);
    const [declinedIds,      setDeclinedIds]      = useState([]);
    const [loading,          setLoading]          = useState(true);
    const [toast,            setToast]            = useState(null);
    const [toastMsg,         setToastMsg]         = useState(null);
    const [error,            setError]            = useState(null);

    const showToast = (msg, type="success") => {
        setToastMsg({ msg, type });
        setTimeout(()=>setToastMsg(null), 3200);
    };

    const handleLogout = () => {
        localStorage.removeItem("tastycart_rider");
        if (onLogout) onLogout();
        else window.location.href="/login";
    };

    // ── SSE real-time updates ─────────────────────────────────────────────────
    const { subscribe, unsubscribe, isConnected: sseConnected } = useSse({
        userId: rider?.userId || rider?.id,
        isAuthenticated: !!rider,
    });

    const playBeep = () => {
        try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch {}
    };

    const loadProfile = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const profile = initialRider||await riderApi.getProfile();
            const formatted = { ...profile, fullName:`${profile.firstName||""} ${profile.lastName||""}`.trim(), availability:profile.availability||"OFFLINE", totalDeliveries:profile.totalDeliveries||0, earnings:profile.earnings||0 };
            setRider(formatted);
            try { localStorage.setItem("tastycart_rider",JSON.stringify(formatted)); } catch(_) {}
        } catch(err) {
            setError("Could not load your profile.");
            try {
                const s = localStorage.getItem("tastycart_rider");
                if (s) { setRider(JSON.parse(s)); setError(null); }
            } catch(_) {}
        } finally { setLoading(false); }
    }, [initialRider]);

    const loadRiderOrders = useCallback(async () => {
        try {
            const myOrders = await orderApi.getRiderOrders();
            if (!Array.isArray(myOrders)) return;
            const active    = myOrders.filter(o => ACTIVE_STATUSES.includes(resolveStatus(o.status)));
            const completed = myOrders.filter(o => resolveStatus(o.status)===STATUS_META.DELIVERED.name).map(o => ({ ...normaliseOrder(o), completedAt:o.updatedAt||o.completedAt }));
            setActiveDeliveries(active.map(o => normaliseOrder(o)));
            setCompletedOrders(completed);
        } catch(e) { console.error("Failed to load rider orders:", e); }
    }, []);

    const fetchAvailable = useCallback(async () => {
        try {
            const all = await orderApi.getAllReadyForPickupOrders();
            const activeIds = new Set(activeDeliveries.map(o=>o.id));
            const available = Array.isArray(all) ? all.filter(o => !o.riderId && !declinedIds.includes(o.id) && !activeIds.has(o.id)) : [];
            setAvailableOrders(available);
        } catch(e) { console.error("fetchAvailable:", e); }
    }, [declinedIds, activeDeliveries]);

    useEffect(()=>{ loadProfile(); },[loadProfile]);
    useEffect(()=>{ if(rider) loadRiderOrders(); },[rider?.id, loadRiderOrders]);
    // ── SSE event handlers ────────────────────────────────────────────────────
    useEffect(() => {
        const handleNewOrder = (data) => {
            if (rider?.availability !== "ONLINE") return;
            const order = data.order || data;
            if (!order?.id) return;
            const norm = normaliseOrder(order);
            setAvailableOrders(prev => {
                if (prev.some(o => o.id === norm.id)) return prev;
                playBeep();
                showToast("New order available! 🛵");
                return [norm, ...prev];
            });
        };

        const handleOrderUpdate = (data) => {
            const orderId = data.orderId || data.id;
            const newStatus = data.status;
            if (!orderId || !newStatus) return;
            setActiveDeliveries(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: resolveStatus(newStatus) } : o
            ));
        };

        subscribe("NEW_ORDER",    handleNewOrder);
        subscribe("ORDER_UPDATE", handleOrderUpdate);
        return () => {
            unsubscribe("NEW_ORDER");
            unsubscribe("ORDER_UPDATE");
        };
    }, [subscribe, unsubscribe, rider?.availability]);

    // ── Poll available orders every 30s — only when SSE is disconnected ───────
    useEffect(()=>{
        if (rider?.availability==="ONLINE" && !sseConnected) {
            fetchAvailable();
            const iv = setInterval(fetchAvailable, 30000);
            return ()=>clearInterval(iv);
        }
        if (rider?.availability==="ONLINE" && sseConnected) {
            fetchAvailable(); // initial fetch when SSE connects
        }
    }, [rider?.availability, fetchAvailable, sseConnected]);

    const updateRider = useCallback(updated => {
        const r = { ...updated, fullName:`${updated.firstName||""} ${updated.lastName||""}`.trim() };
        setRider(r);
        try { localStorage.setItem("tastycart_rider",JSON.stringify(r)); } catch(_) {}
    }, []);

    const handleToggleOnline = async () => {
        if (!rider) return;
        const newStatus = rider.availability==="ONLINE" ? "OFFLINE" : "ONLINE";
        setRider(prev=>({...prev, availability:newStatus}));
        try {
            await riderApi.setAvailability(newStatus);
            if (newStatus==="OFFLINE") setAvailableOrders([]);
            else await fetchAvailable();
        } catch(err) {
            setRider(prev=>({...prev, availability:rider.availability}));
            showToast("Failed to update availability","error");
        }
    };

    const handleAccept = async (order) => {
        if (!rider?.id) { showToast("Rider ID not found","error"); return; }
        try {
            await orderApi.assignRider(order.id, rider.id);
            const norm = normaliseOrder({ ...order, status:"ACCEPTED" });
            setActiveDeliveries(prev=>[...prev, norm]);
            setAvailableOrders(prev=>prev.filter(o=>o.id!==order.id));
            setTab("orders");
            showToast(activeDeliveries.length > 0 ? "Order queued! Finish your current delivery first. 📋" : "Order accepted! Head to the restaurant. 🏍️");
        } catch(err) { showToast("Failed to accept: "+err.message,"error"); }
    };

    const handleDecline = (order) => {
        setDeclinedIds(prev=>[...prev, order.id]);
        setAvailableOrders(prev=>prev.filter(o=>o.id!==order.id));
    };

    const handlePickedUp = async (id) => {
        try {
            await orderApi.updateOrderStatus(id, STATUS_META.PICKED_UP.name);
            setActiveDeliveries(prev => prev.map(o => o.id===id ? { ...o, status:STATUS_META.PICKED_UP.name } : o));
            showToast("Order picked up! Deliver to customer. 🏍️");
        } catch(err) { showToast("Failed: "+err.message,"error"); }
    };

    const handleDelivered = async (id) => {
        try {
            await orderApi.updateOrderStatus(id, "DELIVERED");
            const deliveredOrder = activeDeliveries.find(o=>o.id===id);
            const completed = { ...deliveredOrder, completedAt:new Date().toISOString() };
            setActiveDeliveries(prev=>prev.filter(o=>o.id!==id));
            setCompletedOrders(prev=>[completed, ...prev]);
            setToast(completed);
            updateRider({ ...rider, totalDeliveries:(rider.totalDeliveries||0)+1, earnings:(rider.earnings||0)+(completed.deliveryFee||0) });
            setTimeout(()=>setToast(null), 5000);
            if (rider?.availability==="ONLINE") fetchAvailable();
        } catch(err) { showToast("Failed: "+err.message,"error"); }
    };

    const isOnline      = rider?.availability==="ONLINE";
    const visibleOrders = availableOrders.filter(o=>!declinedIds.includes(o.id));
    const activeCount   = activeDeliveries.length;
    const pendingCount  = isOnline ? visibleOrders.length : 0;
    const totalBadge    = activeCount + pendingCount;
    const fullName      = rider ? `${rider.firstName||""} ${rider.lastName||""}`.trim()||rider.fullName||"Rider" : "Rider";
    const initials      = fullName.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"R";

    if (loading) return (
        <><style>{CSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:18 }}>
            <TastycartLogo size={64}/><Spinner size={32}/>
            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:17, color:T.green }}>Loading your dashboard…</p>
        </div></>
    );

    if (error&&!rider) return (
        <><style>{CSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16, padding:24 }}>
            <TastycartLogo size={64}/>
            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:18, color:T.red }}>{error}</p>
            <div style={{ display:"flex", gap:10 }}>
                <button className="btn-primary" onClick={loadProfile} style={{ padding:"12px 24px" }}>Try Again</button>
                {onLogout && <button className="btn-outline" onClick={onLogout} style={{ padding:"12px 24px" }}>← Back</button>}
            </div>
        </div></>
    );

    if (!rider) return (
        <><style>{CSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.offWhite, gap:16 }}>
            <TastycartLogo size={72}/>
            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:20, color:T.ink }}>No rider profile found</p>
            {onLogout && <button className="btn-primary" onClick={onLogout} style={{ padding:"12px 28px" }}>← Register</button>}
        </div></>
    );

    return (
        <>
            <style>{CSS}</style>
            {toast    && <DeliveryToast order={toast} onDismiss={()=>setToast(null)}/>}
            {toastMsg && (
                <div style={{ position:"fixed", top:20, right:20, zIndex:99998, background:toastMsg.type==="error"?T.redLight:T.greenLight, color:toastMsg.type==="error"?T.red:T.green, border:`1.5px solid ${toastMsg.type==="error"?"#f5a5a5":"#a8d5a8"}`, borderRadius:14, padding:"11px 16px", fontSize:13, fontWeight:600, boxShadow:"0 6px 28px rgba(0,0,0,.1)", animation:"fadeUp .25s ease", display:"flex", alignItems:"center", gap:8, maxWidth:320 }}>
                    <span style={{ width:20, height:20, borderRadius:"50%", background:toastMsg.type==="error"?T.red:T.greenMid, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{toastMsg.type==="error"?"!":"✓"}</span>
                    {toastMsg.msg}
                </div>
            )}

            <div style={{ minHeight:"100vh", display:"flex", background:T.offWhite }}>
                <aside className="desktop-sidebar" style={{ width:230, flexShrink:0, background:`linear-gradient(180deg,${T.dark} 0%,#0d1f0d 100%)`, flexDirection:"column", padding:"24px 14px", position:"fixed", top:0, left:0, height:"100vh", overflowY:"auto", zIndex:800 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, paddingLeft:4, marginBottom:28 }}>
                        <TastycartLogo size={38}/>
                        <div>
                            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, color:"white", margin:0 }}>Tasty<span style={{ color:T.orange }}>cart</span></p>
                            <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", margin:0, letterSpacing:.5 }}>RIDER</p>
                        </div>
                    </div>
                    <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={()=>setTab(t.id)} className={`nav-item${tab===t.id?" active":""}`}
                                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:"rgba(255,255,255,.55)", fontWeight:600, fontFamily:"'DM Sans',sans-serif", fontSize:14, background:"transparent" }}>
                                <span style={{ fontSize:18 }}>{t.icon}</span>
                                <span>{t.label}</span>
                                {t.id==="orders" && totalBadge>0 && (
                                    <span style={{ marginLeft:"auto", background:activeCount>0?T.orange:T.greenMid, color:"white", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20, minWidth:20, textAlign:"center" }}>{totalBadge}</span>
                                )}
                            </button>
                        ))}
                    </nav>
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

                <div className="main-with-sidebar" style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
                    <header style={{ background:"white", borderBottom:`1px solid ${T.border}`, height:62, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", position:"sticky", top:0, zIndex:500, boxShadow:"0 1px 8px rgba(0,0,0,.05)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                            <TastycartLogo size={30}/>
                            <p style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:16, color:T.ink, margin:0 }}>Tasty<span style={{ color:T.orange }}>cart</span>{" "}<span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>Rider</span></p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {activeCount > 0 && (
                                <div onClick={()=>setTab("orders")} style={{ display:"flex", alignItems:"center", gap:6, background:T.orangeLight, border:`1.5px solid ${T.orange}44`, borderRadius:50, padding:"5px 12px", cursor:"pointer" }}>
                                    <span style={{ width:7, height:7, borderRadius:"50%", background:T.orange, display:"inline-block", animation:"pulse 1.2s infinite" }}/>
                                    <span style={{ fontSize:11, fontWeight:700, color:T.orangeDark }}>{activeCount} active deliver{activeCount!==1?"ies":"y"}</span>
                                </div>
                            )}
                            <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} size="sm"/>
                            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.dark},${T.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>{initials}</div>
                        </div>
                    </header>

                    <main style={{ flex:1, padding:"24px 20px 100px", maxWidth:720, width:"100%", margin:"0 auto" }}>
                        <div key={tab} style={{ animation:"fadeUp .3s ease" }}>
                            {tab==="orders"   && <OrdersTab isOnline={isOnline} activeDeliveries={activeDeliveries} visibleOrders={visibleOrders} onAccept={handleAccept} onDecline={handleDecline} onPickedUp={handlePickedUp} onDelivered={handleDelivered} onToggleOnline={handleToggleOnline}/>}
                            {tab==="history"  && <HistoryTab orders={completedOrders}/>}
                            {tab==="earnings" && <EarningsTab completedOrders={completedOrders}/>}
                            {tab==="profile"  && <ProfileTab rider={rider} onUpdate={updateRider} onToast={showToast}/>}
                        </div>
                    </main>
                </div>
            </div>

            <nav className="bottom-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${T.border}`, padding:"8px 8px 16px", display:"flex", justifyContent:"space-around", zIndex:600, boxShadow:"0 -2px 20px rgba(0,0,0,.07)" }}>
                {TABS.map(t => {
                    const active   = tab===t.id;
                    const badgeNum = t.id==="orders" ? totalBadge : 0;
                    return (
                        <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
                            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:active?T.greenLight:"transparent", position:"relative" }}>
                            <span style={{ fontSize:22 }}>{t.icon}</span>
                            <span style={{ fontSize:10, fontWeight:700, color:active?T.green:T.muted, letterSpacing:.3 }}>{t.label}</span>
                            {active && <div style={{ position:"absolute", bottom:0, width:18, height:3, borderRadius:10, background:T.greenMid }}/>}
                            {badgeNum > 0 && (
                                <div style={{ position:"absolute", top:5, right:10, background:activeCount>0?T.orange:T.greenMid, color:"white", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:20, minWidth:16, textAlign:"center" }}>{badgeNum}</div>
                            )}
                        </button>
                    );
                })}
                <button onClick={handleLogout} className="tab-btn" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"8px 16px", borderRadius:14, background:"transparent" }}>
                    <span style={{ fontSize:22 }}>🚪</span>
                    <span style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.3 }}>Logout</span>
                </button>
            </nav>
        </>
    );
}