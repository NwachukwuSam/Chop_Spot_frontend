// SettlementsTab.jsx
// Drop-in replacement — import and use: <SettlementsTab toast={toast} />

import { useState, useEffect, useCallback, useRef } from "react";
import { adminApi } from "../utils/Api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    accent:   "#6366f1",
    accentL:  "rgba(99,102,241,0.1)",
    green:    "#10b981",
    greenL:   "#d1fae5",
    red:      "#ef4444",
    redL:     "#fee2e2",
    orange:   "#f97316",
    orangeL:  "#fff7ed",
    gold:     "#f59e0b",
    goldL:    "#fef3c7",
    purple:   "#7c3aed",
    purpleL:  "#ede9fe",
    muted:    "#64748b",
    text:     "#0f172a",
    textSub:  "#94a3b8",
    border:   "#e2e8f0",
    bg:       "#f8fafc",
};

const fmt = (n) =>
    `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

// ── Payment status config ─────────────────────────────────────────────────────
const PAY_STATUS = {
    FULLY_PAID:     { bg: C.greenL,  c: "#059669", label: "Fully Paid",     icon: "✅", bar: C.green  },
    PARTIALLY_PAID: { bg: C.goldL,   c: "#b45309", label: "Partially Paid", icon: "⚠️", bar: C.gold   },
    NOT_PAID:       { bg: C.redL,    c: "#b91c1c", label: "Not Paid",       icon: "❌", bar: C.red    },
    OVER_PAID:      { bg: C.purpleL, c: C.purple,  label: "Over Paid",      icon: "⬆️", bar: C.purple },
};
const TYPE_CFG = {
    VENDOR: { bg: C.greenL,  c: "#059669", icon: "🏪" },
    RIDER:  { bg: C.goldL,   c: "#b45309", icon: "🏍️" },
};

const PayBadge = ({ status }) => {
    const m = PAY_STATUS[(status || "").toUpperCase()] || { bg: "#f1f5f9", c: C.muted, label: status || "—", icon: "" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: m.bg, color: m.c, whiteSpace: "nowrap" }}>
            {m.icon} {m.label}
        </span>
    );
};
const TypeBadge = ({ type }) => {
    const m = TYPE_CFG[(type || "").toUpperCase()] || { bg: "#f1f5f9", c: C.muted, icon: "" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: m.bg, color: m.c }}>
            {m.icon} {type}
        </span>
    );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const PayProgress = ({ net, paid }) => {
    const pct = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 0;
    const status = PAY_STATUS[
        paid <= 0 ? "NOT_PAID"
            : Math.abs(net - paid) < 0.01 ? "FULLY_PAID"
                : paid > net + 0.01 ? "OVER_PAID"
                    : "PARTIALLY_PAID"
        ] || PAY_STATUS.NOT_PAID;
    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Settled {pct}%</span>
                <span style={{ fontSize: 10, color: status.c, fontWeight: 700 }}>{fmt(paid)} / {fmt(net)}</span>
            </div>
            <div style={{ height: 5, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: status.bar, borderRadius: 10, transition: "width 0.4s ease" }} />
            </div>
        </div>
    );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = () => (
    <div style={{ background: "white", borderRadius: 18, padding: 24, border: `1.5px solid ${C.border}` }}>
        {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, opacity: 1 - i * 0.2 }}>
                {[...Array(6)].map((_, j) => (
                    <div key={j} style={{ height: 13, borderRadius: 7, background: "#f1f5f9", flex: j === 0 ? 2 : 1, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))}
            </div>
        ))}
    </div>
);

// ── Mini stat card ────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, color, sub }) => (
    <div style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${C.border}`, flex: 1, minWidth: 140 }}>
        <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color, lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>{sub}</p>}
    </div>
);

// ── Table wrapper ─────────────────────────────────────────────────────────────
const DataTable = ({ cols, children, minWidth }) => (
    <div style={{ background: "white", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: minWidth || 700 }}>
                <thead>
                <tr style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
                    {cols.map(c => (
                        <th key={c} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#64748b", letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>{c}</th>
                    ))}
                </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    </div>
);

const TD = { padding: "13px 16px", fontSize: 13, color: "#334155", verticalAlign: "middle" };

// ══════════════════════════════════════════════════════════════════════════════
// RecipientSelector — searchable dropdown for vendors or riders
// ══════════════════════════════════════════════════════════════════════════════
function RecipientSelector({ recipientType, onSelect, disabled, lockedLabel }) {
    const [options,  setOptions]  = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [query,    setQuery]    = useState("");
    const [open,     setOpen]     = useState(false);
    const [selected, setSelected] = useState(null);
    const ref = useRef(null);

    // Reset + fetch when type changes
    useEffect(() => {
        if (!recipientType) return;
        // Don't wipe the prefilled recipient when the form is locked
        if (disabled) return;
        setSelected(null);
        setQuery("");
        onSelect(null);
        setLoading(true);

        const promise = recipientType === "VENDOR"
            ? adminApi.getVendors()
            : adminApi.getRiders();

        promise
            .then(data => {
                const list = (Array.isArray(data) ? data : []).map(r => ({
                    id:            r.id,
                    label:         recipientType === "VENDOR"
                        ? (r.restaurantName || r.name || r.id)
                        : ([r.firstName, r.lastName].filter(Boolean).join(" ") || r.id),
                    sub:           recipientType === "VENDOR" ? (r.ownerName || r.category) : r.vehicleType,
                    bankName:      r.bankName || (recipientType === "VENDOR" ? r.restaurantPhone : null) || "—",
                    accountNumber: r.accountNumber || "—",
                    accountName:   recipientType === "VENDOR" ? (r.ownerName || r.restaurantName) : r.accountName,
                    raw: r,
                }));
                setOptions(list);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipientType]);

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

    // If locked (coming from prefill), show a read-only display
    if (disabled && lockedLabel) {
        return (
            <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>
                    Recipient
                </label>
                <div style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "#f8fafc", fontSize: 13, color: C.text, fontWeight: 600 }}>
                    {lockedLabel}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>
                Recipient <span style={{ color: C.red }}>*</span>
            </label>
            <div
                onClick={() => { if (!disabled && !loading) setOpen(o => !o); }}
                style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${open ? C.accent : C.border}`, background: disabled ? "#f8fafc" : "white", cursor: disabled ? "not-allowed" : "pointer", gap: 8, transition: "border-color 0.18s" }}
            >
                {loading
                    ? <span style={{ flex: 1, color: C.muted, fontSize: 13 }}>Loading {recipientType?.toLowerCase()}s…</span>
                    : selected
                        ? <span style={{ flex: 1, fontWeight: 600, color: C.text, fontSize: 13 }}>{selected.label}</span>
                        : <span style={{ flex: 1, color: C.muted, fontSize: 13 }}>Search and select a {recipientType?.toLowerCase() || "recipient"}…</span>
                }
                <span style={{ color: C.muted, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div style={{ position: "absolute", zIndex: 300, top: "calc(100% + 4px)", left: 0, right: 0, background: "white", borderRadius: 12, border: `1.5px solid ${C.border}`, boxShadow: "0 10px 32px rgba(0,0,0,0.14)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={`Search ${recipientType?.toLowerCase()}s…`}
                            style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif", background: "transparent" }}
                        />
                    </div>
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                        {filtered.length === 0
                            ? <div style={{ padding: 16, textAlign: "center", color: C.muted, fontSize: 13 }}>No results</div>
                            : filtered.map(opt => (
                                <div key={opt.id} onClick={() => choose(opt)}
                                     style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid #f8fafc`, transition: "background 0.1s" }}
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

            {/* Bank details preview */}
            {selected && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 11, lineHeight: 1.6 }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>Bank: </span>
                    <span style={{ color: "#334155" }}>{selected.bankName} · {selected.accountNumber} ({selected.accountName || "—"})</span>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// SettlementForm — handles both blank & prefilled (locked) states
// ══════════════════════════════════════════════════════════════════════════════
function SettlementForm({ prefill, onSaved, onCancel, toast }) {
    const today = new Date().toISOString().split("T")[0];

    // isLocked = came from "Record Payment" button — financials are read-only
    const isLocked = prefill?.locked === true;

    const [form, setForm] = useState({
        recipientType:     prefill?.recipientType    || "VENDOR",
        recipientId:       prefill?.recipientId      || "",
        recipientName:     prefill?.recipientName    || "",
        settlementDate:    prefill?.settlementDate   || today,
        ordersCount:       prefill?.ordersCount      != null ? String(prefill.ordersCount)    : "",
        grossAmount:       prefill?.grossAmount      != null ? String(prefill.grossAmount)    : "",
        netTransferred:    prefill?.netTransferred   != null ? String(prefill.netTransferred) : "",
        transferReference: "",
        notes:             "",
    });

    const [autoLoading, setAutoLoading] = useState(false);
    const [saving,      setSaving]      = useState(false);

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // ── When type changes (only in non-locked mode), reset financials ────────
    const handleTypeChange = (type) => {
        if (isLocked) return;
        setForm(f => ({
            ...f,
            recipientType:  type,
            recipientId:    "",
            recipientName:  "",
            ordersCount:    "",
            grossAmount:    "",
            netTransferred: "",
        }));
    };

    // ── When recipient is selected, auto-fetch orders for that date ──────────
    const handleRecipientSelect = useCallback(async (opt) => {
        if (!opt) { setF("recipientId", ""); setF("recipientName", ""); return; }
        setF("recipientId",   opt.id);
        setF("recipientName", opt.label);

        if (!form.settlementDate) return;

        setAutoLoading(true);
        try {
            const data = await adminApi.getSettlementOrders(form.settlementDate, form.recipientType);
            const groups = [
                ...((data?.vendorGroups || []).map(g => ({ ...g, recipientType: "VENDOR" }))),
                ...((data?.riderGroups  || []).map(g => ({ ...g, recipientType: "RIDER" }))),
            ];
            const match = groups.find(g => g.recipientId === opt.id);
            if (match) {
                setForm(f => ({
                    ...f,
                    ordersCount:    String(match.ordersCount || ""),
                    grossAmount:    String(match.grossAmount || ""),
                    netTransferred: String(
                        match.balance > 0 ? match.balance : (match.netPayable || "")
                    ),
                }));
            } else {
                setForm(f => ({ ...f, ordersCount: "0", grossAmount: "0", netTransferred: "0" }));
                toast(`No delivered orders found for this ${form.recipientType.toLowerCase()} on ${form.settlementDate}.`, "info");
            }
        } catch (err) {
            toast("Could not fetch orders: " + err.message, "error");
        } finally {
            setAutoLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.settlementDate, form.recipientType, toast]);

    // ── When date changes (non-locked), re-fetch if recipient already picked ─
    const handleDateChange = async (newDate) => {
        if (isLocked) return;
        setF("settlementDate", newDate);
        if (!form.recipientId || !newDate) return;

        setAutoLoading(true);
        try {
            const data = await adminApi.getSettlementOrders(newDate, form.recipientType);
            const groups = [
                ...((data?.vendorGroups || []).map(g => ({ ...g, recipientType: "VENDOR" }))),
                ...((data?.riderGroups  || []).map(g => ({ ...g, recipientType: "RIDER" }))),
            ];
            const match = groups.find(g => g.recipientId === form.recipientId);
            if (match) {
                setForm(f => ({
                    ...f,
                    settlementDate:  newDate,
                    ordersCount:     String(match.ordersCount || ""),
                    grossAmount:     String(match.grossAmount || ""),
                    netTransferred:  String(match.balance > 0 ? match.balance : (match.netPayable || "")),
                }));
            } else {
                setForm(f => ({ ...f, settlementDate: newDate, ordersCount: "0", grossAmount: "0", netTransferred: "0" }));
            }
        } catch { /* silent */ } finally { setAutoLoading(false); }
    };

    const submit = async () => {
        if (!form.recipientId)  { toast("Please select a recipient.", "error"); return; }
        if (!form.grossAmount)  { toast("Gross amount is required.",  "error"); return; }
        setSaving(true);
        try {
            await adminApi.createSettlement({
                recipientType:     form.recipientType,
                recipientId:       form.recipientId,
                recipientName:     form.recipientName,
                settlementDate:    form.settlementDate,
                ordersCount:       Number(form.ordersCount) || 0,
                grossAmount:       Number(form.grossAmount),
                netTransferred:    form.netTransferred ? Number(form.netTransferred) : undefined,
                transferReference: form.transferReference,
                notes:             form.notes,
            });
            toast("Settlement recorded successfully!", "success");
            onSaved();
        } catch (err) {
            toast("Failed to save: " + err.message, "error");
        } finally { setSaving(false); }
    };

    const IS = {
        width: "100%", padding: "10px 14px", borderRadius: 10,
        border: `1.5px solid ${C.border}`, fontSize: 13, color: "#334155",
        fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
    };
    const LS = { fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 };
    const roStyle = { ...IS, background: "#f8fafc", cursor: "not-allowed", color: C.muted };

    return (
        <div style={{ background: "white", borderRadius: 18, padding: "24px 28px", border: "2px solid #fed7aa", boxShadow: "0 4px 20px rgba(249,115,22,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: C.text, margin: 0 }}>
                    💳 Record Manual Settlement
                </h3>
                {isLocked && (
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", padding: "4px 12px", borderRadius: 20, fontWeight: 700, border: "1px solid #fde68a" }}>
                        🔒 Auto-filled from order
                    </span>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Recipient type */}
                <div>
                    <label style={LS}>Recipient Type <span style={{ color: C.red }}>*</span></label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["VENDOR", "RIDER"].map(t => (
                            <button key={t} onClick={() => handleTypeChange(t)} disabled={isLocked}
                                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${form.recipientType === t ? C.accent : C.border}`, background: form.recipientType === t ? C.accentL : "white", color: form.recipientType === t ? C.accent : C.muted, fontWeight: 700, fontSize: 13, cursor: isLocked ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: isLocked ? 0.7 : 1 }}
                            >{t === "VENDOR" ? "🏪 VENDOR" : "🏍️ RIDER"}</button>
                        ))}
                    </div>
                </div>

                {/* Settlement date */}
                <div>
                    <label style={LS}>Settlement Date</label>
                    <input type="date" value={form.settlementDate}
                           onChange={e => handleDateChange(e.target.value)}
                           readOnly={isLocked}
                           style={isLocked ? roStyle : IS}
                    />
                </div>

                {/* Recipient selector — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <RecipientSelector
                        recipientType={form.recipientType}
                        onSelect={handleRecipientSelect}
                        disabled={isLocked}
                        lockedLabel={isLocked ? form.recipientName : undefined}
                    />
                </div>

                {/* Auto-loading indicator */}
                {autoLoading && (
                    <div style={{ gridColumn: "1 / -1", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                        Fetching order data for {form.settlementDate}…
                    </div>
                )}

                {/* Orders count — auto-filled, read-only */}
                <div>
                    <label style={LS}>
                        Orders Count
                        <span style={{ fontSize: 10, color: C.green, fontWeight: 600, marginLeft: 6, textTransform: "none" }}>auto-filled</span>
                    </label>
                    <input type="number" value={form.ordersCount} readOnly
                           style={roStyle} placeholder="Select recipient + date first"
                    />
                </div>

                {/* Gross amount — auto-filled, read-only */}
                <div>
                    <label style={LS}>
                        Gross Amount (₦) <span style={{ color: C.red }}>*</span>
                        <span style={{ fontSize: 10, color: C.green, fontWeight: 600, marginLeft: 6, textTransform: "none" }}>auto-filled</span>
                    </label>
                    <input type="number" value={form.grossAmount} readOnly
                           style={roStyle} placeholder="Select recipient + date first"
                    />
                    {form.grossAmount && (
                        <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0" }}>
                            Platform cut: {fmt(Number(form.grossAmount) * (form.recipientType === "VENDOR" ? 0.10 : 0.20))}
                        </p>
                    )}
                </div>

                {/* Net transferred — auto-suggested, EDITABLE */}
                <div>
                    <label style={LS}>
                        Net Transferred (₦)
                        <span style={{ fontSize: 10, color: C.gold, fontWeight: 600, marginLeft: 6, textTransform: "none" }}>suggested · editable</span>
                    </label>
                    <input type="number" value={form.netTransferred}
                           onChange={e => setF("netTransferred", e.target.value)}
                           style={IS} placeholder="Actual amount sent"
                    />
                    {prefill?.balance != null && prefill.balance > 0 && (
                        <p style={{ fontSize: 11, color: C.orange, margin: "4px 0 0", fontWeight: 600 }}>
                            Balance outstanding: {fmt(prefill.balance)}
                        </p>
                    )}
                </div>

                {/* Transfer reference */}
                <div>
                    <label style={LS}>Transfer Reference</label>
                    <input type="text" value={form.transferReference}
                           onChange={e => setF("transferReference", e.target.value)}
                           style={IS} placeholder="Bank receipt / TRF number"
                    />
                </div>

                {/* Notes — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={LS}>Notes</label>
                    <input type="text" value={form.notes}
                           onChange={e => setF("notes", e.target.value)}
                           style={IS} placeholder="Optional notes…"
                    />
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                <button onClick={submit} disabled={saving}
                        style={{ padding: "12px 30px", borderRadius: 50, border: "none", background: saving ? "#e2e8f0" : "linear-gradient(135deg,#10b981,#059669)", color: saving ? "#94a3b8" : "white", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif", boxShadow: saving ? "none" : "0 4px 14px rgba(16,185,129,0.3)" }}
                >{saving ? "Saving…" : "✓ Save Settlement"}</button>
                <button onClick={onCancel}
                        style={{ padding: "12px 24px", borderRadius: 50, border: `1.5px solid ${C.border}`, background: "white", color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                >Cancel</button>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// OrderGroupCard — shows a single vendor/rider group with per-order drilldown.
//
// DESIGN DECISION — "one order, two settlements":
//   A single delivered order generates both a VENDOR settlement (the subtotal
//   owed to the restaurant) AND a RIDER settlement (the delivery fee owed to
//   the courier). To make this crystal-clear to the admin, each card shows:
//   - A shared "Order #" pill on every order row so you can trace a specific
//     order across both the Vendor and Rider sections without confusion.
//   - A soft callout banner at the bottom of the drilldown: "Orders below also
//     appear in the Rider section — each order has two settlement lines."
//   - The card header shows the settlement TYPE prominently (🏪 / 🏍️) so the
//     admin always knows which half of the payout they are looking at.
// ══════════════════════════════════════════════════════════════════════════════
function OrderGroupCard({ group, onRecordPayment }) {
    const [expanded, setExpanded] = useState(false);
    const ps = PAY_STATUS[(group.paymentStatus || "NOT_PAID").toUpperCase()] || PAY_STATUS.NOT_PAID;
    const typeCfg = TYPE_CFG[(group.recipientType || "").toUpperCase()] || { icon: "❓", bg: "#f1f5f9", c: C.muted };
    const isFullyPaid = group.paymentStatus === "FULLY_PAID";
    const isVendor = group.recipientType === "VENDOR";

    return (
        <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"}
             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"}
        >
            {/* Card header — clickable to expand */}
            <div onClick={() => setExpanded(e => !e)}
                 style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16, borderBottom: expanded ? `1px solid ${C.border}` : "none" }}
            >
                {/* Type icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: typeCfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, marginTop: 2 }}>
                    {typeCfg.icon}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: C.text }}>
                            {group.recipientName || group.recipientId}
                        </span>
                        {group.ownerName && group.ownerName !== group.recipientName && (
                            <span style={{ fontSize: 11, color: C.muted, background: "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>{group.ownerName}</span>
                        )}
                        <TypeBadge type={group.recipientType} />
                        <PayBadge status={group.paymentStatus} />
                        {/* Dual-settlement hint badge */}
                        <span title="Each order in this group also generates a separate Rider settlement for the delivery fee."
                              style={{ fontSize: 10, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 20, fontWeight: 700, cursor: "help", whiteSpace: "nowrap" }}>
                            {isVendor ? "🔗 +Rider split" : "🔗 +Vendor split"}
                        </span>
                    </div>

                    {/* Bank details line */}
                    {(group.bankName && group.bankName !== "—") && (
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>
                            🏦 {group.bankName} · {group.accountNumber} ({group.accountName || "—"})
                        </p>
                    )}

                    {/* Financial summary row */}
                    <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                        {[
                            { label: "Orders",      value: group.ordersCount,                         color: C.text     },
                            { label: "Gross",        value: fmt(group.grossAmount),                   color: "#1a5c1a"  },
                            { label: "Platform Cut", value: fmt(group.platformCut),                   color: C.red      },
                            { label: "Net Payable",  value: fmt(group.netPayable),                    color: "#059669"  },
                            { label: "Settled",      value: fmt(group.totalPaid || 0),                color: C.accent   },
                            { label: "Balance",      value: fmt(Math.max(0, group.balance || 0)),     color: group.balance > 0.01 ? C.orange : C.green },
                        ].map(stat => (
                            <div key={stat.label} style={{ textAlign: "left" }}>
                                <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 600 }}>{stat.label}</p>
                                <p style={{ margin: "1px 0 0", fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: "'Sora',sans-serif" }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 8, maxWidth: 400 }}>
                        <PayProgress net={group.netPayable || 0} paid={group.totalPaid || 0} />
                    </div>
                </div>

                {/* Right: actions + expand toggle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <button
                        onClick={e => { e.stopPropagation(); onRecordPayment(group); }}
                        style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: isFullyPaid ? "#d1fae5" : "linear-gradient(135deg,#f97316,#fb923c)", color: isFullyPaid ? "#059669" : "white", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", boxShadow: isFullyPaid ? "none" : "0 3px 10px rgba(249,115,22,0.3)" }}
                    >
                        {isFullyPaid ? "✓ Settled" : group.paymentStatus === "PARTIALLY_PAID" ? "Pay Balance" : "Record Payment"}
                    </button>
                    <span style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                        {group.orders?.length ?? group.ordersCount} order{(group.ordersCount || 0) !== 1 ? "s" : ""}
                        <span style={{ fontSize: 10 }}>{expanded ? " ▲ hide" : " ▼ show"}</span>
                    </span>
                </div>
            </div>

            {/* Expanded: individual order rows */}
            {expanded && (
                <div style={{ background: "#fafbff" }}>
                    {/* Dual-settlement explainer banner */}
                    <div style={{ margin: "10px 16px 0", padding: "8px 14px", background: "#f5f3ff", borderRadius: 10, border: "1px solid #ddd6fe", fontSize: 11, color: "#7c3aed", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>ℹ️</span>
                        <span>
                            Each order below is <strong>one transaction</strong> that generates <strong>two settlement lines</strong> — one for the{" "}
                            {isVendor ? <><strong>vendor</strong> (subtotal) and one for the <strong>rider</strong> (delivery fee)</> : <><strong>rider</strong> (delivery fee) and one for the <strong>vendor</strong> (subtotal)</>}.
                            {" "}The Order ID links both.
                        </span>
                    </div>

                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: isVendor ? "1.4fr 1fr 1fr 1fr 1fr" : "1.4fr 1fr 1fr 1fr 1fr", gap: 0, padding: "10px 20px 6px", marginTop: 8 }}>
                        {["Order ID", "Customer", isVendor ? "Subtotal (→ vendor)" : "Delivery Fee (→ rider)", "Service Charge", "Order Total"].map(h => (
                            <span key={h} style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>{h}</span>
                        ))}
                    </div>

                    {(group.orders && group.orders.length > 0) ? (
                        group.orders.map((o, i) => (
                            <div key={o.id || i}
                                 style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 0, padding: "10px 20px", borderTop: `1px solid #f1f5f9`, alignItems: "center" }}
                            >
                                {/* Order ID — shared between vendor + rider cards */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentL, padding: "3px 8px", borderRadius: 6 }}>
                                        #{(o.id || "").slice(-8)}
                                    </span>
                                    {/* "Shared order" micro-badge — clarifies dual-settlement visually */}
                                    <span title="This order also has a settlement line in the other section."
                                          style={{ fontSize: 9, color: "#7c3aed", background: "#ede9fe", padding: "2px 6px", borderRadius: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                        {isVendor ? "🏍️ rider owed" : "🏪 vendor owed"}
                                    </span>
                                </div>
                                <span style={{ fontSize: 12, color: C.text }}>{o.customerName || o.customer || "—"}</span>
                                {/* Highlight the column that goes to THIS recipient */}
                                <span style={{ fontSize: 13, fontWeight: 800, color: isVendor ? "#059669" : "#b45309", background: isVendor ? "#f0fdf4" : "#fef3c7", padding: "3px 8px", borderRadius: 8, display: "inline-block" }}>
                                    {fmt(isVendor ? (o.subtotal || 0) : (o.deliveryFee || 0))}
                                </span>
                                <span style={{ fontSize: 12, color: C.orange }}>{fmt(o.serviceCharge || 0)}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a5c1a" }}>{fmt(o.totalAmount || o.amount || 0)}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ps.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ps.icon || typeCfg.icon}</div>
                            <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>
                                    {group.ordersCount} delivered order{group.ordersCount !== 1 ? "s" : ""} — consolidated settlement
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
                                    Individual order details not returned by server. Gross: {fmt(group.grossAmount)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Group footer totals */}
                    <div style={{ padding: "10px 20px", background: "#f1f5f9", display: "flex", gap: 24, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            <strong style={{ color: C.text }}>
                                {isVendor ? "Subtotal (vendor share):" : "Delivery Fees (rider share):"}
                            </strong>{" "}
                            {fmt(group.netPayable)}
                        </span>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            <strong style={{ color: C.red }}>Platform Cut ({isVendor ? "10" : "20"}%):</strong> {fmt(group.platformCut)}
                        </span>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            <strong style={{ color: "#059669" }}>Net Payable:</strong> {fmt(group.netPayable)}
                        </span>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            <strong style={{ color: C.accent }}>Already Settled:</strong> {fmt(group.totalPaid || 0)}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: group.balance > 0.01 ? C.orange : "#059669" }}>
                            Balance: {fmt(Math.max(0, group.balance || 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main SettlementsTab export
// ══════════════════════════════════════════════════════════════════════════════
export default function SettlementsTab({ toast }) {
    const today = new Date().toISOString().split("T")[0];

    const [subTab,      setSubTab]      = useState("orders");
    const [date,        setDate]        = useState(today);
    const [filterType,  setFilterType]  = useState("ALL");
    const [ordersData,  setOrdersData]  = useState(null);
    const [settlements, setSettles]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [formPrefill, setFormPrefill] = useState(null);

    // ── Load treated orders ───────────────────────────────────────────────────
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const t = filterType === "ALL" ? null : filterType;
            setOrdersData(await adminApi.getSettlementOrders(date, t));
        } catch (err) { toast(err.message, "error"); }
        finally { setLoading(false); }
    }, [date, filterType, toast]);

    // ── Load settlement records ───────────────────────────────────────────────
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
        if (subTab === "records") loadSettlements();
    }, [subTab, loadOrders, loadSettlements]);

    // ── Build display groups ─────────────────────────────────────────────────
    const allGroups = [
        ...((ordersData?.vendorGroups || []).map(g => ({ ...g, recipientType: "VENDOR" }))),
        ...((ordersData?.riderGroups  || []).map(g => ({ ...g, recipientType: "RIDER"  }))),
    ].filter(g => filterType === "ALL" || g.recipientType === filterType);

    // ── Summary totals ────────────────────────────────────────────────────────
    const totalGross   = allGroups.reduce((a, g) => a + (g.grossAmount || 0), 0);
    const totalNet     = allGroups.reduce((a, g) => a + (g.netPayable  || 0), 0);
    const totalPaid    = allGroups.reduce((a, g) => a + (g.totalPaid   || 0), 0);
    const totalBalance = totalNet - totalPaid;

    // ── Open form from "Record Payment" on a group row ────────────────────────
    const openPrefilled = (g) => {
        setFormPrefill({
            locked:         true,
            recipientType:  g.recipientType,
            recipientId:    g.recipientId,
            recipientName:  g.recipientName || g.recipientId,
            settlementDate: date,
            ordersCount:    g.ordersCount,
            grossAmount:    g.grossAmount,
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
        <>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
            `}</style>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Header */}
                <div style={{ background: "white", borderRadius: 18, padding: "18px 22px", border: `1.5px solid ${C.border}` }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: C.text, margin: "0 0 4px" }}>
                        💳 Manual Settlements
                    </h2>
                    <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
                        Review delivered orders by date, then record bank transfers to vendors and riders.
                        Each order generates <strong>two settlement lines</strong> — one for the vendor (subtotal) and one for the rider (delivery fee).
                    </p>
                </div>

                {/* Sub-tab navigation */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                        ["orders",  "📦 Treated Orders"],
                        ["records", "📋 Settlement Records"],
                        ["form",    "➕ Record Settlement"],
                    ].map(([id, label]) => (
                        <button key={id}
                                onClick={() => { if (id !== "form") setFormPrefill(null); setSubTab(id); }}
                                style={{ padding: "9px 20px", borderRadius: 50, border: `2px solid ${subTab === id ? C.accent : C.border}`, background: subTab === id ? C.accent : "white", color: subTab === id ? "white" : C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s" }}
                        >{label}</button>
                    ))}
                </div>

                {/* Filter bar — hidden on form tab */}
                {subTab !== "form" && (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        {subTab === "orders" && (
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                   style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none" }}
                            />
                        )}
                        {["ALL", "VENDOR", "RIDER"].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                    style={{ padding: "7px 16px", borderRadius: 50, border: `2px solid ${filterType === t ? C.accent : C.border}`, background: filterType === t ? C.accent : "white", color: filterType === t ? "white" : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                            >{t}</button>
                        ))}
                    </div>
                )}

                {/* ── FORM sub-tab ── */}
                {subTab === "form" && (
                    <SettlementForm
                        prefill={formPrefill}
                        toast={toast}
                        onSaved={onFormSaved}
                        onCancel={() => { setFormPrefill(null); setSubTab("orders"); }}
                    />
                )}

                {/* ── TREATED ORDERS sub-tab ── */}
                {subTab === "orders" && (
                    loading ? <Skeleton /> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                            {/* Summary strip */}
                            {allGroups.length > 0 && (
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <MiniStat label="Gross Revenue"   value={fmt(totalGross)}                  color="#1a5c1a" />
                                    <MiniStat label="Net Payable"     value={fmt(totalNet)}                    color={C.accent} />
                                    <MiniStat label="Total Settled"   value={fmt(totalPaid)}                   color={C.green}  />
                                    <MiniStat label="Outstanding"     value={fmt(Math.max(0, totalBalance))}   color={totalBalance > 0.01 ? C.red : C.green} sub={totalBalance <= 0.01 ? "All clear ✅" : undefined} />
                                </div>
                            )}

                            {/* Dual-settlement context callout (only when both vendors + riders present) */}
                            {ordersData?.vendorGroups?.length > 0 && ordersData?.riderGroups?.length > 0 && filterType === "ALL" && (
                                <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "10px 16px", fontSize: 12, color: "#6d28d9", display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 18 }}>🔗</span>
                                    <span>
                                        The same delivered orders appear in <strong>both</strong> sections below — the Vendor section shows what the restaurant earns (subtotal), while the Rider section shows what the courier earns (delivery fee). The Order ID on each row links them.
                                    </span>
                                </div>
                            )}

                            {allGroups.length === 0 ? (
                                <div style={{ background: "white", borderRadius: 18, padding: "60px 24px", textAlign: "center", border: `1.5px solid ${C.border}` }}>
                                    <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
                                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: C.text, fontSize: 16 }}>No delivered orders on {date}</p>
                                    <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>Try a different date or check your filter.</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {/* Vendor section header */}
                                    {(filterType === "ALL" || filterType === "VENDOR") && ordersData?.vendorGroups?.length > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 2px" }}>
                                            <div style={{ width: 28, height: 2.5, background: C.green, borderRadius: 2 }} />
                                            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#059669", textTransform: "uppercase" }}>
                                                🏪 Vendor Settlements ({ordersData.vendorGroups.length})
                                            </span>
                                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>— subtotal owed to restaurants</span>
                                        </div>
                                    )}
                                    {(filterType === "ALL" || filterType === "VENDOR") && (ordersData?.vendorGroups || []).map((g, i) => (
                                        <OrderGroupCard key={`v-${i}`} group={{ ...g, recipientType: "VENDOR" }} onRecordPayment={openPrefilled} />
                                    ))}

                                    {/* Rider section header */}
                                    {(filterType === "ALL" || filterType === "RIDER") && ordersData?.riderGroups?.length > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 2px" }}>
                                            <div style={{ width: 28, height: 2.5, background: C.gold, borderRadius: 2 }} />
                                            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#b45309", textTransform: "uppercase" }}>
                                                🏍️ Rider Settlements ({ordersData.riderGroups.length})
                                            </span>
                                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>— delivery fee owed to couriers</span>
                                        </div>
                                    )}
                                    {(filterType === "ALL" || filterType === "RIDER") && (ordersData?.riderGroups || []).map((g, i) => (
                                        <OrderGroupCard key={`r-${i}`} group={{ ...g, recipientType: "RIDER" }} onRecordPayment={openPrefilled} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* ── SETTLEMENT RECORDS sub-tab ── */}
                {subTab === "records" && (
                    loading ? <Skeleton /> : (
                        <DataTable cols={["Recipient", "Type", "Date", "Orders", "Gross", "Net Transferred", "Reference", "Recorded By"]} minWidth={800}>
                            {settlements.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: "50px", textAlign: "center", color: C.muted }}>
                                        No settlement records found
                                    </td>
                                </tr>
                            ) : settlements.map((s, i) => (
                                <tr key={s.id || i} style={{ borderTop: "1px solid #f1f5f9" }}>
                                    <td style={TD}>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{s.recipientName || s.recipientId}</div>
                                        {s.accountNumber && s.accountNumber !== "—" && (
                                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.bankName} · {s.accountNumber}</div>
                                        )}
                                    </td>
                                    <td style={{ ...TD, textAlign: "center" }}><TypeBadge type={s.recipientType} /></td>
                                    <td style={TD}>{s.settlementDate}</td>
                                    <td style={TD}>{s.ordersCount ?? "—"}</td>
                                    <td style={{ ...TD, fontWeight: 700, color: "#1a5c1a" }}>{fmt(s.grossAmount)}</td>
                                    <td style={{ ...TD, fontWeight: 800, color: "#059669" }}>{fmt(s.netTransferred)}</td>
                                    <td style={{ ...TD, fontFamily: "monospace", fontSize: 11 }}>{s.transferReference || "—"}</td>
                                    <td style={{ ...TD, color: C.muted }}>{s.recordedBy || "—"}</td>
                                </tr>
                            ))}
                        </DataTable>
                    )
                )}
            </div>
        </>
    );
}