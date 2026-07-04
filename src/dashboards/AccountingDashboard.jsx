// AccountingDashboard.jsx — ChopSpot Finance Console
import { useState, useEffect, useCallback } from "react";
import { financeApi, adminApi } from "../utils/Api";

const fmt     = n => `₦${Number(n || 0).toLocaleString()}`;
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; }};

const NAV_ITEMS = [
    { id:"overview",  icon:"◉",  label:"Overview"       },
    { id:"sales",     icon:"🛒", label:"Sales"          },
    { id:"vendors",   icon:"🏪", label:"Vendor Payouts" },
    { id:"riders",    icon:"🏍️", label:"Rider Payouts"  },
    { id:"expenses",  icon:"📉", label:"Expenses"       },
    { id:"reports",   icon:"📊", label:"Reports"        },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const TD = { padding:"14px 18px", fontSize:13, color:"#334155", verticalAlign:"middle" };
const LS = { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:6 };
const IS = { width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, color:"#334155", fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" };

// ── Shared atoms ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const m = { PAID:{ bg:"#d1fae5",c:"#059669" }, PENDING:{ bg:"#fef3c7",c:"#d97706" }, DELIVERED:{ bg:"#dbeafe",c:"#1d4ed8" }, CANCELLED:{ bg:"#fee2e2",c:"#b91c1c" } };
    const s = m[status?.toUpperCase()] || m.PENDING;
    return <span style={{ padding:"5px 13px", borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.c }}>{status||"—"}</span>;
};

const Toast = ({ msg, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const colors = { success:"#10b981", error:"#ef4444", info:"#3b82f6" };
    return (
        <div style={{ position:"fixed", top:80, right:24, zIndex:9999, background:"white", border:`1.5px solid ${colors[type]||colors.info}`, borderRadius:14, padding:"14px 18px", boxShadow:"0 8px 28px rgba(0,0,0,0.14)", display:"flex", alignItems:"center", gap:12, minWidth:280, animation:"slideUp 0.3s ease" }}>
            <span style={{ fontSize:18 }}>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#334155", flex:1 }}>{msg}</p>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16 }}>×</button>
        </div>
    );
};

// Generic modal for ref input (replaces prompt())
const RefModal = ({ title, onConfirm, onCancel }) => {
    const [ref, setRef] = useState("");
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"white", borderRadius:20, padding:"28px 32px", width:380, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"#0f172a", margin:"0 0 16px" }}>{title}</h3>
                <label style={LS}>Payment Reference <span style={{ color:"#94a3b8", fontWeight:400 }}>(optional)</span></label>
                <input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. TRF2026041500123" style={{ ...IS, marginBottom:20 }} autoFocus />
                <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => onConfirm(ref)} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#10b981,#059669)", color:"white", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>✓ Confirm</button>
                    <button onClick={onCancel} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"white", color:"#64748b", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const Skeleton = () => (
    <div style={{ background:"white", borderRadius:18, padding:24, border:"1.5px solid #e2e8f0" }}>
        {[...Array(5)].map((_,i) => (
            <div key={i} style={{ display:"flex", gap:16, marginBottom:16, opacity:1-i*0.15 }}>
                {[...Array(5)].map((_,j) => <div key={j} style={{ height:14, borderRadius:7, background:"#f1f5f9", flex:j===0?2:1, animation:"pulse 1.4s ease-in-out infinite" }} />)}
            </div>
        ))}
    </div>
);

// ════════════════════════════════════════════════════════════
// Overview Tab
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ overview, vendorPayouts, riderPayouts, expenses }) => {
    const pendingVendor = vendorPayouts.filter(v => v.status==="PENDING").reduce((a,v) => a+(v.netPayable||0), 0);
    const pendingRider  = riderPayouts.filter(r  => r.status==="PENDING").reduce((a,r) => a+(r.netPayable||0), 0);
    const totalExpenses = expenses.reduce((a,e) => a+(e.amount||0), 0);
    const totalFees     = overview.totalPlatformFees || 0;
    const netProfit     = totalFees - totalExpenses;

    const stats = [
        { label:"Platform Fees",          value:fmt(totalFees),        color:"#7c3aed", icon:"💎", bg:"#f5f3ff" },
        { label:"Pending Vendor Payouts",  value:fmt(pendingVendor),    color:"#f59e0b", icon:"🏪", bg:"#fffbeb" },
        { label:"Pending Rider Payouts",   value:fmt(pendingRider),     color:"#f97316", icon:"🏍️", bg:"#fff7ed" },
        { label:"Total Expenses",          value:fmt(totalExpenses),    color:"#ef4444", icon:"📉", bg:"#fef2f2" },
        { label:"Net Profit",              value:fmt(netProfit),        color:"#10b981", icon:"✅", bg:"#f0fdf4" },
        { label:"Total Orders",            value:overview.totalOrders||0, color:"#3b82f6", icon:"📦", bg:"#eff6ff" },
    ];

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
                {stats.map((st,i) => (
                    <div key={i} style={{ background:"white", borderRadius:18, padding:"18px 20px", border:"1.5px solid #f1f5f9", boxShadow:"0 2px 14px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:46, height:46, borderRadius:13, background:st.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{st.icon}</div>
                        <div>
                            <p style={{ fontSize:11, color:"#94a3b8", margin:0, fontWeight:600 }}>{st.label}</p>
                            <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, margin:"3px 0 0", color:st.color, lineHeight:1 }}>{st.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
                {/* Vendor breakdown */}
                <div style={{ background:"white", borderRadius:18, border:"1.5px solid #e2e8f0", overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1.5px solid #f1f5f9", background:"#f8fafc" }}>
                        <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#0f172a", margin:0 }}>🏪 Per-Vendor Breakdown</h3>
                    </div>
                    {Object.entries(vendorPayouts.reduce((acc,v) => {
                        const name = v.vendorName||"Unknown";
                        if(!acc[name]) acc[name]={ paid:0, pending:0, fee:0 };
                        acc[name].fee += v.platformFee||0;
                        v.status==="PAID" ? acc[name].paid += v.netPayable||0 : acc[name].pending += v.netPayable||0;
                        return acc;
                    }, {})).map(([name, data], i, arr) => (
                        <div key={name} style={{ padding:"13px 20px", borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                <span style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{name}</span>
                                <span style={{ fontSize:11, color:"#94a3b8" }}>Fee: {fmt(data.fee)}</span>
                            </div>
                            <div style={{ display:"flex", gap:10 }}>
                                <span style={{ fontSize:11, color:"#059669", fontWeight:700 }}>✅ {fmt(data.paid)}</span>
                                {data.pending>0 && <span style={{ fontSize:11, color:"#f59e0b", fontWeight:700 }}>⏳ {fmt(data.pending)}</span>}
                            </div>
                        </div>
                    ))}
                    {vendorPayouts.length===0 && <div style={{ padding:"30px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>No vendor payouts</div>}
                </div>

                {/* Rider breakdown */}
                <div style={{ background:"white", borderRadius:18, border:"1.5px solid #e2e8f0", overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1.5px solid #f1f5f9", background:"#f8fafc" }}>
                        <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:"#0f172a", margin:0 }}>🏍️ Per-Rider Breakdown</h3>
                    </div>
                    {Object.entries(riderPayouts.reduce((acc,r) => {
                        const name = r.riderName||"Unknown";
                        if(!acc[name]) acc[name]={ paid:0, pending:0, cut:0 };
                        acc[name].cut += r.platformCut||0;
                        r.status==="PAID" ? acc[name].paid += r.netPayable||0 : acc[name].pending += r.netPayable||0;
                        return acc;
                    }, {})).map(([name, data], i, arr) => (
                        <div key={name} style={{ padding:"13px 20px", borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                <span style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{name}</span>
                                <span style={{ fontSize:11, color:"#94a3b8" }}>Cut: {fmt(data.cut)}</span>
                            </div>
                            <div style={{ display:"flex", gap:10 }}>
                                <span style={{ fontSize:11, color:"#059669", fontWeight:700 }}>✅ {fmt(data.paid)}</span>
                                {data.pending>0 && <span style={{ fontSize:11, color:"#f59e0b", fontWeight:700 }}>⏳ {fmt(data.pending)}</span>}
                            </div>
                        </div>
                    ))}
                    {riderPayouts.length===0 && <div style={{ padding:"30px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>No rider payouts</div>}
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Sales Tab
// ════════════════════════════════════════════════════════════
const SalesTab = ({ toast }) => {
    const [sales,        setSales]        = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [page,         setPage]         = useState(0);
    const [totalPages,   setTotalPages]   = useState(1);
    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadSales = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const d = await financeApi.getSales(null, p, 20);
            const list = Array.isArray(d) ? d : (Array.isArray(d?.content) ? d.content : d?.orders || []);
            setSales(list);
            setTotalPages(d?.totalPages ?? (list.length < 20 ? p + 1 : p + 2));
        } catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { loadSales(0); }, [loadSales]);

    const goPage = (p) => { setPage(p); loadSales(p); };

    const filtered = sales
        .filter(o => statusFilter==="ALL" || o.status?.toUpperCase()===statusFilter)
        .filter(o => (o.id||"").toLowerCase().includes(search.toLowerCase()) || (o.customerName||o.customer||"").toLowerCase().includes(search.toLowerCase()));

    const total = filtered.reduce((a,o) => a+(o.totalAmount||o.amount||0), 0);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer…"
                       style={{ padding:"10px 16px", borderRadius:50, border:"1.5px solid #e2e8f0", fontSize:13, width:260, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
                {["ALL","DELIVERED","PENDING","CANCELLED"].map(st => (
                    <button key={st} onClick={() => setStatusFilter(st)} style={{ padding:"8px 16px", borderRadius:50, border:`2px solid ${statusFilter===st?"#10b981":"#e2e8f0"}`, background:statusFilter===st?"#10b981":"white", color:statusFilter===st?"white":"#64748b", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{st}</button>
                ))}
                <span style={{ marginLeft:"auto", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#10b981" }}>Total: {fmt(total)}</span>
            </div>
            <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
                <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
                        <thead>
                        <tr style={{ background:"#f8fafc" }}>
                            {["Order ID","Customer","Vendor","Date","Subtotal","Service Charge","Total","Status"].map(c =>
                                <th key={c} style={{ padding:"13px 16px", textAlign:["Subtotal","Service Charge","Total"].includes(c)?"right":"left", fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{c}</th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>Loading…</td></tr>
                        ) : filtered.map((o,i) => (
                            <tr key={o.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                                <td style={TD}><span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700 }}>#{(o.id||"").slice(-8)}</span></td>
                                <td style={TD}>{o.customerName||o.customer||"—"}</td>
                                <td style={TD}>{o.vendorName||o.vendor||"—"}</td>
                                <td style={TD}>{fmtDate(o.createdAt||o.date)}</td>
                                <td style={{ ...TD, textAlign:"right" }}>{fmt(o.subtotal||0)}</td>
                                <td style={{ ...TD, textAlign:"right", color:"#f97316" }}>{fmt(o.serviceCharge||0)}</td>
                                <td style={{ ...TD, textAlign:"right", fontWeight:800, color:"#10b981" }}>{fmt(o.totalAmount||o.amount||0)}</td>
                                <td style={{ ...TD, textAlign:"center" }}><StatusBadge status={o.status} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length===0 && <div style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>No orders found</div>}
            </div>
            {!loading && totalPages > 1 && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"8px 0" }}>
                    <button onClick={() => goPage(page - 1)} disabled={page === 0} style={{ padding:"7px 18px", borderRadius:8, border:"1.5px solid #d1fae5", background:"white", color: page === 0 ? "#bbb" : "#10b981", fontWeight:700, fontSize:13, cursor: page === 0 ? "not-allowed" : "pointer" }}>← Prev</button>
                    <span style={{ fontSize:13, fontWeight:600, color:"#64748b" }}>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => goPage(page + 1)} disabled={page >= totalPages - 1} style={{ padding:"7px 18px", borderRadius:8, border:"1.5px solid #d1fae5", background:"white", color: page >= totalPages - 1 ? "#bbb" : "#10b981", fontWeight:700, fontSize:13, cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>Next →</button>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Vendor Payouts Tab
// ════════════════════════════════════════════════════════════
const VendorPayoutsTab = ({ payouts, setPayouts, toast }) => {
    const [refModal, setRefModal] = useState(null); // { id }
    const [vendors,  setVendors]  = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ vendorId:"", period:"", grossSales:"", ordersCount:"" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { adminApi.getVendors().then(d => setVendors(Array.isArray(d)?d:[])).catch(()=>{}); }, []);

    const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

    const markPaid = async (id, ref) => {
        try {
            await financeApi.markVendorPaid(id, ref);
            const updated = await financeApi.getVendorPayouts();
            setPayouts(updated);
            toast("Vendor payout marked as PAID!", "success");
        } catch (err) { toast(err.message, "error"); }
        finally { setRefModal(null); }
    };

    const create = async () => {
        if (!form.vendorId || !form.grossSales) { toast("Vendor and gross sales are required.", "error"); return; }
        setSaving(true);
        try {
            await financeApi.createVendorPayout({ ...form, grossSales:Number(form.grossSales), ordersCount:Number(form.ordersCount)||0 });
            const updated = await financeApi.getVendorPayouts();
            setPayouts(updated);
            toast("Vendor payout record created!", "success");
            setShowForm(false);
            setForm({ vendorId:"", period:"", grossSales:"", ordersCount:"" });
        } catch (err) { toast(err.message, "error"); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {refModal && <RefModal title="Mark Vendor Payout as Paid" onConfirm={ref => markPaid(refModal.id, ref)} onCancel={() => setRefModal(null)} />}

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={() => setShowForm(!showForm)} style={{ padding:"10px 22px", borderRadius:50, border:"none", background:showForm?"#f1f5f9":"linear-gradient(135deg,#10b981,#059669)", color:showForm?"#64748b":"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    {showForm?"✕ Cancel":"+ Generate Payout"}
                </button>
            </div>

            {showForm && (
                <div style={{ background:"white", borderRadius:18, padding:"22px 26px", border:"2px solid #bbf7d0" }}>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a", margin:"0 0 18px" }}>🏪 Generate Vendor Payout</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <div style={{ gridColumn:"1/-1" }}>
                            <label style={LS}>Vendor <span style={{ color:"red" }}>*</span></label>
                            <select value={form.vendorId} onChange={e => setF("vendorId",e.target.value)} style={IS}>
                                <option value="">— Select Vendor —</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.restaurantName||v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={LS}>Period (e.g. "Apr 1–15")</label>
                            <input value={form.period} onChange={e => setF("period",e.target.value)} style={IS} placeholder="Apr 1–15" />
                        </div>
                        <div>
                            <label style={LS}>Gross Sales (₦) <span style={{ color:"red" }}>*</span></label>
                            <input type="number" value={form.grossSales} onChange={e => setF("grossSales",e.target.value)} style={IS} placeholder="0" />
                        </div>
                        <div>
                            <label style={LS}>Orders Count</label>
                            <input type="number" value={form.ordersCount} onChange={e => setF("ordersCount",e.target.value)} style={IS} placeholder="0" />
                        </div>
                    </div>
                    <div style={{ marginTop:14, background:"#f0fdf4", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#166534" }}>
                        Platform fee (10%): {fmt(Number(form.grossSales||0)*0.10)} → Net payable: {fmt(Number(form.grossSales||0)*0.90)}
                    </div>
                    <button onClick={create} disabled={saving} style={{ marginTop:16, padding:"12px 28px", borderRadius:50, border:"none", background:saving?"#e2e8f0":"linear-gradient(135deg,#10b981,#059669)", color:saving?"#94a3b8":"white", fontWeight:800, fontSize:14, cursor:saving?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif" }}>
                        {saving?"Generating…":"✓ Generate Payout"}
                    </button>
                </div>
            )}

            <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
                <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead><tr style={{ background:"#f8fafc" }}>
                            {["Vendor","Period","Gross Sales","Platform Fee (10%)","Net Payable","Status","Action"].map(c =>
                                <th key={c} style={{ padding:"13px 18px", textAlign:["Gross Sales","Platform Fee (10%)","Net Payable"].includes(c)?"right":"left", fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{c}</th>
                            )}
                        </tr></thead>
                        <tbody>
                        {payouts.map((p,i) => (
                            <tr key={p.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                                <td style={TD}><span style={{ fontWeight:700 }}>{p.vendorName||p.vendor||"—"}</span></td>
                                <td style={TD}>{p.period||"—"}</td>
                                <td style={{ ...TD, textAlign:"right" }}>{fmt(p.grossSales)}</td>
                                <td style={{ ...TD, textAlign:"right", color:"#ef4444" }}>{fmt(p.platformFee)}</td>
                                <td style={{ ...TD, textAlign:"right", fontWeight:800, color:"#059669" }}>{fmt(p.netPayable)}</td>
                                <td style={{ ...TD, textAlign:"center" }}><StatusBadge status={p.status} /></td>
                                <td style={{ ...TD, textAlign:"center" }}>
                                    {p.status==="PENDING" && (
                                        <button onClick={() => setRefModal({ id:p.id })} style={{ padding:"7px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#10b981,#059669)", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                                            Mark Paid
                                        </button>
                                    )}
                                    {p.status==="PAID" && <span style={{ fontSize:11, color:"#94a3b8" }}>✅ {p.paidAt ? fmtDate(p.paidAt) : "Paid"}</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {payouts.length===0 && <div style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>No vendor payouts yet</div>}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Rider Payouts Tab
// ════════════════════════════════════════════════════════════
const RiderPayoutsTab = ({ payouts, setPayouts, toast }) => {
    const [refModal, setRefModal] = useState(null);
    const [riders,   setRiders]   = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ riderId:"", period:"", grossEarned:"", deliveriesCount:"" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { adminApi.getRiders().then(d => setRiders(Array.isArray(d)?d:[])).catch(()=>{}); }, []);

    const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

    const markPaid = async (id, ref) => {
        try {
            await financeApi.markRiderPaid(id, ref);
            const updated = await financeApi.getRiderPayouts();
            setPayouts(updated);
            toast("Rider payout marked as PAID!", "success");
        } catch (err) { toast(err.message, "error"); }
        finally { setRefModal(null); }
    };

    const create = async () => {
        if (!form.riderId || !form.grossEarned) { toast("Rider and gross earned are required.", "error"); return; }
        setSaving(true);
        try {
            await financeApi.createRiderPayout({ ...form, grossEarned:Number(form.grossEarned), deliveriesCount:Number(form.deliveriesCount)||0 });
            const updated = await financeApi.getRiderPayouts();
            setPayouts(updated);
            toast("Rider payout created!", "success");
            setShowForm(false);
            setForm({ riderId:"", period:"", grossEarned:"", deliveriesCount:"" });
        } catch (err) { toast(err.message, "error"); }
        finally { setSaving(false); }
    };

    const getName = r => [r.firstName, r.lastName].filter(Boolean).join(" ") || r.name || "Rider";

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {refModal && <RefModal title="Mark Rider Payout as Paid" onConfirm={ref => markPaid(refModal.id, ref)} onCancel={() => setRefModal(null)} />}

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={() => setShowForm(!showForm)} style={{ padding:"10px 22px", borderRadius:50, border:"none", background:showForm?"#f1f5f9":"linear-gradient(135deg,#f59e0b,#fbbf24)", color:showForm?"#64748b":"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    {showForm?"✕ Cancel":"+ Generate Payout"}
                </button>
            </div>

            {showForm && (
                <div style={{ background:"white", borderRadius:18, padding:"22px 26px", border:"2px solid #fde68a" }}>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a", margin:"0 0 18px" }}>🏍️ Generate Rider Payout</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <div style={{ gridColumn:"1/-1" }}>
                            <label style={LS}>Rider <span style={{ color:"red" }}>*</span></label>
                            <select value={form.riderId} onChange={e => setF("riderId",e.target.value)} style={IS}>
                                <option value="">— Select Rider —</option>
                                {riders.map(r => <option key={r.id} value={r.id}>{getName(r)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={LS}>Period (e.g. "Apr 1–15")</label>
                            <input value={form.period} onChange={e => setF("period",e.target.value)} style={IS} placeholder="Apr 1–15" />
                        </div>
                        <div>
                            <label style={LS}>Gross Earned (₦) <span style={{ color:"red" }}>*</span></label>
                            <input type="number" value={form.grossEarned} onChange={e => setF("grossEarned",e.target.value)} style={IS} placeholder="0" />
                        </div>
                        <div>
                            <label style={LS}>Deliveries Count</label>
                            <input type="number" value={form.deliveriesCount} onChange={e => setF("deliveriesCount",e.target.value)} style={IS} placeholder="0" />
                        </div>
                    </div>
                    <div style={{ marginTop:14, background:"#fffbeb", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#92400e" }}>
                        Platform cut (20%): {fmt(Number(form.grossEarned||0)*0.20)} → Net payable: {fmt(Number(form.grossEarned||0)*0.80)}
                    </div>
                    <button onClick={create} disabled={saving} style={{ marginTop:16, padding:"12px 28px", borderRadius:50, border:"none", background:saving?"#e2e8f0":"linear-gradient(135deg,#f59e0b,#d97706)", color:saving?"#94a3b8":"white", fontWeight:800, fontSize:14, cursor:saving?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif" }}>
                        {saving?"Generating…":"✓ Generate Payout"}
                    </button>
                </div>
            )}

            <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
                <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead><tr style={{ background:"#f8fafc" }}>
                            {["Rider","Period","Deliveries","Gross Earned","Platform Cut (20%)","Net Payable","Status","Action"].map(c =>
                                <th key={c} style={{ padding:"13px 18px", textAlign:["Gross Earned","Platform Cut (20%)","Net Payable"].includes(c)?"right":"left", fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{c}</th>
                            )}
                        </tr></thead>
                        <tbody>
                        {payouts.map((p,i) => (
                            <tr key={p.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                                <td style={TD}><span style={{ fontWeight:700 }}>{p.riderName||p.rider||"—"}</span></td>
                                <td style={TD}>{p.period||"—"}</td>
                                <td style={TD}>{p.deliveriesCount||0}</td>
                                <td style={{ ...TD, textAlign:"right" }}>{fmt(p.grossEarned)}</td>
                                <td style={{ ...TD, textAlign:"right", color:"#ef4444" }}>{fmt(p.platformCut)}</td>
                                <td style={{ ...TD, textAlign:"right", fontWeight:800, color:"#059669" }}>{fmt(p.netPayable)}</td>
                                <td style={{ ...TD, textAlign:"center" }}><StatusBadge status={p.status} /></td>
                                <td style={{ ...TD, textAlign:"center" }}>
                                    {p.status==="PENDING" && (
                                        <button onClick={() => setRefModal({ id:p.id })} style={{ padding:"7px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                                            Mark Paid
                                        </button>
                                    )}
                                    {p.status==="PAID" && <span style={{ fontSize:11, color:"#94a3b8" }}>✅ {p.paidAt ? fmtDate(p.paidAt) : "Paid"}</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {payouts.length===0 && <div style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>No rider payouts yet</div>}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// Expenses Tab
// ════════════════════════════════════════════════════════════
const CATEGORIES = ["Operations","Marketing","Technology","Salaries","Logistics","Miscellaneous"];

const ExpensesTab = ({ expenses, setExpenses, toast }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ category:"Operations", description:"", amount:"", expenseDate:"", receiptAttached:false });
    const [saving, setSaving] = useState(false);

    const setF = (k,v) => setForm(f => ({ ...f, [k]:v }));

    const create = async () => {
        if (!form.description || !form.amount) { toast("Description and amount are required.", "error"); return; }
        setSaving(true);
        try {
            await financeApi.logExpense({ ...form, amount:Number(form.amount) });
            const updated = await financeApi.getExpenses();
            setExpenses(updated);
            toast("Expense logged!", "success");
            setShowForm(false);
            setForm({ category:"Operations", description:"", amount:"", expenseDate:"", receiptAttached:false });
        } catch (err) { toast(err.message, "error"); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await financeApi.deleteExpense(id);
            const updated = await financeApi.getExpenses();
            setExpenses(updated);
            toast("Expense deleted.", "success");
        } catch (err) { toast(err.message, "error"); }
    };

    const total = expenses.reduce((a,e) => a+(e.amount||0), 0);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:"#ef4444" }}>Total: {fmt(total)}</div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding:"10px 22px", borderRadius:50, border:"none", background:showForm?"#f1f5f9":"linear-gradient(135deg,#ef4444,#dc2626)", color:showForm?"#64748b":"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    {showForm?"✕ Cancel":"+ Log Expense"}
                </button>
            </div>

            {showForm && (
                <div style={{ background:"white", borderRadius:18, padding:"22px 26px", border:"2px solid #fecaca" }}>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a", margin:"0 0 18px" }}>📉 Log Expense</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <div>
                            <label style={LS}>Category</label>
                            <select value={form.category} onChange={e => setF("category",e.target.value)} style={IS}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={LS}>Amount (₦) <span style={{ color:"red" }}>*</span></label>
                            <input type="number" value={form.amount} onChange={e => setF("amount",e.target.value)} style={IS} placeholder="0" />
                        </div>
                        <div style={{ gridColumn:"1/-1" }}>
                            <label style={LS}>Description <span style={{ color:"red" }}>*</span></label>
                            <input value={form.description} onChange={e => setF("description",e.target.value)} style={IS} placeholder="Brief description…" />
                        </div>
                        <div>
                            <label style={LS}>Expense Date</label>
                            <input type="date" value={form.expenseDate} onChange={e => setF("expenseDate",e.target.value)} style={IS} />
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:24 }}>
                            <div onClick={() => setF("receiptAttached",!form.receiptAttached)} style={{ width:20, height:20, borderRadius:4, border:`2px solid ${form.receiptAttached?"#10b981":"#cbd5e1"}`, background:form.receiptAttached?"#10b981":"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s" }}>
                                {form.receiptAttached && <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                            </div>
                            <span style={{ fontSize:13, color:"#64748b" }}>Receipt attached</span>
                        </div>
                    </div>
                    <button onClick={create} disabled={saving} style={{ marginTop:16, padding:"12px 28px", borderRadius:50, border:"none", background:saving?"#e2e8f0":"linear-gradient(135deg,#ef4444,#dc2626)", color:saving?"#94a3b8":"white", fontWeight:800, fontSize:14, cursor:saving?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif" }}>
                        {saving?"Saving…":"✓ Log Expense"}
                    </button>
                </div>
            )}

            <div style={{ background:"white", borderRadius:18, overflow:"hidden", border:"1.5px solid #e2e8f0" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                        {["Date","Category","Description","Amount","Added By","Receipt","Action"].map(c =>
                            <th key={c} style={{ padding:"13px 18px", textAlign:c==="Amount"?"right":"left", fontSize:11, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:0.7 }}>{c}</th>
                        )}
                    </tr></thead>
                    <tbody>
                    {expenses.map((e,i) => (
                        <tr key={e.id||i} style={{ borderTop:"1px solid #f1f5f9" }}>
                            <td style={TD}>{fmtDate(e.expenseDate||e.date)}</td>
                            <td style={TD}><span style={{ background:"#f1f5f9", borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700 }}>{e.category}</span></td>
                            <td style={TD}>{e.description}</td>
                            <td style={{ ...TD, textAlign:"right", fontWeight:800, color:"#ef4444" }}>{fmt(e.amount)}</td>
                            <td style={TD}>{e.addedBy||"—"}</td>
                            <td style={{ ...TD, textAlign:"center" }}>{e.receiptAttached?"✅":"—"}</td>
                            <td style={{ ...TD, textAlign:"center" }}>
                                <button onClick={() => remove(e.id)} style={{ background:"none", border:"1.5px solid #fecaca", color:"#ef4444", borderRadius:8, padding:"5px 12px", cursor:"pointer", fontWeight:700, fontSize:11 }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {expenses.length===0 && <div style={{ padding:"50px", textAlign:"center", color:"#94a3b8" }}>No expenses logged</div>}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════
// MAIN ACCOUNTING DASHBOARD
// ════════════════════════════════════════════════════════════
export default function AccountingDashboard({ onExit }) {
    const [tab,           setTab]           = useState("overview");
    const [vendorPayouts, setVendorPayouts] = useState([]);
    const [riderPayouts,  setRiderPayouts]  = useState([]);
    const [expenses,      setExpenses]      = useState([]);
    const [overview,      setOverview]      = useState({});
    const [loading,       setLoading]       = useState(true);
    const [sidebarOpen,   setSidebarOpen]   = useState(false);
    const [toastMsg,      setToastMsg]      = useState(null);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const toast = useCallback((msg, type="info") => {
        setToastMsg({ msg, type, key:Date.now() });
    }, []);

    // Load all finance data on mount (not on every tab change to reduce API calls)
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ov, vp, rp, exp] = await Promise.all([
                    financeApi.getOverview(),
                    financeApi.getVendorPayouts(),
                    financeApi.getRiderPayouts(),
                    financeApi.getExpenses(),
                ]);
                setOverview(ov || {});
                setVendorPayouts(Array.isArray(vp) ? vp : []);
                setRiderPayouts(Array.isArray(rp)  ? rp : []);
                setExpenses(Array.isArray(exp)      ? exp : []);
            } catch (err) {
                toast("Failed to load finance data: " + err.message, "error");
            } finally { setLoading(false); }
        };
        load();
    }, [toast]);

    // Get name from stored user
    let adminName = "Finance Manager";
    try {
        const u = JSON.parse(localStorage.getItem("chopspot_user")||"{}");
        adminName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Finance Manager";
    } catch (_) {}

    const initials = adminName.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
    const pendingVendorTotal = vendorPayouts.filter(v => v.status==="PENDING").reduce((a,v) => a+(v.netPayable||0), 0);
    const pendingRiderTotal  = riderPayouts.filter(r  => r.status==="PENDING").reduce((a,r) => a+(r.netPayable||0), 0);

    const tabProps = { toast };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing:border-box; }
                @keyframes acIn   { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
                @keyframes pulse  { 0%,100%{opacity:1}50%{opacity:0.45} }
                @keyframes slideUp{ from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                ::-webkit-scrollbar{width:4px;height:4px}
                ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
            `}</style>

            {toastMsg && <Toast key={toastMsg.key} msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

            <div style={{ display:"flex", minHeight:"100vh", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif" }}>
                {sidebarOpen && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:199 }} onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside style={{ width:248, background:"#0f172a", display:"flex", flexDirection:"column", flexShrink:0, position:isMobile?"fixed":"sticky", top:0, height:"100vh", overflowY:"auto", left:isMobile?(sidebarOpen?0:-248):0, transition:isMobile?"left 0.28s cubic-bezier(.34,1.2,.64,1)":"none", zIndex:isMobile?200:"auto" }}>
                    <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#f97316,#fb923c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🍊</div>
                            <div>
                                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"white" }}>Chop<span style={{ color:"#f97316" }}>Spot</span></span>
                                <p style={{ margin:0, fontSize:10, color:"#64748b", letterSpacing:1, fontWeight:700, textTransform:"uppercase" }}>Finance Console</p>
                            </div>
                        </div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:50, padding:"4px 12px" }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b" }} />
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:"#f59e0b" }}>Finance Manager</span>
                        </div>
                    </div>

                    {/* Quick stats sidebar */}
                    <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, color:"#475569", textTransform:"uppercase", margin:"0 0 10px" }}>At a Glance</p>
                        {[
                            { label:"Vendor payouts", value:fmt(pendingVendorTotal), bg:"rgba(124,58,237,0.12)", border:"rgba(124,58,237,0.2)", c:"#a78bfa", vc:"#c4b5fd" },
                            { label:"Rider payouts",  value:fmt(pendingRiderTotal),  bg:"rgba(249,115,22,0.12)", border:"rgba(249,115,22,0.2)", c:"#fb923c", vc:"#fed7aa" },
                        ].map(st => (
                            <div key={st.label} style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:st.c }}>{st.label}</span>
                                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:12, color:st.vc }}>{st.value}</span>
                            </div>
                        ))}
                    </div>

                    <nav style={{ flex:1, padding:"14px 12px" }}>
                        <p style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, color:"#475569", textTransform:"uppercase", padding:"0 8px", margin:"0 0 8px" }}>Navigation</p>
                        {NAV_ITEMS.map(item => {
                            const active = tab===item.id;
                            return (
                                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, border:"none", background:active?"rgba(245,158,11,0.15)":"transparent", color:active?"#fbbf24":"#94a3b8", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:active?700:500, fontSize:14, marginBottom:2, transition:"all 0.18s", textAlign:"left" }}
                                        onMouseEnter={e => { if(!active){ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="white"; }}}
                                        onMouseLeave={e => { if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94a3b8"; }}}
                                >
                                    <span style={{ fontSize:16, width:20, textAlign:"center" }}>{item.icon}</span>
                                    <span style={{ flex:1 }}>{item.label}</span>
                                    {active && <span style={{ width:6, height:6, borderRadius:"50%", background:"#fbbf24" }} />}
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{ padding:"14px 16px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#92400e,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white" }}>{initials}</div>
                            <div>
                                <p style={{ margin:0, fontWeight:700, fontSize:13, color:"white" }}>{adminName}</p>
                                <p style={{ margin:0, fontSize:10, color:"#64748b" }}>Finance Manager</p>
                            </div>
                        </div>
                        {onExit && <button onClick={onExit} style={{ width:"100%", padding:"9px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#94a3b8", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>← Back to App</button>}
                    </div>
                </aside>

                {/* Main content */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
                    <header style={{ background:"white", borderBottom:"1.5px solid #e2e8f0", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, gap:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <button onClick={() => setSidebarOpen(o => !o)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:isMobile?"flex":"none", alignItems:"center" }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <div>
                                <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:"#0f172a", margin:0 }}>
                                    {NAV_ITEMS.find(n => n.id===tab)?.label||"Finance"}
                                </h1>
                                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#94a3b8", margin:0 }}>ChopSpot Finance Console · All figures in ₦</p>
                            </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#fffbeb", border:"1px solid #fef08a", borderRadius:50, padding:"5px 12px" }}>
                                <span style={{ width:7, height:7, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }} />
                                <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:11, color:"#92400e" }}>Finance Manager</span>
                            </div>
                            <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#92400e,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white", fontFamily:"'Sora',sans-serif", border:"2px solid #fef08a" }}>{initials}</div>
                        </div>
                    </header>

                    <main style={{ flex:1, padding:"28px 24px 48px", overflowY:"auto", animation:"acIn 0.3s ease both" }} key={tab}>
                        {loading ? (
                            <div style={{ textAlign:"center", padding:"100px 20px", color:"#64748b" }}>
                                <div style={{ fontSize:32, marginBottom:12 }}>🍊</div>
                                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Loading Finance Console…</p>
                            </div>
                        ) : (
                            <>
                                {tab==="overview" && <OverviewTab overview={overview} vendorPayouts={vendorPayouts} riderPayouts={riderPayouts} expenses={expenses} />}
                                {tab==="sales"    && <SalesTab {...tabProps} />}
                                {tab==="vendors"  && <VendorPayoutsTab payouts={vendorPayouts} setPayouts={setVendorPayouts} {...tabProps} />}
                                {tab==="riders"   && <RiderPayoutsTab  payouts={riderPayouts}  setPayouts={setRiderPayouts}  {...tabProps} />}
                                {tab==="expenses" && <ExpensesTab expenses={expenses} setExpenses={setExpenses} {...tabProps} />}
                                {tab==="reports"  && <div style={{ background:"white", borderRadius:20, padding:"60px 40px", textAlign:"center", border:"1.5px solid #e2e8f0" }}><div style={{ fontSize:52, marginBottom:16 }}>📊</div><h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800 }}>Reports coming soon</h3></div>}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}