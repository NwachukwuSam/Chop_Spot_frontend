// AdminDashboard.jsx – TastyCart Admin Console
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, orderApi } from "../utils/Api";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const NAV_ITEMS = [
  { id: "overview", icon: "◉",  label: "Overview"  },
  { id: "vendors",  icon: "🏪", label: "Vendors"   },
  { id: "riders",   icon: "🏍️", label: "Riders"    },
  { id: "orders",   icon: "🛒", label: "Orders"    },
  { id: "users",    icon: "👥", label: "All Users" },
  { id: "reports",  icon: "📊", label: "Reports"   },
];

const VENDOR_REG_ROUTE = "/vendor-registration";
const RIDER_REG_ROUTE  = "/rider-registration";

// Success Modal Component
const SuccessModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "32px",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}>Success!</h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#64748b",
          marginBottom: 24,
        }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

// Error Modal Component
const ErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "white",
        borderRadius: 24,
        padding: "32px",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}>Error</h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#64748b",
          marginBottom: 24,
        }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

// ── auth helpers ──────────────────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem("chopspot_token") || 
                localStorage.getItem("adminToken") || 
                sessionStorage.getItem("adminToken") || 
                "";
  console.log("🔑 Token retrieved:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
  return token;
};

const apiFetch = async (url, options = {}) => {
  const token = getToken();
  console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
  
  if (!token) {
    console.error("❌ No token available for API call!");
    throw new Error("AUTH_ERROR:401");
  }
  
  const res = await fetch(url, {
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}`
    },
    ...options,
  });
  
  console.log(`📡 Response status: ${res.status}`);
  
  if (res.status === 401 || res.status === 403) {
    console.error(`❌ Auth error: ${res.status}`);
    // Clear invalid tokens
    localStorage.removeItem("chopspot_token");
    localStorage.removeItem("adminToken");
    throw new Error(`AUTH_ERROR:${res.status}`);
  }
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API Error (${res.status}):`, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
  
  const data = await res.json();
  console.log(`✅ API Response for ${url}:`, data);
  return data;
};

// ── badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    APPROVED:  { bg: "#d1fae5", color: "#059669", dot: "#10b981" },
    Active:    { bg: "#d1fae5", color: "#059669", dot: "#10b981" },
    Online:    { bg: "#d1fae5", color: "#059669", dot: "#10b981" },
    DELIVERED: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
    PENDING:   { bg: "#fef3c7", color: "#b45309", dot: "#f59e0b" },
    Pending:   { bg: "#fef3c7", color: "#b45309", dot: "#f59e0b" },
    SUSPENDED: { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status || "Pending"}
    </span>
  );
};

const ActionBtn = ({ label, color, onClick }) => (
  <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: color, color: "white", fontWeight: 700, fontSize: 11, fontFamily: "'DM Sans',sans-serif", transition: "opacity 0.15s, transform 0.15s", boxShadow: `0 2px 8px ${color}55` }}
    onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
  >{label}</button>
);

const AuthNotice = ({ code }) => (
  <div style={{ margin: 24, padding: "18px 20px", borderRadius: 14, background: "#fff7ed", border: "1.5px solid #fed7aa", display: "flex", gap: 12 }}>
    <span style={{ fontSize: 22 }}>🔐</span>
    <div>
      <p style={{ fontWeight: 700, color: "#c2410c", margin: "0 0 4px", fontSize: 14 }}>
        {code === "401" ? "Session Expired" : "Access Denied (403)"}
      </p>
      <p style={{ color: "#9a3412", fontSize: 13, margin: 0, lineHeight: 1.55 }}>
        Your admin token doesn't have permission for this resource, or it has expired. Please log out and log back in. If the problem persists, verify your account has the <strong>ADMIN</strong> role.
      </p>
    </div>
  </div>
);

const Empty = ({ icon, msg }) => (
  <div style={{ padding: "60px 20px", textAlign: "center" }}>
    <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
    <p style={{ color: "#94a3b8", fontSize: 14 }}>{msg}</p>
  </div>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: "10px 14px 10px 38px", borderRadius: 50, border: "1.5px solid #e2e8f0", background: "white", fontSize: 13, color: "#334155", outline: "none", fontFamily: "'DM Sans',sans-serif", width: 260, transition: "border-color 0.2s, box-shadow 0.2s" }}
      onFocus={e => { e.target.style.borderColor = "#1a5c1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,26,0.1)"; }}
      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const td = { padding: "14px 20px", fontSize: 13, color: "#334155", verticalAlign: "middle" };

const DataTable = ({ cols, children, empty }) => (
  <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
            {cols.map(c => (
              <th key={c} style={{ padding: "13px 20px", textAlign: ["Amount"].includes(c) ? "right" : ["Status","Actions"].includes(c) ? "center" : "left", fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: 0.7, textTransform: "uppercase", whiteSpace: "nowrap" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!children || (Array.isArray(children) && children.length === 0))
            ? <tr><td colSpan={cols.length}>{empty}</td></tr>
            : children}
        </tbody>
      </table>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1.5px solid #e2e8f0" }}>
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, opacity: 1 - i * 0.15 }}>
        {[...Array(5)].map((_, j) => (
          <div key={j} style={{ height: 14, borderRadius: 7, background: "#f1f5f9", flex: j === 0 ? 2 : 1, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════
// Overview Tab
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ overview, navigate }) => {
  const stats = [
    { label: "Total Customers", value: overview.totalCustomers   || 0, color: "#3b82f6", icon: "👤", bg: "#eff6ff" },
    { label: "Total Vendors",   value: overview.totalVendors     || 0, color: "#10b981", icon: "🏪", bg: "#f0fdf4" },
    { label: "Total Riders",    value: overview.totalRiders      || 0, color: "#f59e0b", icon: "🏍️", bg: "#fffbeb" },
    { label: "Total Orders",    value: overview.totalOrders      || 0, color: "#8b5cf6", icon: "📦", bg: "#f5f3ff" },
    { label: "Pending Orders",  value: overview.pendingOrders    || 0, color: "#f97316", icon: "⏳", bg: "#fff7ed" },
    { label: "Delivered",       value: overview.deliveredOrders  || 0, color: "#22c55e", icon: "✅", bg: "#f0fdf4" },
    { label: "Online Riders",   value: overview.onlineRiders     || 0, color: "#eab308", icon: "🌐", bg: "#fefce8" },
    { label: "Total Revenue",   value: fmt(overview.totalRevenue || 0), color: "#ef4444", icon: "💰", bg: "#fef2f2" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Quick register cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { icon: "🏪", title: "Onboard a Vendor", sub: "Register a new restaurant partner", bg: "#1a5c1a", accent: "#f5920a", path: VENDOR_REG_ROUTE },
          { icon: "🏍️", title: "Onboard a Rider",  sub: "Register a new delivery rider",     bg: "#1d4ed8", accent: "#60a5fa", path: RIDER_REG_ROUTE  },
        ].map(({ icon, title, sub, bg, accent, path }) => (
          <div key={path} onClick={() => navigate(path)} style={{ background: `linear-gradient(135deg,${bg} 0%,${bg}dd 100%)`, borderRadius: 20, padding: "22px 24px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: `0 8px 28px ${bg}44`, transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 14px 36px ${bg}55`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 8px 28px ${bg}44`; }}>
            <div style={{ position: "absolute", right: -18, top: -18, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: "#fff", fontSize: 17, margin: "0 0 4px" }}>{title}</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "0 0 16px" }}>{sub}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: accent, borderRadius: 50, padding: "7px 18px", color: "white", fontSize: 12, fontWeight: 800 }}>Register Now →</div>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 18, padding: "18px 20px", border: "1.5px solid #f1f5f9", boxShadow: "0 2px 14px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.04)"; }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, margin: "3px 0 0", color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Vendors Tab
// ════════════════════════════════════════════════════════════
const VendorsTab = ({ navigate }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState(null);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({ show: false, type: "", message: "" });

  const showSuccessModal = (message) => {
    setModalState({ show: true, type: "success", message });
    setTimeout(() => {
      setModalState({ show: false, type: "", message: "" });
    }, 3000);
  };

  const showErrorModal = (message) => {
    setModalState({ show: true, type: "error", message });
  };

  const closeModal = () => {
    setModalState({ show: false, type: "", message: "" });
  };

  const load = useCallback(async () => {
    setLoading(true); 
    setAuthErr(null);
    try {
      const data = await adminApi.getVendors();
      console.log("🔍 Raw vendors data:", data);
      
      let vendorsArray = [];
      if (Array.isArray(data)) {
        vendorsArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        vendorsArray = data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        vendorsArray = data.results;
      } else if (data?.vendors && Array.isArray(data.vendors)) {
        vendorsArray = data.vendors;
      } else {
        vendorsArray = [];
      }
      
      console.log("📋 Processed vendors:", vendorsArray);
      setVendors(vendorsArray);
    } catch (err) {
      console.error("❌ Error loading vendors:", err);
      if (err.message?.startsWith("AUTH_ERROR:")) {
        setAuthErr(err.message.split(":")[1]);
      }
      showErrorModal("Failed to load vendors: " + err.message);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

const action = async (id, type) => {
  if (!id) { showErrorModal("Invalid vendor ID"); return; }
  try {
    if (type === "approve") {
      await adminApi.approveVendor(id);
    } else if (type === "suspend") {
      await adminApi.suspendVendor(id);
    }
    await load();
    showSuccessModal(`Vendor ${type === "approve" ? "approved" : "suspended"} successfully!`);
  } catch (err) {
    console.error(`Failed to ${type} vendor:`, err);
    showErrorModal(`Failed to ${type} vendor: ${err.message}`);
  }
};
  if (authErr) return <AuthNotice code={authErr} />;
  if (loading) return <TableSkeleton />;

  const getRestaurantName = (vendor) => vendor.restaurantName || vendor.name || vendor.businessName || "Unnamed Restaurant";
  const getOwnerName = (vendor) => vendor.ownerName || vendor.owner || vendor.contactPerson || "—";
  const getCategory = (vendor) => vendor.category || vendor.cuisine || "—";
  const getStatus = (vendor) => vendor.status || vendor.approvalStatus || "Pending";
  const getJoinedDate = (vendor) => vendor.joined || (vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "—");

  const filtered = vendors.filter(vendor => {
    const name = getRestaurantName(vendor).toLowerCase();
    const owner = getOwnerName(vendor).toLowerCase();
    const searchTerm = search.toLowerCase();
    return name.includes(searchTerm) || owner.includes(searchTerm);
  });

  return (
    <>
      {modalState.show && modalState.type === "success" && <SuccessModal isOpen={true} message={modalState.message} onClose={closeModal} />}
      {modalState.show && modalState.type === "error" && <ErrorModal isOpen={true} message={modalState.message} onClose={closeModal} />}
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search vendors by name or owner…" />
          <button onClick={() => navigate(VENDOR_REG_ROUTE)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,92,26,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
            🏪 + Register Vendor
          </button>
        </div>
        
        {vendors.length === 0 ? (
          <Empty icon="🏪" msg="No vendors found. Click 'Register Vendor' to add one." />
        ) : (
          <DataTable cols={["Restaurant", "Owner", "Category", "Joined", "Status", "Actions"]} empty={<Empty icon="🏪" msg="No matching vendors" />}>
            {filtered.map((vendor, i) => (
              <tr key={vendor.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={td}><span style={{ fontWeight: 700 }}>{getRestaurantName(vendor)}</span></td>
                <td style={td}>{getOwnerName(vendor)}</td>
                <td style={td}><span style={{ background: "#f1f5f9", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>{getCategory(vendor)}</span></td>
                <td style={td}>{getJoinedDate(vendor)}</td>
                <td style={{ ...td, textAlign: "center" }}><Badge status={getStatus(vendor)} /></td>
                <td style={{ ...td, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {getStatus(vendor) !== "APPROVED" && getStatus(vendor) !== "Active" && (
                      <ActionBtn label="✓ Approve" color="#10b981" onClick={() => action(vendor.id, "approve")} />
                    )}
                    <ActionBtn label="Suspend" color="#ef4444" onClick={() => action(vendor.id, "suspend")} />
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// Riders Tab
// ════════════════════════════════════════════════════════════
const RidersTab = ({ navigate }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState(null);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({ show: false, type: "", message: "" });

  const showSuccessModal = (message) => {
    setModalState({ show: true, type: "success", message });
    setTimeout(() => {
      setModalState({ show: false, type: "", message: "" });
    }, 3000);
  };

  const showErrorModal = (message) => {
    setModalState({ show: true, type: "error", message });
  };

  const closeModal = () => {
    setModalState({ show: false, type: "", message: "" });
  };

  const load = useCallback(async () => {
    setLoading(true); 
    setAuthErr(null);
    try {
      const data = await adminApi.getRiders();
      console.log("🔍 Raw riders data:", data);
      
      let ridersArray = [];
      if (Array.isArray(data)) {
        ridersArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        ridersArray = data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        ridersArray = data.results;
      } else if (data?.riders && Array.isArray(data.riders)) {
        ridersArray = data.riders;
      } else {
        ridersArray = [];
      }
      
      console.log("📋 Processed riders:", ridersArray);
      setRiders(ridersArray);
    } catch (err) {
      console.error("❌ Error loading riders:", err);
      if (err.message?.startsWith("AUTH_ERROR:")) {
        setAuthErr(err.message.split(":")[1]);
      }
      showErrorModal("Failed to load riders: " + err.message);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

const action = async (id, type) => {
  if (!id) { showErrorModal("Invalid rider ID"); return; }
  try {
    if (type === "approve") {
      await adminApi.approveRider(id);
    } else if (type === "suspend") {
      await adminApi.suspendRider(id);
    }
    await load();
    showSuccessModal(`Rider ${type === "approve" ? "approved" : "suspended"} successfully!`);
  } catch (err) {
    console.error(`Failed to ${type} rider:`, err);
    showErrorModal(`Failed to ${type} rider: ${err.message}`);
  }
};
  if (authErr) return <AuthNotice code={authErr} />;
  if (loading) return <TableSkeleton />;

  const getRiderName = (rider) => {
  console.log("🏍️ Rider object:", rider); // ← check console to see real field names
  return (
    rider.riderName ||
    rider.name ||
    rider.fullName ||
    rider.username ||
    rider.firstName && rider.lastName ? `${rider.firstName} ${rider.lastName}`.trim() : null ||
    rider.firstName ||
    rider.lastName ||
    rider.email?.split("@")[0] ||   // fallback: use email prefix
    "Unnamed Rider"
  );
};
  const getVehicle = (rider) => rider.vehicleType || rider.vehicle || "—";
  const getZone = (rider) => rider.deliveryZone || rider.zone || rider.area || "—";
  const getStatus = (rider) => rider.status || rider.approvalStatus || "Pending";
  const getJoinedDate = (rider) => rider.joined || (rider.createdAt ? new Date(rider.createdAt).toLocaleDateString() : "—");

  const filtered = riders.filter(rider => {
    const name = getRiderName(rider).toLowerCase();
    const vehicle = getVehicle(rider).toLowerCase();
    const searchTerm = search.toLowerCase();
    return name.includes(searchTerm) || vehicle.includes(searchTerm);
  });

  return (
    <>
      {modalState.show && modalState.type === "success" && <SuccessModal isOpen={true} message={modalState.message} onClose={closeModal} />}
      {modalState.show && modalState.type === "error" && <ErrorModal isOpen={true} message={modalState.message} onClose={closeModal} />}
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search riders by name or vehicle…" />
          <button onClick={() => navigate(RIDER_REG_ROUTE)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 16px rgba(59,130,246,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
            🏍️ + Register Rider
          </button>
        </div>
        
        {riders.length === 0 ? (
          <Empty icon="🏍️" msg="No riders found. Click 'Register Rider' to add one." />
        ) : (
          <DataTable cols={["Rider Name", "Vehicle", "Zone", "Joined", "Status", "Actions"]} empty={<Empty icon="🏍️" msg="No matching riders" />}>
            {filtered.map((rider, i) => (
              <tr key={rider.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                      {getRiderName(rider)[0]?.toUpperCase() || "?"}
                    </div>
                    <span style={{ fontWeight: 700 }}>{getRiderName(rider)}</span>
                  </div>
                 </td>
                <td style={td}><span style={{ background: "#f1f5f9", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>{getVehicle(rider)}</span></td>
                <td style={td}>{getZone(rider)}</td>
                <td style={td}>{getJoinedDate(rider)}</td>
                <td style={{ ...td, textAlign: "center" }}><Badge status={getStatus(rider)} /></td>
                <td style={{ ...td, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {getStatus(rider) !== "APPROVED" && getStatus(rider) !== "Active" && getStatus(rider) !== "Online" && (
                      <ActionBtn label="✓ Approve" color="#10b981" onClick={() => action(rider.id, "approve")} />
                    )}
                    <ActionBtn label="Suspend" color="#ef4444" onClick={() => action(rider.id, "suspend")} />
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// Orders Tab
// ════════════════════════════════════════════════════════════
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setAuthErr(null);
    try {
      const data = await orderApi.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message?.startsWith("AUTH_ERROR:")) setAuthErr(err.message.split(":")[1]);
      else console.error(err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id, status) => {
    try { await orderApi.updateOrderStatus(id, status); load(); }
    catch (err) { if (err.message?.startsWith("AUTH_ERROR:")) setAuthErr(err.message.split(":")[1]); }
  };

  if (authErr) return <AuthNotice code={authErr} />;
  if (loading) return <TableSkeleton />;

  const filtered = orders.filter(o =>
    (o.id || "").toString().includes(search) ||
    (o.customer || o.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID or customer…" />
      <DataTable cols={["Order ID", "Customer", "Vendor", "Amount", "Status", "Actions"]} empty={<Empty icon="🛒" msg="No orders yet" />}>
        {filtered.map((o, i) => (
          <tr key={o.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
            <td style={td}><span style={{ fontFamily: "monospace", fontWeight: 700 }}>#{o.id}</span></td>
            <td style={td}>{o.customer || o.customerName}</td>
            <td style={td}>{o.vendor || o.vendorName}</td>
            <td style={{ ...td, textAlign: "right", fontWeight: 800, color: "#1a5c1a" }}>{fmt(o.totalAmount || o.amount || 0)}</td>
            <td style={{ ...td, textAlign: "center" }}><Badge status={o.status} /></td>
            <td style={{ ...td, textAlign: "center" }}>
              {o.status !== "DELIVERED" && <ActionBtn label="Mark Delivered" color="#10b981" onClick={() => update(o.id, "DELIVERED")} />}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
};

const UsersTab = () => <div style={{ background: "white", borderRadius: 20, padding: "60px 40px", textAlign: "center", border: "1.5px solid #e2e8f0" }}><div style={{ fontSize: 52, marginBottom: 16 }}>👥</div><h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: "#0f172a" }}>All Platform Users</h3><p style={{ color: "#64748b", marginTop: 8 }}>Full user list and management coming soon.</p></div>;
const ReportsTab = () => <div style={{ background: "white", borderRadius: 20, padding: "60px 40px", textAlign: "center", border: "1.5px solid #e2e8f0" }}><div style={{ fontSize: 52, marginBottom: 16 }}>📊</div><h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: "#0f172a" }}>Admin Reports</h3><p style={{ color: "#64748b", marginTop: 8 }}>Analytics and platform reports coming soon.</p></div>;

// ════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════
export default function AdminDashboard({ adminName = "Admin", onExit }) {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("chopspot_token") || localStorage.getItem("adminToken");
      
      console.log("🔐 Auth check - Token exists:", !!token);
      
      if (!token) {
        console.error("No token found, redirecting to login");
        navigate("/login");
        return;
      }
      
      // Verify user data from localStorage
      const userStr = localStorage.getItem("chopspot_user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("✅ User data from localStorage:", userData);
          
          // Check if user has admin role
          const hasAdminRole = userData.roles && 
            (userData.roles.includes("ADMIN") || userData.roles.includes("SUPER_ADMIN"));
          
          if (!hasAdminRole) {
            console.warn("⚠️ User does not have admin role. Roles:", userData.roles);
            // Clear tokens and redirect
            localStorage.removeItem("chopspot_token");
            localStorage.removeItem("adminToken");
            navigate("/login");
            return;
          }
        } catch (err) {
          console.warn("⚠️ Error parsing user data:", err.message);
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch overview data
  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try { 
        console.log("📡 Fetching admin overview...");
        const d = await adminApi.getOverview(); 
        console.log("✅ Overview data received:", d);
        setOverview(d); 
      } catch (e) { 
        console.error("❌ Overview error:", e);
        if (e.status === 401 || e.status === 403 || e.message?.includes("AUTH_ERROR")) {
          console.log("🔐 Auth error, clearing tokens and redirecting...");
          localStorage.removeItem("chopspot_token");
          localStorage.removeItem("adminToken");
          navigate("/login");
        }
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchOverview();
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes acIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:10px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'DM Sans',sans-serif" }}>
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 199, backdropFilter: "blur(2px)" }} onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside style={{ width: 256, background: "linear-gradient(180deg,#0d1f0d 0%,#112211 60%,#0f1f0f 100%)", display: "flex", flexDirection: "column", flexShrink: 0, position: isMobile ? "fixed" : "sticky", top: 0, height: "100vh", overflowY: "auto", left: isMobile ? (sidebarOpen ? 0 : -256) : 0, transition: isMobile ? "left 0.3s" : "none", zIndex: isMobile ? 200 : "auto", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 14px rgba(26,92,26,0.4)" }}>🛒</div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "white" }}>Tasty<span style={{ color: "#f5920a" }}>cart</span></div>
                <div style={{ fontSize: 9, color: "#4a7a4a", letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase" }}>Admin Console</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "14px 14px 4px" }}>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.8, color: "#3a6a3a", textTransform: "uppercase", padding: "0 6px", margin: "0 0 8px" }}>Quick Register</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Vendor", icon: "🏪", path: VENDOR_REG_ROUTE, color: "#1a5c1a" },
                { label: "Rider", icon: "🏍️", path: RIDER_REG_ROUTE, color: "#1d4ed8" },
              ].map(({ label, icon, path, color }) => (
                <button key={path} onClick={() => navigate(path)} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${color}cc,${color})`, color: "white", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: `0 4px 14px ${color}55`, transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  <span style={{ fontSize: 18 }}>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          <nav style={{ flex: 1, padding: "14px 12px 10px" }}>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.8, color: "#3a6a3a", textTransform: "uppercase", padding: "0 6px", margin: "0 0 8px" }}>Navigation</p>
            {NAV_ITEMS.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "none", background: active ? "linear-gradient(135deg,rgba(245,146,10,0.18),rgba(26,92,26,0.2))" : "transparent", color: active ? "#f5920a" : "#5a8a5a", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 700 : 500, fontSize: 13.5, marginBottom: 2, transition: "all 0.18s", textAlign: "left", borderLeft: active ? "3px solid #f5920a" : "3px solid transparent" }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f5920a" }} />}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "14px 16px 22px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1a5c1a,#f5920a)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
                {adminName[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#4a7a4a" }}>Platform Admin</p>
              </div>
            </div>
            {onExit && (
              <button onClick={onExit} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#5a8a5a", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back to App</button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ background: "white", borderBottom: "1.5px solid #e8edf2", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {isMobile && (
                <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              )}
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
                  {NAV_ITEMS.find(n => n.id === tab)?.icon} {NAV_ITEMS.find(n => n.id === tab)?.label}
                </h1>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                  {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate(VENDOR_REG_ROUTE)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 3px 12px rgba(26,92,26,0.25)" }}>🏪 Vendor</button>
              <button onClick={() => navigate(RIDER_REG_ROUTE)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 3px 12px rgba(59,130,246,0.25)" }}>🏍️ Rider</button>
            </div>
          </header>

          <main style={{ flex: 1, padding: "28px 28px 56px", overflowY: "auto", animation: "acIn 0.3s ease both" }} key={tab}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>Loading TastyCart Console…</p>
              </div>
            ) : (
              <>
                {tab === "overview" && <OverviewTab overview={overview} navigate={navigate} />}
                {tab === "vendors" && <VendorsTab navigate={navigate} />}
                {tab === "riders" && <RidersTab navigate={navigate} />}
                {tab === "orders" && <OrdersTab />}
                {tab === "users" && <UsersTab />}
                {tab === "reports" && <ReportsTab />}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}