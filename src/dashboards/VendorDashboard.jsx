import { useState, useRef, useEffect } from "react";

// ─── Shared micro styles ──────────────────────────────────────────────────────
const inp = (extra={}) => ({
  width:"100%", padding:"12px 14px", borderRadius:12,
  border:"1.5px solid #e2ebe2", background:"#f7fbf7",
  fontSize:14, color:"#1a2e1a", fontFamily:"'Plus Jakarta Sans',sans-serif",
  outline:"none", boxSizing:"border-box", transition:"all 0.2s",
  ...extra,
});
const lbl = { fontSize:11, fontWeight:700, letterSpacing:1.5, color:"#6a8a6a", textTransform:"uppercase", display:"block", marginBottom:5 };
const focus = e => { e.target.style.borderColor="#2d8a2d"; e.target.style.boxShadow="0 0 0 3px rgba(45,138,45,0.12)"; e.target.style.background="#fff"; };
const blur  = e => { e.target.style.borderColor="#e2ebe2"; e.target.style.boxShadow="none"; e.target.style.background="#f7fbf7"; };

const STATUS = {
  Pending:   { bg:"#fff8e6", color:"#b36000", dot:"#f97316", label:"Pending"   },
  Delivered: { bg:"#e8f5e0", color:"#2d6a2d", dot:"#4caf50", label:"Delivered" },
  Cancelled: { bg:"#fdecea", color:"#c0392b", dot:"#e74c3c", label:"Cancelled" },
  Preparing: { bg:"#e8f0ff", color:"#1a3a8a", dot:"#4070e0", label:"Preparing" },
};

const fmt = n => `₦${Number(n).toLocaleString()}`;
const fmtDate = iso => new Date(iso).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"});
const fmtTime = iso => new Date(iso).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"});
const timeAgo = iso => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(iso);
};

const PRESETS_PACKAGES = [
  {id:"plastic",name:"Plastic Container",price:200},{id:"disposable",name:"Disposable Takeaway",price:100},
  {id:"nylon",name:"Just Nylon",price:0},{id:"foil",name:"Foil Wrap",price:50},
  {id:"styrofoam",name:"Styrofoam Pack",price:150},{id:"luxury",name:"Luxury Box",price:500},
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CATEGORIES = ["Nigerian","Continental","Fast Food","Grills & BBQ","Street Food","Soups & Swallow","Pastries & Drinks","Healthy Bowls","Seafood","Snacks & Sides"];

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id:"overview",  label:"Overview",  icon:"📊" },
  { id:"orders",    label:"Orders",    icon:"📋" },
  { id:"menu",      label:"Menu",      icon:"🍽️"  },
  { id:"profile",   label:"Profile",   icon:"🏪"  },
];

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;
  const sc = STATUS[order.status] || STATUS.Pending;
  const nextStatus = { Pending:"Preparing", Preparing:"Delivered", Delivered:null, Cancelled:null };
  const actionLabel = { Pending:"Mark as Preparing", Preparing:"Mark as Delivered" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:26, width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 100px rgba(0,0,0,0.22)", animation:"modalIn 0.3s cubic-bezier(.34,1.56,.64,1)", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#155a15,#2d8a2d)", padding:"22px 24px 18px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:11, margin:"0 0 3px", letterSpacing:1.2 }}>ORDER</p>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, margin:0, color:"white" }}>{order.id}</h3>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, margin:"5px 0 0" }}>
                {fmtDate(order.date)} at {fmtTime(order.date)}
              </p>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12 }}>
            <span style={{ background:sc.bg, color:sc.color, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:sc.dot, display:"inline-block" }}/>
              {order.status}
            </span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontSize:12 }}>· {timeAgo(order.date)}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:"auto", flex:1, padding:"20px 24px" }}>
          {/* Customer info */}
          <div style={{ background:"#f7fbf7", borderRadius:14, padding:"14px 16px", marginBottom:18 }}>
            <p style={{ ...lbl, marginBottom:10 }}>Customer Details</p>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {[
                ["👤 Name", order.customer],
                ["📱 WhatsApp", order.whatsapp],
                ["📍 Deliver to", order.location],
                ["💳 Payment", order.paymentMethod],
              ].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:"#7a9a7a", fontWeight:600 }}>{k}</span>
                  <span style={{ color:"#1a2e1a", fontWeight:600, maxWidth:"60%", textAlign:"right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <h4 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:"#1a2e1a", margin:"0 0 10px" }}>🍱 Order Items</h4>
          <div style={{ background:"white", border:"1.5px solid #e2ebe2", borderRadius:14, overflow:"hidden", marginBottom:16 }}>
            {order.pack && (
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"#f0f7f0", borderBottom:"1px solid #e8f0e8" }}>
                <span style={{ fontSize:13, color:"#5a8a5a", fontWeight:600 }}>📦 {order.pack.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#2d8a2d" }}>{fmt(order.pack.price)}</span>
              </div>
            )}
            {order.items?.map((item, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", borderBottom: i<order.items.length-1?"1px solid #f2f7f2":"none" }}>
                <span style={{ fontSize:14, color:"#2a3a2a", fontWeight:500 }}>
                  {item.name}
                  <span style={{ color:"#9ab59a", marginLeft:6 }}>×{item.qty}</span>
                </span>
                <span style={{ fontWeight:700, fontSize:13, color:"#1a2e1a" }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ background:"#f0f7f0", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#1a2e1a" }}>Total</span>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:"#f97316" }}>{fmt(order.total)}</span>
          </div>
        </div>

        {/* Action footer */}
        {nextStatus[order.status] && (
          <div style={{ padding:"14px 24px 22px", borderTop:"1px solid #f0f7f0", flexShrink:0 }}>
            <div style={{ display:"flex", gap:10 }}>
              {order.status !== "Delivered" && (
                <button onClick={()=>{onUpdateStatus(order.id,"Cancelled"); onClose();}} style={{ flex:1, padding:"12px", borderRadius:50, border:"1.5px solid #f5c5c5", background:"white", color:"#c0392b", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  Cancel Order
                </button>
              )}
              <button onClick={()=>{onUpdateStatus(order.id, nextStatus[order.status]); onClose();}} style={{ flex:2, padding:"12px", borderRadius:50, border:"none", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white", fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:"0 4px 16px rgba(45,138,45,0.3)" }}>
                ✓ {actionLabel[order.status]}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ vendor, orders, onViewOrder }) => {
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.date).toDateString() === todayStr);
  const todayRevenue = todayOrders.filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+o.total,0);
  const totalRevenue = orders.filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+o.total,0);
  const pending = orders.filter(o=>o.status==="Pending").length;
  const delivered = orders.filter(o=>o.status==="Delivered").length;
  const recentOrders = [...orders].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const totalItems = (vendor.menuCategories||[]).reduce((a,c)=>a+c.items.length,0);

  const stats = [
    { label:"Today's Orders", value:todayOrders.length, icon:"📦", color:"#2d8a2d", bg:"#e8f5e0" },
    { label:"Today's Revenue", value:fmt(todayRevenue), icon:"💰", color:"#f97316", bg:"#fff5ef" },
    { label:"Pending", value:pending, icon:"⏳", color:"#b36000", bg:"#fff8e6" },
    { label:"Total Revenue", value:fmt(totalRevenue), icon:"📈", color:"#6a3dc8", bg:"#f0eaff" },
    { label:"Delivered", value:delivered, icon:"✅", color:"#1a6a8a", bg:"#e3f4fb" },
    { label:"Menu Items", value:totalItems, icon:"🍽️", color:"#1a6a1a", bg:"#ecf7ec" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {/* Greeting */}
      <div style={{ background:"linear-gradient(135deg,#155a15,#2d8a2d,#3daa3d)", borderRadius:22, padding:"22px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ position:"absolute", bottom:-30, right:60, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }}/>
        <div style={{ position:"relative" }}>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, margin:"0 0 3px" }}>Good {new Date().getHours()<12?"Morning":"Afternoon"} 👋</p>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"clamp(18px,3vw,24px)", color:"white", margin:"0 0 8px" }}>{vendor.name}</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <span style={{ background:"rgba(255,255,255,0.18)", color:"white", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>
              ⭐ {vendor.rating || 4.5} rating
            </span>
            <span style={{ background: vendor.isOpen?"rgba(255,255,255,0.18)":"rgba(200,50,50,0.4)", color:"white", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>
              {vendor.isOpen ? "🟢 Open" : "🔴 Closed"}
            </span>
            <span style={{ background:"rgba(255,255,255,0.18)", color:"white", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>
              {vendor.category}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
        {stats.map((s,i) => (
          <div key={s.label} style={{ background:"white", borderRadius:18, padding:"16px 18px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #eef5ee", animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
            <div style={{ width:44, height:44, borderRadius:14, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
            <div>
              <p style={{ margin:0, fontSize:10, color:"#8aaa8a", fontWeight:600, letterSpacing:0.3 }}>{s.label}</p>
              <p style={{ margin:"2px 0 0", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:"clamp(14px,2vw,18px)", color:s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background:"white", borderRadius:22, overflow:"hidden", border:"1px solid #eef5ee", boxShadow:"0 2px 14px rgba(0,0,0,0.05)" }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #f0f7f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:"#1a2e1a", margin:0 }}>Recent Orders</h3>
          <span style={{ fontSize:12, color:"#7aaa7a", fontWeight:600 }}>Latest {recentOrders.length}</span>
        </div>
        {recentOrders.length === 0 && (
          <div style={{ padding:"40px 0", textAlign:"center", color:"#aaa" }}>
            <p style={{ fontSize:32 }}>📭</p>
            <p style={{ fontWeight:600, marginTop:10 }}>No orders yet</p>
          </div>
        )}
        {recentOrders.map((order,i) => {
          const sc = STATUS[order.status]||STATUS.Pending;
          return (
            <div key={order.id} onClick={()=>onViewOrder(order)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom: i<recentOrders.length-1?"1px solid #f5faf5":"none", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fdf9"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{ width:40, height:40, borderRadius:13, background:sc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🍱</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#1a2e1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{order.customer}</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:"#9ab59a" }}>{timeAgo(order.date)} · {order.id}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#1a2e1a" }}>{fmt(order.total)}</span>
                <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>{order.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = ({ orders, onViewOrder, onUpdateStatus }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const tabs = ["All","Pending","Preparing","Delivered","Cancelled"];
  const shown = orders
    .filter(o => filter==="All" || o.status===filter)
    .filter(o => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Search */}
      <div style={{ background:"white", borderRadius:50, display:"flex", alignItems:"center", padding:"6px 16px", border:"1.5px solid #e2ebe2", gap:8 }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7aaa7a" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by customer name or order ID…"
          style={{ border:"none", flex:1, fontSize:14, color:"#1a2e1a", fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", background:"transparent" }}/>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
        {tabs.map(t => {
          const count = t==="All" ? orders.length : orders.filter(o=>o.status===t).length;
          return (
            <button key={t} onClick={()=>setFilter(t)} style={{
              padding:"8px 16px", borderRadius:50, border:"none", whiteSpace:"nowrap",
              background: filter===t ? "#2d8a2d" : "white",
              color: filter===t ? "white" : "#5a7a5a",
              fontWeight:700, fontSize:13, cursor:"pointer",
              boxShadow: filter===t ? "0 3px 12px rgba(45,138,45,0.25)" : "none",
              border: filter===t ? "none" : "1.5px solid #e2ebe2",
              transition:"all 0.18s", display:"flex", alignItems:"center", gap:6,
            }}>
              {t}
              <span style={{ background: filter===t?"rgba(255,255,255,0.25)":STATUS[t]?.bg||"#f0f7f0", color: filter===t?"white":STATUS[t]?.color||"#5a7a5a", fontSize:11, fontWeight:800, padding:"1px 7px", borderRadius:20 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #eef5ee", boxShadow:"0 2px 14px rgba(0,0,0,0.05)" }}>
        {shown.length === 0 && (
          <div style={{ padding:"50px 0", textAlign:"center", color:"#aaa" }}>
            <p style={{ fontSize:36 }}>📭</p>
            <p style={{ fontWeight:600, fontSize:15, marginTop:10 }}>No orders found</p>
          </div>
        )}
        {shown.map((order,i)=>{
          const sc = STATUS[order.status]||STATUS.Pending;
          return (
            <div key={order.id} onClick={()=>onViewOrder(order)} style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 20px", borderBottom: i<shown.length-1?"1px solid #f5faf5":"none", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fdf9"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              {/* Status dot / icon */}
              <div style={{ width:44, height:44, borderRadius:14, background:sc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🍱</div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#1a2e1a" }}>{order.customer}</p>
                  <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, flexShrink:0 }}>{order.status}</span>
                </div>
                <p style={{ margin:0, fontSize:12, color:"#9ab59a" }}>
                  {order.id} · {fmtDate(order.date)} {fmtTime(order.date)} · {order.location?.split(",")[0]}
                </p>
              </div>
              {/* Amount + chevron */}
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#1a2e1a" }}>{fmt(order.total)}</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Menu Tab ─────────────────────────────────────────────────────────────────
const MenuTab = ({ vendor, onUpdate }) => {
  const [catName, setCatName] = useState("");
  const [pending, setPending] = useState({ catId:null, name:"", price:"" });

  const cats = vendor.menuCategories || [];

  const addCat = () => {
    if (!catName.trim()) return;
    onUpdate({ ...vendor, menuCategories:[...cats, {id:`cat-${Date.now()}`, name:catName, items:[]}] });
    setCatName("");
  };

  const removeCat = id => onUpdate({...vendor, menuCategories:cats.filter(c=>c.id!==id)});

  const addItem = catId => {
    if (!pending.name.trim() || !pending.price) return;
    const item = {id:`item-${Date.now()}`, name:pending.name, price:Number(pending.price), available:true};
    onUpdate({...vendor, menuCategories:cats.map(c=>c.id===catId?{...c,items:[...c.items,item]}:c)});
    setPending({catId:null,name:"",price:""});
  };

  const removeItem = (catId,itemId) =>
    onUpdate({...vendor, menuCategories:cats.map(c=>c.id===catId?{...c,items:c.items.filter(i=>i.id!==itemId)}:c)});

  const toggleAvail = (catId,itemId) =>
    onUpdate({...vendor, menuCategories:cats.map(c=>
      c.id===catId?{...c,items:c.items.map(i=>i.id===itemId?{...i,available:!i.available}:i)}:c
    )});

  const totalItems = cats.reduce((a,c)=>a+c.items.length,0);
  const availItems = cats.reduce((a,c)=>a+c.items.filter(i=>i.available).length,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Summary */}
      <div style={{ display:"flex", gap:12 }}>
        {[
          {label:"Categories", value:cats.length, color:"#2d8a2d", bg:"#e8f5e0"},
          {label:"Total Items", value:totalItems, color:"#f97316", bg:"#fff5ef"},
          {label:"Available", value:availItems, color:"#1a6a8a", bg:"#e3f4fb"},
        ].map(s=>(
          <div key={s.label} style={{ flex:1, background:"white", borderRadius:16, padding:"14px 16px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,0.05)", border:"1px solid #eef5ee" }}>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:s.color, margin:0 }}>{s.value}</p>
            <p style={{ fontSize:11, color:"#8aaa8a", fontWeight:600, margin:"2px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add category */}
      <div style={{ background:"white", borderRadius:18, padding:"16px 18px", border:"1.5px solid #e2ebe2" }}>
        <p style={{ ...lbl, marginBottom:10 }}>Add New Category</p>
        <div style={{ display:"flex", gap:10 }}>
          <input value={catName} onChange={e=>setCatName(e.target.value)}
            placeholder="e.g. Rice Dishes, Proteins, Drinks…"
            style={{ ...inp(), flex:1 }}
            onFocus={focus} onBlur={blur}
            onKeyDown={e=>e.key==="Enter"&&addCat()}
          />
          <button onClick={addCat} style={{ padding:"0 22px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white", fontWeight:800, fontSize:18, cursor:"pointer" }}>+</button>
        </div>
      </div>

      {/* Categories */}
      {cats.length===0 && (
        <div style={{ background:"white", borderRadius:18, padding:"40px 0", textAlign:"center", color:"#aaa", border:"1.5px dashed #d8eed8" }}>
          <p style={{ fontSize:36 }}>🍽️</p>
          <p style={{ fontWeight:600, fontSize:15, marginTop:10 }}>No menu categories</p>
          <p style={{ fontSize:13 }}>Add a category above to get started</p>
        </div>
      )}

      {cats.map(cat => (
        <div key={cat.id} style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1.5px solid #e2ebe2", boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
          {/* Cat header */}
          <div style={{ background:"linear-gradient(135deg,#ecf7ec,#daf0da)", padding:"13px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <span style={{ fontWeight:800, fontSize:13, color:"#1a6a1a", letterSpacing:0.6 }}>{cat.name}</span>
              <span style={{ marginLeft:10, fontSize:11, color:"#5a8a5a" }}>{cat.items.length} item{cat.items.length!==1?"s":""}</span>
            </div>
            <button onClick={()=>removeCat(cat.id)} style={{ background:"rgba(200,50,50,0.1)", border:"none", borderRadius:8, padding:"5px 12px", cursor:"pointer", color:"#c0392b", fontWeight:700, fontSize:11 }}>Delete</button>
          </div>

          {/* Items */}
          {cat.items.length===0 && (
            <p style={{ padding:"14px 18px", color:"#b0c8b0", fontSize:13, margin:0 }}>No items yet — add one below</p>
          )}
          {cat.items.map((item,i) => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", borderBottom: i<cat.items.length-1?"1px solid #f5faf5":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div onClick={()=>toggleAvail(cat.id,item.id)} style={{ width:20, height:20, borderRadius:6, border:`2px solid ${item.available?"#2d8a2d":"#ccc"}`, background:item.available?"#2d8a2d":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.18s", flexShrink:0 }}>
                  {item.available&&<svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                </div>
                <div>
                  <p style={{ margin:0, fontWeight:600, fontSize:14, color: item.available?"#1a2e1a":"#aaa", textDecoration:item.available?"none":"line-through" }}>{item.name}</p>
                  <p style={{ margin:"2px 0 0", fontWeight:700, fontSize:13, color: item.available?"#2d8a2d":"#ccc" }}>{fmt(item.price)}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, background: item.available?"#e8f5e0":"#f5f5f5", color: item.available?"#2d6a2d":"#999" }}>
                  {item.available?"In Stock":"Out"}
                </span>
                <button onClick={()=>removeItem(cat.id,item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ddd", fontSize:20, padding:"0 4px", transition:"color 0.18s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#e74c3c"}
                  onMouseLeave={e=>e.currentTarget.style.color="#ddd"}
                >×</button>
              </div>
            </div>
          ))}

          {/* Add item */}
          <div style={{ padding:"12px 16px", background:"#fafcfa", borderTop:"1px solid #f0f7f0" }}>
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={pending.catId===cat.id?pending.name:""}
                onChange={e=>setPending({catId:cat.id,name:e.target.value,price:pending.catId===cat.id?pending.price:""})}
                placeholder="New item name…"
                style={{ ...inp({padding:"10px 12px",fontSize:13}), flex:2 }}
                onFocus={focus} onBlur={blur}
              />
              <input
                type="number"
                value={pending.catId===cat.id?pending.price:""}
                onChange={e=>setPending(p=>({...p,catId:cat.id,price:e.target.value}))}
                placeholder="₦ Price"
                style={{ ...inp({padding:"10px 12px",fontSize:13}), flex:1 }}
                onFocus={focus} onBlur={blur}
              />
              <button
                onClick={()=>{ if(pending.catId!==cat.id)setPending({catId:cat.id,name:"",price:""}); else addItem(cat.id); }}
                style={{ padding:"0 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white", fontWeight:800, fontSize:18, cursor:"pointer" }}
              >+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ vendor, onUpdate }) => {
  const [v, setV] = useState({ ...vendor });
  const [saved, setSaved] = useState(false);
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  const toggleDay = d => set("openDays", (v.openDays||[]).includes(d)?(v.openDays||[]).filter(x=>x!==d):[...(v.openDays||[]),d]);
  const togglePkg = pkg => {
    const cur = v.packages||[];
    set("packages", cur.find(p=>p.id===pkg.id)?cur.filter(p=>p.id!==pkg.id):[...cur,pkg]);
  };

  const save = () => {
    onUpdate(v);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Save toast */}
      {saved && (
        <div style={{ background:"linear-gradient(135deg,#2d8a2d,#4caf50)", borderRadius:14, padding:"12px 18px", display:"flex", alignItems:"center", gap:10, color:"white", fontWeight:700, animation:"toastIn 0.3s ease" }}>
          ✅ Profile saved successfully!
        </div>
      )}

      {/* Logo */}
      <div style={{ background:"white", borderRadius:20, padding:"20px", border:"1.5px solid #e2ebe2", display:"flex", alignItems:"center", gap:18 }}>
        <div onClick={()=>document.getElementById("logo-edit").click()} style={{ width:80, height:80, borderRadius:20, overflow:"hidden", background:"#e8f5e0", border:"2.5px dashed #8ac88a", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          {v.logoPreview
            ? <img src={v.logoPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="logo"/>
            : <span style={{ fontSize:32 }}>📸</span>
          }
        </div>
        <input id="logo-edit" type="file" accept="image/*" style={{ display:"none" }}
          onChange={e=>{ const f=e.target.files[0]; if(f) set("logoPreview",URL.createObjectURL(f)); }}
        />
        <div>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"#1a2e1a", margin:"0 0 4px" }}>{v.name}</h3>
          <p style={{ color:"#7a9a7a", fontSize:13, margin:0 }}>Click photo to change</p>
          {/* Open/closed toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
            <div onClick={()=>set("isOpen",!v.isOpen)} style={{ width:44, height:24, borderRadius:50, background:v.isOpen?"#2d8a2d":"#ccc", cursor:"pointer", position:"relative", transition:"background 0.25s" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:v.isOpen?22:3, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:v.isOpen?"#2d8a2d":"#aaa" }}>{v.isOpen?"Open for orders":"Closed"}</span>
          </div>
        </div>
      </div>

      {/* Business details */}
      <Section title="Business Info" icon="🏪">
        <Field2 label="Business Name">
          <input value={v.name||""} onChange={e=>set("name",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
        </Field2>
        <Field2 label="Category">
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {CATEGORIES.map(c=>(
              <div key={c} onClick={()=>set("category",c)} style={{ padding:"6px 13px", borderRadius:50, cursor:"pointer", fontSize:12, fontWeight:600, background:v.category===c?"#2d8a2d":"#f0f7f0", color:v.category===c?"white":"#3a6a3a", border:`1.5px solid ${v.category===c?"#2d8a2d":"#d0e8d0"}`, transition:"all 0.18s" }}>
                {c}
              </div>
            ))}
          </div>
        </Field2>
        <Field2 label="Description">
          <textarea value={v.description||""} onChange={e=>set("description",e.target.value)} rows={3} style={{ ...inp(), resize:"none", lineHeight:1.6 }} onFocus={focus} onBlur={blur}/>
        </Field2>
        <div style={{ display:"flex", gap:12 }}>
          <Field2 label="Phone / WhatsApp" style={{ flex:1 }}>
            <input value={v.phone||""} onChange={e=>set("phone",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
          </Field2>
          <Field2 label="Email" style={{ flex:1 }}>
            <input value={v.email||""} onChange={e=>set("email",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
          </Field2>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location & Hours" icon="📍">
        <Field2 label="Full Address">
          <input value={v.address||""} onChange={e=>set("address",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
        </Field2>
        <Field2 label="Landmark">
          <input value={v.landmark||""} onChange={e=>set("landmark",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
        </Field2>
        <Field2 label="Open Days">
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {DAYS.map(d=>(
              <div key={d} onClick={()=>toggleDay(d)} style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12, fontWeight:700, background:(v.openDays||[]).includes(d)?"#2d8a2d":"#f0f7f0", color:(v.openDays||[]).includes(d)?"white":"#4a7a4a", border:`1.5px solid ${(v.openDays||[]).includes(d)?"#2d8a2d":"#d0e8d0"}`, transition:"all 0.18s" }}>
                {d}
              </div>
            ))}
          </div>
        </Field2>
        <div style={{ display:"flex", gap:12 }}>
          <Field2 label="Opens" style={{ flex:1 }}>
            <input type="time" value={v.openTime||"08:00"} onChange={e=>set("openTime",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
          </Field2>
          <Field2 label="Closes" style={{ flex:1 }}>
            <input type="time" value={v.closeTime||"20:00"} onChange={e=>set("closeTime",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
          </Field2>
        </div>
        <Field2 label="Min. Delivery Fee (₦)">
          <input type="number" value={v.deliveryFrom||""} onChange={e=>set("deliveryFrom",e.target.value)} style={inp()} onFocus={focus} onBlur={blur}/>
        </Field2>
      </Section>

      {/* Packaging */}
      <Section title="Packaging Options" icon="📦">
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {PRESETS_PACKAGES.map(pkg=>{
            const on = (v.packages||[]).find(p=>p.id===pkg.id);
            return (
              <div key={pkg.id} onClick={()=>togglePkg(pkg)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 15px", borderRadius:13, cursor:"pointer", background:on?"#eaf6ea":"#f7fbf7", border:`1.5px solid ${on?"#2d8a2d":"#e2ebe2"}`, transition:"all 0.18s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${on?"#2d8a2d":"#c0d5c0"}`, background:on?"#2d8a2d":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s" }}>
                    {on&&<svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                  </div>
                  <span style={{ fontWeight:600, fontSize:13, color:"#1a2e1a" }}>{pkg.name}</span>
                </div>
                <span style={{ fontWeight:700, color:"#f97316", fontSize:13 }}>{pkg.price===0?"Free":`₦${pkg.price}`}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Save button */}
      <button onClick={save} style={{ width:"100%", padding:"16px", borderRadius:50, border:"none", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, cursor:"pointer", boxShadow:"0 5px 20px rgba(45,138,45,0.32)", transition:"transform 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
      >💾 Save Profile</button>
    </div>
  );
};

// ─── Shared sub-components for profile ───────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <div style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1.5px solid #e2ebe2", boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
    <div style={{ background:"linear-gradient(135deg,#ecf7ec,#daf0da)", padding:"12px 18px", display:"flex", alignItems:"center", gap:8 }}>
      <span>{icon}</span>
      <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:"#1a6a1a" }}>{title}</span>
    </div>
    <div style={{ padding:"18px 18px", display:"flex", flexDirection:"column", gap:14 }}>
      {children}
    </div>
  </div>
);

const Field2 = ({ label, children, style }) => (
  <div style={style}>
    <label style={lbl}>{label}</label>
    {children}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function VendorDashboard({ initialVendor, onLogout }) {
  const loadVendor = () => {
    if (initialVendor) return initialVendor;
    try { const s = localStorage.getItem("chopspot_vendor"); return s ? JSON.parse(s) : null; } catch { return null; }
  };

  const [vendor, setVendor] = useState(loadVendor);
  const [orders, setOrders] = useState(vendor?.orders || []);
  const [tab, setTab] = useState("overview");
  const [viewOrder, setViewOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const updateVendor = updated => {
    setVendor(updated);
    try { localStorage.setItem("chopspot_vendor", JSON.stringify({ ...updated, orders })); } catch {}
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.id===orderId ? {...o, status:newStatus} : o);
    setOrders(updated);
  };

  if (!vendor) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f2f7f2", padding:20 }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:48 }}>🏪</p>
        <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:"#1a2e1a", marginTop:12 }}>No vendor profile found</p>
        <button onClick={onLogout} style={{ marginTop:16, padding:"12px 28px", borderRadius:50, border:"none", background:"#2d8a2d", color:"white", fontWeight:700, cursor:"pointer" }}>Register as Vendor</button>
      </div>
    </div>
  );

  const pendingCount = orders.filter(o=>o.status==="Pending").length;
  const initials = vendor.name?.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "V";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#f2f7f2;}
        @keyframes modalIn{from{opacity:0;transform:scale(0.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
        input::placeholder{color:#b0c8b0}
        select{cursor:pointer}
        .nav-tab{transition:all 0.18s;}
        .nav-tab:hover{background:rgba(45,138,45,0.06)!important;}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f0f6f0", display:"flex", flexDirection:"column" }}>

        {/* ── Top Navbar ── */}
        <nav style={{ background:"white", borderBottom:"1px solid #e2ebe2", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", position:"sticky", top:0, zIndex:500, boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2d8a2d,#4caf50)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🍊</div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"#1a6a1a" }}>
              Chop<span style={{ color:"#f97316" }}>Spot</span>
              <span style={{ color:"#9ab59a", fontWeight:500, fontSize:12, marginLeft:6 }}>Vendor</span>
            </span>
          </div>

          {/* Pending badge */}
          {pendingCount > 0 && (
            <div onClick={()=>setTab("orders")} style={{ display:"flex", alignItems:"center", gap:8, background:"#fff8e6", border:"1.5px solid #ffd080", borderRadius:50, padding:"6px 14px", cursor:"pointer" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#f97316", display:"inline-block", animation:"pulse 1.5s infinite" }}/>
              <span style={{ fontWeight:700, fontSize:13, color:"#b36000" }}>{pendingCount} pending order{pendingCount>1?"s":""}</span>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white", fontFamily:"'Sora',sans-serif" }}>
              {initials}
            </div>
          </div>
        </nav>

        <div style={{ display:"flex", flex:1, maxWidth:1100, margin:"0 auto", width:"100%", padding:"0", gap:0 }}>

          {/* ── Sidebar (desktop) ── */}
          <aside style={{ width:220, flexShrink:0, padding:"24px 12px", position:"sticky", top:60, height:"calc(100vh - 60px)", overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
            {TABS.map(t => (
              <button key={t.id} className="nav-tab" onClick={()=>setTab(t.id)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                borderRadius:14, border:"none", cursor:"pointer", textAlign:"left", width:"100%",
                background: tab===t.id ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "transparent",
                color: tab===t.id ? "white" : "#5a7a5a",
                fontWeight: tab===t.id ? 700 : 500,
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontSize:14,
                boxShadow: tab===t.id ? "0 4px 16px rgba(45,138,45,0.28)" : "none",
              }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <span>{t.label}</span>
                {t.id==="orders" && pendingCount>0 && (
                  <span style={{ marginLeft:"auto", background: tab===t.id?"rgba(255,255,255,0.3)":"#f97316", color:"white", fontSize:11, fontWeight:800, padding:"1px 8px", borderRadius:20 }}>{pendingCount}</span>
                )}
              </button>
            ))}

            <div style={{ marginTop:"auto", paddingTop:12 }}>
              <div style={{ background:"#eaf6ea", borderRadius:14, padding:"12px 14px", marginBottom:10 }}>
                <p style={{ margin:0, fontSize:11, color:"#5a8a5a", fontWeight:600 }}>Store Status</p>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:6, cursor:"pointer" }} onClick={()=>updateVendor({...vendor,isOpen:!vendor.isOpen})}>
                  <div style={{ width:36, height:20, borderRadius:50, background:vendor.isOpen?"#2d8a2d":"#ccc", position:"relative", transition:"background 0.25s" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:"white", position:"absolute", top:3, left:vendor.isOpen?18:3, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:vendor.isOpen?"#2d8a2d":"#999" }}>{vendor.isOpen?"Open":"Closed"}</span>
                </div>
              </div>
              {onLogout && (
                <button onClick={onLogout} style={{ width:"100%", padding:"10px", borderRadius:12, border:"1.5px solid #e2ebe2", background:"white", color:"#999", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                  ← Back to Home
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main style={{ flex:1, padding:"24px 20px 60px", minWidth:0, overflowX:"hidden" }}>
            {/* Mobile tab bar */}
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:2 }}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:50, border:"none", cursor:"pointer", whiteSpace:"nowrap", background:tab===t.id?"#2d8a2d":"white", color:tab===t.id?"white":"#5a7a5a", fontWeight:700, fontSize:13, border:tab===t.id?"none":"1.5px solid #e2ebe2", boxShadow:tab===t.id?"0 3px 12px rgba(45,138,45,0.25)":"none" }}>
                  {t.icon} {t.label}
                  {t.id==="orders"&&pendingCount>0&&<span style={{ background:tab===t.id?"rgba(255,255,255,0.3)":"#f97316", color:"white", fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:20 }}>{pendingCount}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div key={tab} style={{ animation:"fadeUp 0.3s ease" }}>
              {tab==="overview" && <OverviewTab vendor={vendor} orders={orders} onViewOrder={setViewOrder}/>}
              {tab==="orders"   && <OrdersTab orders={orders} onViewOrder={setViewOrder} onUpdateStatus={updateOrderStatus}/>}
              {tab==="menu"     && <MenuTab vendor={vendor} onUpdate={updateVendor}/>}
              {tab==="profile"  && <ProfileTab vendor={vendor} onUpdate={updateVendor}/>}
            </div>
          </main>
        </div>
      </div>

      {/* Order detail modal */}
      {viewOrder && <OrderModal order={viewOrder} onClose={()=>setViewOrder(null)} onUpdateStatus={(id,s)=>{ updateOrderStatus(id,s); setViewOrder(o=>({...o,status:s})); }}/>}
    </>
  );
}