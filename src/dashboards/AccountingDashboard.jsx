// AccountingDashboard.jsx
import { useState, useEffect } from "react";
import { financeApi, orderApi } from "../utils/Api";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const NAV_ITEMS = [
    { id: "overview", icon: "◉", label: "Overview" },
    { id: "sales", icon: "🛒", label: "Sales" },
    { id: "vendors", icon: "🏪", label: "Vendor Payouts" },
    { id: "riders", icon: "🏍️", label: "Rider Payouts" },
    { id: "expenses", icon: "📉", label: "Expenses" },
    { id: "reports", icon: "📊", label: "Reports" },
];

// ──────────────────────────────────────────────
// Overview Tab
// ──────────────────────────────────────────────
const OverviewTab = ({ overview, vendorPayouts, riderPayouts, expenses }) => {
    const pendingVendor = vendorPayouts.filter((v) => v.status === "PENDING").reduce((a, v) => a + (v.netPayable || 0), 0);
    const pendingRider = riderPayouts.filter((r) => r.status === "PENDING").reduce((a, r) => a + (r.netPayable || 0), 0);
    const totalExpenses = expenses.reduce((a, e) => a + (e.amount || 0), 0);
    const netProfit = (overview.totalPlatformFees || 0) - totalExpenses;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                    { label: "Total Platform Fees", value: fmt(overview.totalPlatformFees || 0), color: "#7c3aed" },
                    { label: "Pending Vendor Payouts", value: fmt(pendingVendor), color: "#f59e0b" },
                    { label: "Pending Rider Payouts", value: fmt(pendingRider), color: "#f97316" },
                    { label: "Total Expenses", value: fmt(totalExpenses), color: "#ef4444" },
                    { label: "Net Profit", value: fmt(netProfit), color: "#10b981" },
                    { label: "Total Orders", value: overview.totalOrders || 0, color: "#3b82f6" },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 18, padding: 20, border: "1.5px solid #e2e8f0" }}>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{stat.label}</p>
                        <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, margin: "8px 0 0", color: stat.color }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                {/* Per-Vendor Breakdown */}
                <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Per-Vendor Breakdown</h3>
                    </div>
                    <div style={{ padding: "0" }}>
                        {Object.entries(
                            vendorPayouts.reduce((acc, v) => {
                                const name = v.vendorName || "Unknown";
                                if (!acc[name]) acc[name] = { paid: 0, pending: 0, fee: 0 };
                                acc[name].fee += v.platformFee || 0;
                                if (v.status === "PAID") acc[name].paid += v.netPayable || 0;
                                else if (v.status === "PENDING") acc[name].pending += v.netPayable || 0;
                                return acc;
                            }, {})
                        ).map(([name, data], i, arr) => (
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

                {/* Per-Rider Breakdown */}
                <div style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
                        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0 }}>Per-Rider Breakdown</h3>
                    </div>
                    <div style={{ padding: "0" }}>
                        {Object.entries(
                            riderPayouts.reduce((acc, r) => {
                                const name = r.riderName || "Unknown";
                                if (!acc[name]) acc[name] = { paid: 0, pending: 0, cut: 0 };
                                acc[name].cut += r.platformCut || 0;
                                if (r.status === "PAID") acc[name].paid += r.netPayable || 0;
                                else acc[name].pending += r.netPayable || 0;
                                return acc;
                            }, {})
                        ).map(([name, data], i, arr) => (
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
        </div>
    );
};

// ──────────────────────────────────────────────
// Vendor Payouts Tab
// ──────────────────────────────────────────────
const VendorPayoutsTab = ({ payouts, setPayouts }) => {
    const handleMarkPaid = async (id) => {
        const ref = prompt("Enter payment reference (optional):");
        try {
            await financeApi.markVendorPaid(id, ref || "");
            const updated = await financeApi.getVendorPayouts();
            setPayouts(updated);
            alert("Vendor payout marked as PAID successfully");
        } catch (e) {
            alert("Failed to mark as paid: " + e.message);
        }
    };

    return (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Vendor</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Period</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Gross Sales</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Platform Fee</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Net Payable</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {payouts.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "16px 20px" }}>{p.id}</td>
                        <td style={{ padding: "16px 20px" }}>{p.vendorName || p.vendor}</td>
                        <td style={{ padding: "16px 20px" }}>{p.period}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>{fmt(p.grossSales)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>{fmt(p.platformFee)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 700 }}>{fmt(p.netPayable)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                <span
                    style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.status === "PAID" ? "#d1fae5" : "#fef3c7",
                        color: p.status === "PAID" ? "#10b981" : "#d97706",
                    }}
                >
                  {p.status}
                </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            {p.status === "PENDING" && (
                                <button
                                    onClick={() => handleMarkPaid(p.id)}
                                    style={{
                                        padding: "8px 20px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// ──────────────────────────────────────────────
// Rider Payouts Tab
// ──────────────────────────────────────────────
const RiderPayoutsTab = ({ payouts, setPayouts }) => {
    const handleMarkPaid = async (id) => {
        const ref = prompt("Enter payment reference (optional):");
        try {
            await financeApi.markRiderPaid(id, ref || "");
            const updated = await financeApi.getRiderPayouts();
            setPayouts(updated);
            alert("Rider payout marked as PAID successfully");
        } catch (e) {
            alert("Failed to mark as paid: " + e.message);
        }
    };

    return (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Rider</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Period</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Gross Earned</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Platform Cut</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Net Payable</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {payouts.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "16px 20px" }}>{p.id}</td>
                        <td style={{ padding: "16px 20px" }}>{p.riderName || p.rider}</td>
                        <td style={{ padding: "16px 20px" }}>{p.period}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>{fmt(p.grossEarned)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>{fmt(p.platformCut)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 700 }}>{fmt(p.netPayable)}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                <span
                    style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.status === "PAID" ? "#d1fae5" : "#fef3c7",
                        color: p.status === "PAID" ? "#10b981" : "#d97706",
                    }}
                >
                  {p.status}
                </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            {p.status === "PENDING" && (
                                <button
                                    onClick={() => handleMarkPaid(p.id)}
                                    style={{
                                        padding: "8px 20px",
                                        background: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// ──────────────────────────────────────────────
// Expenses Tab
// ──────────────────────────────────────────────
const ExpensesTab = ({ expenses, setExpenses }) => {
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await financeApi.deleteExpense(id);
            const updated = await financeApi.getExpenses();
            setExpenses(updated);
        } catch (e) {
            alert("Failed to delete expense: " + e.message);
        }
    };

    return (
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Category</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Amount</th>
                    <th style={{ padding: "16px 20px", textAlign: "left" }}>Added By</th>
                    <th style={{ padding: "16px 20px", textAlign: "center" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {expenses.map((exp, i) => (
                    <tr key={exp.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "16px 20px" }}>{new Date(exp.expenseDate || exp.date).toLocaleDateString()}</td>
                        <td style={{ padding: "16px 20px" }}>{exp.category}</td>
                        <td style={{ padding: "16px 20px" }}>{exp.description}</td>
                        <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 700 }}>{fmt(exp.amount)}</td>
                        <td style={{ padding: "16px 20px" }}>{exp.addedBy}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}
                            >
                                Delete
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
// Sales Tab
// ──────────────────────────────────────────────
const SalesTab = ({ sales }) => {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1.5px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>All Sales ({sales.length} orders)</h3>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                    <thead>
                    <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: "14px 16px", textAlign: "left" }}>Order ID</th>
                        <th style={{ padding: "14px 16px", textAlign: "left" }}>Customer</th>
                        <th style={{ padding: "14px 16px", textAlign: "left" }}>Vendor</th>
                        <th style={{ padding: "14px 16px", textAlign: "left" }}>Date</th>
                        <th style={{ padding: "14px 16px", textAlign: "right" }}>Amount</th>
                        <th style={{ padding: "14px 16px", textAlign: "center" }}>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sales.map((order, i) => (
                        <tr key={order.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>{order.id}</td>
                            <td style={{ padding: "14px 16px" }}>{order.customer}</td>
                            <td style={{ padding: "14px 16px" }}>{order.vendor}</td>
                            <td style={{ padding: "14px 16px" }}>{fmtDate(order.date)}</td>
                            <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700 }}>{fmt(order.amount || order.totalAmount)}</td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <span
                      style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: order.status === "Delivered" ? "#d1fae5" : "#fef3c7",
                          color: order.status === "Delivered" ? "#10b981" : "#d97706",
                      }}
                  >
                    {order.status}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────
// Reports Tab (Placeholder)
// ──────────────────────────────────────────────
const ReportsTab = () => (
    <div style={{ background: "white", borderRadius: 20, padding: 40, textAlign: "center", border: "1.5px solid #e2e8f0" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>📊</p>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>Reports</h3>
        <p style={{ color: "#64748b", marginTop: 12 }}>Advanced analytics and reports coming soon...</p>
    </div>
);

// ──────────────────────────────────────────────
// MAIN ACCOUNTING DASHBOARD
// ──────────────────────────────────────────────
export default function AccountingDashboard({ adminName = "Bello Musa", onExit }) {
    const [tab, setTab] = useState("overview");
    const [vendorPayouts, setVendorPayouts] = useState([]);
    const [riderPayouts, setRiderPayouts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [sales, setSales] = useState([]);
    const [overview, setOverview] = useState({});
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // Load all data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [ov, vp, rp, exp, sl] = await Promise.all([
                    financeApi.getOverview(),
                    financeApi.getVendorPayouts(),
                    financeApi.getRiderPayouts(),
                    financeApi.getExpenses(),
                    orderApi.getAllOrders(),
                ]);

                setOverview(ov);
                setVendorPayouts(vp);
                setRiderPayouts(rp);
                setExpenses(exp);
                setSales(sl);
            } catch (err) {
                console.error("Failed to load accounting data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [tab]);

    const pendingVendorTotal = vendorPayouts.filter((v) => v.status === "PENDING").reduce((a, v) => a + (v.netPayable || 0), 0);
    const pendingRiderTotal = riderPayouts.filter((r) => r.status === "PENDING").reduce((a, r) => a + (r.netPayable || 0), 0);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes acIn { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
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
                    {/* Logo */}
                    <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍊</div>
                            <div>
                                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "white" }}>Chop<span style={{ color: "#f97316" }}>Spot</span></span>
                                <p style={{ margin: 0, fontSize: 10, color: "#64748b", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Finance Console</p>
                            </div>
                        </div>
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
                                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#bae6fd" }}>{fmt(sales.filter((s) => s.status === "Delivered").reduce((a, s) => a + (s.amount || s.totalAmount || 0), 0))}</span>
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

                    {/* Navigation */}
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
                                        background: active ? "rgba(245,158,11,0.15)" : "transparent",
                                        color: active ? "#fbbf24" : "#94a3b8",
                                        cursor: "pointer",
                                        fontFamily: "'DM Sans',sans-serif",
                                        fontWeight: active ? 700 : 500,
                                        fontSize: 14,
                                        marginBottom: 2,
                                        transition: "all 0.18s",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                            e.currentTarget.style.color = "white";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#94a3b8";
                                        }
                                    }}
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
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg,#92400e,#f59e0b)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "white",
                                }}
                            >
                                {adminName
                                    .trim()
                                    .split(" ")
                                    .map((w) => w[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "white" }}>{adminName}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Finance Manager</p>
                            </div>
                        </div>
                        {onExit && (
                            <button
                                onClick={onExit}
                                style={{
                                    width: "100%",
                                    padding: "9px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.04)",
                                    color: "#94a3b8",
                                    fontFamily: "'DM Sans',sans-serif",
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                ← Back to App
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Top bar */}
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
                            gap: 12,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button
                                onClick={() => setSidebarOpen((o) => !o)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4,
                                    display: isMobile ? "flex" : "none",
                                    alignItems: "center",
                                }}
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            <div>
                                <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
                                    {NAV_ITEMS.find((n) => n.id === tab)?.label || "Accounting"}
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
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg,#92400e,#f59e0b)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "white",
                                    fontFamily: "'Sora',sans-serif",
                                    cursor: "pointer",
                                    border: "2px solid #fef08a",
                                }}
                            >
                                {adminName
                                    .trim()
                                    .split(" ")
                                    .map((w) => w[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main style={{ flex: 1, padding: "28px 24px 48px", overflowY: "auto", animation: "acIn 0.3s ease both" }} key={tab}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>Loading Finance Console...</div>
                        ) : (
                            <>
                                {tab === "overview" && <OverviewTab overview={overview} vendorPayouts={vendorPayouts} riderPayouts={riderPayouts} expenses={expenses} />}
                                {tab === "sales" && <SalesTab sales={sales} />}
                                {tab === "vendors" && <VendorPayoutsTab payouts={vendorPayouts} setPayouts={setVendorPayouts} />}
                                {tab === "riders" && <RiderPayoutsTab payouts={riderPayouts} setPayouts={setRiderPayouts} />}
                                {tab === "expenses" && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
                                {tab === "reports" && <ReportsTab />}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}