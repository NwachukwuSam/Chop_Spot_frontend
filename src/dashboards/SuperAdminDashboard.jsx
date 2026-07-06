// SuperAdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, reportApi } from "../utils/Api";
import SettlementsTab from "./SettlementsTab.jsx";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const NAV_ITEMS = [
    { id: "overview",    icon: "◉",  label: "Overview"     },
    { id: "admins",      icon: "🛡️", label: "Admin Users"  },
    { id: "vendors",     icon: "🏪", label: "Vendors"      },
    { id: "riders",      icon: "🏍️", label: "Riders"       },
    { id: "orders",      icon: "📦", label: "Orders"       },
    { id: "users",       icon: "👥", label: "All Users"    },
    { id: "settlements", icon: "💳", label: "Settlements"  },
    { id: "reports",     icon: "📊", label: "Reports"      },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg:      "#0b1120",
    bgAlt:   "#111827",
    border:  "rgba(255,255,255,0.07)",
    accent:  "#6366f1",
    accentL: "rgba(99,102,241,0.15)",
    gold:    "#f59e0b",
    green:   "#10b981",
    red:     "#ef4444",
    muted:   "#64748b",
    text:    "#f1f5f9",
    textSub: "#94a3b8",
};

// ── Shared atoms ──────────────────────────────────────────────────────────────
const s = { padding:"14px 20px", fontSize:13, color:"#334155", verticalAlign:"middle" };

const Badge = ({ status }) => {
    const map = {
        APPROVED:   { bg:"#d1fae5", c:"#059669" },
        ACTIVE:     { bg:"#d1fae5", c:"#059669" },
        CUSTOMER:   { bg:"#dbeafe", c:"#1d4ed8" },
        VENDOR:     { bg:"#d1fae5", c:"#059669" },
        RIDER:      { bg:"#fef3c7", c:"#b45309" },
        ADMIN:      { bg:"#ede9fe", c:"#7c3aed" },
        SUPER_ADMIN:{ bg:"#fce7f3", c:"#9d174d" },
        ACCOUNTING: { bg:"#e0f2fe", c:"#0369a1" },
        PENDING:    { bg:"#fef3c7", c:"#b45309" },
        SUSPENDED:  { bg:"#fee2e2", c:"#b91c1c" },
        REJECTED:   { bg:"#fee2e2", c:"#b91c1c" },
    };
    const m = map[(status||"").toUpperCase()] || map.PENDING;
    return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, background:m.bg, color:m.c }}>{status || "—"}</span>;
};

const Btn = ({ label, color="#6366f1", onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:disabled?"not-allowed":"pointer", background:disabled?"#e2e8f0":color, color:disabled?"#94a3b8":"white", fontWeight:700, fontSize:11, fontFamily:"'DM Sans',sans-serif", opacity:disabled?0.6:1, transition:"opacity 0.15s, transform 0.15s", boxShadow:disabled?"none":`0 2px 8px ${color}55` }}
            onMouseEnter={e => { if(!disabled){ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-1px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"; }}
    >{label}</button>
);

const Input = ({ label, value, onChange, type="text", placeholder, required }) => (
    <div>
        <label style={{ fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:6 }}>
            {label}{required && <span style={{ color:C.red }}> *</span>}
        </label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder||label}
               style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, color:"#334155", fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
               onFocus={e => e.target.style.borderColor="#6366f1"}
               onBlur={e => e.target.style.borderColor="#e2e8f0"}
        />
    </div>
);

const DataTable = ({ cols, children, empty }) => (
    <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #e2e8f0", boxShadow:"0 2px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                <tr style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
                    {cols.map(c => <th key={c} style={{ padding:"13px 20px", textAlign:"left", fontSize:11, fontWeight:800, color:"#64748b", letterSpacing:0.7, textTransform:"uppercase", whiteSpace:"nowrap" }}>{c}</th>)}
                </tr>
                </thead>
                <tbody>
                {!children || (Array.isArray(children) && children.length === 0)
                    ? <tr><td colSpan={cols.length}>{empty || <div style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>No data</div>}</td></tr>
                    : children}
                </tbody>
            </table>
        </div>
    </div>
);

const Skeleton = () => (
    <div style={{ background:"white", borderRadius:18, padding:24, border:"1.5px solid #e2e8f0" }}>
        {[...Array(5)].map((_,i) => (
            <div key={i} style={{ display:"flex", gap:16, marginBottom:16, opacity:1-i*0.15 }}>
                {[...Array(5)].map((_,j) => <div key={j} style={{ height:14, borderRadius:7, background:"#f1f5f9", flex:j===0?2:1, animation:"pulse 1.4s ease-in-out infinite" }} />)}
            </div>
        ))}
    </div>
);

const Toast = ({ msg, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const colors = { success:"#10b981", error:"#ef4444", info:"#6366f1" };
    return (
        <div style={{ position:"fixed", top:80, right:24, zIndex:9999, background:"white", border:`1.5px solid ${colors[type]||colors.info}`, borderRadius:14, padding:"14px 18px", boxShadow:"0 8px 28px rgba(0,0,0,0.14)", display:"flex", alignItems:"center", gap:12, minWidth:280, animation:"slideUp 0.3s ease" }}>
            <span style={{ fontSize:18 }}>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#334155", flex:1 }}>{msg}</p>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16 }}>×</button>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Overview Tab
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ overview }) => {
    const stats = [
        { label:"Customers",    value:overview.totalCustomers  || 0, color:"#3b82f6", icon:"👤" },
        { label:"Vendors",      value:overview.totalVendors    || 0, color:"#10b981", icon:"🏪" },
        { label:"Riders",       value:overview.totalRiders     || 0, color:"#f59e0b", icon:"🏍️" },
        { label:"Total Orders", value:overview.totalOrders     || 0, color:"#8b5cf6", icon:"📦" },
        { label:"Pending",      value:overview.pendingOrders   || 0, color:"#f97316", icon:"⏳" },
        { label:"Delivered",    value:overview.deliveredOrders || 0, color:"#22c55e", icon:"✅" },
        { label:"Online Riders",value:overview.onlineRiders    || 0, color:"#eab308", icon:"🌐" },
        { label:"Revenue",      value:fmt(overview.totalRevenue|| 0), color:"#ef4444", icon:"💰" },
    ];
    return (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
            {stats.map((s,i) => (
                <div key={i} style={{ background:"white", borderRadius:18, padding:"18px 20px", border:"1.5px solid #f1f5f9", boxShadow:"0 2px 14px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:46, height:46, borderRadius:13, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{s.icon}</div>
                    <div>
                        <p style={{ fontSize:11, color:"#94a3b8", margin:0, fontWeight:600 }}>{s.label}</p>
                        <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, margin:"3px 0 0", color:s.color, lineHeight:1 }}>{s.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Admin Users Tab (CRUD — Super Admin only)
// ════════════════════════════════════════════════════════════
const AdminsTab = ({ toast }) => {
    const [admins,  setAdmins]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ email:"", password:"", firstName:"", lastName:"", adminRole:"Operations Manager" });
    const [saving, setSaving] = useState(false);

    const ROLES = ["Operations Manager","Finance Manager","Support Manager","Marketing Manager","General Admin"];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getAdmins();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (err) { toast("Failed to load admins: " + err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

    const createAdmin = async () => {
        if (!form.email || !form.password || !form.firstName) {
            toast("Email, password, and first name are required.", "error"); return;
        }
        setSaving(true);
        try {
            await adminApi.createAdmin({ ...form, userType:"ADMIN" });
            toast("Admin created successfully!", "success");
            setShowForm(false);
            setForm({ email:"", password:"", firstName:"", lastName:"", adminRole:"Operations Manager" });
            load();
        } catch (err) { toast("Failed to create admin: " + err.message, "error"); }
        finally { setSaving(false); }
    };

    const toggle = async (id, active) => {
        try {
            active ? await adminApi.activateAdmin(id) : await adminApi.suspendAdmin(id);
            toast(`Admin ${active ? "activated" : "suspended"}!`, "success");
            load();
        } catch (err) { toast(err.message, "error"); }
    };

    const remove = async (id) => {
        if (!window.confirm("Permanently delete this admin?")) return;
        try {
            await adminApi.deleteAdmin(id);
            toast("Admin deleted.", "success");
            load();
        } catch (err) { toast(err.message, "error"); }
    };

    const getName = a => [a.firstName, a.lastName].filter(Boolean).join(" ") || a.username || a.email;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={() => setShowForm(!showForm)} style={{ padding:"10px 22px", borderRadius:50, border:"none", background:showForm?"#f1f5f9":"linear-gradient(135deg,#6366f1,#818cf8)", color:showForm?"#64748b":"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    {showForm ? "✕ Cancel" : "+ Add Admin"}
                </button>
            </div>

            {showForm && (
                <div style={{ background:"white", borderRadius:20, padding:"24px 28px", border:"2px solid #c7d2fe", boxShadow:"0 4px 20px rgba(99,102,241,0.1)" }}>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a", margin:"0 0 20px" }}>🛡️ Create New Admin</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <Input label="First Name" value={form.firstName} onChange={v => setF("firstName",v)} required />
                        <Input label="Last Name"  value={form.lastName}  onChange={v => setF("lastName",v)} />
                        <Input label="Email"      value={form.email}     onChange={v => setF("email",v)} type="email" required />
                        <Input label="Password"   value={form.password}  onChange={v => setF("password",v)} type="password" required />
                        <div style={{ gridColumn:"1/-1" }}>
                            <label style={{ fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:6 }}>Admin Role</label>
                            <select value={form.adminRole} onChange={e => setF("adminRole", e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, color:"#334155", fontFamily:"'DM Sans',sans-serif", outline:"none" }}>
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={createAdmin} disabled={saving} style={{ marginTop:20, padding:"12px 32px", borderRadius:50, border:"none", background:saving?"#e2e8f0":"linear-gradient(135deg,#6366f1,#818cf8)", color:saving?"#94a3b8":"white", fontWeight:800, fontSize:14, cursor:saving?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif" }}>
                        {saving ? "Creating…" : "✓ Create Admin"}
                    </button>
                </div>
            )}

            {loading ? <Skeleton /> : (
                <DataTable cols={["Name","Email","Role","Status","Actions"]}>
                    {admins.map((a,i) => (
                        <tr key={a.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={s}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:13 }}>
                                        {getName(a)[0]?.toUpperCase()||"A"}
                                    </div>
                                    <span style={{ fontWeight:700 }}>{getName(a)}</span>
                                </div>
                            </td>
                            <td style={{ ...s, color:"#64748b" }}>{a.email}</td>
                            <td style={s}><span style={{ background:"#ede9fe", color:"#7c3aed", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{a.adminRole || a.userType || "ADMIN"}</span></td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={a.active ? "ACTIVE" : "SUSPENDED"} /></td>
                            <td style={{ ...s, textAlign:"center" }}>
                                <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                                    {a.active
                                        ? <Btn label="Suspend" color="#f59e0b" onClick={() => toggle(a.id, false)} />
                                        : <Btn label="Activate" color="#10b981" onClick={() => toggle(a.id, true)} />
                                    }
                                    <Btn label="Delete" color="#ef4444" onClick={() => remove(a.id)} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Vendors Tab
// ════════════════════════════════════════════════════════════
const VendorsTab = ({ toast }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try { const d = await adminApi.getVendors(); setVendors(Array.isArray(d) ? d : []); }
        catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const action = async (id, type) => {
        try {
            if (type==="approve")  await adminApi.approveVendor(id);
            if (type==="suspend")  await adminApi.suspendVendor(id);
            if (type==="reject")   await adminApi.rejectVendor(id);
            if (type==="delete") { if(!window.confirm("Delete vendor?")) return; await adminApi.deleteVendor(id); }
            toast(`Vendor ${type}d!`, "success"); load();
        } catch (err) { toast(err.message, "error"); }
    };

    const filtered = vendors.filter(v =>
        (v.restaurantName||"").toLowerCase().includes(search.toLowerCase()) ||
        (v.ownerName||"").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…"
                   style={{ padding:"10px 16px", borderRadius:50, border:"1.5px solid #e2e8f0", fontSize:13, width:280, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
            {loading ? <Skeleton /> : (
                <DataTable cols={["Restaurant","Owner","Category","Status","Actions"]}>
                    {filtered.map((v,i) => (
                        <tr key={v.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={s}><span style={{ fontWeight:700 }}>{v.restaurantName||"—"}</span></td>
                            <td style={s}>{v.ownerName||"—"}</td>
                            <td style={s}><span style={{ background:"#f1f5f9", borderRadius:6, padding:"3px 8px", fontSize:11 }}>{v.category||"—"}</span></td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={v.status} /></td>
                            <td style={{ ...s, textAlign:"center" }}>
                                <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap" }}>
                                    {v.status !== "APPROVED"  && <Btn label="Approve" color="#10b981" onClick={() => action(v.id,"approve")} />}
                                    {v.status !== "SUSPENDED" && <Btn label="Suspend" color="#f59e0b" onClick={() => action(v.id,"suspend")} />}
                                    <Btn label="Delete" color="#ef4444" onClick={() => action(v.id,"delete")} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Riders Tab
// ════════════════════════════════════════════════════════════
const RidersTab = ({ toast }) => {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try { const d = await adminApi.getRiders(); setRiders(Array.isArray(d) ? d : []); }
        catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const action = async (id, type) => {
        try {
            if (type==="approve") await adminApi.approveRider(id);
            if (type==="suspend") await adminApi.suspendRider(id);
            if (type==="reject")  await adminApi.rejectRider(id);
            if (type==="delete")  { if(!window.confirm("Delete rider?")) return; await adminApi.deleteRider(id); }
            toast(`Rider ${type}d!`, "success"); load();
        } catch (err) { toast(err.message, "error"); }
    };

    const getName = r => [r.firstName, r.lastName].filter(Boolean).join(" ") || "—";
    const filtered = riders.filter(r => getName(r).toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search riders…"
                   style={{ padding:"10px 16px", borderRadius:50, border:"1.5px solid #e2e8f0", fontSize:13, width:280, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
            {loading ? <Skeleton /> : (
                <DataTable cols={["Name","Vehicle","Zone","Status","Actions"]}>
                    {filtered.map((r,i) => (
                        <tr key={r.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={s}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#fef3c7,#fde68a)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:"#92400e" }}>
                                        {getName(r)[0]?.toUpperCase()||"R"}
                                    </div>
                                    <span style={{ fontWeight:700 }}>{getName(r)}</span>
                                </div>
                            </td>
                            <td style={s}>{r.vehicleType||"—"}</td>
                            <td style={s}>{r.deliveryZone||"—"}</td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={r.status} /></td>
                            <td style={{ ...s, textAlign:"center" }}>
                                <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap" }}>
                                    {r.status !== "APPROVED"  && <Btn label="Approve" color="#10b981" onClick={() => action(r.id,"approve")} />}
                                    {r.status !== "SUSPENDED" && <Btn label="Suspend" color="#f59e0b" onClick={() => action(r.id,"suspend")} />}
                                    <Btn label="Delete" color="#ef4444" onClick={() => action(r.id,"delete")} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Orders Tab
// ════════════════════════════════════════════════════════════
const ORDER_STATUSES = [
    "PENDING_PAYMENT","PENDING","ACCEPTED","PREPARING",
    "READY_FOR_PICKUP","PICKED_UP","DELIVERED",
    "PAYMENT_FAILED","PAYMENT_CANCELLED","CANCELLED",
];

const OrdersTab = ({ toast }) => {
    const [orders,      setOrders]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [updating,    setUpdating]    = useState({});
    const [page,        setPage]        = useState(0);
    const [totalPages,  setTotalPages]  = useState(1);

    const load = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const d = await adminApi.getOrders(null, p, 20);
            const list = Array.isArray(d) ? d : (Array.isArray(d?.content) ? d.content : d?.orders || []);
            setOrders(list);
            setTotalPages(d?.totalPages ?? (list.length < 20 ? p + 1 : p + 2));
        } catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(0); }, [load]);

    const goPage = (p) => { setPage(p); load(p); };

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(p => ({ ...p, [id]: true }));
        try {
            await adminApi.updateOrderStatus(id, newStatus);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            toast("Status updated!", "success");
        } catch (err) { toast(err.message, "error"); }
        finally { setUpdating(p => ({ ...p, [id]: false })); }
    };

    const shortId = id => id ? `#${String(id).slice(-6).toUpperCase()}` : "—";

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {loading ? <Skeleton /> : (
                <DataTable cols={["Order ID","Customer","Vendor","Total","Status","Action"]}>
                    {orders.map((o, i) => (
                        <tr key={o.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={s}>
                                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:12, color:"#6366f1" }}>
                                    {shortId(o.id)}
                                </span>
                            </td>
                            <td style={s}>{o.customerName || o.whatsappNumber || "—"}</td>
                            <td style={s}>{o.vendorName || "—"}</td>
                            <td style={s}>₦{(o.totalAmount || 0).toLocaleString()}</td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={o.status} /></td>
                            <td style={{ ...s, textAlign:"center" }}>
                                {updating[o.id] ? (
                                    <span style={{ fontSize:12, color:"#94a3b8" }}>Updating…</span>
                                ) : (
                                    <select
                                        value={o.status || ""}
                                        onChange={e => handleStatusChange(o.id, e.target.value)}
                                        style={{ padding:"5px 8px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:11, fontFamily:"'DM Sans',sans-serif", background:"white", color:"#374151", cursor:"pointer", outline:"none" }}
                                    >
                                        {ORDER_STATUSES.map(st => (
                                            <option key={st} value={st}>{st.replace(/_/g," ")}</option>
                                        ))}
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </DataTable>
            )}
            {!loading && totalPages > 1 && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"8px 0" }}>
                    <button onClick={() => goPage(page - 1)} disabled={page === 0} style={{ padding:"7px 18px", borderRadius:8, border:"1.5px solid rgba(99,102,241,0.3)", background: page === 0 ? "transparent" : "rgba(99,102,241,0.08)", color: page === 0 ? "#4a5568" : "#818cf8", fontWeight:700, fontSize:13, cursor: page === 0 ? "not-allowed" : "pointer" }}>← Prev</button>
                    <span style={{ fontSize:13, fontWeight:600, color:"#94a3b8" }}>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1} style={{ padding:"7px 18px", borderRadius:8, border:"1.5px solid rgba(99,102,241,0.3)", background: page >= totalPages - 1 ? "transparent" : "rgba(99,102,241,0.08)", color: page >= totalPages - 1 ? "#4a5568" : "#818cf8", fontWeight:700, fontSize:13, cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>Next →</button>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// All Users Tab
// ════════════════════════════════════════════════════════════
const UsersTab = ({ toast }) => {
    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");
    const [filter,  setFilter]  = useState("ALL");

    const load = useCallback(async () => {
        setLoading(true);
        try { const d = await adminApi.getAllUsers(); setUsers(Array.isArray(d) ? d : []); }
        catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const TYPE_COLOR = { CUSTOMER:"#3b82f6", VENDOR:"#10b981", RIDER:"#f59e0b" };
    const getName = u => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.restaurantName || u.username || "—";

    const counts = { ALL:users.length };
    users.forEach(u => { counts[u._userType] = (counts[u._userType]||0)+1; });

    const filtered = users
        .filter(u => filter==="ALL" || u._userType===filter)
        .filter(u => getName(u).toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["ALL","CUSTOMER","VENDOR","RIDER"].map(t => (
                    <button key={t} onClick={() => setFilter(t)} style={{ padding:"8px 18px", borderRadius:50, border:`2px solid ${filter===t?(TYPE_COLOR[t]||"#6366f1"):"#e2e8f0"}`, background:filter===t?(TYPE_COLOR[t]||"#6366f1"):"white", color:filter===t?"white":"#64748b", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        {t} ({counts[t]||0})
                    </button>
                ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                   style={{ padding:"10px 16px", borderRadius:50, border:"1.5px solid #e2e8f0", fontSize:13, width:300, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
            {loading ? <Skeleton /> : (
                <DataTable cols={["Name","Email","Type","Status"]}>
                    {filtered.map((u,i) => (
                        <tr key={u.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={s}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <div style={{ width:32, height:32, borderRadius:"50%", background:`${TYPE_COLOR[u._userType]||"#94a3b8"}20`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:TYPE_COLOR[u._userType]||"#64748b" }}>
                                        {getName(u)[0]?.toUpperCase()||"?"}
                                    </div>
                                    <span style={{ fontWeight:600 }}>{getName(u)}</span>
                                </div>
                            </td>
                            <td style={{ ...s, color:"#64748b" }}>{u.email||"—"}</td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={u._userType} /></td>
                            <td style={{ ...s, textAlign:"center" }}><Badge status={u.active||u.status==="APPROVED" ? "ACTIVE" : "SUSPENDED"} /></td>
                        </tr>
                    ))}
                </DataTable>
            )}
            <p style={{ fontSize:12, color:"#94a3b8", textAlign:"center", margin:0 }}>Showing {filtered.length} of {users.length} users</p>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Reports Tab
// ════════════════════════════════════════════════════════════

// Normalizers (pure — no React deps)
const _normRev  = d => { const l=Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.revenue)?d.revenue:[]; return l.map(r=>({label:r.label||r.period||r.date||"—",value:Number(r.value||r.revenue||r.totalRevenue||0)})); };
const _normBrk  = d => { if(Array.isArray(d))return d.map(x=>({status:x.status||"?",count:Number(x.count||x.total||0)})); if(d&&typeof d==="object")return Object.entries(d).map(([k,v])=>({status:k,count:Number(v)})); return []; };
const _normVend = d => { const l=Array.isArray(d)?d:Array.isArray(d?.vendors)?d.vendors:Array.isArray(d?.data)?d.data:[]; return l.map(v=>({name:v.vendorName||v.name||"—",orders:Number(v.totalOrders||v.orderCount||0),revenue:Number(v.totalRevenue||v.revenue||0)})); };
const _normPeak = d => { const l=Array.isArray(d)?d:Array.isArray(d?.hours)?d.hours:Array.isArray(d?.data)?d.data:[]; const m={}; l.forEach(h=>{m[h.hour??h.hourOfDay??0]=Number(h.count||h.orders||0);}); return Array.from({length:24},(_,i)=>({hour:i,count:m[i]||0})); };

const ReportBarChart = ({ data, color, valueFmt, labelFmt, chartHeight=160 }) => {
    if(!data.length) return <div style={{height:chartHeight,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13}}>No data available</div>;
    const max=Math.max(...data.map(d=>d.value??d.count??0),1);
    const MAX_H=chartHeight-22;
    return (
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:chartHeight,overflowX:"auto"}}>
            {data.map((d,i)=>{
                const val=d.value??d.count??0;
                const h=Math.max(val>0?3:0,Math.round(val/max*MAX_H));
                const lbl=labelFmt?labelFmt(d.label??d.hour??i):(d.label??d.hour??i);
                return (
                    <div key={i} title={valueFmt?valueFmt(val):String(val)}
                        style={{flex:1,minWidth:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:3}}>
                        <div style={{width:"72%",height:h,background:color,borderRadius:"3px 3px 0 0",flexShrink:0,transition:"height 0.5s ease"}}/>
                        <span style={{fontSize:8,color:"#94a3b8",lineHeight:1,width:"100%",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lbl}</span>
                    </div>
                );
            })}
        </div>
    );
};

const ReportsTab = ({ toast }) => {
    const [summary,    setSummary]    = useState({});
    const [revenue,    setRevenue]    = useState([]);
    const [breakdown,  setBreakdown]  = useState([]);
    const [topVendors, setTopVendors] = useState([]);
    const [peakHours,  setPeakHours]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [period,     setPeriod]     = useState("WEEKLY");
    const [pLoad,      setPLoad]      = useState(false);
    const didInit = useRef(false);

    // Load everything on mount
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const [sum, rev, brk, top, peak] = await Promise.all([
                    reportApi.getSummary().catch(() => ({})),
                    reportApi.getRevenue(period).catch(() => []),
                    reportApi.getOrderStatusBreakdown().catch(() => []),
                    reportApi.getTopVendors(10, period).catch(() => []),
                    reportApi.getPeakHours().catch(() => []),
                ]);
                if (!alive) return;
                setSummary(sum || {});
                setRevenue(_normRev(rev));
                setBreakdown(_normBrk(brk));
                setTopVendors(_normVend(top));
                setPeakHours(_normPeak(peak));
            } finally { if (alive) { setLoading(false); didInit.current = true; } }
        })();
        return () => { alive = false; };
    }, []); // eslint-disable-line

    // Reload period-sensitive data (revenue + top vendors) on period toggle
    useEffect(() => {
        if (!didInit.current) return;
        let alive = true;
        setPLoad(true);
        (async () => {
            const [rev, top] = await Promise.all([
                reportApi.getRevenue(period).catch(() => []),
                reportApi.getTopVendors(10, period).catch(() => []),
            ]);
            if (!alive) return;
            setRevenue(_normRev(rev));
            setTopVendors(_normVend(top));
            setPLoad(false);
        })();
        return () => { alive = false; };
    }, [period]);

    const ACC = "#6366f1";
    const fmtN = n => `₦${Number(n||0).toLocaleString()}`;

    const CARDS = [
        { label:"Total Revenue",      value:fmtN(summary.totalRevenue),                        icon:"💰", color:"#6366f1" },
        { label:"Total Orders",       value:(summary.totalOrders||0).toLocaleString(),           icon:"📦", color:"#10b981" },
        { label:"Avg Order Value",    value:fmtN(summary.averageOrderValue),                    icon:"📈", color:"#f59e0b" },
        { label:"Service Charges",    value:fmtN(summary.totalServiceChargeCollected),           icon:"🏷️", color:"#ef4444" },
        { label:"This Month Revenue", value:fmtN(summary.thisMonthRevenue),                     icon:"📅", color:"#8b5cf6" },
        { label:"This Month Orders",  value:(summary.thisMonthOrders||0).toLocaleString(),       icon:"🗓️", color:"#f97316" },
    ];

    const ST_C = { DELIVERED:"#10b981",COMPLETED:"#10b981",PENDING:"#f59e0b",ACCEPTED:"#3b82f6",PREPARING:"#6366f1",CANCELLED:"#ef4444",REJECTED:"#ef4444",READY_FOR_PICKUP:"#8b5cf6",OUT_FOR_DELIVERY:"#f97316",PICKED_UP:"#f97316" };
    const brkTotal = breakdown.reduce((a,x) => a+x.count, 0);

    const Card = ({title, children, right}) => (
        <div style={{background:"white",borderRadius:20,border:"1.5px solid #e2e8f0",overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.03)"}}>
            <div style={{padding:"16px 22px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,color:"#0f172a",margin:0}}>{title}</h3>
                {right}
            </div>
            <div style={{padding:"18px 22px"}}>{children}</div>
        </div>
    );

    const PeriodToggle = () => (
        <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:8,padding:3}}>
            {["DAILY","WEEKLY","MONTHLY"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} disabled={pLoad}
                    style={{padding:"5px 11px",borderRadius:6,border:"none",background:period===p?ACC:"transparent",color:period===p?"white":"#64748b",fontWeight:700,fontSize:11,cursor:pLoad?"wait":"pointer",transition:"all 0.15s",opacity:pLoad&&period!==p?0.5:1}}>
                    {p==="DAILY"?"Daily":p==="WEEKLY"?"Weekly":"Monthly"}
                </button>
            ))}
        </div>
    );

    if (loading) return (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
                {[...Array(6)].map((_,i) => <div key={i} style={{background:"white",borderRadius:16,height:84,border:"1.5px solid #e2e8f0",animation:`pulse 1.4s ease-in-out ${i*0.08}s infinite`}}/>)}
            </div>
            <div style={{background:"white",borderRadius:20,height:280,border:"1.5px solid #e2e8f0",animation:"pulse 1.4s ease-in-out infinite"}}/>
            <div style={{background:"white",borderRadius:20,height:200,border:"1.5px solid #e2e8f0",animation:"pulse 1.4s ease-in-out 0.15s infinite"}}/>
        </div>
    );

    return (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>

            {/* 1 — Summary Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
                {CARDS.map((c,i) => (
                    <div key={i} style={{background:"white",borderRadius:16,padding:"18px 20px",border:"1.5px solid #e2e8f0",boxShadow:"0 2px 10px rgba(0,0,0,0.03)",display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:42,height:42,borderRadius:12,background:`${c.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                        <div>
                            <p style={{fontSize:10,color:"#94a3b8",margin:0,fontWeight:600,textTransform:"uppercase",letterSpacing:0.7}}>{c.label}</p>
                            <p style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,margin:"2px 0 0",color:c.color,lineHeight:1.1}}>{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2 — Revenue Over Time */}
            <Card title="💹 Revenue Over Time" right={<PeriodToggle/>}>
                {pLoad
                    ? <div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13}}>Updating…</div>
                    : <ReportBarChart data={revenue} color={ACC} valueFmt={fmtN} chartHeight={180}/>}
            </Card>

            {/* 3 — Order Status Breakdown */}
            <Card title="📊 Order Status Breakdown">
                {breakdown.length===0
                    ? <div style={{textAlign:"center",padding:"30px",color:"#94a3b8",fontSize:13}}>No data available</div>
                    : breakdown.map(({status,count}) => {
                        const pct = brkTotal>0 ? (count/brkTotal*100) : 0;
                        const c   = ST_C[status]||"#94a3b8";
                        return (
                            <div key={status} style={{marginBottom:12}}>
                                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:5,color:"#334155"}}>
                                    <span>{status.replace(/_/g," ")}</span>
                                    <span style={{color:"#64748b"}}>{count.toLocaleString()} <span style={{fontWeight:400}}>({pct.toFixed(1)}%)</span></span>
                                </div>
                                <div style={{height:8,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                                    <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:4,transition:"width 0.6s ease"}}/>
                                </div>
                            </div>
                        );
                    })}
            </Card>

            {/* 4 — Top Vendors */}
            <Card title="🏆 Top Vendors" right={pLoad ? <span style={{fontSize:12,color:"#94a3b8"}}>Updating…</span> : null}>
                {topVendors.length===0
                    ? <div style={{textAlign:"center",padding:"30px",color:"#94a3b8",fontSize:13}}>No data available</div>
                    : (
                        <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%",borderCollapse:"collapse"}}>
                                <thead>
                                <tr style={{background:"#f8fafc"}}>
                                    {["#","Vendor","Orders","Revenue"].map(h => (
                                        <th key={h} style={{padding:"10px 14px",textAlign:["Revenue","Orders"].includes(h)?"right":"left",fontSize:10,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:0.7}}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {topVendors.map((v,i) => (
                                    <tr key={i} style={{borderTop:"1px solid #f1f5f9"}}>
                                        <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:ACC}}>{i+1}</td>
                                        <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:"#334155"}}>{v.name}</td>
                                        <td style={{padding:"11px 14px",fontSize:13,textAlign:"right",color:"#64748b"}}>{v.orders.toLocaleString()}</td>
                                        <td style={{padding:"11px 14px",fontSize:13,textAlign:"right",fontWeight:700,color:"#10b981"}}>{fmtN(v.revenue)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </Card>

            {/* 5 — Peak Hours */}
            <Card title="⏰ Peak Hours — Orders by Hour of Day">
                <ReportBarChart data={peakHours} color="#818cf8" labelFmt={h=>`${h}h`} chartHeight={160}/>
            </Card>

        </div>
    );
};

// ════════════════════════════════════════════════════════════
// MAIN SUPER ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
export default function SuperAdminDashboard({ onExit }) {
    const [tab,      setTab]      = useState("overview");
    const [overview, setOverview] = useState({});
    const [loading,  setLoading]  = useState(true);
    const [sidebar,  setSidebar]  = useState(false);
    const [toastMsg, setToastMsg] = useState(null);
    const navigate = useNavigate();

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // ── Toast helper passed down to tabs ──────────────────────────────────────
    const toast = useCallback((msg, type="info") => {
        setToastMsg({ msg, type, key: Date.now() });
    }, []);

    // ── Auth guard ────────────────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("chopspot_token") || localStorage.getItem("adminToken");
        if (!token) { navigate("/login"); return; }
        const raw = localStorage.getItem("chopspot_user");
        if (raw) {
            try {
                const u = JSON.parse(raw);
                if (!u.roles?.includes("SUPER_ADMIN")) {
                    navigate("/login");
                }
            } catch (_) {}
        }
    }, [navigate]);

    // ── Load overview ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try { setOverview(await adminApi.getOverview()); }
            catch (err) {
                if (err.status === 401 || err.message?.includes("expired")) navigate("/login");
                else toast(err.message, "error");
            } finally { setLoading(false); }
        };
        fetch();
    }, [navigate, toast]);

    // ── Get adminName from localStorage ───────────────────────────────────────
    let adminName = "Super Admin";
    try {
        const u = JSON.parse(localStorage.getItem("chopspot_user")||"{}");
        adminName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Super Admin";
    } catch (_) {}

    const tabProps = { toast };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing:border-box; }
                @keyframes acIn  { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
                @keyframes slideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                ::-webkit-scrollbar{width:4px;height:4px}
                ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px}
            `}</style>

            {toastMsg && <Toast key={toastMsg.key} msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

            <div style={{ display:"flex", minHeight:"100vh", background:"#f0f4f8", fontFamily:"'DM Sans',sans-serif" }}>
                {sidebar && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:199 }} onClick={() => setSidebar(false)} />}

                {/* Sidebar */}
                <aside style={{ width:256, background:"linear-gradient(180deg,#0b1120,#0f1a2e)", display:"flex", flexDirection:"column", flexShrink:0, position:isMobile?"fixed":"sticky", top:0, height:"100vh", overflowY:"auto", left:isMobile?(sidebar?0:-256):0, transition:isMobile?"left 0.3s":"none", zIndex:isMobile?200:"auto", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 4px 14px rgba(99,102,241,0.5)" }}>👑</div>
                            <div>
                                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"white" }}>Tasty<span style={{ color:"#6366f1" }}>cart</span></div>
                                <div style={{ fontSize:9, color:"#475569", letterSpacing:1.5, fontWeight:700, textTransform:"uppercase" }}>Super Admin</div>
                            </div>
                        </div>
                    </div>

                    <nav style={{ flex:1, padding:"16px 12px" }}>
                        {NAV_ITEMS.map(item => {
                            const active = tab===item.id;
                            return (
                                <button key={item.id} onClick={() => { setTab(item.id); setSidebar(false); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, border:"none", background:active?"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.1))":"transparent", color:active?"#818cf8":"#64748b", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:active?700:500, fontSize:13.5, marginBottom:2, transition:"all 0.18s", textAlign:"left", borderLeft:active?"3px solid #6366f1":"3px solid transparent" }}>
                                    <span style={{ fontSize:16, width:22, textAlign:"center" }}>{item.icon}</span>
                                    <span style={{ flex:1 }}>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{ padding:"14px 16px 22px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#f59e0b)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14 }}>
                                {adminName[0]?.toUpperCase()||"S"}
                            </div>
                            <div>
                                <p style={{ margin:0, fontWeight:700, fontSize:13, color:"white" }}>{adminName}</p>
                                <p style={{ margin:0, fontSize:10, color:"#475569" }}>Super Administrator</p>
                            </div>
                        </div>
                        {onExit && <button onClick={onExit} style={{ width:"100%", padding:"9px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#64748b", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Back to App</button>}
                    </div>
                </aside>

                {/* Main */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
                    <header style={{ background:"white", borderBottom:"1.5px solid #e8edf2", padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                            {isMobile && <button onClick={() => setSidebar(o => !o)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>}
                            <div>
                                <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"#0f172a", margin:0 }}>
                                    {NAV_ITEMS.find(n => n.id===tab)?.icon} {NAV_ITEMS.find(n => n.id===tab)?.label}
                                </h1>
                                <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>{new Date().toLocaleDateString("en-NG",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
                            </div>
                        </div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#ede9fe", borderRadius:50, padding:"5px 14px" }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", display:"inline-block" }} />
                            <span style={{ fontWeight:700, fontSize:11, color:"#6366f1" }}>Super Admin</span>
                        </div>
                    </header>

                    <main style={{ flex:1, padding:"28px 28px 56px", overflowY:"auto", animation:"acIn 0.3s ease both" }} key={tab}>
                        {loading ? (
                            <div style={{ textAlign:"center", padding:"100px 20px", color:"#64748b" }}>
                                <div style={{ fontSize:32, marginBottom:12 }}>👑</div>
                                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Loading Super Admin Console…</p>
                            </div>
                        ) : (
                            <>
                                {tab==="overview"    && <OverviewTab overview={overview} />}
                                {tab==="admins"      && <AdminsTab {...tabProps} />}
                                {tab==="vendors"     && <VendorsTab {...tabProps} />}
                                {tab==="riders"      && <RidersTab {...tabProps} />}
                                {tab==="orders"      && <OrdersTab {...tabProps} />}
                                {tab==="users"       && <UsersTab {...tabProps} />}
                                {tab==="settlements" && <SettlementsTab {...tabProps} />}
                                {tab==="reports"     && <ReportsTab {...tabProps} />}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}