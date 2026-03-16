import { useState, useRef, useEffect } from "react";

// ─── Seed data ─────────────────────────────────────────────────────────────────
const seedVendorPayouts = [
  { id: "VP001", vendor: "Mama Cass Kitchen", owner: "Cassandra Okeke",  bank: "GTBank",      accountNo: "0123456789", period: "Mar 1–15",  grossSales: 284000, platformFee: 28400, netPayable: 255600, status: "Pending",  orders: 71, lastPaid: "Feb 28, 2026" },
  { id: "VP002", vendor: "ChopHouse",         owner: "Ngozi Nwosu",      bank: "Zenith Bank",  accountNo: "2012345678", period: "Mar 1–15",  grossSales: 412000, platformFee: 41200, netPayable: 370800, status: "Pending",  orders: 103, lastPaid: "Feb 28, 2026" },
  { id: "VP003", vendor: "Spice Garden",      owner: "Rasheed Afolabi",  bank: "First Bank",   accountNo: "3012345678", period: "Mar 1–15",  grossSales: 198000, platformFee: 19800, netPayable: 178200, status: "Pending",  orders: 49, lastPaid: "Feb 28, 2026" },
  { id: "VP004", vendor: "The Rice House",    owner: "Adaeze Obi",       bank: "Access Bank",  accountNo: "0023456789", period: "Mar 1–15",  grossSales: 156000, platformFee: 15600, netPayable: 140400, status: "Paid",     orders: 39, lastPaid: "Mar 15, 2026" },
  { id: "VP005", vendor: "Buka Express",      owner: "Musa Bello",       bank: "UBA",          accountNo: "1012345678", period: "Mar 1–15",  grossSales: 67000,  platformFee: 6700,  netPayable: 60300,  status: "Suspended",orders: 17, lastPaid: "Feb 14, 2026" },
  { id: "VP006", vendor: "Mama Cass Kitchen", owner: "Cassandra Okeke",  bank: "GTBank",      accountNo: "0123456789", period: "Feb 16–28", grossSales: 310000, platformFee: 31000, netPayable: 279000, status: "Paid",     orders: 77, lastPaid: "Feb 28, 2026" },
  { id: "VP007", vendor: "ChopHouse",         owner: "Ngozi Nwosu",      bank: "Zenith Bank",  accountNo: "2012345678", period: "Feb 16–28", grossSales: 389000, platformFee: 38900, netPayable: 350100, status: "Paid",     orders: 97, lastPaid: "Feb 28, 2026" },
];

const seedRiderPayouts = [
  { id: "RP001", rider: "Emeka Duru",     vehicle: "Motorcycle", bank: "GTBank",      accountNo: "0111222233", period: "Mar 1–15",  deliveries: 142, grossEarned: 71000, platformCut: 14200, netPayable: 56800, status: "Pending",  lastPaid: "Feb 28, 2026" },
  { id: "RP002", rider: "Aminu Kaduna",   vehicle: "Motorcycle", bank: "Zenith Bank",  accountNo: "2011223344", period: "Mar 1–15",  deliveries: 171, grossEarned: 85500, platformCut: 17100, netPayable: 68400, status: "Pending",  lastPaid: "Feb 28, 2026" },
  { id: "RP003", rider: "Sunday Effiong", vehicle: "Keke",       bank: "Access Bank",  accountNo: "0021234567", period: "Mar 1–15",  deliveries: 63,  grossEarned: 31500, platformCut: 6300,  netPayable: 25200, status: "Paid",     lastPaid: "Mar 15, 2026" },
  { id: "RP004", rider: "Tunde Olatunji", vehicle: "Bicycle",    bank: "First Bank",   accountNo: "3011223344", period: "Mar 1–15",  deliveries: 96,  grossEarned: 48000, platformCut: 9600,  netPayable: 38400, status: "Pending",  lastPaid: "Feb 28, 2026" },
  { id: "RP005", rider: "Yusuf Garba",    vehicle: "Motorcycle", bank: "UBA",          accountNo: "1011223344", period: "Mar 1–15",  deliveries: 49,  grossEarned: 24500, platformCut: 4900,  netPayable: 19600, status: "Pending",  lastPaid: "Feb 28, 2026" },
  { id: "RP006", rider: "Emeka Duru",     vehicle: "Motorcycle", bank: "GTBank",      accountNo: "0111222233", period: "Feb 16–28", deliveries: 130, grossEarned: 65000, platformCut: 13000, netPayable: 52000, status: "Paid",     lastPaid: "Feb 28, 2026" },
  { id: "RP007", rider: "Aminu Kaduna",   vehicle: "Motorcycle", bank: "Zenith Bank",  accountNo: "2011223344", period: "Feb 16–28", deliveries: 155, grossEarned: 77500, platformCut: 15500, netPayable: 62000, status: "Paid",     lastPaid: "Feb 28, 2026" },
];

const seedExpenses = [
  { id: "EXP001", date: "Mar 15, 2026", category: "Operations",   description: "Rider insurance premium — Q1 2026",         amount: 120000, addedBy: "Amaka Okafor",   receipt: true  },
  { id: "EXP002", date: "Mar 14, 2026", category: "Marketing",    description: "Campus flyer printing and distribution",     amount: 45000,  addedBy: "Bello Musa",     receipt: true  },
  { id: "EXP003", date: "Mar 12, 2026", category: "Technology",   description: "Server hosting — AWS (March)",               amount: 78500,  addedBy: "Chisom Eze",     receipt: false },
  { id: "EXP004", date: "Mar 10, 2026", category: "Salaries",     description: "Part-time support staff (2 persons)",        amount: 160000, addedBy: "Amaka Okafor",   receipt: true  },
  { id: "EXP005", date: "Mar 8, 2026",  category: "Operations",   description: "Office supplies and stationery",             amount: 18500,  addedBy: "Bello Musa",     receipt: false },
  { id: "EXP006", date: "Mar 5, 2026",  category: "Technology",   description: "SMS notification service — bulk credits",    amount: 32000,  addedBy: "Chisom Eze",     receipt: true  },
  { id: "EXP007", date: "Mar 1, 2026",  category: "Miscellaneous",description: "Team lunch — monthly all-hands",             amount: 28000,  addedBy: "Amaka Okafor",   receipt: false },
  { id: "EXP008", date: "Feb 28, 2026", category: "Marketing",    description: "Social media ads (Instagram + Facebook)",    amount: 55000,  addedBy: "Bello Musa",     receipt: true  },
  { id: "EXP009", date: "Feb 25, 2026", category: "Technology",   description: "Payment gateway integration fee",            amount: 42000,  addedBy: "Chisom Eze",     receipt: true  },
  { id: "EXP010", date: "Feb 20, 2026", category: "Salaries",     description: "Admin team salaries — February",             amount: 380000, addedBy: "Amaka Okafor",   receipt: true  },
];


// ─── Vendor sales per order (grouped by vendor) ──────────────────────────────
const seedVendorSales = {
  "Mama Cass Kitchen": [
    { orderId: "ORD-1001", customer: "Fatima Hassan",   date: "Mar 15, 2026", items: 3, amount: 4200,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1008", customer: "Lola Okonkwo",    date: "Mar 14, 2026", items: 2, amount: 3800,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1014", customer: "Kabir Sule",      date: "Mar 13, 2026", items: 4, amount: 6100,  payment: "USSD",     status: "Delivered" },
    { orderId: "ORD-1021", customer: "Hauwa Ibrahim",   date: "Mar 12, 2026", items: 1, amount: 1500,  payment: "Transfer", status: "Delivered" },
    { orderId: "ORD-1029", customer: "Gbenga Olawale",  date: "Mar 11, 2026", items: 3, amount: 5200,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1033", customer: "Musa Adamu",      date: "Mar 10, 2026", items: 2, amount: 3400,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1040", customer: "Fatima Hassan",   date: "Mar 9, 2026",  items: 5, amount: 7800,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1047", customer: "Jumoke Adediran", date: "Mar 8, 2026",  items: 2, amount: 3100,  payment: "Transfer", status: "Cancelled" },
  ],
  "ChopHouse": [
    { orderId: "ORD-1003", customer: "Hauwa Ibrahim",   date: "Mar 15, 2026", items: 5, amount: 8500,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1006", customer: "Kabir Sule",      date: "Mar 15, 2026", items: 2, amount: 3400,  payment: "Card",     status: "En Route"  },
    { orderId: "ORD-1009", customer: "Musa Adamu",      date: "Mar 14, 2026", items: 4, amount: 7200,  payment: "USSD",     status: "Delivered" },
    { orderId: "ORD-1016", customer: "Fatima Hassan",   date: "Mar 13, 2026", items: 3, amount: 5600,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1023", customer: "Ifeanyi Obi",     date: "Mar 12, 2026", items: 2, amount: 3200,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1031", customer: "Lola Okonkwo",    date: "Mar 11, 2026", items: 6, amount: 9800,  payment: "Transfer", status: "Delivered" },
  ],
  "Spice Garden": [
    { orderId: "ORD-1002", customer: "Gbenga Olawale",  date: "Mar 15, 2026", items: 2, amount: 2800,  payment: "Transfer", status: "Preparing" },
    { orderId: "ORD-1007", customer: "Fatima Hassan",   date: "Mar 15, 2026", items: 3, amount: 5100,  payment: "Transfer", status: "Pending"   },
    { orderId: "ORD-1018", customer: "Kabir Sule",      date: "Mar 13, 2026", items: 2, amount: 4200,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1025", customer: "Jumoke Adediran", date: "Mar 12, 2026", items: 1, amount: 1900,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1038", customer: "Musa Adamu",      date: "Mar 10, 2026", items: 4, amount: 6800,  payment: "USSD",     status: "Delivered" },
  ],
  "The Rice House": [
    { orderId: "ORD-1008", customer: "Lola Okonkwo",    date: "Mar 14, 2026", items: 2, amount: 3800,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1019", customer: "Fatima Hassan",   date: "Mar 12, 2026", items: 3, amount: 5400,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1026", customer: "Hauwa Ibrahim",   date: "Mar 11, 2026", items: 2, amount: 3600,  payment: "Transfer", status: "Delivered" },
  ],
  "Buka Express": [
    { orderId: "ORD-1005", customer: "Jumoke Adediran", date: "Mar 12, 2026", items: 4, amount: 6200,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1012", customer: "Kabir Sule",      date: "Mar 10, 2026", items: 2, amount: 3100,  payment: "Card",     status: "Delivered" },
    { orderId: "ORD-1028", customer: "Musa Adamu",      date: "Mar 8, 2026",  items: 1, amount: 1800,  payment: "USSD",     status: "Cancelled" },
  ],
};

// ─── Rider delivery log (grouped by rider) ────────────────────────────────────
const seedRiderDeliveries = {
  "Emeka Duru": [
    { orderId: "ORD-1001", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", date: "Mar 15, 2026", zone: "Hall 1–3",       earned: 500,  status: "Delivered" },
    { orderId: "ORD-1006", customer: "Kabir Sule",      vendor: "ChopHouse",         date: "Mar 15, 2026", zone: "Hall 1–3",       earned: 500,  status: "En Route"  },
    { orderId: "ORD-1012", customer: "Lola Okonkwo",    vendor: "Spice Garden",      date: "Mar 14, 2026", zone: "Hall 1–3",       earned: 500,  status: "Delivered" },
    { orderId: "ORD-1018", customer: "Gbenga Olawale",  vendor: "ChopHouse",         date: "Mar 13, 2026", zone: "Porter's Lodge", earned: 450,  status: "Delivered" },
    { orderId: "ORD-1024", customer: "Musa Adamu",      vendor: "Mama Cass Kitchen", date: "Mar 12, 2026", zone: "Hall 1–3",       earned: 500,  status: "Delivered" },
    { orderId: "ORD-1030", customer: "Hauwa Ibrahim",   vendor: "ChopHouse",         date: "Mar 11, 2026", zone: "Hall 1–3",       earned: 500,  status: "Delivered" },
  ],
  "Aminu Kaduna": [
    { orderId: "ORD-1005", customer: "Jumoke Adediran", vendor: "Buka Express",      date: "Mar 12, 2026", zone: "Main Gate",      earned: 500,  status: "Delivered" },
    { orderId: "ORD-1009", customer: "Musa Adamu",      vendor: "ChopHouse",         date: "Mar 14, 2026", zone: "Main Gate",      earned: 500,  status: "Delivered" },
    { orderId: "ORD-1015", customer: "Kabir Sule",      vendor: "Spice Garden",      date: "Mar 13, 2026", zone: "Main Gate",      earned: 500,  status: "Delivered" },
    { orderId: "ORD-1022", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", date: "Mar 11, 2026", zone: "Main Gate",      earned: 500,  status: "Delivered" },
    { orderId: "ORD-1031", customer: "Lola Okonkwo",    vendor: "ChopHouse",         date: "Mar 10, 2026", zone: "Faculty Area",   earned: 450,  status: "Delivered" },
  ],
  "Sunday Effiong": [
    { orderId: "ORD-1008", customer: "Lola Okonkwo",    vendor: "The Rice House",    date: "Mar 14, 2026", zone: "Porter's Lodge", earned: 500,  status: "Delivered" },
    { orderId: "ORD-1014", customer: "Kabir Sule",      vendor: "Mama Cass Kitchen", date: "Mar 13, 2026", zone: "Porter's Lodge", earned: 500,  status: "Delivered" },
    { orderId: "ORD-1020", customer: "Hauwa Ibrahim",   vendor: "Spice Garden",      date: "Mar 12, 2026", zone: "Porter's Lodge", earned: 450,  status: "Delivered" },
  ],
  "Tunde Olatunji": [
    { orderId: "ORD-1003", customer: "Hauwa Ibrahim",   vendor: "ChopHouse",         date: "Mar 15, 2026", zone: "Faculty Area",   earned: 450,  status: "Delivered" },
    { orderId: "ORD-1011", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", date: "Mar 14, 2026", zone: "Faculty Area",   earned: 450,  status: "Delivered" },
    { orderId: "ORD-1017", customer: "Gbenga Olawale",  vendor: "Spice Garden",      date: "Mar 13, 2026", zone: "Faculty Area",   earned: 450,  status: "Delivered" },
    { orderId: "ORD-1025", customer: "Jumoke Adediran", vendor: "Buka Express",      date: "Mar 11, 2026", zone: "Faculty Area",   earned: 450,  status: "Delivered" },
  ],
  "Yusuf Garba": [
    { orderId: "ORD-1007", customer: "Fatima Hassan",   vendor: "Spice Garden",      date: "Mar 15, 2026", zone: "Hall 4–6",       earned: 500,  status: "Delivered" },
    { orderId: "ORD-1016", customer: "Kabir Sule",      vendor: "ChopHouse",         date: "Mar 13, 2026", zone: "Hall 4–6",       earned: 500,  status: "Delivered" },
    { orderId: "ORD-1023", customer: "Ifeanyi Obi",     vendor: "ChopHouse",         date: "Mar 12, 2026", zone: "Hall 4–6",       earned: 500,  status: "Cancelled" },
  ],
};

// ─── Platform-wide sales list (all orders) ────────────────────────────────────
const seedAllSales = [
  { orderId: "ORD-1001", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", rider: "Emeka Duru",     date: "Mar 15, 2026", items: 3, amount: 4200,  delivery: 500, platformFee: 470, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1002", customer: "Gbenga Olawale",  vendor: "Spice Garden",      rider: "—",              date: "Mar 15, 2026", items: 2, amount: 2800,  delivery: 350, platformFee: 315, payment: "Transfer", status: "Preparing" },
  { orderId: "ORD-1003", customer: "Hauwa Ibrahim",   vendor: "ChopHouse",         rider: "Tunde Olatunji", date: "Mar 14, 2026", items: 5, amount: 8500,  delivery: 450, platformFee: 895, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1004", customer: "Ifeanyi Obi",     vendor: "Mama Cass Kitchen", rider: "—",              date: "Mar 13, 2026", items: 1, amount: 1500,  delivery: 0,   platformFee: 150, payment: "USSD",     status: "Cancelled" },
  { orderId: "ORD-1005", customer: "Jumoke Adediran", vendor: "Buka Express",      rider: "Aminu Kaduna",   date: "Mar 12, 2026", items: 4, amount: 6200,  delivery: 500, platformFee: 670, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1006", customer: "Kabir Sule",      vendor: "ChopHouse",         rider: "Emeka Duru",     date: "Mar 15, 2026", items: 2, amount: 3400,  delivery: 500, platformFee: 390, payment: "Card",     status: "En Route"  },
  { orderId: "ORD-1007", customer: "Fatima Hassan",   vendor: "Spice Garden",      rider: "Yusuf Garba",    date: "Mar 15, 2026", items: 3, amount: 5100,  delivery: 500, platformFee: 560, payment: "Transfer", status: "Pending"   },
  { orderId: "ORD-1008", customer: "Lola Okonkwo",    vendor: "The Rice House",    rider: "Sunday Effiong", date: "Mar 14, 2026", items: 2, amount: 3800,  delivery: 500, platformFee: 430, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1009", customer: "Musa Adamu",      vendor: "ChopHouse",         rider: "Aminu Kaduna",   date: "Mar 14, 2026", items: 4, amount: 7200,  delivery: 500, platformFee: 770, payment: "USSD",     status: "Delivered" },
  { orderId: "ORD-1010", customer: "Hauwa Ibrahim",   vendor: "Spice Garden",      rider: "—",              date: "Mar 13, 2026", items: 2, amount: 3600,  delivery: 350, platformFee: 395, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1011", customer: "Fatima Hassan",   vendor: "Mama Cass Kitchen", rider: "Tunde Olatunji", date: "Mar 14, 2026", items: 3, amount: 5400,  delivery: 450, platformFee: 585, payment: "Card",     status: "Delivered" },
  { orderId: "ORD-1012", customer: "Kabir Sule",      vendor: "Buka Express",      rider: "Emeka Duru",     date: "Mar 10, 2026", items: 2, amount: 3100,  delivery: 500, platformFee: 360, payment: "Card",     status: "Delivered" },
];

const EXPENSE_CATEGORIES = ["Operations", "Marketing", "Technology", "Salaries", "Logistics", "Miscellaneous", "Legal & Compliance", "Utilities"];
const PERIODS = ["Mar 1–15, 2026", "Feb 16–28, 2026", "Feb 1–15, 2026", "Jan 16–31, 2026"];

// ─── Colour maps ───────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:   { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  Paid:      { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Suspended: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  Overdue:   { bg: "#fce7f3", text: "#831843", dot: "#ec4899" },
};

const CAT_COLORS = {
  Operations:           { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  Marketing:            { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7" },
  Technology:           { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  Salaries:             { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  Logistics:            { bg: "#fefce8", text: "#854d0e", dot: "#eab308" },
  Miscellaneous:        { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" },
  "Legal & Compliance": { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
  Utilities:            { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
};

// ─── Micro components ──────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n).toLocaleString()}`;

const StatusPill = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{status}
    </span>
  );
};

const CatPill = ({ cat }) => {
  const c = CAT_COLORS[cat] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.text, borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />{cat}
    </span>
  );
};

const Avatar = ({ initials, size = 34, gradient = "linear-gradient(135deg,#1e3a5f,#2563eb)" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
    {initials}
  </div>
);

const Table = ({ children }) => (
  <div style={{ overflowX: "auto", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "white" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>{children}</table>
  </div>
);

const TH = ({ children, right, accent }) => (
  <th style={{ padding: "11px 16px", textAlign: right ? "right" : "left", fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: accent ? "#1e3a5f" : "#94a3b8", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap" }}>{children}</th>
);

const TD = ({ children, right, mono, dim, bold, green, red, amber }) => (
  <td style={{ padding: "13px 16px", fontSize: 13, borderBottom: "1px solid #f1f5f9", textAlign: right ? "right" : "left", verticalAlign: "middle", fontFamily: mono ? "monospace" : "'DM Sans',sans-serif", color: green ? "#065f46" : red ? "#991b1b" : amber ? "#92400e" : dim ? "#94a3b8" : "#1e293b", fontWeight: bold ? 700 : 500, letterSpacing: mono ? 0.5 : 0 }}>{children}</td>
);

const TR = ({ children, onClick, clickable }) => (
  <tr
    style={{ cursor: clickable ? "pointer" : "default", transition: "background 0.12s" }}
    onMouseEnter={e => { if (clickable) e.currentTarget.style.background = "#f8fafc"; }}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    onClick={onClick}
  >{children}</tr>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: "9px 14px 9px 34px", borderRadius: 50, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#1e293b", outline: "none", width: 240 }}
      onFocus={e => e.target.style.borderColor = "#1e3a5f"}
      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
    />
  </div>
);

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, subColor, delay = 0, big }) => (
  <div style={{ background: "white", borderRadius: 18, padding: "20px 22px", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", animation: `acIn 0.4s ease ${delay}s both` }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{icon}</div>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", margin: "0 0 5px" }}>{label}</p>
    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: big ? 28 : 24, color, margin: 0, letterSpacing: -0.5 }}>{value}</p>
    {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: subColor || "#64748b", margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

// ─── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, count, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
    <div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 21, color: "#0f172a", margin: 0 }}>
        {title}{count !== undefined && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginLeft: 8 }}>({count})</span>}
      </h2>
      {sub && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", margin: "3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Mark Paid confirmation ────────────────────────────────────────────────────
function MarkPaidModal({ item, type, onConfirm, onCancel }) {
  const [ref, setRef] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 420, padding: "28px 28px 24px", boxShadow: "0 28px 80px rgba(0,0,0,0.2)", animation: "acIn 0.25s cubic-bezier(.34,1.4,.64,1) both" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>✅</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#0f172a", textAlign: "center", margin: "0 0 6px" }}>Confirm Payment</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 20px", lineHeight: 1.55 }}>
          Mark <strong style={{ color: "#0f172a" }}>{type === "vendor" ? item.vendor : item.rider}</strong> payout of{" "}
          <strong style={{ color: "#065f46" }}>{fmt(item.netPayable)}</strong> as paid?
        </p>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Payment Reference (optional)</label>
          <input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. TRF2026031500123"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontFamily: "monospace", fontSize: 13, color: "#1e293b", outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(ref)} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#059669,#10b981)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
            ✅ Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Expense Modal ─────────────────────────────────────────────────────────
function AddExpenseModal({ onSave, onCancel }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: EXPENSE_CATEGORIES[0], description: "", amount: "", addedBy: "", receipt: false });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.description.trim() && Number(form.amount) > 0 && form.addedBy.trim();

  const iS = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#1e293b", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
  const lS = { display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.2)", animation: "acIn 0.25s cubic-bezier(.34,1.4,.64,1) both" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#7c1d3f,#be185d)", padding: "22px 24px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Accounting</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "white", margin: "4px 0 0" }}>Log New Expense</h3>
            </div>
            <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Date + Category */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={lS}>Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={iS} onFocus={e => e.target.style.borderColor="#be185d"} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lS}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...iS, appearance: "none", cursor: "pointer" }}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lS}>Description</label>
            <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. AWS server hosting — March" style={iS} onFocus={e => e.target.style.borderColor="#be185d"} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
          </div>

          {/* Amount */}
          <div>
            <label style={lS}>Amount (₦)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#be185d" }}>₦</span>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" style={{ ...iS, paddingLeft: 32 }} onFocus={e => e.target.style.borderColor="#be185d"} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
            </div>
          </div>

          {/* Added by */}
          <div>
            <label style={lS}>Added By (Your Name)</label>
            <input value={form.addedBy} onChange={e => set("addedBy", e.target.value)} placeholder="e.g. Amaka Okafor" style={iS} onFocus={e => e.target.style.borderColor="#be185d"} onBlur={e => e.target.style.borderColor="#e2e8f0"} />
          </div>

          {/* Receipt toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fdf2f8", borderRadius: 10, border: "1px solid #fbcfe8" }}>
            <div onClick={() => set("receipt", !form.receipt)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.receipt ? "#be185d" : "#cbd5e1"}`, background: form.receipt ? "#be185d" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.18s" }}>
              {form.receipt && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b" }}>Receipt / invoice attached</span>
          </div>

          {/* Summary preview */}
          {form.amount > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #ef4444" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#991b1b", margin: 0 }}>
                This will record an expense of <strong>{fmt(form.amount)}</strong> under <strong>{form.category}</strong>.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={valid ? () => onSave({ ...form, id: `EXP${String(Date.now()).slice(-3)}`, amount: Number(form.amount), date: new Date(form.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }) : undefined}
              style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#7c1d3f,#be185d)" : "#e2e8f0", color: valid ? "white" : "#94a3b8", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: valid ? "pointer" : "not-allowed", boxShadow: valid ? "0 4px 14px rgba(190,24,93,0.32)" : "none" }}>
              Log Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payout Detail Modal ───────────────────────────────────────────────────────
function PayoutDetailModal({ item, type, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  const isVendor = type === "vendor";
  const accent = isVendor ? "#7c3aed" : "#f97316";
  const gross = isVendor ? item.grossSales : item.grossEarned;
  const cut = isVendor ? item.platformFee : item.platformCut;
  const cutLabel = isVendor ? "Platform Fee (10%)" : "Platform Cut (20%)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(0,0,0,0.2)", animation: "acIn 0.25s cubic-bezier(.34,1.4,.64,1) both", position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${accent},${accent}77)`, borderRadius: "22px 22px 0 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f1f5f9" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: accent, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 4px" }}>{isVendor ? "Vendor Payout" : "Rider Payout"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Avatar initials={isVendor ? item.vendor.slice(0,2).toUpperCase() : item.rider.split(" ").map(w=>w[0]).slice(0,2).join("")} size={46} gradient={isVendor ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "linear-gradient(135deg,#f97316,#fb923c)"} />
            <div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: "#0f172a", margin: 0 }}>{isVendor ? item.vendor : item.rider}</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{isVendor ? item.owner : item.vehicle} · Period: {item.period}</p>
            </div>
          </div>
          <StatusPill status={item.status} />
        </div>

        {/* Breakdown */}
        <div style={{ padding: "18px 24px" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 10px" }}>Financial Breakdown</p>
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "4px 0", marginBottom: 16 }}>
            {[
              [isVendor ? "Gross Sales" : "Gross Earned", fmt(gross), false, true],
              [cutLabel, `-${fmt(cut)}`, true, false],
              [null, null, null, null], // divider
              ["Net Payable", fmt(item.netPayable), false, false],
            ].map((row, i) => row[0] === null ? (
              <div key={i} style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", fontWeight: 600 }}>{row[0]}</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: row[3] ? 14 : 15, fontWeight: 800, color: row[2] ? "#991b1b" : row[3] ? "#1e293b" : "#065f46" }}>{row[1]}</span>
              </div>
            ))}
          </div>

          {/* Bank details */}
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 10px" }}>Bank Details</p>
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #bbf7d0" }}>
            {[["Bank", item.bank], ["Account No.", item.accountNo], [isVendor ? "Account Name" : "Rider", isVendor ? item.owner : item.rider]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{k}</span>
                <span style={{ fontFamily: k === "Account No." ? "monospace" : "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: k === "Account No." ? 0.5 : 0 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Other info */}
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            {[
              [isVendor ? "📦" : "🏍️", isVendor ? "Orders" : "Deliveries", isVendor ? item.orders : item.deliveries],
              ["📅", "Last Paid", item.lastPaid],
              ["🔖", "Period", item.period],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#0f172a", margin: "4px 0 2px", lineHeight: 1.2 }}>{val}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <button onClick={onClose} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#f1f5f9", color: "#475569", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Expense Detail Modal ──────────────────────────────────────────────────────
function ExpenseDetailModal({ expense, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 420, boxShadow: "0 28px 80px rgba(0,0,0,0.2)", animation: "acIn 0.25s cubic-bezier(.34,1.4,.64,1) both", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg,#be185d,#ec4899)", borderRadius: "22px 22px 0 0" }} />
        <div style={{ padding: "24px 24px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, color: "#be185d", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 4px" }}>Expense Record</p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#0f172a", margin: 0 }}>{expense.id}</h3>
            </div>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>

          {/* Amount hero */}
          <div style={{ background: "linear-gradient(135deg,#fef2f2,#fce7f3)", borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 20, border: "1.5px solid #fecdd3" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#be185d", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 4px" }}>Amount</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 32, color: "#991b1b", margin: 0, letterSpacing: -0.5 }}>{fmt(expense.amount)}</p>
          </div>

          {[
            ["Description", expense.description],
            ["Category", <CatPill cat={expense.category} />],
            ["Date", expense.date],
            ["Added By", expense.addedBy],
            ["Receipt", expense.receipt ? "✅ Attached" : "❌ Not attached"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>{k}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#1e293b", fontWeight: 600, maxWidth: 220, textAlign: "right" }}>{v}</span>
            </div>
          ))}

          <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 12, border: "none", background: "#f1f5f9", color: "#475569", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}


// ─── STATUS colour helper for order statuses ──────────────────────────────────
const ORDER_STATUS_COLORS = {
  Delivered: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Preparing: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  "En Route":{ bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  Pending:   { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};
const OrderStatusPill = ({ status }) => {
  const s = ORDER_STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:s.bg, color:s.text, borderRadius:50, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>{status}
    </span>
  );
};

// ─── Vendor Sales List Modal ───────────────────────────────────────────────────
function VendorSalesModal({ payout, onClose }) {
  const sales = seedVendorSales[payout.vendor] || [];
  const [search, setSearch] = useState("");
  const filtered = sales.filter(s =>
    s.orderId.toLowerCase().includes(search.toLowerCase()) ||
    s.customer.toLowerCase().includes(search.toLowerCase())
  );
  const totalSales = filtered.filter(s => s.status === "Delivered").reduce((a, s) => a + s.amount, 0);
  const totalOrders = filtered.filter(s => s.status === "Delivered").length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:22, width:"100%", maxWidth:660, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 28px 80px rgba(0,0,0,0.22)", animation:"acIn 0.28s cubic-bezier(.34,1.4,.64,1) both", overflow:"hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#4c1d95,#7c3aed)", padding:"22px 24px 18px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar initials={payout.vendor.slice(0,2).toUpperCase()} size={44} gradient="rgba(255,255,255,0.2)" />
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", margin:0 }}>Sales Breakdown</p>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:19, color:"white", margin:"3px 0 0" }}>{payout.vendor}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.6)", margin:"2px 0 0" }}>Period: {payout.period} · Owner: {payout.owner}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
          {/* Summary pills */}
          <div style={{ display:"flex", gap:10 }}>
            {[
              ["📦","Delivered Orders", totalOrders],
              ["💰","Total Sales", fmt(totalSales)],
              ["📊","Platform Fee (10%)", fmt(Math.round(totalSales * 0.1))],
              ["✅","Net to Vendor", fmt(Math.round(totalSales * 0.9))],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:10, padding:"8px 12px", flex:1, textAlign:"center" }}>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:"white", margin:0 }}>{val}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"rgba(255,255,255,0.6)", margin:"2px 0 0", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Search */}
        <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #f1f5f9", flexShrink:0, background:"#f8fafc" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID or customer…" />
        </div>
        {/* Table */}
        <div style={{ overflowY:"auto", flex:1 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Order ID","Customer","Date","Items","Amount","Payment","Status"].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:800, letterSpacing:1, textTransform:"uppercase", color:"#94a3b8", borderBottom:"1.5px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.orderId} style={{ background: i%2===0?"white":"#fafafa" }}>
                  <td style={{ padding:"11px 16px", fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#7c3aed" }}>{s.orderId}</td>
                  <td style={{ padding:"11px 16px", fontSize:13, color:"#0f172a", fontWeight:600 }}>{s.customer}</td>
                  <td style={{ padding:"11px 16px", fontSize:12, color:"#94a3b8" }}>{s.date}</td>
                  <td style={{ padding:"11px 16px", textAlign:"center" }}><span style={{ background:"#f1f5f9", borderRadius:50, padding:"2px 8px", fontSize:12, fontWeight:700, color:"#475569" }}>{s.items}</span></td>
                  <td style={{ padding:"11px 16px", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color: s.status==="Cancelled"?"#94a3b8":"#059669" }}>{fmt(s.amount)}</td>
                  <td style={{ padding:"11px 16px" }}><span style={{ background:"#f1f5f9", borderRadius:50, padding:"2px 8px", fontSize:11, fontWeight:700, color:"#64748b" }}>{s.payment}</span></td>
                  <td style={{ padding:"11px 16px" }}><OrderStatusPill status={s.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:"#94a3b8", fontFamily:"'DM Sans',sans-serif" }}>No sales found</td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background:"#f0fdf4", borderTop:"2px solid #bbf7d0" }}>
                  <td colSpan={4} style={{ padding:"12px 16px", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:13, color:"#065f46" }}>Total (Delivered only)</td>
                  <td style={{ padding:"12px 16px", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#059669" }}>{fmt(totalSales)}</td>
                  <td colSpan={2} style={{ padding:"12px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6b7280" }}>{totalOrders} of {filtered.length} orders delivered</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Rider Deliveries List Modal ──────────────────────────────────────────────
function RiderDeliveriesModal({ payout, onClose }) {
  const deliveries = seedRiderDeliveries[payout.rider] || [];
  const [search, setSearch] = useState("");
  const filtered = deliveries.filter(d =>
    d.orderId.toLowerCase().includes(search.toLowerCase()) ||
    d.customer.toLowerCase().includes(search.toLowerCase()) ||
    d.vendor.toLowerCase().includes(search.toLowerCase())
  );
  const totalEarned = filtered.filter(d => d.status === "Delivered").reduce((a, d) => a + d.earned, 0);
  const completed   = filtered.filter(d => d.status === "Delivered").length;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:22, width:"100%", maxWidth:660, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 28px 80px rgba(0,0,0,0.22)", animation:"acIn 0.28s cubic-bezier(.34,1.4,.64,1) both", overflow:"hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#c2410c,#f97316)", padding:"22px 24px 18px", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar initials={payout.rider.split(" ").map(w=>w[0]).slice(0,2).join("")} size={44} gradient="rgba(255,255,255,0.2)" />
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", margin:0 }}>Delivery Log</p>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:19, color:"white", margin:"3px 0 0" }}>{payout.rider}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.6)", margin:"2px 0 0" }}>Period: {payout.period} · {payout.vehicle}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:34, height:34, cursor:"pointer", fontSize:18, color:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
          {/* Summary pills */}
          <div style={{ display:"flex", gap:10 }}>
            {[
              ["🏍️","Completed", completed],
              ["💰","Gross Earned", fmt(totalEarned)],
              ["✂️","Platform Cut (20%)", fmt(Math.round(totalEarned * 0.2))],
              ["✅","Net to Rider", fmt(Math.round(totalEarned * 0.8))],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 10px", flex:1, textAlign:"center" }}>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color:"white", margin:0 }}>{val}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"rgba(255,255,255,0.6)", margin:"2px 0 0", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Search */}
        <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #f1f5f9", flexShrink:0, background:"#f8fafc" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, customer or vendor…" />
        </div>
        {/* Table */}
        <div style={{ overflowY:"auto", flex:1 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Order ID","Customer","Vendor","Zone","Date","Earned","Status"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:800, letterSpacing:1, textTransform:"uppercase", color:"#94a3b8", borderBottom:"1.5px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.orderId} style={{ background: i%2===0?"white":"#fafafa" }}>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#f97316" }}>{d.orderId}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:"#0f172a", fontWeight:600 }}>{d.customer}</td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#64748b" }}>{d.vendor}</td>
                  <td style={{ padding:"11px 14px" }}><span style={{ background:"#fff7ed", borderRadius:50, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#c2410c" }}>{d.zone}</span></td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#94a3b8" }}>{d.date}</td>
                  <td style={{ padding:"11px 14px", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:13, color: d.status==="Cancelled"?"#94a3b8":"#059669" }}>{fmt(d.earned)}</td>
                  <td style={{ padding:"11px 14px" }}><OrderStatusPill status={d.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:"#94a3b8", fontFamily:"'DM Sans',sans-serif" }}>No deliveries found</td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background:"#fff7ed", borderTop:"2px solid #fed7aa" }}>
                  <td colSpan={5} style={{ padding:"12px 14px", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:13, color:"#c2410c" }}>Total Earned (Delivered only)</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#ea580c" }}>{fmt(totalEarned)}</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6b7280" }}>{completed} of {filtered.length} completed</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: SALES ──────────────────────────────────────────────────────────────
function SalesTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");

  const vendors = ["All", ...Array.from(new Set(seedAllSales.map(s => s.vendor)))];
  const statuses = ["All", "Delivered", "En Route", "Preparing", "Pending", "Cancelled"];

  const filtered = seedAllSales.filter(s => {
    const sm = s.orderId.toLowerCase().includes(search.toLowerCase()) ||
               s.customer.toLowerCase().includes(search.toLowerCase()) ||
               s.vendor.toLowerCase().includes(search.toLowerCase());
    const st = statusFilter === "All" || s.status === statusFilter;
    const sv = vendorFilter === "All" || s.vendor === vendorFilter;
    return sm && st && sv;
  });

  const totalRevenue     = filtered.filter(s => s.status === "Delivered").reduce((a, s) => a + s.amount, 0);
  const totalDeliveryFee = filtered.filter(s => s.status === "Delivered").reduce((a, s) => a + s.delivery, 0);
  const totalPlatformFee = filtered.filter(s => s.status === "Delivered").reduce((a, s) => a + s.platformFee, 0);
  const totalOrders      = filtered.filter(s => s.status === "Delivered").length;
  const cancelledOrders  = filtered.filter(s => s.status === "Cancelled").length;

  return (
    <div>
      <SectionHeader
        title="Sales"
        sub="All orders across the platform — click any row for details"
        count={filtered.length}
        action={
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ background:"linear-gradient(135deg,#0ea5e9,#38bdf8)", borderRadius:12, padding:"10px 18px", textAlign:"right" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:1, margin:0 }}>Total Sales</p>
              <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:"white", margin:0 }}>{fmt(totalRevenue)}</p>
            </div>
          </div>
        }
      />

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { icon:"📦", label:"Delivered Orders",  value:totalOrders,              color:"#059669" },
          { icon:"💰", label:"Gross Sales",        value:fmt(totalRevenue),         color:"#0ea5e9" },
          { icon:"🛵", label:"Delivery Fees",      value:fmt(totalDeliveryFee),     color:"#f97316" },
          { icon:"📊", label:"Platform Fees",      value:fmt(totalPlatformFee),     color:"#7c3aed" },
          { icon:"❌", label:"Cancelled",          value:cancelledOrders,           color:"#ef4444" },
        ].map(c => (
          <div key={c.label} style={{ background:"white", borderRadius:14, padding:"14px 16px", border:"1.5px solid #e2e8f0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${c.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:8 }}>{c.icon}</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:0.6, textTransform:"uppercase", margin:"0 0 3px" }}>{c.label}</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:c.color, margin:0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search order, customer or vendor…" />
        <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
          style={{ padding:"9px 14px", borderRadius:50, border:"1.5px solid #e2e8f0", background:"white", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#475569", fontWeight:700, cursor:"pointer", outline:"none" }}>
          {vendors.map(v => <option key={v}>{v}</option>)}
        </select>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding:"7px 14px", borderRadius:50, border:"1.5px solid", borderColor: statusFilter===s?"#0ea5e9":"#e2e8f0", background: statusFilter===s?"#0ea5e9":"white", color: statusFilter===s?"white":"#64748b", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:11, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <TH>Order ID</TH><TH>Customer</TH><TH>Vendor</TH><TH>Rider</TH>
            <TH>Date</TH><TH>Items</TH><TH right>Sale Amount</TH><TH right>Delivery Fee</TH>
            <TH right>Platform Fee</TH><TH>Payment</TH><TH>Status</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <TR key={s.orderId}>
              <TD><span style={{ fontFamily:"monospace", fontWeight:700, fontSize:12, color:"#0ea5e9" }}>{s.orderId}</span></TD>
              <TD><span style={{ fontWeight:600 }}>{s.customer}</span></TD>
              <TD><span style={{ fontSize:12, color:"#64748b" }}>{s.vendor}</span></TD>
              <TD><span style={{ fontSize:12, color: s.rider==="—"?"#d1d5db":"#374151" }}>{s.rider}</span></TD>
              <TD dim>{s.date}</TD>
              <TD><span style={{ background:"#f1f5f9", borderRadius:50, padding:"2px 8px", fontSize:12, fontWeight:700, color:"#475569" }}>{s.items}</span></TD>
              <TD right><strong style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, color: s.status==="Cancelled"?"#94a3b8":"#059669" }}>{fmt(s.amount)}</strong></TD>
              <TD right><span style={{ fontSize:12, color:"#f97316", fontWeight:700 }}>{fmt(s.delivery)}</span></TD>
              <TD right><span style={{ fontSize:12, color:"#7c3aed", fontWeight:700 }}>{fmt(s.platformFee)}</span></TD>
              <TD><span style={{ background:"#f1f5f9", borderRadius:50, padding:"2px 8px", fontSize:11, fontWeight:700, color:"#64748b" }}>{s.payment}</span></TD>
              <TD><OrderStatusPill status={s.status} /></TD>
            </TR>
          ))}
        </tbody>
        {filtered.filter(s=>s.status==="Delivered").length > 0 && (
          <tfoot>
            <tr style={{ background:"#f0fdf4", borderTop:"2px solid #bbf7d0" }}>
              <td colSpan={6} style={{ padding:"12px 16px", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:13, color:"#065f46" }}>Totals (Delivered only)</td>
              <td style={{ padding:"12px 16px", textAlign:"right", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#059669" }}>{fmt(totalRevenue)}</td>
              <td style={{ padding:"12px 16px", textAlign:"right", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#f97316" }}>{fmt(totalDeliveryFee)}</td>
              <td style={{ padding:"12px 16px", textAlign:"right", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#7c3aed" }}>{fmt(totalPlatformFee)}</td>
              <td colSpan={2} style={{ padding:"12px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#6b7280" }}>{totalOrders} of {filtered.length} orders</td>
            </tr>
          </tfoot>
        )}
      </Table>
    </div>
  );
}

// ─── TAB: OVERVIEW ────────────────────────────────────────────────────────────
function OverviewTab({ vendorPayouts, riderPayouts, expenses }) {
  const pendingVendors   = vendorPayouts.filter(v => v.status === "Pending");
  const pendingRiders    = riderPayouts.filter(r => r.status === "Pending");
  const totalVendorDue   = pendingVendors.reduce((a, v) => a + v.netPayable, 0);
  const totalRiderDue    = pendingRiders.reduce((a, r) => a + r.netPayable, 0);
  const totalExpenses    = expenses.reduce((a, e) => a + e.amount, 0);
  const totalPlatformFee = vendorPayouts.reduce((a, v) => a + v.platformFee, 0) + riderPayouts.reduce((a, r) => a + r.platformCut, 0);
  const netRevenue       = totalPlatformFee - totalExpenses;

  // Category breakdown for expenses
  const catBreakdown = EXPENSE_CATEGORIES.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((a, e) => a + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCat = catBreakdown[0]?.total || 1;

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: "#0f172a", margin: "0 0 4px" }}>Financial Overview</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", margin: 0 }}>ChopSpot platform financials — all figures in Nigerian Naira (₦)</p>
      </div>

      {/* Main stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard icon="🏪" label="Vendor Payouts Due"  value={fmt(totalVendorDue)}  sub={`${pendingVendors.length} pending`}   color="#7c3aed" delay={0}    />
        <StatCard icon="🏍️" label="Rider Payouts Due"  value={fmt(totalRiderDue)}   sub={`${pendingRiders.length} pending`}    color="#f97316" delay={0.05} />
        <StatCard icon="📊" label="Platform Revenue"   value={fmt(totalPlatformFee)} sub="fees collected"                       color="#0ea5e9" delay={0.1}  />
        <StatCard icon="📉" label="Total Expenses"     value={fmt(totalExpenses)}    sub={`${expenses.length} entries`}         color="#be185d" delay={0.15} />
        <StatCard icon="💰" label="Net Profit"         value={fmt(netRevenue)}       sub="revenue − expenses"                   color={netRevenue >= 0 ? "#059669" : "#dc2626"} subColor={netRevenue >= 0 ? "#10b981" : "#ef4444"} delay={0.2} big />
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>

        {/* Pending payouts summary */}
        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Pending Payouts</h3>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8" }}>{pendingVendors.length + pendingRiders.length} outstanding</span>
          </div>
          {[...pendingVendors.slice(0, 3).map(v => ({ name: v.vendor, amount: v.netPayable, type: "vendor", period: v.period })),
            ...pendingRiders.slice(0, 3).map(r => ({ name: r.rider, amount: r.netPayable, type: "rider", period: r.period }))
          ].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.type === "vendor" ? "#7c3aed" : "#f97316", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{item.period}</p>
                </div>
              </div>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: item.type === "vendor" ? "#7c3aed" : "#f97316" }}>{fmt(item.amount)}</span>
            </div>
          ))}
          <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1.5px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#475569" }}>Total Outstanding</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{fmt(totalVendorDue + totalRiderDue)}</span>
            </div>
          </div>
        </div>

        {/* Expense breakdown by category */}
        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Expenses by Category</h3>
          </div>
          <div style={{ padding: "14px 20px" }}>
            {catBreakdown.map(({ cat, total }) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#475569", fontWeight: 600 }}>{cat}</span>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 800, color: "#be185d" }}>{fmt(total)}</span>
                </div>
                <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(total / maxCat) * 100}%`, background: "linear-gradient(90deg,#be185d,#ec4899)", borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* P&L Summary */}
        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>P&L Summary</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {[
              ["Platform fees from vendors", totalPlatformFee * 0.6, true],
              ["Platform fees from riders",  totalPlatformFee * 0.4, true],
              ["Total Revenue",              totalPlatformFee, true, true],
              [null],
              ["Operations",   expenses.filter(e=>e.category==="Operations").reduce((a,e)=>a+e.amount,0), false],
              ["Technology",   expenses.filter(e=>e.category==="Technology").reduce((a,e)=>a+e.amount,0), false],
              ["Marketing",    expenses.filter(e=>e.category==="Marketing").reduce((a,e)=>a+e.amount,0), false],
              ["Salaries",     expenses.filter(e=>e.category==="Salaries").reduce((a,e)=>a+e.amount,0), false],
              ["Other",        expenses.filter(e=>!["Operations","Technology","Marketing","Salaries"].includes(e.category)).reduce((a,e)=>a+e.amount,0), false],
              ["Total Expenses", totalExpenses, false, true],
              [null],
              ["Net Profit / Loss", netRevenue, netRevenue >= 0, false, true],
            ].map((row, i) => row[0] === null ? (
              <div key={i} style={{ height: 1, background: "#e2e8f0", margin: "8px 0" }} />
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: row[4] ? "10px 0 0" : "5px 0", borderTop: row[4] ? "1.5px solid #e2e8f0" : "none", marginTop: row[4] ? 4 : 0 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: row[3] || row[4] ? 13 : 12, color: row[3] || row[4] ? "#0f172a" : "#64748b", fontWeight: row[3] || row[4] ? 700 : 500 }}>{row[0]}</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: row[4] ? 15 : 13, fontWeight: row[3] || row[4] ? 800 : 600, color: row[4] ? (netRevenue >= 0 ? "#059669" : "#dc2626") : row[2] ? "#059669" : "#be185d" }}>
                  {row[2] ? "" : "-"}{fmt(row[1])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent expenses */}
        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Recent Expenses</h3>
          </div>
          {expenses.slice(0, 5).map((e, i, arr) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{e.description.length > 42 ? e.description.slice(0, 42) + "…" : e.description}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{e.date} · {e.category}</p>
              </div>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#be185d", flexShrink: 0, marginLeft: 8 }}>-{fmt(e.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: VENDOR PAYOUTS ──────────────────────────────────────────────────────
function VendorPayoutsTab({ payouts, setPayouts }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [markingItem, setMarkingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [salesItem, setSalesItem] = useState(null);

  const filtered = payouts.filter(v => {
    const s = v.vendor.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase());
    return s && (filter === "All" || v.status === filter);
  });

  const totalDue = filtered.filter(v => v.status === "Pending").reduce((a, v) => a + v.netPayable, 0);

  const markPaid = (item, ref) => {
    setPayouts(p => p.map(v => v.id === item.id ? { ...v, status: "Paid", lastPaid: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } : v));
    setMarkingItem(null);
  };

  return (
    <div>
      <SectionHeader
        title="Vendor Payouts"
        sub="Manage remittances to food vendors — 10% platform fee deducted"
        count={filtered.length}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius: 12, padding: "10px 18px" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Total Due</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "white", margin: 0 }}>{fmt(totalDue)}</p>
            </div>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search vendor or owner…" />
        {["All", "Pending", "Paid", "Suspended"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "7px 16px", borderRadius: 50, border: "1.5px solid", borderColor: filter === s ? "#7c3aed" : "#e2e8f0", background: filter === s ? "#7c3aed" : "white", color: filter === s ? "white" : "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <TH>Vendor</TH><TH>Period</TH><TH right>Gross Sales</TH><TH right>Platform Fee</TH><TH right>Net Payable</TH>
            <TH>Orders</TH><TH>Bank</TH><TH>Status</TH><TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map(v => (
            <TR key={v.id} clickable onClick={() => setViewItem(v)}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={v.vendor.slice(0,2).toUpperCase()} size={32} gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{v.vendor}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{v.owner}</p>
                  </div>
                </div>
              </TD>
              <TD dim>{v.period}</TD>
              <TD right bold>{fmt(v.grossSales)}</TD>
              <TD right red>{fmt(v.platformFee)}</TD>
              <TD right><strong style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#059669" }}>{fmt(v.netPayable)}</strong></TD>
              <TD><span style={{ background: "#f1f5f9", borderRadius: 50, padding: "2px 8px", fontSize: 12, fontWeight: 700, color: "#475569" }}>{v.orders}</span></TD>
              <TD dim>{v.bank}</TD>
              <TD><StatusPill status={v.status} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  {v.status === "Pending" && (
                    <button onClick={() => setMarkingItem(v)}
                      style={{ background: "#d1fae5", border: "none", borderRadius: 8, padding: "6px 12px", color: "#065f46", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#059669"; e.currentTarget.style.color="white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#d1fae5"; e.currentTarget.style.color="#065f46"; }}
                    >✅ Mark Paid</button>
                  )}
                  <button onClick={() => setViewItem(v)}
                    style={{ background: "#f5f3ff", border: "none", borderRadius: 8, padding: "6px 12px", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    View
                  </button>
                  <button onClick={() => setSalesItem(v)}
                    style={{ background: "#f0fdf4", border: "none", borderRadius: 8, padding: "6px 12px", color: "#059669", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                    📊 Sales
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {markingItem && <MarkPaidModal item={markingItem} type="vendor" onConfirm={(ref) => markPaid(markingItem, ref)} onCancel={() => setMarkingItem(null)} />}
      {viewItem && <PayoutDetailModal item={viewItem} type="vendor" onClose={() => setViewItem(null)} />}
      {salesItem && <VendorSalesModal payout={salesItem} onClose={() => setSalesItem(null)} />}
    </div>
  );
}

// ─── TAB: RIDER PAYOUTS ───────────────────────────────────────────────────────
function RiderPayoutsTab({ payouts, setPayouts }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [markingItem, setMarkingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deliveriesItem, setDeliveriesItem] = useState(null);

  const filtered = payouts.filter(r => {
    const s = r.rider.toLowerCase().includes(search.toLowerCase());
    return s && (filter === "All" || r.status === filter);
  });

  const totalDue = filtered.filter(r => r.status === "Pending").reduce((a, r) => a + r.netPayable, 0);

  const markPaid = (item) => {
    setPayouts(p => p.map(r => r.id === item.id ? { ...r, status: "Paid", lastPaid: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } : r));
    setMarkingItem(null);
  };

  return (
    <div>
      <SectionHeader
        title="Rider Payouts"
        sub="Manage earnings remittances to delivery riders — 20% platform cut deducted"
        count={filtered.length}
        action={
          <div style={{ background: "linear-gradient(135deg,#ea580c,#fb923c)", borderRadius: 12, padding: "10px 18px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Total Due</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "white", margin: 0 }}>{fmt(totalDue)}</p>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search rider…" />
        {["All", "Pending", "Paid"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "7px 16px", borderRadius: 50, border: "1.5px solid", borderColor: filter === s ? "#f97316" : "#e2e8f0", background: filter === s ? "#f97316" : "white", color: filter === s ? "white" : "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>{s}</button>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <TH>Rider</TH><TH>Vehicle</TH><TH>Period</TH><TH right>Deliveries</TH>
            <TH right>Gross Earned</TH><TH right>Platform Cut</TH><TH right>Net Payable</TH>
            <TH>Bank</TH><TH>Status</TH><TH>Actions</TH>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <TR key={r.id} clickable onClick={() => setViewItem(r)}>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={r.rider.split(" ").map(w=>w[0]).slice(0,2).join("")} size={32} gradient="linear-gradient(135deg,#f97316,#fb923c)" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{r.rider}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{r.id}</p>
                  </div>
                </div>
              </TD>
              <TD><span style={{ background: "#fff7ed", borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#c2410c" }}>{r.vehicle}</span></TD>
              <TD dim>{r.period}</TD>
              <TD right bold>{r.deliveries}</TD>
              <TD right bold>{fmt(r.grossEarned)}</TD>
              <TD right red>{fmt(r.platformCut)}</TD>
              <TD right><strong style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#059669" }}>{fmt(r.netPayable)}</strong></TD>
              <TD dim>{r.bank}</TD>
              <TD><StatusPill status={r.status} /></TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  {r.status === "Pending" && (
                    <button onClick={() => setMarkingItem(r)}
                      style={{ background: "#d1fae5", border: "none", borderRadius: 8, padding: "6px 12px", color: "#065f46", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#059669"; e.currentTarget.style.color="white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#d1fae5"; e.currentTarget.style.color="#065f46"; }}
                    >✅ Mark Paid</button>
                  )}
                  <button onClick={() => setViewItem(r)}
                    style={{ background: "#fff7ed", border: "none", borderRadius: 8, padding: "6px 12px", color: "#c2410c", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    View
                  </button>
                  <button onClick={() => setDeliveriesItem(r)}
                    style={{ background: "#f0fdf4", border: "none", borderRadius: 8, padding: "6px 12px", color: "#059669", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                    🏍️ Log
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {markingItem && <MarkPaidModal item={markingItem} type="rider" onConfirm={() => markPaid(markingItem)} onCancel={() => setMarkingItem(null)} />}
      {viewItem && <PayoutDetailModal item={viewItem} type="rider" onClose={() => setViewItem(null)} />}
      {deliveriesItem && <RiderDeliveriesModal payout={deliveriesItem} onClose={() => setDeliveriesItem(null)} />}
    </div>
  );
}

// ─── TAB: EXPENSES ────────────────────────────────────────────────────────────
function ExpensesTab({ expenses, setExpenses }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const filtered = expenses.filter(e => {
    const s = e.description.toLowerCase().includes(search.toLowerCase()) || e.addedBy.toLowerCase().includes(search.toLowerCase());
    return s && (catFilter === "All" || e.category === catFilter);
  });

  const totalFiltered = filtered.reduce((a, e) => a + e.amount, 0);

  const handleAdd = (data) => { setExpenses(p => [data, ...p]); setShowAdd(false); };
  const handleDelete = (id) => { setExpenses(p => p.filter(e => e.id !== id)); };

  return (
    <div>
      <SectionHeader
        title="Expenses"
        sub="Log and track all platform operating costs"
        count={filtered.length}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecdd3", borderRadius: 12, padding: "8px 16px" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Showing Total</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#991b1b", margin: 0 }}>{fmt(totalFiltered)}</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              style={{ background: "linear-gradient(135deg,#7c1d3f,#be185d)", color: "white", border: "none", borderRadius: 12, padding: "11px 18px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(190,24,93,0.3)", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Log Expense
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search description or added by…" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...EXPENSE_CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "6px 14px", borderRadius: 50, border: "1.5px solid", borderColor: catFilter === c ? "#be185d" : "#e2e8f0", background: catFilter === c ? "#be185d" : "white", color: catFilter === c ? "white" : "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{c}</button>
          ))}
        </div>
      </div>

      <Table>
        <thead>
          <tr><TH>Date</TH><TH>Description</TH><TH>Category</TH><TH right>Amount</TH><TH>Added By</TH><TH>Receipt</TH><TH>Actions</TH></tr>
        </thead>
        <tbody>
          {filtered.map(e => (
            <TR key={e.id} clickable onClick={() => setViewItem(e)}>
              <TD dim>{e.date}</TD>
              <TD>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0f172a", maxWidth: 260 }}>{e.description}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{e.id}</p>
              </TD>
              <TD><CatPill cat={e.category} /></TD>
              <TD right><strong style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#be185d" }}>{fmt(e.amount)}</strong></TD>
              <TD dim>{e.addedBy}</TD>
              <TD>
                <span style={{ fontSize: 16 }}>{e.receipt ? "✅" : "❌"}</span>
              </TD>
              <TD>
                <div style={{ display: "flex", gap: 6 }} onClick={ev => ev.stopPropagation()}>
                  <button onClick={() => setViewItem(e)}
                    style={{ background: "#fdf4ff", border: "none", borderRadius: 8, padding: "6px 12px", color: "#7e22ce", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>View</button>
                  <button onClick={() => handleDelete(e.id)}
                    style={{ background: "#fef2f2", border: "none", borderRadius: 8, padding: "6px 10px", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={ev => { ev.currentTarget.style.background="#dc2626"; ev.currentTarget.style.color="white"; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background="#fef2f2"; ev.currentTarget.style.color="#dc2626"; }}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {showAdd && <AddExpenseModal onSave={handleAdd} onCancel={() => setShowAdd(false)} />}
      {viewItem && <ExpenseDetailModal expense={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}

// ─── TAB: REPORTS ─────────────────────────────────────────────────────────────
function ReportsTab({ vendorPayouts, riderPayouts, expenses }) {
  const [period, setPeriod] = useState(PERIODS[0]);

  const vPaid = vendorPayouts.filter(v => v.status === "Paid");
  const rPaid = riderPayouts.filter(r => r.status === "Paid");
  const vPending = vendorPayouts.filter(v => v.status === "Pending");
  const rPending = riderPayouts.filter(r => r.status === "Pending");

  const totalVendorPaid    = vPaid.reduce((a, v) => a + v.netPayable, 0);
  const totalRiderPaid     = rPaid.reduce((a, v) => a + v.netPayable, 0);
  const totalVendorPending = vPending.reduce((a, v) => a + v.netPayable, 0);
  const totalRiderPending  = rPending.reduce((a, v) => a + v.netPayable, 0);
  const totalExpenses      = expenses.reduce((a, e) => a + e.amount, 0);
  const totalFees          = vendorPayouts.reduce((a, v) => a + v.platformFee, 0) + riderPayouts.reduce((a, r) => a + r.platformCut, 0);

  const rows = [
    { label: "Platform Fees Collected",       value: totalFees,          type: "income" },
    { label: "Vendor Payouts — Paid",          value: totalVendorPaid,    type: "debit" },
    { label: "Rider Payouts — Paid",           value: totalRiderPaid,     type: "debit" },
    { label: "Vendor Payouts — Pending",       value: totalVendorPending, type: "pending" },
    { label: "Rider Payouts — Pending",        value: totalRiderPending,  type: "pending" },
    { label: "Total Expenses Logged",          value: totalExpenses,      type: "debit" },
    { label: "Net (Revenue − Paid − Expenses)", value: totalFees - totalVendorPaid - totalRiderPaid - totalExpenses, type: "net" },
  ];

  return (
    <div>
      <SectionHeader title="Financial Reports" sub="Cumulative summary across all periods" />

      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: "8px 18px", borderRadius: 50, border: "1.5px solid", borderColor: period === p ? "#1e3a5f" : "#e2e8f0", background: period === p ? "#1e3a5f" : "white", color: period === p ? "white" : "#64748b", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>{p}</button>
        ))}
      </div>

      {/* Summary table */}
      <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #f1f5f9", background: "#f8fafc" }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#0f172a", margin: 0 }}>Consolidated Statement</h3>
        </div>
        <div style={{ padding: "8px 0" }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: row.type === "net" ? "14px 22px" : "11px 22px", borderTop: row.type === "net" ? "2px solid #e2e8f0" : "none", background: row.type === "net" ? "#f8fafc" : "transparent" }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: row.type === "net" ? 14 : 13, color: row.type === "net" ? "#0f172a" : "#475569", fontWeight: row.type === "net" ? 800 : 500 }}>{row.label}</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: row.type === "net" ? 18 : 14, color: row.type === "income" ? "#059669" : row.type === "pending" ? "#f59e0b" : row.type === "net" ? (row.value >= 0 ? "#059669" : "#dc2626") : "#be185d" }}>
                {row.type === "income" ? "+" : row.type === "pending" ? "~" : ""}{fmt(Math.abs(row.value))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Per-Vendor Breakdown</h3>
          </div>
          <div style={{ padding: "0" }}>
            {Object.entries(vendorPayouts.reduce((acc, v) => {
              if (!acc[v.vendor]) acc[v.vendor] = { paid: 0, pending: 0, fee: 0 };
              acc[v.vendor].fee += v.platformFee;
              if (v.status === "Paid") acc[v.vendor].paid += v.netPayable;
              else if (v.status === "Pending") acc[v.vendor].pending += v.netPayable;
              return acc;
            }, {})).map(([name, data], i, arr) => (
              <div key={name} style={{ padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{name}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8" }}>Fee: {fmt(data.fee)}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#059669", fontWeight: 700 }}>✅ Paid: {fmt(data.paid)}</span>
                  {data.pending > 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>⏳ Pending: {fmt(data.pending)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Per-Rider Breakdown</h3>
          </div>
          {Object.entries(riderPayouts.reduce((acc, r) => {
            if (!acc[r.rider]) acc[r.rider] = { paid: 0, pending: 0, cut: 0 };
            acc[r.rider].cut += r.platformCut;
            if (r.status === "Paid") acc[r.rider].paid += r.netPayable;
            else acc[r.rider].pending += r.netPayable;
            return acc;
          }, {})).map(([name, data], i, arr) => (
            <div key={name} style={{ padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{name}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8" }}>Cut: {fmt(data.cut)}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#059669", fontWeight: 700 }}>✅ Paid: {fmt(data.paid)}</span>
                {data.pending > 0 && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>⏳ Pending: {fmt(data.pending)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", icon: "◉",  label: "Overview"       },
  { id: "sales",    icon: "🛒", label: "Sales"          },
  { id: "vendors",  icon: "🏪", label: "Vendor Payouts" },
  { id: "riders",   icon: "🏍️",label: "Rider Payouts"  },
  { id: "expenses", icon: "📉", label: "Expenses"       },
  { id: "reports",  icon: "📊", label: "Reports"        },
];

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function AccountingDashboard({ adminName = "Bello Musa", onExit }) {
  const [tab, setTab]                   = useState("overview");
  const [vendorPayouts, setVendorPayouts] = useState(seedVendorPayouts);
  const [riderPayouts, setRiderPayouts]   = useState(seedRiderPayouts);
  const [expenses, setExpenses]           = useState(seedExpenses);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const initials = adminName.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const pendingVendorTotal = vendorPayouts.filter(v=>v.status==="Pending").reduce((a,v)=>a+v.netPayable,0);
  const pendingRiderTotal  = riderPayouts.filter(r=>r.status==="Pending").reduce((a,r)=>a+r.netPayable,0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes acIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #94a3b8; }
        select option { color: #1e293b; background: white; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Mobile overlay */}
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside style={{
          width: 248, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0,
          position: isMobile ? "fixed" : "sticky", top: 0, height: "100vh", overflowY: "auto",
          left: isMobile ? (sidebarOpen ? 0 : -248) : 0,
          transition: isMobile ? "left 0.28s cubic-bezier(.34,1.2,.64,1)" : "none",
          zIndex: isMobile ? 200 : "auto",
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍊</div>
              <div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white" }}>Chop<span style={{ color: "#f97316" }}>Spot</span></span>
                <p style={{ margin: 0, fontSize: 10, color: "#64748b", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Finance Console</p>
              </div>
            </div>
            {/* Role badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 50, padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>Finance Manager</span>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#475569", textTransform: "uppercase", margin: "0 0 10px" }}>At a Glance</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#7dd3fc" }}>Total sales</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#bae6fd" }}>{fmt(seedAllSales.filter(s=>s.status==="Delivered").reduce((a,s)=>a+s.amount,0))}</span>
              </div>
              <div style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#a78bfa" }}>Vendor payouts</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#c4b5fd" }}>{fmt(pendingVendorTotal)}</span>
              </div>
              <div style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#fb923c" }}>Rider payouts</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#fed7aa" }}>{fmt(pendingRiderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "14px 12px" }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#475569", textTransform: "uppercase", padding: "0 8px", margin: "0 0 8px" }}>Navigation</p>
            {NAV_ITEMS.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                  border: "none", background: active ? "rgba(245,158,11,0.15)" : "transparent",
                  color: active ? "#fbbf24" : "#94a3b8", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 700 : 500, fontSize: 14,
                  marginBottom: 2, transition: "all 0.18s", textAlign: "left",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}}
                >
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />}
                </button>
              );
            })}
          </nav>

          {/* Profile */}
          <div style={{ padding: "14px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Avatar initials={initials} size={34} gradient="linear-gradient(135deg,#92400e,#f59e0b)" />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Finance Manager</p>
              </div>
            </div>
            {onExit && (
              <button onClick={onExit} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                ← Back to App
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <header style={{ background: "white", borderBottom: "1.5px solid #e2e8f0", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: isMobile ? "flex" : "none", alignItems: "center" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
                  {NAV_ITEMS.find(n => n.id === tab)?.label || "Accounting"}
                </h1>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", margin: 0 }}>ChopSpot Finance Console · All figures in ₦</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 50, padding: "5px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, color: "#92400e" }}>Finance Manager</span>
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              {/* Avatar */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#92400e,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", cursor: "pointer", border: "2px solid #fef08a" }}>
                {initials}
              </div>
            </div>
          </header>

          {/* Page */}
          <main style={{ flex: 1, padding: "28px 24px 48px", overflowY: "auto", animation: "acIn 0.3s ease both" }} key={tab}>
            {tab === "overview" && <OverviewTab vendorPayouts={vendorPayouts} riderPayouts={riderPayouts} expenses={expenses} />}
            {tab === "sales"    && <SalesTab />}
            {tab === "vendors"  && <VendorPayoutsTab payouts={vendorPayouts} setPayouts={setVendorPayouts} />}
            {tab === "riders"   && <RiderPayoutsTab  payouts={riderPayouts}  setPayouts={setRiderPayouts} />}
            {tab === "expenses" && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
            {tab === "reports"  && <ReportsTab vendorPayouts={vendorPayouts} riderPayouts={riderPayouts} expenses={expenses} />}
          </main>
        </div>
      </div>
    </>
  );
}