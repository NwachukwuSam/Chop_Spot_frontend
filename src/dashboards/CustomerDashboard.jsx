import { useState } from "react";

// ── helpers ─────────────────────────────────────────────────────────────────
const fmt = n => `₦${Number(n).toLocaleString()}`;
const fmtDate = iso => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
const fmtTime = iso => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};

const STATUS_COLOR = {
  Delivered: { bg: "#e8f5e0", color: "#2d6a2d", dot: "#4caf50" },
  Pending:   { bg: "#fff8e1", color: "#b36a00", dot: "#f97316" },
  Cancelled: { bg: "#fdecea", color: "#c0392b", dot: "#e74c3c" },
};

const DELIVERY_LOCATIONS = [
  { label: "Porter's Lodge (₦300)", value: "porters", fee: 300 },
  { label: "Hall 1 (₦350)", value: "hall1", fee: 350 },
  { label: "Hall 2 (₦350)", value: "hall2", fee: 350 },
  { label: "Main Gate (₦400)", value: "maingate", fee: 400 },
  { label: "Faculty Area (₦450)", value: "faculty", fee: 450 },
];

// Seed demo orders if none exist (so the dashboard isn't empty on first open)
const DEMO_ORDERS = [
  {
    id: "ORD-1710000001",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerName: "Demo User",
    location: "Porter's Lodge (₦300)",
    total: 2150,
    status: "Delivered",
    paymentMethod: "Card",
    groups: [
      { vendor: { name: "Lacusine Restaurant" }, pack: { name: "Plastic", price: 200 },
        items: [{ id: "i1", name: "White Rice", price: 400, qty: 2 }, { id: "i7", name: "Chicken", price: 1200, qty: 1 }] },
    ],
  },
  {
    id: "ORD-1710000002",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    customerName: "Demo User",
    location: "Hall 1 (₦350)",
    total: 1850,
    status: "Delivered",
    paymentMethod: "Transfer",
    groups: [
      { vendor: { name: "Bro Mike's Foods" }, pack: { name: "Foil Container", price: 150 },
        items: [{ id: "i1", name: "Suya (200g)", price: 1000, qty: 1 }, { id: "i2", name: "Peppered Gizzard", price: 800, qty: 1 }] },
    ],
  },
  {
    id: "ORD-1710000003",
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    customerName: "Demo User",
    location: "Main Gate (₦400)",
    total: 3400,
    status: "Delivered",
    paymentMethod: "USSD",
    groups: [
      { vendor: { name: "Cutlery Restaurant" }, pack: { name: "Luxury Box", price: 500 },
        items: [{ id: "i1", name: "Shrimp Cocktail", price: 2500, qty: 1 }, { id: "i2", name: "Bruschetta", price: 1200, qty: 1 }] },
    ],
  },
];

// ── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Delivered;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 480, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "dbIn 0.3s cubic-bezier(.34,1.56,.64,1)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1a6a1a,#2d8a2d)", padding: "22px 24px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: "0 0 3px", letterSpacing: 1.2, textTransform: "uppercase" }}>Order ID</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, margin: 0, color: "white", letterSpacing: 0.5 }}>{order.id}</h3>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <span style={{ background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, display: "inline-block" }}/>
              {order.status}
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>· {fmtDate(order.date)} at {fmtTime(order.date)}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              ["📍 Delivered to", order.location],
              ["💳 Payment", order.paymentMethod],
              ["👤 Customer", order.customerName],
              ["💰 Total Paid", fmt(order.total)],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#f4f8f4", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#8aaa8a", fontWeight: 600, marginBottom: 3 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a2e1a" }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <h4 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2e1a", margin: "0 0 12px" }}>🍽 Order Items</h4>
          {order.groups?.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 16, background: "#f9fdf9", borderRadius: 14, overflow: "hidden", border: "1px solid #e0eee0" }}>
              <div style={{ background: "#e8f5e0", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1a6a1a", fontFamily: "'Sora',sans-serif" }}>{group.vendor?.name}</span>
                {group.pack && <span style={{ fontSize: 11, color: "#5a8a5a", background: "white", padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>{group.pack.name} · {fmt(group.pack.price)}</span>}
              </div>
              <div style={{ padding: "4px 0" }}>
                {group.items?.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #f0f7f0" }}>
                    <span style={{ fontSize: 13, color: "#3a5a3a" }}>{item.name} <span style={{ color: "#8aaa8a" }}>×{item.qty}</span></span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a" }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Total breakdown */}
          <div style={{ background: "#f4f8f4", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #e0eee0" }}>
              <span style={{ fontSize: 13, color: "#5a7a5a" }}>🛵 Delivery Fee</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#1a2e1a" }}>Included</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a" }}>Total</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#f97316" }}>{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Edit Profile Modal ───────────────────────────────────────────────────────
const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState({
    gender: profile?.gender || "Male",
    fullName: profile?.fullName || "",
    whatsapp: profile?.whatsapp || "",
    location: profile?.location?.value || DELIVERY_LOCATIONS[0].value,
    hostel: profile?.hostel || "",
    room: profile?.room || "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedLoc = DELIVERY_LOCATIONS.find(l => l.value === form.location);

  const iStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #d8eed8", background: "#f4f8f4", fontSize: 14, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
  const lStyle = { fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: "#5a7a5a", textTransform: "uppercase", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 440, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 80px rgba(0,0,0,0.2)", animation: "dbIn 0.28s cubic-bezier(.34,1.56,.64,1)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 22px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, margin: 0, color: "#1a2e1a" }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "4px 22px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={lStyle}>Gender</label><select value={form.gender} onChange={e => set("gender", e.target.value)} style={{ ...iStyle, appearance: "none" }}><option>Male</option><option>Female</option><option>Prefer not to say</option></select></div>
          <div><label style={lStyle}>Full Name</label><input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Your full name" style={iStyle} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"}/></div>
          <div><label style={lStyle}>WhatsApp Number</label><input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+234..." style={iStyle} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"}/></div>
          <div><label style={lStyle}>Default Delivery Location</label><select value={form.location} onChange={e => set("location", e.target.value)} style={{ ...iStyle, appearance: "none" }}>{DELIVERY_LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}</select></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><label style={lStyle}>Hostel / Building</label><input value={form.hostel} onChange={e => set("hostel", e.target.value)} placeholder="e.g. Block C" style={iStyle} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"}/></div>
            <div style={{ flex: 1 }}><label style={lStyle}>Room / Flat</label><input value={form.room} onChange={e => set("room", e.target.value)} placeholder="e.g. Room 204" style={iStyle} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#d8eed8"}/></div>
          </div>
        </div>
        <div style={{ padding: "14px 22px 20px", flexShrink: 0 }}>
          <button onClick={() => onSave({ ...form, location: selectedLoc })} style={{ width: "100%", padding: "14px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 18px rgba(45,138,45,0.3)" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ────────────────────────────────────────────────────────────────
import React from 'react'
import { useNavigate } from 'react-router-dom';
function CustomerDashboard({ profile, orders: rawOrders, onBack, onUpdateProfile }) {
  const orders = rawOrders?.length ? rawOrders : DEMO_ORDERS;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  

  const totalSpent = orders.reduce((a, o) => a + o.total, 0);
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const avgOrder = totalOrders ? Math.round(totalSpent / totalOrders) : 0;

  const filteredOrders = activeTab === "all" ? orders : orders.filter(o => o.status.toLowerCase() === activeTab);

  const initials = profile?.fullName
    ? profile.fullName.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleSaveProfile = (updated) => {
    onUpdateProfile(updated);
    setShowEdit(false);
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f2f7f2; }
        @keyframes dbIn { from { opacity:0; transform:scale(0.94) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #b0d5b0; border-radius: 10px; }
        .stat-card { animation: fadeUp 0.4s ease both; }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }
        .order-row:hover { background: #f0f7f0 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f2f7f2", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── Top Nav ── */}
        <nav style={{ background: "white", borderBottom: "1px solid #e0eee0", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#2d8a2d", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif", padding: "6px 10px", borderRadius: 10, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8f5e0"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Home
          </button>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a6a1a" }}>
            Chop<span style={{ color: "#f97316" }}>Spot</span>
          </span>
          <div style={{ width: 90 }}/>{/* spacer */}
        </nav>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px" }}>

          {/* ── Profile Card ── */}
          <div style={{ background: "linear-gradient(135deg,#1a6a1a 0%,#2d8a2d 50%,#3da03d 100%)", borderRadius: 24, padding: "28px 28px 24px", marginBottom: 24, position: "relative", overflow: "hidden", animation: "fadeUp 0.35s ease" }}>
            {/* decorative circles */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }}/>
            <div style={{ position: "absolute", bottom: -40, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}/>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                {initials}
              </div>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: "0 0 3px", letterSpacing: 1.2, textTransform: "uppercase" }}>My Profile</p>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(18px,3vw,26px)", color: "white", margin: "0 0 6px" }}>
                  {profile?.fullName || "No profile yet"}
                </h2>
                {profile ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                    {[
                      ["📱", profile.whatsapp],
                      ["⚧", profile.gender],
                      ["📍", profile.location?.label || "—"],
                      ["🏠", [profile.hostel, profile.room].filter(Boolean).join(", ") || "—"],
                    ].map(([icon, val]) => (
                      <span key={val} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 4 }}>
                        {icon} {val}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>Complete a checkout and save your details to build your profile.</p>
                )}
              </div>
              {/* Edit button */}
              <button onClick={() => setShowEdit(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "8px 16px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "background 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >✏️ Edit</button>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Orders", value: totalOrders, icon: "📦", color: "#2d8a2d", bg: "#e8f5e0" },
              { label: "Total Spent", value: fmt(totalSpent), icon: "💳", color: "#f97316", bg: "#fff5ef" },
              { label: "Avg Order", value: fmt(avgOrder), icon: "📊", color: "#7b3fd4", bg: "#f3eeff" },
              { label: "Delivered", value: delivered, icon: "✅", color: "#1a6a8a", bg: "#e3f4fb" },
            ].map(stat => (
              <div key={stat.label} className="stat-card" style={{ background: "white", borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #eef5ee" }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{stat.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: "#8aaa8a", fontWeight: 600, letterSpacing: 0.5 }}>{stat.label}</p>
                  <p style={{ margin: "2px 0 0", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(15px,2.5vw,20px)", color: stat.color }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order History ── */}
          <div style={{ background: "white", borderRadius: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #eef5ee", animation: "fadeUp 0.45s ease 0.1s both" }}>
            {/* Header */}
            <div style={{ padding: "20px 22px 0", borderBottom: "1px solid #f0f7f0" }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a", marginBottom: 14 }}>Order History</h3>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: -1 }}>
                {[["all","All"],["delivered","Delivered"],["pending","Pending"],["cancelled","Cancelled"]].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)} style={{ padding: "8px 14px", borderRadius: "10px 10px 0 0", border: "none", background: activeTab === key ? "#f4f8f4" : "transparent", color: activeTab === key ? "#2d8a2d" : "#8aaa8a", fontWeight: activeTab === key ? 700 : 500, fontSize: 13, cursor: "pointer", borderBottom: activeTab === key ? "2px solid #2d8a2d" : "2px solid transparent", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#aaa" }}>
                <p style={{ fontSize: 36 }}>📭</p>
                <p style={{ fontWeight: 600, fontSize: 15, marginTop: 10 }}>No orders here yet</p>
              </div>
            ) : (
              <div>
                {filteredOrders.map((order, idx) => {
                  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Delivered;
                  const restaurantNames = order.groups?.map(g => g.vendor?.name).join(", ") || "—";
                  const itemCount = order.groups?.reduce((a, g) => a + (g.items?.length || 0), 0) || 0;
                  return (
                    <div key={order.id} className="order-row" onClick={() => setSelectedOrder(order)} style={{ padding: "16px 22px", borderBottom: idx < filteredOrders.length - 1 ? "1px solid #f0f7f0" : "none", cursor: "pointer", transition: "background 0.18s", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🍱</div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a", fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>{restaurantNames}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>{fmtDate(order.date)} · {itemCount} item{itemCount !== 1 ? "s" : ""} · {order.location}</p>
                      </div>
                      {/* Right */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a" }}>{fmt(order.total)}</span>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }}/>
                          {order.status}
                        </span>
                      </div>
                      {/* Chevron */}
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Favourite Restaurants (derived from orders) ── */}
          {orders.length > 0 && (() => {
            const freq = {};
            orders.forEach(o => o.groups?.forEach(g => { const n = g.vendor?.name; if (n) freq[n] = (freq[n] || 0) + 1; }));
            const faves = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,4);
            return (
              <div style={{ marginTop: 20, background: "white", borderRadius: 22, padding: "20px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #eef5ee", animation: "fadeUp 0.5s ease 0.15s both" }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a", margin: "0 0 16px" }}>⭐ Your Favourites</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {faves.map(([name, count], i) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#f9fdf9", borderRadius: 14, border: "1px solid #e8f0e8" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: ["#e8f5e0","#fff5ef","#f3eeff","#e3f4fb"][i] || "#f4f8f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {["🥇","🥈","🥉","🏅"][i] || "⭐"}
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

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {showEdit && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} onSave={handleSaveProfile} />}
    </>
  );
}

export default CustomerDashboard
