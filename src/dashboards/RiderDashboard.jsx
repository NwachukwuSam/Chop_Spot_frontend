import { useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => `₦${Number(n || 0).toLocaleString()}`;
const fmtTime = iso => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
const fmtDate = iso => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const timeAgo = iso => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(iso);
};

// ── Shared input / label styles (mirrors vendor theme exactly) ────────────────
const inp = (extra = {}) => ({
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "1.5px solid #d8eed8", background: "#f4f8f4",
  fontSize: 14, color: "#1a2e1a", fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box", transition: "all 0.2s",
  ...extra,
});
const lbl = { fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: "#5a7a5a", textTransform: "uppercase", display: "block", marginBottom: 5 };
const foc = e => { e.target.style.borderColor = "#2d8a2d"; e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)"; e.target.style.background = "#fff"; };
const blr = e => { e.target.style.borderColor = "#d8eed8"; e.target.style.boxShadow = "none"; e.target.style.background = "#f4f8f4"; };

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Available:  { bg: "#e8f5e0", color: "#2d6a2d",  dot: "#4caf50" },
  Accepted:   { bg: "#e8f0ff", color: "#1a3a8a",  dot: "#4070e0" },
  "Picked Up":{ bg: "#fff5ef", color: "#b35000",  dot: "#f97316" },
  Delivered:  { bg: "#e8f5e0", color: "#2d6a2d",  dot: "#4caf50" },
};

// ── Demo available orders pool ────────────────────────────────────────────────
const POOL = [
  {
    id: "ORD-9901", date: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    customer: "Aisha Bello", phone: "+234 812 000 0001",
    pickupFrom: "Lacusine Restaurant, Faculty Canteen",
    deliverTo: "Hall 2, Block B, Room 204",
    items: "White Rice ×2, Peppered Gizzard ×1",
    total: 2450, deliveryFee: 400,
  },
  {
    id: "ORD-9902", date: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    customer: "Emeka Okonkwo", phone: "+234 803 000 0002",
    pickupFrom: "Bro Mike's Foods, Opposite Library",
    deliverTo: "Porter's Lodge (collect at gate)",
    items: "Jollof Rice + Beef ×1, Fried Plantain ×1",
    total: 1800, deliveryFee: 350,
  },
  {
    id: "ORD-9903", date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    customer: "Funmilayo Adeyemi", phone: "+234 705 000 0003",
    pickupFrom: "Mama Titi's Kitchen, Block C",
    deliverTo: "Faculty Area, Dept of Law, Office 12",
    items: "Pounded Yam + Egusi ×2, Assorted Meat ×1",
    total: 3200, deliveryFee: 450,
  },
  {
    id: "ORD-9904", date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    customer: "Ngozi Okafor", phone: "+234 809 000 0005",
    pickupFrom: "The Pepper Spot, Main Gate Area",
    deliverTo: "Hall 1, Room 108",
    items: "Fried Rice + Turkey ×1, Shawarma ×2",
    total: 2900, deliveryFee: 400,
  },
  {
    id: "ORD-9905", date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    customer: "Tunde Bakare", phone: "+234 816 000 0006",
    pickupFrom: "SirKay Restaurant, Student Union",
    deliverTo: "Hall 2, Block A, Room 312",
    items: "Suya ×3, Malt ×2",
    total: 2100, deliveryFee: 350,
  },
];

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Available;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

// ── Available Order Card ──────────────────────────────────────────────────────
const AvailableCard = ({ order, onAccept, onDecline }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e0eee0", boxShadow: "0 2px 14px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(45,138,45,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)"}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f7f0", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        <div>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>{order.customer}</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>{order.id} · {timeAgo(order.date)}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
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
              <span style={{ color: "#2d8a2d", fontWeight: 700 }}>Pickup: </span>{order.pickupFrom}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#4a6a4a" }}>
              <span style={{ color: "#f97316", fontWeight: 700 }}>Deliver: </span>{order.deliverTo}
            </p>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div style={{ marginTop: 10, padding: "12px 14px", background: "#f4f8f4", borderRadius: 12, border: "1px solid #e0eee0", fontSize: 13 }}>
            {[["Items", order.items], ["Order Total", fmt(order.total)], ["Customer Phone", order.phone]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#7a9a7a", fontWeight: 600 }}>{k}</span>
                <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", maxWidth: "62%" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => onDecline(order.id)} style={{ flex: 1, padding: "11px", borderRadius: 50, border: "1.5px solid #e0eee0", background: "white", color: "#8aaa8a", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5c5c5"; e.currentTarget.style.color = "#c0392b"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0eee0"; e.currentTarget.style.color = "#8aaa8a"; }}
          >Decline</button>
          <button onClick={() => onAccept(order)} style={{ flex: 2, padding: "11px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Sora',sans-serif", boxShadow: "0 4px 16px rgba(45,138,45,0.3)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >⚡ Accept Order</button>
        </div>
      </div>
    </div>
  );
};

// ── Active Delivery Card ──────────────────────────────────────────────────────
const ActiveDeliveryCard = ({ order, onPickedUp, onDelivered }) => {
  const isPickedUp = order.riderStatus === "Picked Up";
  return (
    <div style={{ background: "white", borderRadius: 22, overflow: "hidden", border: `2px solid ${isPickedUp ? "#f97316" : "#2d8a2d"}`, boxShadow: `0 6px 28px ${isPickedUp ? "rgba(249,115,22,0.15)" : "rgba(45,138,45,0.15)"}` }}>
      {/* Status bar */}
      <div style={{ background: isPickedUp ? "linear-gradient(135deg,#fff5ef,#ffe8d8)" : "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: isPickedUp ? "#f97316" : "#4caf50", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: isPickedUp ? "#b35000" : "#2d6a2d" }}>
          {isPickedUp ? "🏍️ EN ROUTE — Heading to customer" : "⏳ ACCEPTED — Head to restaurant now"}
        </span>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Customer + earn */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: "0 0 3px" }}>{order.customer}</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#8aaa8a" }}>{order.id} · {order.phone}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#f97316" }}>{fmt(order.deliveryFee)}</p>
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
                <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{order.pickupFrom}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#8aaa8a", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Deliver to</p>
                <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{order.deliverTo}</p>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: "1px solid #e0eee0", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#7a9a7a" }}>Items</span>
            <span style={{ color: "#4a6a4a", maxWidth: "65%", textAlign: "right" }}>{order.items}</span>
          </div>
        </div>

        {/* Action button */}
        {!isPickedUp ? (
          <button onClick={() => onPickedUp(order.id)} style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 5px 20px rgba(45,138,45,0.35)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >✅ Order Picked Up</button>
        ) : (
          <button onClick={() => onDelivered(order.id)} style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 5px 20px rgba(249,115,22,0.38)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >🎯 Mark as Delivered</button>
        )}
      </div>
    </div>
  );
};

// ── Delivery Complete Toast ───────────────────────────────────────────────────
const DeliveryToast = ({ order, onDismiss }) => (
  <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 9999, animation: "toastSlide 0.4s cubic-bezier(.34,1.56,.64,1)", width: "calc(100% - 32px)", maxWidth: 420 }}>
    <div style={{ background: "white", border: "2px solid #4caf50", borderRadius: 20, padding: "16px 18px", boxShadow: "0 10px 40px rgba(45,138,45,0.2)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎉</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a", margin: "0 0 2px" }}>Delivery Complete!</p>
        <p style={{ fontSize: 12, color: "#7a9a7a", margin: "0 0 3px" }}>Order {order?.id} — {order?.customer}</p>
        <p style={{ fontSize: 14, color: "#f97316", fontWeight: 800, margin: 0 }}>+{fmt(order?.deliveryFee)} earned 💰</p>
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#aaa", fontSize: 20, cursor: "pointer", padding: 0 }}>×</button>
    </div>
  </div>
);

// ── History Tab ───────────────────────────────────────────────────────────────
const HistoryTab = ({ orders }) => {
  if (!orders.length) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#8aaa8a" }}>
      <p style={{ fontSize: 44 }}>📭</p>
      <p style={{ fontWeight: 700, fontSize: 15, marginTop: 12, color: "#5a7a5a" }}>No deliveries yet</p>
      <p style={{ fontSize: 13, marginTop: 4 }}>Accept your first order to get started</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[...orders].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).map((order, i) => (
        <div key={order.id} style={{ background: "white", borderRadius: 18, padding: "15px 18px", border: "1.5px solid #e0eee0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animation: `fadeUp 0.35s ease ${i * 0.05}s both` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>{order.customer}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8aaa8a" }}>{order.id} · {fmtDate(order.completedAt)} at {fmtTime(order.completedAt)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#f97316" }}>+{fmt(order.deliveryFee)}</p>
              <StatusBadge status="Delivered" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#8aaa8a" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50", display: "inline-block" }} />
              {order.pickupFrom?.split(",")[0]}
            </span>
            <span>→</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />
              {order.deliverTo?.split(",")[0]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Earnings Tab ──────────────────────────────────────────────────────────────
const EarningsTab = ({ completedOrders }) => {
  const total = completedOrders.reduce((a, o) => a + (o.deliveryFee || 0), 0);
  const todayStr = new Date().toDateString();
  const today = completedOrders.filter(o => new Date(o.completedAt).toDateString() === todayStr).reduce((a, o) => a + (o.deliveryFee || 0), 0);
  const thisWeek = completedOrders.filter(o => new Date(o.completedAt) >= new Date(Date.now() - 7 * 864e5)).reduce((a, o) => a + (o.deliveryFee || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Earnings hero */}
      <div style={{ background: "linear-gradient(135deg,#155a15,#2d8a2d,#3daa3d)", borderRadius: 24, padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 6px" }}>Total Lifetime Earnings</p>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 44, color: "white", margin: "0 0 4px" }}>{fmt(total)}</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>Across {completedOrders.length} delivery{completedOrders.length !== 1 ? "ies" : ""}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Today", value: fmt(today),                   icon: "☀️", color: "#f97316", bg: "#fff5ef" },
          { label: "This Week", value: fmt(thisWeek),            icon: "📅", color: "#2d8a2d", bg: "#e8f5e0" },
          { label: "Total Earned", value: fmt(total),            icon: "🏆", color: "#1a6a8a", bg: "#e3f4fb" },
          { label: "Deliveries", value: completedOrders.length, icon: "📦", color: "#7b3fd4", bg: "#f3eeff" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 18, padding: "16px 18px", border: "1.5px solid #e0eee0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#8aaa8a", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tip if empty */}
      {completedOrders.length === 0 && (
        <div style={{ background: "#e8f5e0", border: "1.5px solid #b8d8b8", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: "#4a7a4a", lineHeight: 1.65 }}>
            Earnings are calculated per delivery. Accept more orders to grow your income. Weekly payouts go to your registered bank account every Monday.
          </p>
        </div>
      )}

      {/* Recent payouts */}
      {completedOrders.length > 0 && (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e0eee0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f7f0" }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1a2e1a", margin: 0 }}>Recent Payouts</p>
          </div>
          {[...completedOrders].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5).map((o, i, arr) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f0f7f0" : "none" }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{o.customer}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8aaa8a" }}>{fmtDate(o.completedAt)} · {o.id}</p>
              </div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#f97316" }}>+{fmt(o.deliveryFee)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ rider, onUpdate }) => {
  const [v, setV] = useState({ ...rider });
  const [saved, setSaved] = useState(false);
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));

  const AVAIL = ["Morning (6am–12pm)", "Afternoon (12pm–6pm)", "Evening (6pm–11pm)", "All Day", "Weekends Only"];
  const BIKES = ["Motorcycle", "Bicycle", "Tricycle (Keke)", "Scooter", "On Foot"];

  const save = () => {
    onUpdate({ ...v, fullName: `${v.firstName || ""} ${v.lastName || ""}`.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {saved && (
        <div style={{ background: "#e8f5e0", border: "1.5px solid #4caf50", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, color: "#2d6a2d", fontWeight: 700, fontSize: 14, animation: "fadeUp 0.3s ease" }}>
          ✅ Profile saved successfully!
        </div>
      )}

      {/* Avatar + online toggle */}
      <div style={{ background: "white", borderRadius: 20, padding: "20px", border: "1.5px solid #e0eee0", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div onClick={() => document.getElementById("profile-av-edit").click()} style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#e8f5e0", border: "2.5px solid #7aaa7a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          {v.avatarPreview
            ? <img src={v.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
            : <span style={{ fontSize: 28 }}>👤</span>
          }
        </div>
        <input id="profile-av-edit" type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files[0]; if (f) set("avatarPreview", URL.createObjectURL(f)); }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#1a2e1a", margin: "0 0 3px" }}>{v.fullName || v.firstName}</h3>
          <p style={{ color: "#8aaa8a", fontSize: 12, margin: "0 0 10px" }}>Tap photo to change</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div onClick={() => set("isOnline", !v.isOnline)} style={{ width: 44, height: 24, borderRadius: 50, background: v.isOnline ? "#2d8a2d" : "#ccc", cursor: "pointer", position: "relative", transition: "background 0.25s", boxShadow: v.isOnline ? "0 0 10px rgba(45,138,45,0.35)" : "none" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: v.isOnline ? 22 : 3, transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: v.isOnline ? "#2d8a2d" : "#aaa" }}>{v.isOnline ? "Online — Ready for orders" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Personal */}
      <ProfileSection title="Personal Info" icon="👤">
        <div style={{ display: "flex", gap: 12 }}>
          <PF label="First Name" style={{ flex: 1 }}><input value={v.firstName || ""} onChange={e => set("firstName", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
          <PF label="Last Name" style={{ flex: 1 }}><input value={v.lastName || ""} onChange={e => set("lastName", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
        </div>
        <PF label="WhatsApp"><input value={v.phone || ""} onChange={e => set("phone", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
        <PF label="Email"><input value={v.email || ""} onChange={e => set("email", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
        <PF label="Base Location"><input value={v.address || ""} onChange={e => set("address", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
      </ProfileSection>

      {/* Vehicle */}
      <ProfileSection title="Vehicle" icon="🏍️">
        <PF label="Vehicle Type">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {BIKES.map(b => (
              <div key={b} onClick={() => set("vehicleType", b)} style={{ padding: "6px 13px", borderRadius: 50, cursor: "pointer", fontSize: 12, fontWeight: 600, background: v.vehicleType === b ? "#2d8a2d" : "#f0f7f0", color: v.vehicleType === b ? "white" : "#3a6a3a", border: `1.5px solid ${v.vehicleType === b ? "#2d8a2d" : "#d0e8d0"}`, transition: "all 0.18s" }}>{b}</div>
            ))}
          </div>
        </PF>
        <PF label="Model"><input value={v.vehicleModel || ""} onChange={e => set("vehicleModel", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
        <PF label="Plate Number"><input value={v.plateNumber || ""} onChange={e => set("plateNumber", e.target.value.toUpperCase())} style={{ ...inp(), letterSpacing: 2, textTransform: "uppercase" }} onFocus={foc} onBlur={blr} /></PF>
      </ProfileSection>

      {/* Availability */}
      <ProfileSection title="Availability" icon="🕐">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AVAIL.map(a => {
            const active = (v.availability || []).includes(a);
            return (
              <div key={a} onClick={() => {
                const cur = v.availability || [];
                set("availability", active ? cur.filter(x => x !== a) : [...cur, a]);
              }} style={{ padding: "7px 14px", borderRadius: 50, cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? "#2d8a2d" : "#f0f7f0", color: active ? "white" : "#3a6a3a", border: `1.5px solid ${active ? "#2d8a2d" : "#d0e8d0"}`, transition: "all 0.18s" }}>
                {a}
              </div>
            );
          })}
        </div>
        <PF label="Delivery Zone"><input value={v.zone || ""} onChange={e => set("zone", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
      </ProfileSection>

      {/* Bank */}
      <ProfileSection title="Payout Details" icon="🏦">
        <PF label="Bank Name"><input value={v.bankName || ""} onChange={e => set("bankName", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
        <PF label="Account Number"><input type="tel" value={v.accountNumber || ""} onChange={e => set("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} style={{ ...inp(), letterSpacing: 2 }} onFocus={foc} onBlur={blr} /></PF>
        <PF label="Account Name"><input value={v.accountName || ""} onChange={e => set("accountName", e.target.value)} style={inp()} onFocus={foc} onBlur={blr} /></PF>
      </ProfileSection>

      <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 5px 20px rgba(45,138,45,0.32)", transition: "transform 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >💾 Save Profile</button>
    </div>
  );
};

const ProfileSection = ({ title, icon, children }) => (
  <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e0eee0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
    <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "12px 18px", display: "flex", gap: 8, alignItems: "center" }}>
      <span>{icon}</span>
      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a6a1a" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  </div>
);

const PF = ({ label, children, style }) => (
  <div style={style}>
    <label style={lbl}>{label}</label>
    {children}
  </div>
);

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "orders",   icon: "📋", label: "Orders"   },
  { id: "history",  icon: "📦", label: "History"  },
  { id: "earnings", icon: "💰", label: "Earnings" },
  { id: "profile",  icon: "👤", label: "Profile"  },
];

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function RiderDashboard({ initialRider, onLogout }) {
  const loadRider = () => {
    if (initialRider) return initialRider;
    try { const s = localStorage.getItem("chopspot_rider"); return s ? JSON.parse(s) : null; } catch { return null; }
  };

  const [rider, setRider] = useState(loadRider);
  const [activeTab, setActiveTab] = useState("orders");
  const [availableOrders, setAvailableOrders] = useState(POOL);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [completedOrders, setCompletedOrders] = useState(() => loadRider()?.completedOrders || []);
  const [toast, setToast] = useState(null);
  const [declinedIds, setDeclinedIds] = useState([]);

  const isOnline = rider?.isOnline;

  const updateRider = updated => {
    setRider(updated);
    try { localStorage.setItem("chopspot_rider", JSON.stringify({ ...updated, completedOrders })); } catch {}
  };

  const handleToggleOnline = () => updateRider({ ...rider, isOnline: !rider.isOnline });
  const handleAccept = order => { setActiveDelivery({ ...order, riderStatus: "Accepted" }); setAvailableOrders(p => p.filter(o => o.id !== order.id)); setActiveTab("orders"); };
  const handleDecline = id => { setDeclinedIds(p => [...p, id]); setAvailableOrders(p => p.filter(o => o.id !== id)); };
  const handlePickedUp = () => setActiveDelivery(p => ({ ...p, riderStatus: "Picked Up" }));
  const handleDelivered = () => {
    const done = { ...activeDelivery, riderStatus: "Delivered", completedAt: new Date().toISOString() };
    const updated = [done, ...completedOrders];
    setCompletedOrders(updated);
    setActiveDelivery(null);
    setToast(done);
    updateRider({ ...rider, totalDeliveries: (rider.totalDeliveries || 0) + 1, earnings: (rider.earnings || 0) + (done.deliveryFee || 0), completedOrders: updated });
    setTimeout(() => setToast(null), 5000);
  };

  if (!rider) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48 }}>🏍️</p>
        <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginTop: 12 }}>No rider profile found</p>
        <button onClick={onLogout} style={{ marginTop: 16, padding: "12px 28px", borderRadius: 50, border: "none", background: "#2d8a2d", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Register as Rider</button>
      </div>
    </div>
  );

  const initials = rider.fullName?.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "R";
  const visibleOrders = availableOrders.filter(o => !declinedIds.includes(o.id));
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

        {/* ── Navbar ── */}
        <nav style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(18px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid rgba(45,138,45,0.12)", position: "sticky", top: 0, zIndex: 500, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏍️</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a6a1a" }}>
              Chop<span style={{ color: "#f97316" }}>Spot</span>
              <span style={{ color: "#9ab59a", fontWeight: 500, fontSize: 12, marginLeft: 6 }}>Rider</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Online toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: isOnline ? "#e8f5e0" : "#f4f8f4", border: `1px solid ${isOnline ? "#b8d8b8" : "#e0eee0"}`, borderRadius: 50, padding: "5px 13px 5px 9px", cursor: "pointer", transition: "all 0.2s" }} onClick={handleToggleOnline}>
              <div style={{ width: 32, height: 18, borderRadius: 50, background: isOnline ? "#2d8a2d" : "#ccc", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: isOnline ? 16 : 2, transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#2d8a2d" : "#aaa" }}>{isOnline ? "Online" : "Offline"}</span>
            </div>

            {/* Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", overflow: "hidden", border: "2px solid #b8d8b8" }}>
              {rider.avatarPreview
                ? <img src={rider.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
                : initials
              }
            </div>
          </div>
        </nav>

        {/* ── Content ── */}
        <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "20px 16px 100px" }}>

          {/* Offline banner */}
          {!isOnline && (
            <div style={{ background: "white", border: "1.5px solid #e0eee0", borderRadius: 16, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.3s ease", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 22 }}>😴</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>You're offline</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8aaa8a" }}>Toggle to Online to start receiving orders</p>
              </div>
              <button onClick={handleToggleOnline} style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Go Online</button>
            </div>
          )}

          {/* Active delivery — shown across all tabs */}
          {activeDelivery && (
            <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>🔴 ACTIVE DELIVERY</p>
              <ActiveDeliveryCard order={activeDelivery} onPickedUp={handlePickedUp} onDelivered={handleDelivered} />
            </div>
          )}

          {/* Tab content */}
          <div key={activeTab} style={{ animation: "fadeUp 0.28s ease" }}>
            {activeTab === "orders" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2e1a", margin: 0 }}>Available Orders</h2>
                  <span style={{ fontSize: 12, color: "#7aaa7a", background: "white", border: "1px solid #e0eee0", padding: "4px 12px", borderRadius: 20 }}>
                    {visibleOrders.length} near you
                  </span>
                </div>

                {!isOnline && (
                  <div style={{ textAlign: "center", padding: "44px 0", color: "#8aaa8a" }}>
                    <p style={{ fontSize: 40 }}>🔌</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginTop: 10, color: "#5a7a5a" }}>Go online to see orders</p>
                    <button onClick={handleToggleOnline} style={{ marginTop: 14, padding: "10px 24px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,138,45,0.25)" }}>Go Online Now</button>
                  </div>
                )}

                {isOnline && activeDelivery && (
                  <div style={{ background: "#fff8e6", border: "1.5px solid #f5d080", borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "#7a5a00" }}>
                    ⚠️ Complete your current delivery before accepting a new order.
                  </div>
                )}

                {isOnline && !activeDelivery && visibleOrders.length === 0 && (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#8aaa8a" }}>
                    <p style={{ fontSize: 40 }}>🔍</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginTop: 10, color: "#5a7a5a" }}>No orders nearby right now</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Stay online — new orders appear here in real time</p>
                  </div>
                )}

                {isOnline && !activeDelivery && visibleOrders.map((order, i) => (
                  <div key={order.id} style={{ animation: `fadeUp 0.35s ease ${i * 0.07}s both` }}>
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
                    <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  )}
                </div>
                <ProfileTab rider={rider} onUpdate={updateRider} />
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Tab Bar ── */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(45,138,45,0.12)", padding: "8px 16px 16px", display: "flex", justifyContent: "space-around", zIndex: 500, boxShadow: "0 -2px 20px rgba(0,0,0,0.06)" }}>
          {TABS.map(t => {
            const isActive = activeTab === t.id;
            const hasBadge = t.id === "orders" && pendingCount > 0;
            return (
              <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "8px 16px", borderRadius: 14, border: "none", cursor: "pointer",
                background: isActive ? "#e8f5e0" : "transparent",
                position: "relative",
              }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#2d8a2d" : "#8aaa8a", letterSpacing: 0.3 }}>{t.label}</span>
                {isActive && <div style={{ position: "absolute", bottom: -2, width: 20, height: 3, borderRadius: 10, background: "#2d8a2d" }} />}
                {hasBadge && (
                  <div style={{ position: "absolute", top: 5, right: 14, width: 8, height: 8, borderRadius: "50%", background: "#f97316", animation: "pulse 1.5s infinite" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}