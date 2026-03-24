// SuperAdminDashboard.jsx
import { useState, useEffect } from "react";
import { adminApi } from "../utils/Api";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const NAV_ITEMS = [
    { id: "overview", icon: "◉", label: "Overview" },
    { id: "vendors", icon: "🏪", label: "Vendors" },
    { id: "riders", icon: "🏍️", label: "Riders" },
    { id: "admins", icon: "🛡️", label: "Admins" },
    { id: "users", icon: "👥", label: "All Users" },
    { id: "reports", icon: "📊", label: "Reports" },
];

// ──────────────────────────────────────────────
// Overview Tab
// ──────────────────────────────────────────────
const OverviewTab = ({ overview }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                    { label: "Total Customers", value: overview.totalCustomers || 0, color: "#3b82f6", icon: "👤" },
                    { label: "Total Vendors", value: overview.totalVendors || 0, color: "#10b981", icon: "🏪" },
                    { label: "Total Riders", value: overview.totalRiders || 0, color: "#f59e0b", icon: "🏍️" },
                    { label: "Total Orders", value: overview.totalOrders || 0, color: "#8b5cf6", icon: "📦" },
                    { label: "Pending Orders", value: overview.pendingOrders || 0, color: "#f97316", icon: "⏳" },
                    { label: "Delivered Orders", value: overview.deliveredOrders || 0, color: "#22c55e", icon: "✅" },
                    { label: "Online Riders", value: overview.onlineRiders || 0, color: "#eab308", icon: "🌐" },
                    { label: "Total Revenue", value: fmt(overview.totalRevenue || 0), color: "#ef4444", icon: "💰" },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 18, padding: 20, border: "1.5px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontSize: 28 }}>{stat.icon}</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{stat.label}</p>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 32, margin: "4px 0 0", color: stat.color }}>
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────
// Vendors Tab - Full rich table
// ──────────────────────────────────────────────
const VendorsTab = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadVendors = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getVendors();
            setVendors(Array.isArray(data) ? data : data?.data || data?.results || []);
        } catch (err) {
            console.error("Failed to load vendors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    const handleApprove = async (id) => {
        try {
            await fetch(`/api/admin/vendors/${id}/approve`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
            });
            loadVendors();
            alert("Vendor approved successfully");
        } catch (e) {
            alert("Failed to approve vendor");
        }
    };

    const handleSuspend = async (id) => {
        try {
            await fetch(`/api/admin/vendors/${id}/suspend`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
            });
            loadVendors();
            alert("Vendor suspended");
        } catch (e) {
            alert("Failed to suspend vendor");
        }
    };

    if (loading) return <div style={{ padding: 80, textAlign: "center", color: "#64748b" }}>Loading vendors...</div>;

    return (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Restaurant</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Owner</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Category</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Joined</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {vendors.map((v, i) => (
                    <tr key={v.id || i} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "16px 20px", fontWeight: 600 }}>{v.restaurantName || v.name}</td>
                        <td style={{ padding: "16px 20px" }}>{v.ownerName || v.owner || "—"}</td>
                        <td style={{ padding: "16px 20px" }}>{v.category || "—"}</td>
                        <td style={{ padding: "16px 20px" }}>{v.joined || "—"}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                <span
                    style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: (v.status === "APPROVED" || v.status === "Active") ? "#d1fae5" : "#fef3c7",
                        color: (v.status === "APPROVED" || v.status === "Active") ? "#10b981" : "#d97706",
                    }}
                >
                  {v.status || "Pending"}
                </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            {v.status !== "APPROVED" && (
                                <button
                                    onClick={() => handleApprove(v.id)}
                                    style={{
                                        marginRight: 8,
                                        padding: "6px 14px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontSize: 13,
                                    }}
                                >
                                    Approve
                                </button>
                            )}
                            <button
                                onClick={() => handleSuspend(v.id)}
                                style={{
                                    padding: "6px 14px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                }}
                            >
                                Suspend
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// ──────────────────────────────────────────────
// Riders Tab - Full rich table
// ──────────────────────────────────────────────
const RidersTab = () => {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRiders = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getRiders();
            setRiders(Array.isArray(data) ? data : data?.data || data?.results || []);
        } catch (err) {
            console.error("Failed to load riders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRiders();
    }, []);

    const handleApprove = async (id) => {
        try {
            await fetch(`/api/admin/riders/${id}/approve`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
            });
            loadRiders();
            alert("Rider approved");
        } catch (e) {
            alert("Failed to approve");
        }
    };

    const handleSuspend = async (id) => {
        try {
            await fetch(`/api/admin/riders/${id}/suspend`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
            });
            loadRiders();
            alert("Rider suspended");
        } catch (e) {
            alert("Failed to suspend");
        }
    };

    if (loading) return <div style={{ padding: 80, textAlign: "center", color: "#64748b" }}>Loading riders...</div>;

    return (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Rider Name</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Vehicle</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Zone</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Joined</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {riders.map((r, i) => (
                    <tr key={r.id || i} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "16px 20px", fontWeight: 600 }}>{r.riderName || r.name}</td>
                        <td style={{ padding: "16px 20px" }}>{r.vehicleType || r.vehicle || "—"}</td>
                        <td style={{ padding: "16px 20px" }}>{r.deliveryZone || r.zone || "—"}</td>
                        <td style={{ padding: "16px 20px" }}>{r.joined || "—"}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                <span
                    style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: (r.status === "APPROVED" || r.status === "Online") ? "#d1fae5" : "#fef3c7",
                        color: (r.status === "APPROVED" || r.status === "Online") ? "#10b981" : "#d97706",
                    }}
                >
                  {r.status || "Pending"}
                </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            {r.status !== "APPROVED" && (
                                <button
                                    onClick={() => handleApprove(r.id)}
                                    style={{
                                        marginRight: 8,
                                        padding: "6px 14px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontSize: 13,
                                    }}
                                >
                                    Approve
                                </button>
                            )}
                            <button
                                onClick={() => handleSuspend(r.id)}
                                style={{
                                    padding: "6px 14px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                }}
                            >
                                Suspend
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// ──────────────────────────────────────────────
// Admins Tab
// ──────────────────────────────────────────────
const AdminsTab = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdmins = async () => {
            try {
                setLoading(true);
                // Extend Api.js with getAdmins() when you add the endpoint
                setAdmins([]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAdmins();
    }, []);

    if (loading) return <div style={{ padding: 80, textAlign: "center", color: "#64748b" }}>Loading admins...</div>;

    return (
        <div style={{ background: "white", borderRadius: 20, padding: 40, textAlign: "center", border: "1.5px solid #e2e8f0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛡️</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>Admin Management</h3>
            <p style={{ color: "#64748b", marginTop: 12 }}>Create, suspend, and delete other admins here (Super Admin only).</p>
        </div>
    );
};

// ──────────────────────────────────────────────
// All Users Tab
// ──────────────────────────────────────────────
const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                // Extend with real /api/admin/users endpoint when available
                setUsers([]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    if (loading) return <div style={{ padding: 80, textAlign: "center", color: "#64748b" }}>Loading users...</div>;

    return (
        <div style={{ background: "white", borderRadius: 20, padding: 40, textAlign: "center", border: "1.5px solid #e2e8f0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>👥</p>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>All Platform Users</h3>
            <p style={{ color: "#64748b", marginTop: 12 }}>Full user list and management will be available here.</p>
        </div>
    );
};

// ──────────────────────────────────────────────
// Reports Tab
// ──────────────────────────────────────────────
const ReportsTab = () => (
    <div style={{ background: "white", borderRadius: 20, padding: 40, textAlign: "center", border: "1.5px solid #e2e8f0" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>📊</p>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>Super Admin Reports</h3>
        <p style={{ color: "#64748b", marginTop: 12 }}>Platform-wide analytics, revenue reports, and user growth will be available here.</p>
    </div>
);

// ──────────────────────────────────────────────
// MAIN SUPER ADMIN DASHBOARD
// ──────────────────────────────────────────────
export default function SuperAdminDashboard({ adminName = "Super Admin", onExit }) {
    const [tab, setTab] = useState("overview");
    const [overview, setOverview] = useState({});
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await adminApi.getOverview();
                setOverview(data);
            } catch (err) {
                console.error("Failed to load super admin overview:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [tab]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes acIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

            <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif" }}>
                {/* Mobile overlay */}
                {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199 }} onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside
                    style={{
                        width: 248,
                        background: "#0f172a",
                        display: "flex",
                        flexDirection: "column",
                        flexShrink: 0,
                        position: isMobile ? "fixed" : "sticky",
                        top: 0,
                        height: "100vh",
                        overflowY: "auto",
                        left: isMobile ? (sidebarOpen ? 0 : -248) : 0,
                        transition: isMobile ? "left 0.28s cubic-bezier(.34,1.2,.64,1)" : "none",
                        zIndex: isMobile ? 200 : "auto",
                    }}
                >
                    <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
                            <div>
                                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white" }}>Chop<span style={{ color: "#a855f7" }}>Spot</span></span>
                                <p style={{ margin: 0, fontSize: 10, color: "#64748b", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Super Admin Console</p>
                            </div>
                        </div>
                    </div>

                    <nav style={{ flex: 1, padding: "14px 12px" }}>
                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#475569", textTransform: "uppercase", padding: "0 8px", margin: "0 0 8px" }}>Navigation</p>
                        {NAV_ITEMS.map((item) => {
                            const active = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "none",
                                        background: active ? "rgba(167,139,250,0.15)" : "transparent",
                                        color: active ? "#c4b5fd" : "#94a3b8",
                                        cursor: "pointer",
                                        fontFamily: "'DM Sans',sans-serif",
                                        fontWeight: active ? 700 : 500,
                                        fontSize: 14,
                                        marginBottom: 2,
                                        transition: "all 0.18s",
                                        textAlign: "left",
                                    }}
                                >
                                    <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c4b5fd" }} />}
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{ padding: "14px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                }}
                            >
                                SA
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>{adminName}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Super Administrator</p>
                            </div>
                        </div>
                        {onExit && (
                            <button
                                onClick={onExit}
                                style={{
                                    marginTop: 16,
                                    width: "100%",
                                    padding: "9px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.04)",
                                    color: "#94a3b8",
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: "pointer",
                                }}
                            >
                                ← Back to App
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <header
                        style={{
                            background: "white",
                            borderBottom: "1.5px solid #e2e8f0",
                            padding: "0 24px",
                            height: 64,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button
                                onClick={() => setSidebarOpen((o) => !o)}
                                style={{ display: isMobile ? "flex" : "none", background: "none", border: "none", cursor: "pointer" }}
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
                                {NAV_ITEMS.find((n) => n.id === tab)?.label || "Super Admin"}
                            </h1>
                        </div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8" }}>
                            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                    </header>

                    <main style={{ flex: 1, padding: "28px 24px 48px", overflowY: "auto", animation: "acIn 0.3s ease both" }} key={tab}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>Loading Super Admin Console...</div>
                        ) : (
                            <>
                                {tab === "overview" && <OverviewTab overview={overview} />}
                                {tab === "vendors" && <VendorsTab />}
                                {tab === "riders" && <RidersTab />}
                                {tab === "admins" && <AdminsTab />}
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