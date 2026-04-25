// SettlementsTab.jsx
// Drop-in replacement for the inline SettlementsTab in SuperAdminDashboard.jsx
// Import and use: <SettlementsTab toast={toast} />

import { useState, useEffect, useCallback, useRef } from "react";
import { adminApi } from "../utils/Api";

// ── Shared tokens (copy from SuperAdminDashboard or import from a shared file) ─
const C = {
    accent:  "#6366f1",
    green:   "#10b981",
    red:     "#ef4444",
    orange:  "#f97316",
    gold:    "#f59e0b",
    muted:   "#64748b",
    text:    "#0f172a",
    textSub: "#94a3b8",
    border:  "#e2e8f0",
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

// ── Status badge configs ───────────────────────────────────────────────────────
const STATUS_MAP = {
    FULLY_PAID:     { bg: "#d1fae5", c: "#059669", label: "Fully Paid",     icon: "✅" },
    PARTIALLY_PAID: { bg: "#fef3c7", c: "#b45309", label: "Partially Paid", icon: "⚠️" },
    NOT_PAID:       { bg: "#fee2e2", c: "#b91c1c", label: "Not Paid",       icon: "❌" },
    OVER_PAID:      { bg: "#ede9fe", c: "#7c3aed", label: "Over Paid",      icon: "⬆️" },
    VENDOR:         { bg: "#d1fae5", c: "#059669", label: "Vendor",         icon: "" },
    RIDER:          { bg: "#fef3c7", c: "#b45309", label: "Rider",          icon: "" },
};

const StatusBadge = ({ status }) => {
    const m = STATUS_MAP[(status || "").toUpperCase()] || { bg: "#f1f5f9", c: "#64748b", label: status };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: m.bg, color: m.c, whiteSpace: "nowrap" }}>
            {m.icon} {m.label}
        </span>
    );
};

// ── Skeleton loader ────────────────────────────────────────────────────────────
const Skeleton = () => (
    <div style={{ background: "white", borderRadius: 18, padding: 24, border: `1.5px solid ${C.border}` }}>
        {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, opacity: 1 - i * 0.2 }}>
                {[...Array(6)].map((_, j) => (
                    <div key={j} style={{ height: 13, borderRadius: 7, background: "#f1f5f9", flex: j === 0 ? 2 : 1, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))}
            </div>
        ))}
    </div>
);

// ── Data table wrapper ─────────────────────────────────────────────────────────
const DataTable = ({ cols, children }) => (
    <div style={{ background: "white", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
                    {cols.map(c => (
                        <th key={c} style={{ padding: "13px 18px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: 0.7, textTransform: "uppercase", whiteSpace: "nowrap" }}>{c}</th>
                    ))}
                </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    </div>
);

const td = { padding: "13px 18px", fontSize: 13, color: "#334155", verticalAlign: "middle" };

// ── Searchable recipient dropdown ──────────────────────────────────────────────
function RecipientSelector({ recipientType, value, onSelect, disabled }) {
    const [options,   setOptions]   = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [query,     setQuery]     = useState("");
    const [open,      setOpen]      = useState(false);
    const [selected,  setSelected]  = useState(null);
    const ref = useRef(null);

    // Fetch list when recipientType changes
    useEffect(() => {
        if (!recipientType) return;
        setLoading(true);
        setSelected(null);
        setQuery("");
        onSelect(null);

        const fetch = recipientType === "VENDOR"
            ? adminApi.getVendors()
            : adminApi.getRiders();

        fetch
            .then(data => {
                const list = (Array.isArray(data) ? data : []).map(r => ({
                    id:    r.id,
                    label: recipientType === "VENDOR"
                        ? (r.restaurantName || r.ownerName || r.id)
                        : ([r.firstName, r.lastName].filter(Boolean).join(" ") || r.id),
                    sub:   recipientType === "VENDOR" ? r.ownerName : r.vehicleType,
                    bankName:      recipientType === "VENDOR" ? (r.bankName || "—") : r.bankName,
                    accountNumber: recipientType === "VENDOR" ? (r.accountNumber || "—") : r.accountNumber,
                    accountName:   recipientType === "VENDOR" ? r.ownerName : r.accountName,
                    raw: r,
                }));
                setOptions(list);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [recipientType]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close on outside click
    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub || "").toLowerCase().includes(query.toLowerCase())
    );

    const choose = (opt) => {
        setSelected(opt);
        setQuery(opt.label);
        setOpen(false);
        onSelect(opt);
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>
                Recipient <span style={{ color: C.red }}>*</span>
            </label>
            <div
                style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${open ? C.accent : C.border}`, fontSize: 13, background: disabled ? "#f8fafc" : "white", cursor: disabled ? "not-allowed" : "pointer", gap: 8 }}
                onClick={() => { if (!disabled && !loading) setOpen(o => !o); }}
            >
                {loading
                    ? <span style={{ color: C.muted }}>Loading {recipientType?.toLowerCase()}s…</span>
                    : selected
                        ? <span style={{ flex: 1, fontWeight: 600, color: C.text }}>{selected.label}</span>
                        : <span style={{ flex: 1, color: C.muted }}>Search and select a {recipientType?.toLowerCase() || "recipient"}…</span>
                }
                <span style={{ color: C.muted, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div style={{ position: "absolute", zIndex: 200, top: "calc(100% + 4px)", left: 0, right: 0, background: "white", borderRadius: 12, border: `1.5px solid ${C.border}`, boxShadow: "0 8px 28px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={`Search ${recipientType?.toLowerCase()}s…`}
                            style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
                        />
                    </div>
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                        {filtered.length === 0
                            ? <div style={{ padding: "16px", textAlign: "center", color: C.muted, fontSize: 13 }}>No results</div>
                            : filtered.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => choose(opt)}
                                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid #f8fafc`, transition: "background 0.12s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{opt.label}</div>
                                    {opt.sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{opt.sub}</div>}
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Bank details preview when a recipient is selected */}
            {selected && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 11 }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>Bank: </span>
                    <span style={{ color: "#334155" }}>{selected.bankName || "—"} · {selected.accountNumber || "—"} ({selected.accountName || "—"})</span>
                </div>
            )}
        </div>
    );
}

// ── Settlement form ─────────────────────────────────────────────────────────────
function SettlementForm({ prefill, onSaved, onCancel, toast }) {
    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        recipientType:    prefill?.recipientType    || "VENDOR",
        recipientId:      prefill?.recipientId      || "",
        recipientName:    prefill?.recipientName    || "",
        settlementDate:   prefill?.settlementDate   || today,
        ordersCount:      prefill?.ordersCount      != null ? String(prefill.ordersCount) : "",
        grossAmount:      prefill?.grossAmount      != null ? String(prefill.grossAmount) : "",
        netTransferred:   prefill?.netTransferred   != null ? String(prefill.netTransferred) : "",
        transferReference: "",
        notes:            "",
    });

    const [saving, setSaving] = useState(false);
    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleRecipientSelect = (opt) => {
        if (!opt) { setF("recipientId", ""); setF("recipientName", ""); return; }
        setF("recipientId",   opt.id);
        setF("recipientName", opt.label);
    };

    const handleTypeChange = (type) => {
        setForm(f => ({
            ...f,
            recipientType: type,
            recipientId:   "",
            recipientName: "",
            // Reset financial fields if no prefill locked them
            ...(!prefill ? { ordersCount: "", grossAmount: "", netTransferred: "" } : {}),
        }));
    };

    const submit = async () => {
        if (!form.recipientId)   { toast("Please select a recipient.", "error"); return; }
        if (!form.grossAmount)   { toast("Gross amount is required.", "error"); return; }
        setSaving(true);
        try {
            await adminApi.createSettlement({
                ...form,
                ordersCount:    Number(form.ordersCount) || 0,
                grossAmount:    Number(form.grossAmount),
                netTransferred: form.netTransferred ? Number(form.netTransferred) : undefined,
            });
            toast("Settlement recorded successfully!", "success");
            onSaved();
        } catch (err) {
            toast("Failed to save: " + err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const is = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: "#334155", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
    const ls = { fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 };

    return (
        <div style={{ background: "white", borderRadius: 18, padding: "22px 26px", border: "2px solid #fed7aa", boxShadow: "0 4px 20px rgba(249,115,22,0.08)" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: C.text, margin: "0 0 20px" }}>
                💳 Record Manual Settlement
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Recipient type selector */}
                <div>
                    <label style={ls}>Recipient Type <span style={{ color: C.red }}>*</span></label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["VENDOR", "RIDER"].map(t => (
                            <button
                                key={t}
                                onClick={() => handleTypeChange(t)}
                                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${form.recipientType === t ? C.accent : C.border}`, background: form.recipientType === t ? `${C.accent}18` : "white", color: form.recipientType === t ? C.accent : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                            >{t}</button>
                        ))}
                    </div>
                </div>

                {/* Settlement date */}
                <div>
                    <label style={ls}>Settlement Date</label>
                    <input type="date" value={form.settlementDate} onChange={e => setF("settlementDate", e.target.value)} style={is} />
                </div>

                {/* Recipient searchable dropdown — spans full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <RecipientSelector
                        recipientType={form.recipientType}
                        value={form.recipientId}
                        onSelect={handleRecipientSelect}
                    />
                </div>

                {/* Orders count — read-only if prefilled */}
                <div>
                    <label style={ls}>Orders Count</label>
                    <input
                        type="number"
                        value={form.ordersCount}
                        onChange={e => setF("ordersCount", e.target.value)}
                        readOnly={!!prefill?.ordersCount}
                        style={{ ...is, background: prefill?.ordersCount ? "#f8fafc" : "white", cursor: prefill?.ordersCount ? "not-allowed" : "text" }}
                        placeholder="Auto-populated from orders"
                    />
                </div>

                {/* Gross amount — read-only if prefilled */}
                <div>
                    <label style={ls}>Gross Amount (₦) <span style={{ color: C.red }}>*</span></label>
                    <input
                        type="number"
                        value={form.grossAmount}
                        onChange={e => setF("grossAmount", e.target.value)}
                        readOnly={!!prefill?.grossAmount}
                        style={{ ...is, background: prefill?.grossAmount ? "#f8fafc" : "white", cursor: prefill?.grossAmount ? "not-allowed" : "text" }}
                        placeholder="Total order value"
                    />
                </div>

                {/* Net transferred — editable even if prefilled */}
                <div>
                    <label style={ls}>Net Transferred (₦)</label>
                    <input
                        type="number"
                        value={form.netTransferred}
                        onChange={e => setF("netTransferred", e.target.value)}
                        style={is}
                        placeholder="Actual amount sent to recipient"
                    />
                    {prefill?.balance != null && prefill.balance > 0 && (
                        <p style={{ fontSize: 11, color: C.orange, margin: "4px 0 0", fontWeight: 600 }}>
                            Balance outstanding: {fmt(prefill.balance)}
                        </p>
                    )}
                </div>

                {/* Transfer reference */}
                <div>
                    <label style={ls}>Transfer Reference</label>
                    <input type="text" value={form.transferReference} onChange={e => setF("transferReference", e.target.value)} style={is} placeholder="Bank receipt / ref no." />
                </div>

                {/* Notes — spans full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={ls}>Notes</label>
                    <input type="text" value={form.notes} onChange={e => setF("notes", e.target.value)} style={is} placeholder="Optional notes" />
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                    onClick={submit}
                    disabled={saving}
                    style={{ padding: "12px 30px", borderRadius: 50, border: "none", background: saving ? "#e2e8f0" : "linear-gradient(135deg,#10b981,#059669)", color: saving ? "#94a3b8" : "white", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif" }}
                >{saving ? "Saving…" : "✓ Save Settlement"}</button>
                <button
                    onClick={onCancel}
                    style={{ padding: "12px 24px", borderRadius: 50, border: `1.5px solid ${C.border}`, background: "white", color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                >Cancel</button>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// Main SettlementsTab export
// ════════════════════════════════════════════════════════════════════════════════
export default function SettlementsTab({ toast }) {
    const today = new Date().toISOString().split("T")[0];

    const [subTab,      setSubTab]     = useState("orders");
    const [date,        setDate]       = useState(today);
    const [filterType,  setFilterType] = useState("ALL");
    const [ordersData,  setOrdersData] = useState(null);
    const [settlements, setSettles]    = useState([]);
    const [loading,     setLoading]    = useState(false);
    const [formPrefill, setFormPrefill]= useState(null); // null = hidden; {} = open blank; {...} = prefilled

    // ── Loaders ───────────────────────────────────────────────────────────────
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const t = filterType === "ALL" ? null : filterType;
            setOrdersData(await adminApi.getSettlementOrders(date, t));
        } catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [date, filterType, toast]);

    const loadSettlements = useCallback(async () => {
        setLoading(true);
        try {
            const t = filterType === "ALL" ? null : filterType;
            const data = await adminApi.getSettlements(null, t);
            setSettles(Array.isArray(data) ? data : []);
        } catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [filterType, toast]);

    useEffect(() => {
        if (subTab === "orders")  loadOrders();
        else                      loadSettlements();
    }, [subTab, loadOrders, loadSettlements]);

    // ── Derive displayed groups ───────────────────────────────────────────────
    const allGroups = [
        ...((ordersData?.vendorGroups || []).map(g => ({ ...g, recipientType: "VENDOR" }))),
        ...((ordersData?.riderGroups  || []).map(g => ({ ...g, recipientType: "RIDER" }))),
    ].filter(g => filterType === "ALL" || g.recipientType === filterType);

    // ── Summary totals for orders view ────────────────────────────────────────
    const totalGross    = allGroups.reduce((a, g) => a + (g.grossAmount || 0), 0);
    const totalNet      = allGroups.reduce((a, g) => a + (g.netPayable  || 0), 0);
    const totalPaid     = allGroups.reduce((a, g) => a + (g.totalPaid   || 0), 0);
    const totalBalance  = totalNet - totalPaid;

    // ── Open form prefilled from a group row ──────────────────────────────────
    const openPrefilled = (g) => {
        setFormPrefill({
            recipientType:  g.recipientType,
            recipientId:    g.recipientId,
            recipientName:  g.recipientName || g.recipientId,
            settlementDate: date,
            ordersCount:    g.ordersCount,
            grossAmount:    g.grossAmount,
            // Suggest balance as net transferred if partially paid, else full net
            netTransferred: g.balance > 0 ? g.balance : g.netPayable,
            balance:        g.balance,
        });
        setSubTab("form");
    };

    const onFormSaved = () => {
        setFormPrefill(null);
        setSubTab("records");
        loadSettlements();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Header card */}
            <div style={{ background: "white", borderRadius: 18, padding: "18px 22px", border: `1.5px solid ${C.border}` }}>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: C.text, margin: "0 0 4px" }}>
                    💳 Manual Settlements
                </h2>
                <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
                    Review delivered orders by date, then record manual bank transfers to vendors and riders.
                </p>
            </div>

            {/* Sub-tab navigation */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                    ["orders",  "📦 Treated Orders"],
                    ["records", "📋 Settlement Records"],
                    ["form",    "➕ Record Settlement"],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => { if (id !== "form") { setFormPrefill(null); } setSubTab(id); }}
                        style={{ padding: "9px 20px", borderRadius: 50, border: `2px solid ${subTab === id ? C.accent : C.border}`, background: subTab === id ? C.accent : "white", color: subTab === id ? "white" : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                    >{label}</button>
                ))}
            </div>

            {/* Date + type filter bar (not shown on form sub-tab) */}
            {subTab !== "form" && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    {subTab === "orders" && (
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                               style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none" }} />
                    )}
                    {["ALL", "VENDOR", "RIDER"].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                                style={{ padding: "7px 16px", borderRadius: 50, border: `2px solid ${filterType === t ? C.accent : C.border}`, background: filterType === t ? C.accent : "white", color: filterType === t ? "white" : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {/* ── FORM sub-tab ── */}
            {subTab === "form" && (
                <SettlementForm
                    prefill={formPrefill}
                    toast={toast}
                    onSaved={onFormSaved}
                    onCancel={() => setSubTab("orders")}
                />
            )}

            {/* ── TREATED ORDERS sub-tab ── */}
            {subTab === "orders" && (
                loading ? <Skeleton /> : (
                    <>
                        {/* Summary strip */}
                        {allGroups.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                                {[
                                    { label: "Gross Revenue",    value: fmt(totalGross),   color: "#1a5c1a" },
                                    { label: "Net Payable",      value: fmt(totalNet),     color: C.accent  },
                                    { label: "Total Settled",    value: fmt(totalPaid),    color: C.green   },
                                    { label: "Outstanding",      value: fmt(Math.max(0, totalBalance)), color: totalBalance > 0 ? C.red : C.green },
                                ].map(s => (
                                    <div key={s.label} style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${C.border}` }}>
                                        <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600 }}>{s.label}</p>
                                        <p style={{ margin: "4px 0 0", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <DataTable cols={["Recipient", "Type", "Orders", "Gross", "Platform Cut", "Net Payable", "Settled", "Status", "Action"]}>
                            {allGroups.length === 0 ? (
                                <tr><td colSpan={9} style={{ padding: "50px", textAlign: "center", color: C.muted }}>No delivered orders found for {date}</td></tr>
                            ) : allGroups.map((g, i) => (
                                <tr
                                    key={i}
                                    style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.12s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                                    onClick={() => openPrefilled(g)}
                                >
                                    <td style={td}>
                                        <div style={{ fontWeight: 700 }}>{g.recipientName || g.recipientId}</div>
                                        {g.ownerName && g.ownerName !== g.recipientName && (
                                            <div style={{ fontSize: 11, color: C.muted }}>{g.ownerName}</div>
                                        )}
                                    </td>
                                    <td style={{ ...td, textAlign: "center" }}><StatusBadge status={g.recipientType} /></td>
                                    <td style={td}>{g.ordersCount}</td>
                                    <td style={{ ...td, fontWeight: 700, color: "#1a5c1a" }}>{fmt(g.grossAmount)}</td>
                                    <td style={{ ...td, color: C.red }}>{fmt(g.platformCut)}</td>
                                    <td style={{ ...td, fontWeight: 800, color: "#059669" }}>{fmt(g.netPayable)}</td>
                                    <td style={{ ...td, fontWeight: 700, color: C.accent }}>{fmt(g.totalPaid)}</td>
                                    <td style={{ ...td, textAlign: "center" }}><StatusBadge status={g.paymentStatus} /></td>
                                    <td style={{ ...td, textAlign: "center" }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); openPrefilled(g); }}
                                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: g.paymentStatus === "FULLY_PAID" ? "#d1fae5" : "linear-gradient(135deg,#f97316,#fb923c)", color: g.paymentStatus === "FULLY_PAID" ? "#059669" : "white", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}
                                        >
                                            {g.paymentStatus === "FULLY_PAID" ? "✓ Settled" : g.paymentStatus === "PARTIALLY_PAID" ? "Pay Balance" : "Record Payment"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    </>
                )
            )}

            {/* ── SETTLEMENT RECORDS sub-tab ── */}
            {subTab === "records" && (
                loading ? <Skeleton /> : (
                    <DataTable cols={["Recipient", "Type", "Date", "Orders", "Gross", "Net Transferred", "Reference", "Recorded By"]}>
                        {settlements.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: "50px", textAlign: "center", color: C.muted }}>No settlement records found</td></tr>
                        ) : settlements.map((s, i) => (
                            <tr key={s.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
                                <td style={td}>
                                    <div style={{ fontWeight: 700 }}>{s.recipientName || s.recipientId}</div>
                                    {s.accountNumber && s.accountNumber !== "—" && (
                                        <div style={{ fontSize: 11, color: C.muted }}>{s.bankName} · {s.accountNumber}</div>
                                    )}
                                </td>
                                <td style={{ ...td, textAlign: "center" }}><StatusBadge status={s.recipientType} /></td>
                                <td style={td}>{s.settlementDate}</td>
                                <td style={td}>{s.ordersCount ?? "—"}</td>
                                <td style={{ ...td, fontWeight: 700, color: "#1a5c1a" }}>{fmt(s.grossAmount)}</td>
                                <td style={{ ...td, fontWeight: 800, color: "#059669" }}>{fmt(s.netTransferred)}</td>
                                <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>{s.transferReference || "—"}</td>
                                <td style={{ ...td, color: C.muted }}>{s.recordedBy || "—"}</td>
                            </tr>
                        ))}
                    </DataTable>
                )
            )}
        </div>
    );
}