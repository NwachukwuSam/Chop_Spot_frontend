import { useState, useEffect, useRef } from "react";

// ─── Seed data ─────────────────────────────────────────────────────────────────
const seedCustomers = [
  { id: "CST001", name: "Fatima Hassan",   email: "fatima@mail.com",  phone: "0801 234 5678", orders: 12, totalSpent: 48500,  status: "Active",    joined: "Nov 2024" },
  { id: "CST002", name: "Gbenga Olawale",  email: "gbenga@mail.com",  phone: "0802 345 6789", orders: 5,  totalSpent: 19200,  status: "Active",    joined: "Dec 2024" },
  { id: "CST003", name: "Hauwa Ibrahim",   email: "hauwa@mail.com",   phone: "0803 456 7890", orders: 28, totalSpent: 112000, status: "Active",    joined: "Sep 2024" },
  { id: "CST004", name: "Ifeanyi Obi",     email: "ifeany@mail.com",  phone: "0804 567 8901", orders: 2,  totalSpent: 7400,   status: "Suspended", joined: "Jan 2025" },
  { id: "CST005", name: "Jumoke Adediran", email: "jumoke@mail.com",  phone: "0805 678 9012", orders: 9,  totalSpent: 35600,  status: "Active",    joined: "Oct 2024" },
  { id: "CST006", name: "Kabir Sule",      email: "kabir@mail.com",   phone: "0806 789 0123", orders: 17, totalSpent: 67800,  status: "Active",    joined: "Aug 2024" },
  { id: "CST007", name: "Lola Okonkwo",    email: "lola@mail.com",    phone: "0807 890 1234", orders: 6,  totalSpent: 24300,  status: "Active",    joined: "Feb 2025" },
  { id: "CST008", name: "Musa Adamu",      email: "musa@mail.com",    phone: "0808 901 2345", orders: 21, totalSpent: 84600,  status: "Active",    joined: "Jul 2024" },
];

const seedOrders = [
  { id: "ORD-1001", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", items: 3, total: 4200,  status: "Delivered", rider: "Emeka D.",   date: "Mar 14, 2026", payment: "Card" },
  { id: "ORD-1002", customer: "Gbenga Olawale",  vendor: "Spice Garden",      items: 2, total: 2800,  status: "Preparing", rider: "—",          date: "Mar 15, 2026", payment: "Transfer" },
  { id: "ORD-1003", customer: "Hauwa Ibrahim",   vendor: "ChopHouse",         items: 5, total: 8500,  status: "Delivered", rider: "Tunde O.",   date: "Mar 14, 2026", payment: "Card" },
  { id: "ORD-1004", customer: "Ifeanyi Obi",     vendor: "Mama Cass Kitchen", items: 1, total: 1500,  status: "Cancelled", rider: "—",          date: "Mar 13, 2026", payment: "USSD" },
  { id: "ORD-1005", customer: "Jumoke Adediran", vendor: "Buka Express",      items: 4, total: 6200,  status: "Delivered", rider: "Aminu K.",   date: "Mar 12, 2026", payment: "Card" },
  { id: "ORD-1006", customer: "Kabir Sule",      vendor: "ChopHouse",         items: 2, total: 3400,  status: "En Route",  rider: "Emeka D.",   date: "Mar 15, 2026", payment: "Card" },
  { id: "ORD-1007", customer: "Fatima Hassan",   vendor: "Spice Garden",      items: 3, total: 5100,  status: "Pending",   rider: "—",          date: "Mar 15, 2026", payment: "Transfer" },
  { id: "ORD-1008", customer: "Lola Okonkwo",    vendor: "The Rice House",    items: 2, total: 3800,  status: "Delivered", rider: "Sunday E.",  date: "Mar 13, 2026", payment: "Card" },
  { id: "ORD-1009", customer: "Musa Adamu",      vendor: "ChopHouse",         items: 4, total: 7200,  status: "Delivered", rider: "Aminu K.",   date: "Mar 12, 2026", payment: "USSD" },
];

const seedVendors = [
  { id: "VND001", name: "Mama Cass Kitchen", owner: "Cassandra Okeke",  phone: "0901 111 2222", category: "Nigerian",  orders: 320, revenue: 1280000, rating: 4.8, status: "Active",    email: "cass@vendor.ng",    joined: "Jun 2024", address: "Block B, Cafeteria Row" },
  { id: "VND002", name: "Spice Garden",      owner: "Rasheed Afolabi",  phone: "0902 222 3333", category: "Mixed",     orders: 215, revenue: 860000,  rating: 4.6, status: "Active",    email: "spice@vendor.ng",   joined: "Jul 2024", address: "Stall 7, Food Court" },
  { id: "VND003", name: "ChopHouse",         owner: "Ngozi Nwosu",      phone: "0903 333 4444", category: "Nigerian",  orders: 412, revenue: 1648000, rating: 4.9, status: "Active",    email: "chop@vendor.ng",    joined: "May 2024", address: "Main Campus, Block A" },
  { id: "VND004", name: "Buka Express",      owner: "Musa Bello",       phone: "0904 444 5555", category: "Fast Food", orders: 98,  revenue: 392000,  rating: 4.3, status: "Suspended", email: "buka@vendor.ng",    joined: "Sep 2024", address: "Gate 2, Side Road" },
  { id: "VND005", name: "The Rice House",    owner: "Adaeze Obi",       phone: "0905 555 6666", category: "Nigerian",  orders: 178, revenue: 712000,  rating: 4.7, status: "Active",    email: "rice@vendor.ng",    joined: "Aug 2024", address: "Block C, Cafeteria" },
];

const seedRiders = [
  { id: "RDR001", name: "Emeka Duru",     phone: "0811 111 2222", email: "emeka@rider.ng",  vehicle: "Motorcycle", plateNo: "AKR-234-AB", zone: "Hall 1–3",       deliveries: 284, rating: 4.9, status: "Online",  earnings: 142000, joined: "Jun 2024", bank: "GTBank", accountNo: "0123456789" },
  { id: "RDR002", name: "Tunde Olatunji", phone: "0812 222 3333", email: "tunde@rider.ng",  vehicle: "Bicycle",    plateNo: "—",         zone: "Faculty Area",   deliveries: 192, rating: 4.7, status: "Offline", earnings: 96000,  joined: "Jul 2024", bank: "First Bank", accountNo: "3012345678" },
  { id: "RDR003", name: "Aminu Kaduna",   phone: "0813 333 4444", email: "aminu@rider.ng",  vehicle: "Motorcycle", plateNo: "KNA-120-CD", zone: "Main Gate",      deliveries: 341, rating: 4.8, status: "Online",  earnings: 170500, joined: "May 2024", bank: "Zenith", accountNo: "2012345678" },
  { id: "RDR004", name: "Sunday Effiong", phone: "0814 444 5555", email: "sunday@rider.ng", vehicle: "Keke",       plateNo: "ABJ-567-EF", zone: "Porter's Lodge", deliveries: 126, rating: 4.5, status: "Online",  earnings: 63000,  joined: "Aug 2024", bank: "Access", accountNo: "0023456789" },
  { id: "RDR005", name: "Yusuf Garba",    phone: "0815 555 6666", email: "yusuf@rider.ng",  vehicle: "Motorcycle", plateNo: "KNO-889-GH", zone: "Hall 4–6",       deliveries: 97,  rating: 4.6, status: "Offline", earnings: 48500,  joined: "Oct 2024", bank: "UBA", accountNo: "1012345678" },
];

// ─── Config ────────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = ["Motorcycle", "Bicycle", "Keke", "Scooter", "On Foot"];
const VENDOR_CATEGORIES = ["Nigerian", "Fast Food", "Mixed", "Chinese", "Continental", "Pastries", "Drinks"];
const DELIVERY_ZONES = ["Hall 1–3", "Hall 4–6", "Faculty Area", "Main Gate", "Porter's Lodge", "Library Area"];
const BANKS = ["GTBank", "First Bank", "Zenith Bank", "Access Bank", "UBA", "Fidelity Bank", "Sterling Bank"];

const STATUS_COLORS = {
  Active:    { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  Inactive:  { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" },
  Suspended: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Online:    { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  Offline:   { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" },
  Delivered: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  Preparing: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  "En Route":{ bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  Pending:   { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

const ROLE_META = {
  "Operations Manager": { color: "#3b82f6", bg: "#eff6ff", label: "Operations" },
  "Finance Manager":    { color: "#f59e0b", bg: "#fffbeb", label: "Finance" },
  "Admin Manager":      { color: "#8b5cf6", bg: "#f5f3ff", label: "Admin" },
};

// ─── Shared micro-components ───────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

const Avatar = ({ initials, size = 34, gradient = "linear-gradient(135deg,#2d8a2d,#4caf50)" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
    {initials}
  </div>
);

const Table = ({ children }) => (
  <div style={{ overflowX: "auto", borderRadius: 16, border: "1.5px solid #e5e7eb", background: "white" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>{children}</table>
  </div>
);
const TH = ({ children, right }) => (
  <th style={{ padding: "12px 18px", textAlign: right ? "right" : "left", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#9ca3af", background: "#f9fafb", borderBottom: "1.5px solid #e5e7eb", whiteSpace: "nowrap" }}>{children}</th>
);
const TD = ({ children, right }) => (
  <td style={{ padding: "14px 18px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6", textAlign: right ? "right" : "left", verticalAlign: "middle" }}>{children}</td>
);
const TR = ({ children }) => (
  <tr onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{children}</tr>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", outline: "none", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = "#2d8a2d"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

const SectionHeader = ({ title, sub, count, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
    <div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1f2937", margin: 0 }}>
        {title}
        {count !== undefined && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#9ca3af", marginLeft: 8 }}>({count})</span>}
      </h2>
      {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: "3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ icon, label, value, sub, color = "#2d8a2d", delay = 0 }) => (
  <div style={{ background: "white", borderRadius: 18, padding: "20px 22px", border: "1.5px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", animation: `adIn 0.4s ease ${delay}s both` }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 10 }}>{icon}</div>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1f2937", margin: 0 }}>{value}</p>
    {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280", margin: "3px 0 0" }}>{sub}</p>}
  </div>
);

const DeleteBtn = ({ onClick }) => (
  <button onClick={onClick}
    style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 12px", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
    onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
  >
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    Delete
  </button>
);

const ToggleBtn = ({ status, onClick }) => {
  const isActive = status === "Active" || status === "Online";
  return (
    <button onClick={onClick}
      style={{ background: isActive ? "#fef9c3" : "#dcfce7", border: "none", borderRadius: 8, padding: "6px 12px", color: isActive ? "#854d0e" : "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
      {isActive ? "Suspend" : "Activate"}
    </button>
  );
};

const CreateBtn = ({ label, onClick }) => (
  <button onClick={onClick}
    style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", border: "none", borderRadius: 12, padding: "11px 20px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(45,138,45,0.32)", transition: "transform 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
  >
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    {label}
  </button>
);

// ─── Shared form field styles ──────────────────────────────────────────────────
const iS = { width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", color: "#1f2937", transition: "border-color 0.2s" };
const lS = { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: "#6b7280", textTransform: "uppercase", marginBottom: 7 };

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmModal({ target, entityType, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: "32px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "adIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 18px" }}>🗑️</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1f2937", textAlign: "center", margin: "0 0 8px" }}>Delete {entityType}?</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#6b7280", textAlign: "center", margin: "0 0 24px", lineHeight: 1.55 }}>
          You're about to permanently delete <strong style={{ color: "#1f2937" }}>{target}</strong>. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.38)" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Detail Modal shell ───────────────────────────────────────────────
function DetailModal({ onClose, accent = "#2d8a2d", children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.22)", animation: "adIn 0.28s cubic-bezier(.34,1.4,.64,1) both", position: "relative" }} onClick={e => e.stopPropagation()}>
        {/* Top accent line */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${accent},${accent}88)`, borderRadius: "24px 24px 0 0" }} />
        {children}
      </div>
    </div>
  );
}

// Reusable info row inside modals
const InfoRow = ({ label, value, mono }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
    <span style={{ fontFamily: mono ? "monospace" : "'DM Sans',sans-serif", fontSize: 13, color: "#1f2937", fontWeight: 700, letterSpacing: mono ? 1 : 0 }}>{value || "—"}</span>
  </div>
);

// Stat mini card
const MiniStat = ({ icon, label, value }) => (
  <div style={{ background: "#f9fafb", borderRadius: 14, padding: "14px 10px", textAlign: "center", flex: 1 }}>
    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#1f2937", margin: 0 }}>{value}</p>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
  </div>
);

// Close button for modals
const ModalClose = ({ onClose }) => (
  <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#f3f4f6", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>×</button>
);

// ─── Customer Detail Modal ─────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#3b82f6">
      <ModalClose onClose={onClose} />
      {/* Header */}
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={customer.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={54} gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Customer Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 5px" }}>{customer.name}</h3>
            <StatusPill status={customer.status} />
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="📦" label="Orders" value={customer.orders} />
        <MiniStat icon="💰" label="Total Spent" value={`₦${(customer.totalSpent/1000).toFixed(0)}k`} />
        <MiniStat icon="📅" label="Joined" value={customer.joined} />
      </div>
      {/* Info */}
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Email"  value={customer.email} />
        <InfoRow label="Phone"  value={customer.phone} />
        <InfoRow label="Status" value={<StatusPill status={customer.status} />} />
        <InfoRow label="Joined" value={customer.joined} />
        <InfoRow label="Total Spent" value={`₦${customer.totalSpent.toLocaleString()}`} />
      </div>
    </DetailModal>
  );
}

// ─── Vendor Detail Modal ───────────────────────────────────────────────────────
function VendorModal({ vendor, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#8b5cf6">
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={vendor.name.slice(0,2).toUpperCase()} size={54} gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#8b5cf6", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Vendor Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 5px" }}>{vendor.name}</h3>
            <StatusPill status={vendor.status} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="📦" label="Orders"  value={vendor.orders} />
        <MiniStat icon="💰" label="Revenue" value={`₦${(vendor.revenue/1000).toFixed(0)}k`} />
        <MiniStat icon="⭐" label="Rating"  value={vendor.rating} />
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Owner"    value={vendor.owner} />
        <InfoRow label="Email"    value={vendor.email} />
        <InfoRow label="Phone"    value={vendor.phone} />
        <InfoRow label="Category" value={vendor.category} />
        <InfoRow label="Address"  value={vendor.address} />
        <InfoRow label="Status"   value={<StatusPill status={vendor.status} />} />
        <InfoRow label="Joined"   value={vendor.joined} />
      </div>
    </DetailModal>
  );
}

// ─── Rider Detail Modal ────────────────────────────────────────────────────────
function RiderModal({ rider, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#f97316">
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={rider.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={54} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Rider Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 5px" }}>{rider.name}</h3>
            <StatusPill status={rider.status} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="🏍️" label="Deliveries" value={rider.deliveries} />
        <MiniStat icon="⭐"  label="Rating"     value={rider.rating} />
        <MiniStat icon="💰"  label="Earnings"   value={`₦${(rider.earnings/1000).toFixed(0)}k`} />
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Phone"      value={rider.phone} />
        <InfoRow label="Email"      value={rider.email} />
        <InfoRow label="Gender"     value={rider.gender} />
        <InfoRow label="Vehicle"    value={rider.vehicle} />
        <InfoRow label="Plate No."  value={rider.plateNo} mono />
        <InfoRow label="Zone"       value={rider.zone} />
        <InfoRow label="Bank"       value={rider.bank} />
        <InfoRow label="Account No."value={rider.accountNo} mono />
        <InfoRow label="Acc. Name"  value={rider.accountName || rider.name} />
        <InfoRow label="Status"     value={<StatusPill status={rider.status} />} />
        <InfoRow label="Joined"     value={rider.joined} />
      </div>
    </DetailModal>
  );
}

// ─── Create Vendor Modal (4-step wizard) ───────────────────────────────────────
function CreateVendorModal({ onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", owner: "", email: "", phone: "", category: VENDOR_CATEGORIES[0],
    address: "", password: "", confirmPassword: "", bankName: "", accountNo: "", accountName: "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const steps = ["Business Info", "Contact & Location", "Payout Details", "Review & Create"];
  const canNext = [
    form.name.trim() && form.owner.trim() && form.category,
    form.email.includes("@") && form.phone.trim() && form.address.trim() && form.password.length >= 6,
    form.bankName && form.accountNo.trim() && form.accountName.trim(),
    true,
  ];

  const handleSave = () => {
    onSave({
      ...form,
      id: `VND${String(Date.now()).slice(-3)}`,
      orders: 0, revenue: 0, rating: 0,
      status: "Active",
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "94vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "adIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1a3a1a,#2d6a2d)", padding: "24px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Admin Dashboard</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "white", margin: "4px 0 0" }}>Create New Vendor</h3>
            </div>
            <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? "#4ade80" : "rgba(255,255,255,0.2)", transition: "background 0.3s" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: i <= step ? "#4ade80" : "rgba(255,255,255,0.4)", margin: "5px 0 0", fontWeight: i === step ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: "24px 28px" }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={lS}>Restaurant / Business Name</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Mama Cass Kitchen" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Owner's Full Name</label><input value={form.owner} onChange={e => set("owner", e.target.value)} placeholder="e.g. Cassandra Okeke" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div>
                <label style={lS}>Food Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...iS, appearance: "none", cursor: "pointer" }}>
                  {VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={lS}>Business Email</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="vendor@example.com" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Phone Number</label><input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0901 234 5678" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Business Address / Location on Campus</label><input value={form.address} onChange={e => set("address", e.target.value)} placeholder="e.g. Block B, Cafeteria Row" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}><label style={lS}>Password</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 chars" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
                <div style={{ flex: 1 }}><label style={lS}>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Repeat" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #2d8a2d" }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#166534", margin: 0, lineHeight: 1.55 }}>Payout details are used to process vendor earnings. Ensure all information is accurate.</p>
              </div>
              <div>
                <label style={lS}>Bank Name</label>
                <select value={form.bankName} onChange={e => set("bankName", e.target.value)} style={{ ...iS, appearance: "none", cursor: "pointer" }}>
                  <option value="">Select bank…</option>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div><label style={lS}>Account Number</label><input value={form.accountNo} onChange={e => set("accountNo", e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit account number" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Account Name</label><input value={form.accountName} onChange={e => set("accountName", e.target.value)} placeholder="As it appears on the account" style={iS} onFocus={e => e.target.style.borderColor="#2d8a2d"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6b7280", margin: "0 0 8px" }}>Review the information before creating the vendor account.</p>
              {[
                ["Business Name", form.name], ["Owner", form.owner], ["Category", form.category],
                ["Email", form.email], ["Phone", form.phone], ["Address", form.address],
                ["Bank", form.bankName], ["Account No.", form.accountNo], ["Account Name", form.accountName],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderRadius: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{k}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#1f2937", fontWeight: 700 }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
            )}
            {step < 3 ? (
              <button onClick={() => canNext[step] && setStep(s => s + 1)} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: canNext[step] ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d1d5db", color: canNext[step] ? "white" : "#9ca3af", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: canNext[step] ? "pointer" : "not-allowed", boxShadow: canNext[step] ? "0 4px 14px rgba(45,138,45,0.3)" : "none" }}>
                Next Step →
              </button>
            ) : (
              <button onClick={handleSave} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(45,138,45,0.3)" }}>
                🏪 Create Vendor Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Rider Modal (4-step wizard) ────────────────────────────────────────
function CreateRiderModal({ onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", gender: "Male",
    vehicle: VEHICLE_TYPES[0], plateNo: "", zone: DELIVERY_ZONES[0],
    bank: BANKS[0], accountNo: "", accountName: "", password: "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const steps = ["Personal Info", "Vehicle & Zone", "Payout Details", "Review & Create"];
  const canNext = [
    form.name.trim() && form.phone.trim() && form.email.includes("@") && form.password.length >= 6,
    form.vehicle && form.zone,
    form.bank && form.accountNo.trim() && form.accountName.trim(),
    true,
  ];

  const handleSave = () => {
    onSave({
      ...form,
      id: `RDR${String(Date.now()).slice(-3)}`,
      deliveries: 0, rating: 0, earnings: 0,
      status: "Offline",
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520, maxHeight: "94vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "adIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", padding: "24px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Admin Dashboard</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "white", margin: "4px 0 0" }}>Onboard New Rider</h3>
            </div>
            <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? "#f9a8d4" : "rgba(255,255,255,0.2)", transition: "background 0.3s" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: i <= step ? "#f9a8d4" : "rgba(255,255,255,0.4)", margin: "5px 0 0", fontWeight: i === step ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={lS}>Full Name</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Emeka Duru" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}><label style={lS}>Phone Number</label><input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0811 123 4567" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
                <div style={{ flex: 1 }}>
                  <label style={lS}>Gender</label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} style={{ ...iS, appearance: "none" }}>
                    {["Male","Female","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={lS}>Email Address</label><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="rider@example.com" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Password</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 characters" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lS}>Vehicle Type</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {VEHICLE_TYPES.map(v => (
                    <button key={v} onClick={() => set("vehicle", v)} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid", borderColor: form.vehicle === v ? "#7c3aed" : "#e5e7eb", background: form.vehicle === v ? "#f5f3ff" : "white", color: form.vehicle === v ? "#7c3aed" : "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div><label style={lS}>Plate Number (if applicable)</label><input value={form.plateNo} onChange={e => set("plateNo", e.target.value)} placeholder="e.g. AKR-234-AB or leave blank" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div>
                <label style={lS}>Delivery Zone</label>
                <select value={form.zone} onChange={e => set("zone", e.target.value)} style={{ ...iS, appearance: "none" }}>
                  {DELIVERY_ZONES.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#faf5ff", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #7c3aed" }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b21a8", margin: 0, lineHeight: 1.55 }}>Earnings are paid out weekly to the bank account provided. Ensure the details match the rider's bank records.</p>
              </div>
              <div>
                <label style={lS}>Bank Name</label>
                <select value={form.bank} onChange={e => set("bank", e.target.value)} style={{ ...iS, appearance: "none" }}>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div><label style={lS}>Account Number</label><input value={form.accountNo} onChange={e => set("accountNo", e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit number" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
              <div><label style={lS}>Account Name</label><input value={form.accountName} onChange={e => set("accountName", e.target.value)} placeholder="As on bank records" style={iS} onFocus={e => e.target.style.borderColor="#7c3aed"} onBlur={e => e.target.style.borderColor="#e5e7eb"} /></div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#6b7280", margin: "0 0 6px" }}>Review details before onboarding this rider.</p>
              {[["Name",form.name],["Phone",form.phone],["Email",form.email],["Gender",form.gender],["Vehicle",form.vehicle],["Plate No.",form.plateNo||"—"],["Zone",form.zone],["Bank",form.bank],["Account No.",form.accountNo],["Account Name",form.accountName]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderRadius: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{k}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#1f2937", fontWeight: 700 }}>{v||"—"}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Back</button>
            )}
            {step < 3 ? (
              <button onClick={() => canNext[step] && setStep(s => s + 1)} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: canNext[step] ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#d1d5db", color: canNext[step] ? "white" : "#9ca3af", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: canNext[step] ? "pointer" : "not-allowed", boxShadow: canNext[step] ? "0 4px 14px rgba(124,58,237,0.3)" : "none" }}>
                Next Step →
              </button>
            ) : (
              <button onClick={handleSave} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                🏍️ Onboard Rider
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderModal({ order, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, padding: "28px", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "adIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>Order Details</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1f2937", margin: "3px 0 0" }}>{order.id}</h3>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[["Customer",order.customer],["Vendor",order.vendor],["Items",`${order.items} item(s)`],["Total",`₦${order.total.toLocaleString()}`],["Payment",order.payment],["Rider",order.rider],["Date",order.date]].map(([k,v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>{k}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#1f2937", fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0" }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Status</span>
            <StatusPill status={order.status} />
          </div>
        </div>
        <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 12, border: "none", background: "#f3f4f6", color: "#374151", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}

// ─── TAB: OVERVIEW ────────────────────────────────────────────────────────────
function OverviewTab({ customers, orders, vendors, riders, adminRole }) {
  const revenue = vendors.reduce((a, v) => a + v.revenue, 0);
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const todayOrders = orders.filter(o => o.date.includes("Mar 15")).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: "#1f2937", margin: "0 0 4px" }}>Good morning 👋</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>Here's what's happening on ChopSpot today.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="🛒" label="Customers"    value={customers.length}  sub={`${customers.filter(c=>c.status==="Active").length} active`}  color="#3b82f6" delay={0}    />
        <StatCard icon="📦" label="Total Orders" value={orders.length}     sub={`${delivered} delivered`}                                       color="#f59e0b" delay={0.05} />
        <StatCard icon="🏪" label="Vendors"      value={vendors.length}    sub={`${vendors.filter(v=>v.status==="Active").length} active`}       color="#8b5cf6" delay={0.1}  />
        <StatCard icon="🏍️" label="Riders"      value={riders.length}     sub={`${riders.filter(r=>r.status==="Online").length} online`}         color="#f97316" delay={0.15} />
        <StatCard icon="📅" label="Today's Orders" value={todayOrders}    sub="orders placed today"                                              color="#2d8a2d" delay={0.2}  />
        <StatCard icon="💰" label="Total Revenue"  value={`₦${(revenue/1000000).toFixed(1)}M`} sub="across all vendors"                          color="#10b981" delay={0.25} />
      </div>

      {/* Recent orders + active riders side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 24 }}>
        <div>
          <SectionHeader title="Recent Orders" sub="Latest activity" />
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            {orders.slice(0,5).map((o, i, arr) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length-1 ? "1px solid #f3f4f6" : "none" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1f2937", fontFamily: "'Sora',sans-serif" }}>{o.id}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{o.customer} · {o.vendor}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={o.status} />
                  <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: "#2d8a2d" }}>₦{o.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Rider Status" sub="Live delivery fleet" />
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            {riders.map((r, i, arr) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length-1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={r.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={32} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.zone}</p>
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: CUSTOMERS ───────────────────────────────────────────────────────────
function CustomersTab({ customers, setCustomers }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const toggleStatus = id => setCustomers(p => p.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Suspended" : "Active" } : c));

  return (
    <div>
      <SectionHeader title="Customers" sub="All registered customers — click any row to view details" count={filtered.length} />
      <div style={{ marginBottom: 16 }}><SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" /></div>
      <Table>
        <thead><tr><TH>Customer</TH><TH>Phone</TH><TH>Orders</TH><TH>Total Spent</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH></tr></thead>
        <tbody>
          {filtered.map(c => (
            <TR key={c.id}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={c.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={34} gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
                  <div>
                    <button onClick={() => setSelected(c)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{c.name}</button>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{c.email}</p>
                  </div>
                </div>
              </TD>
              <TD><span style={{ fontSize:12 }}>{c.phone}</span></TD>
              <TD><strong>{c.orders}</strong></TD>
              <TD><strong style={{ color:"#2d8a2d" }}>₦{c.totalSpent.toLocaleString()}</strong></TD>
              <TD><StatusPill status={c.status} /></TD>
              <TD><span style={{ color:"#9ca3af", fontSize:12 }}>{c.joined}</span></TD>
              <TD>
                <div style={{ display:"flex", gap:6 }}>
                  <ToggleBtn status={c.status} onClick={() => toggleStatus(c.id)} />
                  <button onClick={() => setSelected(c)} style={{ background:"#eff6ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#1d4ed8", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── TAB: ORDERS ─────────────────────────────────────────────────────────────
function OrdersTab({ orders }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const statuses = ["All","Pending","Preparing","En Route","Delivered","Cancelled"];

  const filtered = orders.filter(o => {
    const m = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.vendor.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "All" || o.status === statusFilter);
  });

  return (
    <div>
      <SectionHeader title="All Orders" sub="Full order history on the platform" count={filtered.length} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by ID, customer or vendor…" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 14px", borderRadius: 50, border: "1.5px solid", borderColor: statusFilter===s?"#2d8a2d":"#e5e7eb", background: statusFilter===s?"#2d8a2d":"white", color: statusFilter===s?"white":"#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <Table>
        <thead><tr><TH>Order ID</TH><TH>Customer</TH><TH>Vendor</TH><TH>Items</TH><TH>Total</TH><TH>Rider</TH><TH>Status</TH><TH>Date</TH><TH>Action</TH></tr></thead>
        <tbody>
          {filtered.map(o => (
            <TR key={o.id}>
              <TD><span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:12, color:"#2d8a2d" }}>{o.id}</span></TD>
              <TD><span style={{ fontWeight:600 }}>{o.customer}</span></TD>
              <TD><span style={{ color:"#6b7280" }}>{o.vendor}</span></TD>
              <TD><span style={{ background:"#f3f4f6", borderRadius:50, padding:"2px 8px", fontSize:12, fontWeight:700 }}>{o.items}</span></TD>
              <TD><strong>₦{o.total.toLocaleString()}</strong></TD>
              <TD><span style={{ color:o.rider==="—"?"#d1d5db":"#374151", fontSize:12 }}>{o.rider}</span></TD>
              <TD><StatusPill status={o.status} /></TD>
              <TD><span style={{ color:"#9ca3af", fontSize:12 }}>{o.date}</span></TD>
              <TD><button onClick={() => setSelectedOrder(o)} style={{ background:"#eff6ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#1d4ed8", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button></TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

// ─── TAB: VENDORS ─────────────────────────────────────────────────────────────
function VendorsTab({ vendors, setVendors }) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = () => { setVendors(p => p.filter(v => v.id !== confirm.id)); setConfirm(null); };
  const toggleStatus = id => setVendors(p => p.map(v => v.id === id ? { ...v, status: v.status==="Active"?"Suspended":"Active" } : v));
  const handleCreate = (data) => { setVendors(p => [data, ...p]); setShowCreate(false); };

  return (
    <div>
      <SectionHeader
        title="Vendors" sub="All food vendors registered on ChopSpot" count={filtered.length}
        action={<CreateBtn label="Create Vendor" onClick={() => setShowCreate(true)} />}
      />
      <div style={{ marginBottom: 16 }}><SearchBar value={search} onChange={setSearch} placeholder="Search vendors…" /></div>
      <Table>
        <thead><tr><TH>Vendor</TH><TH>Owner</TH><TH>Category</TH><TH>Orders</TH><TH>Revenue</TH><TH>Rating</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
        <tbody>
          {filtered.map(v => (
            <TR key={v.id}>
              <TD>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar initials={v.name.slice(0,2).toUpperCase()} size={34} gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" />
                  <div>
                    <button onClick={() => setSelectedVendor(v)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{v.name}</button>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>Since {v.joined}</p>
                  </div>
                </div>
              </TD>
              <TD>{v.owner}</TD>
              <TD><span style={{ background:"#f3f4f6", borderRadius:50, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#6b7280" }}>{v.category}</span></TD>
              <TD><strong>{v.orders}</strong></TD>
              <TD><strong style={{ color:"#2d8a2d" }}>₦{(v.revenue/1000).toFixed(0)}k</strong></TD>
              <TD><span style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>⭐ {v.rating}</span></TD>
              <TD><StatusPill status={v.status} /></TD>
              <TD>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <button onClick={() => setSelectedVendor(v)} style={{ background:"#f5f3ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#7c3aed", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={v.status} onClick={() => toggleStatus(v.id)} />
                  <DeleteBtn onClick={() => setConfirm({ id:v.id, name:v.name })} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {showCreate && <CreateVendorModal onSave={handleCreate} onCancel={() => setShowCreate(false)} />}
      {confirm && <ConfirmModal target={confirm.name} entityType="Vendor" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {selectedVendor && <VendorModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
    </div>
  );
}

// ─── TAB: RIDERS ──────────────────────────────────────────────────────────────
function RidersTab({ riders, setRiders }) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  const filtered = riders.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.zone.toLowerCase().includes(search.toLowerCase()) || r.vehicle.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = () => { setRiders(p => p.filter(r => r.id !== confirm.id)); setConfirm(null); };
  const toggleStatus = id => setRiders(p => p.map(r => r.id === id ? { ...r, status: r.status==="Online"?"Offline":"Online" } : r));
  const handleCreate = (data) => { setRiders(p => [data, ...p]); setShowCreate(false); };

  return (
    <div>
      <SectionHeader
        title="Riders" sub="All delivery riders on ChopSpot" count={filtered.length}
        action={<CreateBtn label="Onboard Rider" onClick={() => setShowCreate(true)} />}
      />
      <div style={{ marginBottom: 16 }}><SearchBar value={search} onChange={setSearch} placeholder="Search riders…" /></div>
      <Table>
        <thead><tr><TH>Rider</TH><TH>Phone</TH><TH>Vehicle</TH><TH>Zone</TH><TH>Deliveries</TH><TH>Earnings</TH><TH>Rating</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
        <tbody>
          {filtered.map(r => (
            <TR key={r.id}>
              <TD>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar initials={r.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={34} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
                  <div>
                    <button onClick={() => setSelectedRider(r)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{r.name}</button>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>Since {r.joined}</p>
                  </div>
                </div>
              </TD>
              <TD><span style={{ fontSize:12 }}>{r.phone}</span></TD>
              <TD><span style={{ background:"#fff7ed", borderRadius:50, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#c2410c" }}>{r.vehicle}</span></TD>
              <TD><span style={{ color:"#6b7280", fontSize:12 }}>{r.zone}</span></TD>
              <TD><strong>{r.deliveries}</strong></TD>
              <TD><strong style={{ color:"#2d8a2d" }}>₦{(r.earnings/1000).toFixed(0)}k</strong></TD>
              <TD><span style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>⭐ {r.rating}</span></TD>
              <TD><StatusPill status={r.status} /></TD>
              <TD>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <button onClick={() => setSelectedRider(r)} style={{ background:"#fff7ed", border:"none", borderRadius:8, padding:"6px 12px", color:"#c2410c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={r.status} onClick={() => toggleStatus(r.id)} />
                  <DeleteBtn onClick={() => setConfirm({ id:r.id, name:r.name })} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {showCreate && <CreateRiderModal onSave={handleCreate} onCancel={() => setShowCreate(false)} />}
      {confirm && <ConfirmModal target={confirm.name} entityType="Rider" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {selectedRider && <RiderModal rider={selectedRider} onClose={() => setSelectedRider(null)} />}
    </div>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ name, role, email, initials, avatarGradient, roleMeta, extraInfo = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 40, height: 40, borderRadius: "50%", border: `2.5px solid ${open ? roleMeta.color : "#e5e7eb"}`,
          background: avatarGradient, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white",
          fontFamily: "'Sora',sans-serif", transition: "all 0.2s",
          boxShadow: open ? `0 0 0 4px ${roleMeta.color}22` : "0 2px 8px rgba(0,0,0,0.12)",
        }}
        title={name}
      >
        {initials}
      </button>

      {/* Online dot */}
      <span style={{
        position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%",
        background: "#22c55e", border: "2px solid white",
      }} />

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: 52, right: 0, width: 280, background: "white",
          borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.15)", border: "1.5px solid #f3f4f6",
          overflow: "hidden", zIndex: 9999,
          animation: "pdIn 0.22s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          {/* Profile header */}
          <div style={{ background: `linear-gradient(135deg, ${roleMeta.color}18, ${roleMeta.color}08)`, padding: "20px 20px 16px", borderBottom: "1.5px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {initials}
              </div>
              <div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1f2937", margin: 0 }}>{name}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{email}</p>
              </div>
            </div>
            {/* Role badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${roleMeta.color}18`, border: `1px solid ${roleMeta.color}33`, borderRadius: 50, padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: roleMeta.color }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: roleMeta.color }}>{role}</span>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding: "8px 0" }}>
            {[
              { icon: "📧", label: "Email", value: email },
              { icon: "🎭", label: "Role", value: role },
              ...extraInfo,
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase", margin: 0 }}>{label}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", fontWeight: 600, margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 190 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status row */}
          <div style={{ margin: "0 14px 8px", background: "#f0fdf4", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 0 2px rgba(34,197,94,0.25)" }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#166534" }}>Active Session</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", marginLeft: "auto" }}>Online</span>
          </div>

          {/* Footer actions */}
          <div style={{ padding: "8px 14px 14px", display: "flex", flexDirection: "column", gap: 6, borderTop: "1.5px solid #f3f4f6" }}>
            <button
              onClick={() => setOpen(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.background="white"; }}
            >
              ⚙️ Account Settings
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#dc2626", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#fecaca"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#fee2e2"; }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",  icon: "◉",  label: "Overview"  },
  { id: "customers", icon: "🛒", label: "Customers" },
  { id: "orders",    icon: "📦", label: "Orders"    },
  { id: "vendors",   icon: "🏪", label: "Vendors"   },
  { id: "riders",    icon: "🏍️",label: "Riders"    },
];

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function AdminDashboard({ adminRole = "Operations Manager", adminName = "Amaka Okafor", onExit }) {
  const [tab, setTab]             = useState("overview");
  const [customers, setCustomers] = useState(seedCustomers);
  const [vendors, setVendors]     = useState(seedVendors);
  const [riders, setRiders]       = useState(seedRiders);
  const [orders]                  = useState(seedOrders);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const roleMeta = ROLE_META[adminRole] || { color: "#2d8a2d", bg: "#f0fdf4", label: "Admin" };
  const initials = adminName.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const counts = { customers: customers.length, orders: orders.length, vendors: vendors.length, riders: riders.length };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes adIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pdIn { from { opacity:0; transform:scale(0.9) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        input::placeholder, textarea::placeholder { color: #9ca3af; }
        select option { color: #1f2937; background: white; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside style={{
          width: 240, background: "#111827", display: "flex", flexDirection: "column", flexShrink: 0,
          position: isMobile ? "fixed" : "sticky", top: 0, height: "100vh", overflowY: "auto",
          left: isMobile ? (sidebarOpen ? 0 : -240) : 0,
          transition: isMobile ? "left 0.28s cubic-bezier(.34,1.2,.64,1)" : "none",
          zIndex: isMobile ? 200 : "auto",
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍊</div>
              <div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white" }}>Chop<span style={{ color: "#f97316" }}>Spot</span></span>
                <p style={{ margin: 0, fontSize: 10, color: "#6b7280", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Admin Panel</p>
              </div>
            </div>
            {/* Role badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${roleMeta.color}22`, border: `1px solid ${roleMeta.color}44`, borderRadius: 50, padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: roleMeta.color }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: roleMeta.color }}>{adminRole}</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "16px 12px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4b5563", textTransform: "uppercase", padding: "0 8px", margin: "0 0 8px" }}>Navigation</p>
            {NAV_ITEMS.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                  border: "none", background: active ? "rgba(45,138,45,0.18)" : "transparent",
                  color: active ? "#4ade80" : "#9ca3af", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 700 : 500, fontSize: 14,
                  marginBottom: 2, transition: "all 0.18s", textAlign: "left",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {counts[item.id] !== undefined && (
                    <span style={{ background: active ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#4ade80" : "#6b7280", borderRadius: 50, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
                      {counts[item.id]}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick actions section */}
            <div style={{ marginTop: 20, padding: "0 4px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4b5563", textTransform: "uppercase", padding: "0 8px", margin: "0 0 8px" }}>Quick Actions</p>
              <button onClick={() => { setTab("vendors"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(45,138,45,0.25)", background: "rgba(45,138,45,0.08)", color: "#4ade80", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, marginBottom: 8, transition: "all 0.18s" }}>
                <span>🏪</span> New Vendor
              </button>
              <button onClick={() => { setTab("riders"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(168,85,247,0.25)", background: "rgba(168,85,247,0.08)", color: "#c084fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.18s" }}>
                <span>🏍️</span> Onboard Rider
              </button>
            </div>
          </nav>

          {/* Profile + exit */}
          <div style={{ padding: "14px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar initials={initials} size={34} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{adminRole}</p>
              </div>
            </div>
            {onExit && (
              <button onClick={onExit} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                ← Back to App
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: "white", borderBottom: "1.5px solid #e5e7eb", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile hamburger */}
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: isMobile ? "flex" : "none", alignItems: "center" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#1f2937", margin: 0 }}>
                  {NAV_ITEMS.find(n => n.id === tab)?.label || "Dashboard"}
                </h1>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>ChopSpot Admin Console</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Role pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${roleMeta.bg}`, border: `1px solid ${roleMeta.color}30`, borderRadius: 50, padding: "5px 12px" }} className="ad-role-pill">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: roleMeta.color, display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, color: roleMeta.color }}>{roleMeta.label}</span>
              </div>
              {/* Date */}
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af" }} className="ad-date">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              {/* Profile avatar dropdown */}
              <ProfileDropdown
                name={adminName}
                role={adminRole}
                email={`${adminName.toLowerCase().replace(/\s+/g,".")}@chopspot.ng`}
                initials={initials}
                avatarGradient="linear-gradient(135deg,#2d8a2d,#4caf50)"
                roleMeta={roleMeta}
                extraInfo={[
                  { icon: "🗓️", label: "Member Since", value: "January 2025" },
                  { icon: "📍", label: "Region", value: "Lagos, Nigeria" },
                ]}
              />
            </div>
          </header>

          {/* Page */}
          <main style={{ flex: 1, padding: "28px 24px 48px", overflowY: "auto", animation: "adIn 0.3s ease both" }} key={tab}>
            {tab === "overview"  && <OverviewTab customers={customers} orders={orders} vendors={vendors} riders={riders} adminRole={adminRole} />}
            {tab === "customers" && <CustomersTab customers={customers} setCustomers={setCustomers} />}
            {tab === "orders"    && <OrdersTab orders={orders} />}
            {tab === "vendors"   && <VendorsTab vendors={vendors} setVendors={setVendors} />}
            {tab === "riders"    && <RidersTab riders={riders} setRiders={setRiders} />}
          </main>
        </div>
      </div>
    </>
  );
}