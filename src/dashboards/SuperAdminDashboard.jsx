import { useState, useRef, useEffect } from "react";

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedAdmins = [
  { id: "ADM001", name: "Amaka Okafor",    email: "amaka@chopspot.ng",   role: "Operations Manager", status: "Active",   joined: "Jan 12, 2025", avatar: "AO" },
  { id: "ADM002", name: "Bello Musa",      email: "bello@chopspot.ng",   role: "Finance Manager",    status: "Active",   joined: "Feb 3, 2025",  avatar: "BM" },
  { id: "ADM003", name: "Chisom Eze",      email: "chisom@chopspot.ng",  role: "Admin Manager",      status: "Inactive", joined: "Mar 7, 2025",  avatar: "CE" },
  { id: "ADM004", name: "Damilola Adeyemi",email: "damie@chopspot.ng",   role: "Finance Manager",    status: "Active",   joined: "Apr 1, 2025",  avatar: "DA" },
];

const seedCustomers = [
  { id: "CST001", name: "Fatima Hassan",   email: "fatima@mail.com",  phone: "0801 234 5678", orders: 12, totalSpent: 48500, status: "Active",   joined: "Nov 2024" },
  { id: "CST002", name: "Gbenga Olawale",  email: "gbenga@mail.com",  phone: "0802 345 6789", orders: 5,  totalSpent: 19200, status: "Active",   joined: "Dec 2024" },
  { id: "CST003", name: "Hauwa Ibrahim",   email: "hauwa@mail.com",   phone: "0803 456 7890", orders: 28, totalSpent: 112000,status: "Active",   joined: "Sep 2024" },
  { id: "CST004", name: "Ifeanyi Obi",     email: "ifeany@mail.com",  phone: "0804 567 8901", orders: 2,  totalSpent: 7400,  status: "Suspended",joined: "Jan 2025" },
  { id: "CST005", name: "Jumoke Adediran", email: "jumoke@mail.com",  phone: "0805 678 9012", orders: 9,  totalSpent: 35600, status: "Active",   joined: "Oct 2024" },
  { id: "CST006", name: "Kabir Sule",      email: "kabir@mail.com",   phone: "0806 789 0123", orders: 17, totalSpent: 67800, status: "Active",   joined: "Aug 2024" },
];

const seedOrders = [
  { id: "ORD-1001", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", items: 3, total: 4200,  status: "Delivered", rider: "Emeka D.",   date: "Mar 14, 2026" },
  { id: "ORD-1002", customer: "Gbenga Olawale",  vendor: "Spice Garden",       items: 2, total: 2800,  status: "Preparing", rider: "—",          date: "Mar 15, 2026" },
  { id: "ORD-1003", customer: "Hauwa Ibrahim",   vendor: "ChopHouse",          items: 5, total: 8500,  status: "Delivered", rider: "Tunde O.",   date: "Mar 14, 2026" },
  { id: "ORD-1004", customer: "Ifeanyi Obi",     vendor: "Mama Cass Kitchen", items: 1, total: 1500,  status: "Cancelled", rider: "—",          date: "Mar 13, 2026" },
  { id: "ORD-1005", customer: "Jumoke Adediran", vendor: "Buka Express",       items: 4, total: 6200,  status: "Delivered", rider: "Aminu K.",   date: "Mar 12, 2026" },
  { id: "ORD-1006", customer: "Kabir Sule",      vendor: "ChopHouse",          items: 2, total: 3400,  status: "En Route",  rider: "Emeka D.",   date: "Mar 15, 2026" },
  { id: "ORD-1007", customer: "Fatima Hassan",   vendor: "Spice Garden",       items: 3, total: 5100,  status: "Pending",   rider: "—",          date: "Mar 15, 2026" },
];

const seedVendors = [
  { id: "VND001", name: "Mama Cass Kitchen", owner: "Cassandra Okeke",  category: "Nigerian",   orders: 320, revenue: 1280000, rating: 4.8, status: "Active",   joined: "Jun 2024" },
  { id: "VND002", name: "Spice Garden",       owner: "Rasheed Afolabi",  category: "Mixed",      orders: 215, revenue: 860000,  rating: 4.6, status: "Active",   joined: "Jul 2024" },
  { id: "VND003", name: "ChopHouse",          owner: "Ngozi Nwosu",      category: "Nigerian",   orders: 412, revenue: 1648000, rating: 4.9, status: "Active",   joined: "May 2024" },
  { id: "VND004", name: "Buka Express",       owner: "Musa Bello",       category: "Fast Food",  orders: 98,  revenue: 392000,  rating: 4.3, status: "Suspended",joined: "Sep 2024" },
  { id: "VND005", name: "The Rice House",     owner: "Adaeze Obi",       category: "Nigerian",   orders: 178, revenue: 712000,  rating: 4.7, status: "Active",   joined: "Aug 2024" },
];

const seedRiders = [
  { id: "RDR001", name: "Emeka Duru",      phone: "0811 111 2222", vehicle: "Motorcycle", zone: "Hall 1–3",       deliveries: 284, rating: 4.9, status: "Online",  joined: "Jun 2024" },
  { id: "RDR002", name: "Tunde Olatunji",  phone: "0812 222 3333", vehicle: "Bicycle",    zone: "Faculty Area",   deliveries: 192, rating: 4.7, status: "Offline", joined: "Jul 2024" },
  { id: "RDR003", name: "Aminu Kaduna",    phone: "0813 333 4444", vehicle: "Motorcycle", zone: "Main Gate",      deliveries: 341, rating: 4.8, status: "Online",  joined: "May 2024" },
  { id: "RDR004", name: "Sunday Effiong",  phone: "0814 444 5555", vehicle: "Keke",       zone: "Porter's Lodge", deliveries: 126, rating: 4.5, status: "Online",  joined: "Aug 2024" },
  { id: "RDR005", name: "Yusuf Garba",     phone: "0815 555 6666", vehicle: "Motorcycle", zone: "Hall 4–6",       deliveries: 97,  rating: 4.6, status: "Offline", joined: "Oct 2024" },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_ROLES = ["Finance Manager", "Operations Manager", "Admin Manager"];

const ROLE_COLORS = {
  "Finance Manager":    { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "Operations Manager": { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  "Admin Manager":      { bg: "#f3e8ff", text: "#6b21a8", dot: "#a855f7" },
};

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

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }}/>
      {status}
    </span>
  );
};

const RolePill = ({ role }) => {
  const r = ROLE_COLORS[role] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: r.bg, color: r.text, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.dot, flexShrink: 0 }}/>
      {role}
    </span>
  );
};

const Avatar = ({ initials, size = 34, gradient = "linear-gradient(135deg,#2d8a2d,#4caf50)" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
    {initials}
  </div>
);

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmModal({ target, entityType, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: "32px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "saIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 18px" }}>🗑️</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1f2937", textAlign: "center", margin: "0 0 8px" }}>Delete {entityType}?</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#6b7280", textAlign: "center", margin: "0 0 24px", lineHeight: 1.5 }}>
          You're about to permanently delete <strong style={{ color: "#1f2937" }}>{target}</strong>. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.4)" }}>Delete</button>
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
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.25)", animation: "saIn 0.28s cubic-bezier(.34,1.4,.64,1) both", position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${accent},${accent}77)`, borderRadius: "24px 24px 0 0" }} />
        {children}
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, mono }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
    <span style={{ fontFamily: mono ? "monospace" : "'DM Sans',sans-serif", fontSize: 13, color: "#1f2937", fontWeight: 700, letterSpacing: mono ? 1 : 0 }}>{value || "—"}</span>
  </div>
);

const MiniStat = ({ icon, label, value }) => (
  <div style={{ background: "#f9fafb", borderRadius: 14, padding: "14px 10px", textAlign: "center", flex: 1 }}>
    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#1f2937", margin: 0 }}>{value}</p>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
  </div>
);

const ModalClose = ({ onClose }) => (
  <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#f3f4f6", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>×</button>
);

// ─── Admin Detail Modal ────────────────────────────────────────────────────────
function AdminDetailModal({ admin, onClose }) {
  const r = ROLE_COLORS[admin.role] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <DetailModal onClose={onClose} accent={r.dot}>
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={admin.avatar} size={54} />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: r.dot, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Admin Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 6px" }}>{admin.name}</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <RolePill role={admin.role} />
              <StatusPill status={admin.status} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 24px 24px" }}>
        <InfoRow label="Admin ID"    value={admin.id} mono />
        <InfoRow label="Email"       value={admin.email} />
        <InfoRow label="Role"        value={admin.role} />
        <InfoRow label="Status"      value={<StatusPill status={admin.status} />} />
        <InfoRow label="Joined"      value={admin.joined} />
        <div style={{ marginTop: 16, padding: 14, background: "#f9fafb", borderRadius: 12 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Role Permissions</p>
          {admin.role === "Finance Manager" && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>Manages payouts, revenue reports, financial reconciliations, and vendor payment schedules.</p>}
          {admin.role === "Operations Manager" && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>Oversees vendor onboarding, rider management, order operations, and delivery logistics.</p>}
          {admin.role === "Admin Manager" && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>Manages platform settings, user accounts, access control, and system configuration.</p>}
        </div>
      </div>
    </DetailModal>
  );
}

// ─── Customer Detail Modal ─────────────────────────────────────────────────────
function CustomerDetailModal({ customer, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#3b82f6">
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={customer.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={54} gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Customer Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 6px" }}>{customer.name}</h3>
            <StatusPill status={customer.status} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="📦" label="Orders"      value={customer.orders} />
        <MiniStat icon="💰" label="Total Spent" value={`₦${(customer.totalSpent/1000).toFixed(0)}k`} />
        <MiniStat icon="📅" label="Joined"      value={customer.joined} />
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Customer ID" value={customer.id} mono />
        <InfoRow label="Email"       value={customer.email} />
        <InfoRow label="Phone"       value={customer.phone} />
        <InfoRow label="Status"      value={<StatusPill status={customer.status} />} />
        <InfoRow label="Total Orders"value={customer.orders} />
        <InfoRow label="Total Spent" value={`₦${customer.totalSpent.toLocaleString()}`} />
        <InfoRow label="Joined"      value={customer.joined} />
      </div>
    </DetailModal>
  );
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  const sc = STATUS_COLORS[order.status] || { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
  return (
    <DetailModal onClose={onClose} accent={sc.dot}>
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: sc.dot, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 4px" }}>Order Details</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1f2937", margin: 0 }}>{order.id}</h3>
          <StatusPill status={order.status} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: "5px 0 0" }}>{order.date}</p>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="🛒" label="Items"    value={order.items} />
        <MiniStat icon="💰" label="Total"    value={`₦${order.total.toLocaleString()}`} />
        <MiniStat icon="🏍️" label="Rider"   value={order.rider === "—" ? "None" : order.rider.split(" ")[0]} />
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Order ID"  value={order.id} mono />
        <InfoRow label="Customer"  value={order.customer} />
        <InfoRow label="Vendor"    value={order.vendor} />
        <InfoRow label="Items"     value={`${order.items} item(s)`} />
        <InfoRow label="Total"     value={`₦${order.total.toLocaleString()}`} />
        <InfoRow label="Rider"     value={order.rider} />
        <InfoRow label="Status"    value={<StatusPill status={order.status} />} />
        <InfoRow label="Date"      value={order.date} />
      </div>
    </DetailModal>
  );
}

// ─── Vendor Detail Modal ───────────────────────────────────────────────────────
function VendorDetailModal({ vendor, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#8b5cf6">
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={vendor.name.slice(0,2).toUpperCase()} size={54} gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#8b5cf6", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Vendor Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 6px" }}>{vendor.name}</h3>
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
        <InfoRow label="Vendor ID"  value={vendor.id} mono />
        <InfoRow label="Owner"      value={vendor.owner} />
        <InfoRow label="Category"   value={vendor.category} />
        <InfoRow label="Status"     value={<StatusPill status={vendor.status} />} />
        <InfoRow label="Orders"     value={vendor.orders} />
        <InfoRow label="Revenue"    value={`₦${vendor.revenue.toLocaleString()}`} />
        <InfoRow label="Rating"     value={`⭐ ${vendor.rating}`} />
        <InfoRow label="Joined"     value={vendor.joined} />
      </div>
    </DetailModal>
  );
}

// ─── Rider Detail Modal ────────────────────────────────────────────────────────
function RiderDetailModal({ rider, onClose }) {
  return (
    <DetailModal onClose={onClose} accent="#f97316">
      <ModalClose onClose={onClose} />
      <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={rider.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={54} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Rider Profile</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1f2937", margin: "3px 0 6px" }}>{rider.name}</h3>
            <StatusPill status={rider.status} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 24px" }}>
        <MiniStat icon="🏍️" label="Deliveries" value={rider.deliveries} />
        <MiniStat icon="⭐"  label="Rating"     value={rider.rating} />
        <MiniStat icon="💳"  label="Zone"       value={rider.zone.split("–")[0]} />
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <InfoRow label="Rider ID"    value={rider.id} mono />
        <InfoRow label="Phone"       value={rider.phone} />
        <InfoRow label="Vehicle"     value={rider.vehicle} />
        <InfoRow label="Zone"        value={rider.zone} />
        <InfoRow label="Deliveries"  value={rider.deliveries} />
        <InfoRow label="Rating"      value={`⭐ ${rider.rating}`} />
        <InfoRow label="Status"      value={<StatusPill status={rider.status} />} />
        <InfoRow label="Joined"      value={rider.joined} />
      </div>
    </DetailModal>
  );
}


// ─── Create Admin Modal ───────────────────────────────────────────────────────
function CreateAdminModal({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", role: ADMIN_ROLES[0], password: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name.trim() && form.email.includes("@") && form.password.length >= 6;

  const iS = { width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", color: "#1f2937", transition: "border-color 0.2s" };
  const lS = { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "saIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, color: "#2d8a2d", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Super Admin</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1f2937", margin: "4px 0 0" }}>Create New Admin</h3>
          </div>
          <button onClick={onCancel} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {/* Form */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={lS}>Full Name</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Amaka Okafor" style={iS}
                onFocus={e => e.target.style.borderColor = "#2d8a2d"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={lS}>Email Address</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@chopspot.ng" style={iS}
                onFocus={e => e.target.style.borderColor = "#2d8a2d"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={lS}>Admin Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...iS, appearance: "none", cursor: "pointer" }}>
                {ADMIN_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Temporary Password</label>
              <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 characters" style={iS}
                onFocus={e => e.target.style.borderColor = "#2d8a2d"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            {/* Role explanation */}
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #2d8a2d" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#166534", margin: 0, lineHeight: 1.55 }}>
                <strong>Finance Manager</strong> — manages payouts and revenue.<br />
                <strong>Operations Manager</strong> — oversees vendors and riders.<br />
                <strong>Admin Manager</strong> — manages platform settings and users.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={valid ? () => onSave(form) : undefined} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d1d5db", color: valid ? "white" : "#9ca3af", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: valid ? "pointer" : "not-allowed", boxShadow: valid ? "0 4px 14px rgba(45,138,45,0.35)" : "none" }}>
              Create Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
const Table = ({ children }) => (
  <div style={{ overflowX: "auto", borderRadius: 16, border: "1.5px solid #e5e7eb", background: "white" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
      {children}
    </table>
  </div>
);
const TH = ({ children, right }) => (
  <th style={{ padding: "12px 18px", textAlign: right ? "right" : "left", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#9ca3af", background: "#f9fafb", borderBottom: "1.5px solid #e5e7eb", whiteSpace: "nowrap" }}>{children}</th>
);
const TD = ({ children, right }) => (
  <td style={{ padding: "14px 18px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6", textAlign: right ? "right" : "left", verticalAlign: "middle" }}>{children}</td>
);
const TR = ({ children, last }) => (
  <tr style={{ transition: "background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >{children}</tr>
);

// ─── Delete button ────────────────────────────────────────────────────────────
const DeleteBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 12px", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 4 }}
    onMouseEnter={e => { e.currentTarget.style.background="#dc2626"; e.currentTarget.style.color="white"; }}
    onMouseLeave={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#dc2626"; }}
  >
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
    Delete
  </button>
);

// ─── Suspend / Activate toggle ────────────────────────────────────────────────
const ToggleBtn = ({ status, onClick }) => {
  const isActive = status === "Active" || status === "Online";
  return (
    <button onClick={onClick} style={{ background: isActive ? "#fef9c3" : "#dcfce7", border: "none", borderRadius: 8, padding: "6px 12px", color: isActive ? "#854d0e" : "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
      {isActive ? "Suspend" : "Activate"}
    </button>
  );
};

// ─── Search input ─────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 50, border: "1.5px solid #e5e7eb", background: "#f9fafb", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#374151", outline: "none", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = "#2d8a2d"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
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

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "#2d8a2d", delay = 0 }) => (
  <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", border: "1.5px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 4, animation: `saIn 0.4s ease ${delay}s both`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 6 }}>{icon}</div>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase", margin: 0 }}>{label}</p>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, color: "#1f2937", margin: 0 }}>{value}</p>
    {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280", margin: 0 }}>{sub}</p>}
  </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ admins, customers, orders, vendors, riders }) {
  const revenue = vendors.reduce((a, v) => a + v.revenue, 0);
  const delivered = orders.filter(o => o.status === "Delivered").length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: "#1f2937", margin: "0 0 4px" }}>Platform Overview</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>ChopSpot live metrics — last updated just now</p>
      </div>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="👤" label="Total Admins"     value={admins.length}    sub={`${admins.filter(a=>a.status==="Active").length} active`}    color="#2d8a2d" delay={0} />
        <StatCard icon="🛒" label="Customers"        value={customers.length} sub={`${customers.filter(c=>c.status==="Active").length} active`}   color="#3b82f6" delay={0.05} />
        <StatCard icon="📦" label="Total Orders"     value={orders.length}    sub={`${delivered} delivered`}                                       color="#f59e0b" delay={0.1} />
        <StatCard icon="🏪" label="Vendors"          value={vendors.length}   sub={`${vendors.filter(v=>v.status==="Active").length} active`}      color="#8b5cf6" delay={0.15} />
        <StatCard icon="🏍️" label="Riders"          value={riders.length}    sub={`${riders.filter(r=>r.status==="Online").length} online now`}   color="#f97316" delay={0.2} />
        <StatCard icon="💰" label="Total Revenue"    value={`₦${(revenue/1000000).toFixed(1)}M`} sub="across all vendors"                         color="#10b981" delay={0.25} />
      </div>

      {/* Recent orders */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader title="Recent Orders" sub="Latest 5 orders across the platform" />
        <Table>
          <thead>
            <tr><TH>Order ID</TH><TH>Customer</TH><TH>Vendor</TH><TH>Total</TH><TH>Status</TH><TH>Date</TH></tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(o => (
              <TR key={o.id}>
                <TD><span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: "#2d8a2d" }}>{o.id}</span></TD>
                <TD>{o.customer}</TD>
                <TD><span style={{ color: "#6b7280" }}>{o.vendor}</span></TD>
                <TD><strong>₦{o.total.toLocaleString()}</strong></TD>
                <TD><StatusPill status={o.status} /></TD>
                <TD><span style={{ color: "#9ca3af", fontSize: 12 }}>{o.date}</span></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Quick glance: vendors + riders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        <div>
          <SectionHeader title="Top Vendors" sub="By total revenue" />
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            {[...vendors].sort((a,b) => b.revenue - a.revenue).slice(0,4).map((v, i) => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#166534" }}>{i+1}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{v.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{v.orders} orders · ⭐{v.rating}</p>
                  </div>
                </div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#2d8a2d" }}>₦{(v.revenue/1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Active Riders" sub="Currently online" />
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            {riders.filter(r => r.status === "Online").map((r, i, arr) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={r.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={32} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.zone} · {r.vehicle}</p>
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

// ─── ADMINS TAB ───────────────────────────────────────────────────────────────
function AdminsTab({ admins, setAdmins }) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = admins.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (form) => {
    const newAdmin = {
      id: `ADM${String(admins.length + 1).padStart(3,"0")}`,
      name: form.name, email: form.email, role: form.role,
      status: "Active", joined: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      avatar: form.name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(),
    };
    setAdmins(p => [newAdmin, ...p]);
    setShowCreate(false);
  };

  const handleDelete = () => {
    setAdmins(p => p.filter(a => a.id !== confirm.id));
    setConfirm(null);
  };

  const toggleStatus = (id) => {
    setAdmins(p => p.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" } : a));
  };

  return (
    <div>
      <SectionHeader
        title="Admins" sub="Manage platform administrators and their roles" count={filtered.length}
        action={
          <button onClick={() => setShowCreate(true)} style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", border: "none", borderRadius: 12, padding: "11px 20px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(45,138,45,0.35)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Create Admin
          </button>
        }
      />
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or role…" />
      </div>
      <Table>
        <thead>
          <tr><TH>Admin</TH><TH>Role</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH></tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <TR key={a.id}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={a.avatar} size={34} />
                  <div>
                    <button onClick={() => setSelected(a)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{a.name}</button>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{a.email}</p>
                  </div>
                </div>
              </TD>
              <TD><RolePill role={a.role} /></TD>
              <TD><StatusPill status={a.status} /></TD>
              <TD><span style={{ color: "#9ca3af", fontSize: 12 }}>{a.joined}</span></TD>
              <TD>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => setSelected(a)} style={{ background:"#f0fdf4", border:"none", borderRadius:8, padding:"6px 12px", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={a.status} onClick={() => toggleStatus(a.id)} />
                  <DeleteBtn onClick={() => setConfirm({ id: a.id, name: a.name })} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {showCreate && <CreateAdminModal onSave={handleCreate} onCancel={() => setShowCreate(false)} />}
      {confirm && <ConfirmModal target={confirm.name} entityType="Admin" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {selected && <AdminDetailModal admin={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── CUSTOMERS TAB ───────────────────────────────────────────────────────────
function CustomersTab({ customers, setCustomers }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const toggleStatus = (id) => setCustomers(p => p.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Suspended" : "Active" } : c));

  return (
    <div>
      <SectionHeader title="Customers" sub="All registered customers — click any row to view profile" count={filtered.length} />
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
      </div>
      <Table>
        <thead>
          <tr><TH>Customer</TH><TH>Phone</TH><TH>Orders</TH><TH>Total Spent</TH><TH>Status</TH><TH>Joined</TH><TH>Actions</TH></tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <TR key={c.id}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={c.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={34} gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
                  <div>
                    <button onClick={() => setSelected(c)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{c.name}</button>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{c.email}</p>
                  </div>
                </div>
              </TD>
              <TD><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>{c.phone}</span></TD>
              <TD><strong>{c.orders}</strong></TD>
              <TD><strong style={{ color: "#2d8a2d" }}>₦{c.totalSpent.toLocaleString()}</strong></TD>
              <TD><StatusPill status={c.status} /></TD>
              <TD><span style={{ color: "#9ca3af", fontSize: 12 }}>{c.joined}</span></TD>
              <TD>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => setSelected(c)} style={{ background:"#eff6ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#1d4ed8", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={c.status} onClick={() => toggleStatus(c.id)} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab({ orders }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const statuses = ["All", "Pending", "Preparing", "En Route", "Delivered", "Cancelled"];

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.vendor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <SectionHeader title="All Orders" sub="Complete order history across the platform" count={filtered.length} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, customer or vendor…" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 14px", borderRadius: 50, border: "1.5px solid", borderColor: statusFilter === s ? "#2d8a2d" : "#e5e7eb", background: statusFilter === s ? "#2d8a2d" : "white", color: statusFilter === s ? "white" : "#6b7280", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <Table>
        <thead>
          <tr><TH>Order ID</TH><TH>Customer</TH><TH>Vendor</TH><TH>Items</TH><TH>Total</TH><TH>Rider</TH><TH>Status</TH><TH>Date</TH><TH></TH></tr>
        </thead>
        <tbody>
          {filtered.map(o => (
            <TR key={o.id}>
              <TD><span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: "#2d8a2d" }}>{o.id}</span></TD>
              <TD><span style={{ fontWeight: 600 }}>{o.customer}</span></TD>
              <TD><span style={{ color: "#6b7280" }}>{o.vendor}</span></TD>
              <TD><span style={{ background: "#f3f4f6", borderRadius: 50, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{o.items}</span></TD>
              <TD><strong>₦{o.total.toLocaleString()}</strong></TD>
              <TD><span style={{ color: o.rider === "—" ? "#d1d5db" : "#374151", fontSize: 12 }}>{o.rider}</span></TD>
              <TD><StatusPill status={o.status} /></TD>
              <TD><span style={{ color: "#9ca3af", fontSize: 12 }}>{o.date}</span></TD>
              <TD><button onClick={() => setSelected(o)} style={{ background:"#eff6ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#1d4ed8", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button></TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── VENDORS TAB ─────────────────────────────────────────────────────────────
function VendorsTab({ vendors, setVendors }) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(null);
  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = () => { setVendors(p => p.filter(v => v.id !== confirm.id)); setConfirm(null); };
  const toggleStatus = (id) => setVendors(p => p.map(v => v.id === id ? { ...v, status: v.status === "Active" ? "Suspended" : "Active" } : v));

  return (
    <div>
      <SectionHeader title="Vendors" sub="All food vendors registered on ChopSpot" count={filtered.length} />
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search vendors…" />
      </div>
      <Table>
        <thead>
          <tr><TH>Vendor</TH><TH>Owner</TH><TH>Category</TH><TH>Orders</TH><TH>Revenue</TH><TH>Rating</TH><TH>Status</TH><TH>Actions</TH></tr>
        </thead>
        <tbody>
          {filtered.map(v => (
            <TR key={v.id}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={v.name.slice(0,2).toUpperCase()} size={34} gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)" />
                  <div>
                    <button onClick={() => setSelected(v)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{v.name}</button>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Since {v.joined}</p>
                  </div>
                </div>
              </TD>
              <TD>{v.owner}</TD>
              <TD><span style={{ background: "#f3f4f6", borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#6b7280" }}>{v.category}</span></TD>
              <TD><strong>{v.orders}</strong></TD>
              <TD><strong style={{ color: "#2d8a2d" }}>₦{(v.revenue/1000).toFixed(0)}k</strong></TD>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
                  ⭐ {v.rating}
                </div>
              </TD>
              <TD><StatusPill status={v.status} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6, alignItems:"center" }}>
                  <button onClick={() => setSelected(v)} style={{ background:"#f5f3ff", border:"none", borderRadius:8, padding:"6px 12px", color:"#7c3aed", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={v.status} onClick={() => toggleStatus(v.id)} />
                  <DeleteBtn onClick={() => setConfirm({ id: v.id, name: v.name })} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {confirm && <ConfirmModal target={confirm.name} entityType="Vendor" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {selected && <VendorDetailModal vendor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── RIDERS TAB ──────────────────────────────────────────────────────────────
function RidersTab({ riders, setRiders }) {
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState(null);
  const filtered = riders.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.zone.toLowerCase().includes(search.toLowerCase()) || r.vehicle.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = () => { setRiders(p => p.filter(r => r.id !== confirm.id)); setConfirm(null); };
  const toggleStatus = (id) => setRiders(p => p.map(r => r.id === id ? { ...r, status: r.status === "Online" ? "Offline" : "Online" } : r));

  return (
    <div>
      <SectionHeader title="Riders" sub="All delivery riders on the ChopSpot platform" count={filtered.length} />
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search riders…" />
      </div>
      <Table>
        <thead>
          <tr><TH>Rider</TH><TH>Phone</TH><TH>Vehicle</TH><TH>Zone</TH><TH>Deliveries</TH><TH>Rating</TH><TH>Status</TH><TH>Actions</TH></tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <TR key={r.id}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={r.name.split(" ").map(w=>w[0]).slice(0,2).join("")} size={34} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
                  <div>
                    <button onClick={() => setSelected(r)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:700, fontSize:13, color:"#1f2937", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>{r.name}</button>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Since {r.joined}</p>
                  </div>
                </div>
              </TD>
              <TD><span style={{ fontSize: 12 }}>{r.phone}</span></TD>
              <TD><span style={{ background: "#fff7ed", borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#c2410c" }}>{r.vehicle}</span></TD>
              <TD><span style={{ color: "#6b7280", fontSize: 12 }}>{r.zone}</span></TD>
              <TD><strong>{r.deliveries}</strong></TD>
              <TD><span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>⭐ {r.rating}</span></TD>
              <TD><StatusPill status={r.status} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6, alignItems:"center" }}>
                  <button onClick={() => setSelected(r)} style={{ background:"#fff7ed", border:"none", borderRadius:8, padding:"6px 12px", color:"#c2410c", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
                  <ToggleBtn status={r.status} onClick={() => toggleStatus(r.id)} />
                  <DeleteBtn onClick={() => setConfirm({ id: r.id, name: r.name })} />
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
      {confirm && <ConfirmModal target={confirm.name} entityType="Rider" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {selected && <RiderDetailModal rider={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ name, role, email, initials, avatarGradient, accentColor, bgColor, extraInfo = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 40, height: 40, borderRadius: "50%", border: `2.5px solid ${open ? accentColor : "#e5e7eb"}`,
          background: avatarGradient, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white",
          fontFamily: "'Sora',sans-serif", transition: "all 0.2s",
          boxShadow: open ? `0 0 0 4px ${accentColor}30` : "0 2px 8px rgba(0,0,0,0.14)",
        }}
        title={name}
      >
        {initials}
      </button>

      {/* Green online dot */}
      <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />

      {/* Dropdown card */}
      {open && (
        <div style={{
          position: "absolute", top: 52, right: 0, width: 284, background: "white",
          borderRadius: 18, boxShadow: "0 16px 52px rgba(0,0,0,0.18)", border: "1.5px solid #f3f4f6",
          overflow: "hidden", zIndex: 9999,
          animation: "pdIn 0.22s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,${accentColor}18,${accentColor}08)`, padding: "20px 20px 16px", borderBottom: "1.5px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#1f2937", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, borderRadius: 50, padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: accentColor }}>{role}</span>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ padding: "8px 0" }}>
            {[
              { icon: "📧", label: "Email", value: email },
              { icon: "🎭", label: "Role", value: role },
              ...extraInfo,
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px" }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.5, textTransform: "uppercase", margin: 0 }}>{label}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#374151", fontWeight: 600, margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Session status */}
          <div style={{ margin: "0 14px 8px", background: "#f0fdf4", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 0 2px rgba(34,197,94,0.25)" }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#166534" }}>Active Session</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", marginLeft: "auto" }}>Online</span>
          </div>

          {/* Actions */}
          <div style={{ padding: "8px 14px 14px", display: "flex", flexDirection: "column", gap: 6, borderTop: "1.5px solid #f3f4f6" }}>
            <button
              onClick={() => setOpen(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              ⚙️ Account Settings
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#dc2626", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
              onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAV items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",   icon: "◉",  label: "Overview" },
  { id: "admins",     icon: "👤", label: "Admins" },
  { id: "customers",  icon: "🛒", label: "Customers" },
  { id: "orders",     icon: "📦", label: "Orders" },
  { id: "vendors",    icon: "🏪", label: "Vendors" },
  { id: "riders",     icon: "🏍️",label: "Riders" },
];

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard({ onExit }) {
  const [tab, setTab]           = useState("overview");
  const [admins, setAdmins]     = useState(seedAdmins);
  const [customers, setCustomers] = useState(seedCustomers);
  const [orders]                = useState(seedOrders);
  const [vendors, setVendors]   = useState(seedVendors);
  const [riders, setRiders]     = useState(seedRiders);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const counts = { admins: admins.length, customers: customers.length, orders: orders.length, vendors: vendors.length, riders: riders.length };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes saIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pdIn { from { opacity:0; transform:scale(0.9) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        input::placeholder { color: #9ca3af; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} onClick={() => setSidebarOpen(false)} />}

        <aside style={{
          width: 240, background: "#111827", display: "flex", flexDirection: "column",
          flexShrink: 0, position: "sticky", top: 0, height: "100vh",
          overflowY: "auto",
          // Mobile: position fixed
          ...(typeof window !== "undefined" && window.innerWidth < 768 ? {
            position: "fixed", left: sidebarOpen ? 0 : -240, top: 0, height: "100vh",
            zIndex: 200, transition: "left 0.28s cubic-bezier(.34,1.2,.64,1)",
          } : {})
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍊</div>
              <div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white" }}>Chop<span style={{ color: "#f97316" }}>Spot</span></span>
                <p style={{ margin: 0, fontSize: 10, color: "#6b7280", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Super Admin</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "16px 12px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#4b5563", textTransform: "uppercase", padding: "0 8px", margin: "0 0 8px" }}>Management</p>
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
                  onMouseEnter={e => { if(!active) { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="white"; }}}
                  onMouseLeave={e => { if(!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#9ca3af"; }}}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ background: active ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#4ade80" : "#6b7280", borderRadius: 50, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
                    {counts[item.id] ?? ""}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom: admin info + logout */}
          <div style={{ padding: "14px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>SA</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>Super Admin</p>
                <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>sa@chopspot.ng</p>
              </div>
            </div>
            {onExit && (
              <button onClick={onExit} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                ← Exit to App
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: "white", borderBottom: "1.5px solid #e5e7eb", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(o => !o)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }} className="sa-hamburger">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            <div>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#1f2937", margin: 0 }}>
                {NAV_ITEMS.find(n => n.id === tab)?.label || "Dashboard"}
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>ChopSpot Platform · Super Admin Console</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Live indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 50, padding: "5px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 2px rgba(34,197,94,0.25)" }}/>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, color: "#166534" }}>Live</span>
              </div>
              {/* Date */}
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af" }}>
                {new Date().toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" })}
              </span>
              {/* Super Admin profile avatar */}
              <ProfileDropdown
                name="Super Admin"
                role="Super Administrator"
                email="sa@chopspot.ng"
                initials="SA"
                avatarGradient="linear-gradient(135deg,#2d8a2d,#4caf50)"
                accentColor="#2d8a2d"
                bgColor="#f0fdf4"
                extraInfo={[
                  { icon: "🛡️", label: "Access Level", value: "Full Platform Access" },
                  { icon: "🗓️", label: "Member Since", value: "June 2024" },
                  { icon: "📍", label: "Region", value: "Nigeria (All Regions)" },
                  { icon: "👥", label: "Admins Managed", value: `${admins.length} admins` },
                ]}
              />
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: "28px 24px 48px", overflowY: "auto", animation: "saIn 0.3s ease both" }} key={tab}>
            {tab === "overview"  && <OverviewTab admins={admins} customers={customers} orders={orders} vendors={vendors} riders={riders} />}
            {tab === "admins"    && <AdminsTab admins={admins} setAdmins={setAdmins} />}
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