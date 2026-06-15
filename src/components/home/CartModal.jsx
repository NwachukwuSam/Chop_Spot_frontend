

export const CartModal = ({ cartGroups, onClose, onCheckout, onRemoveGroup }) => {
    const itemsTotal = cartGroups.reduce((s, g) => s + (g.pack?.price || 0) + g.items.reduce((a, i) => a + i.price * i.qty, 0), 0);
    const grandTotal = itemsTotal

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 490, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)" }} onClick={e => e.stopPropagation()}>

                <div style={{ padding: "22px 24px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, margin: 0, color: "#1a2e1a" }}>Your Cart</h2>
                    <button onClick={onClose} style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>

                {cartGroups.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#aaa" }}>
                        <p style={{ fontSize: 44, margin: 0 }}>🛒</p>
                        <p style={{ fontWeight: 600, fontSize: 16, marginTop: 12 }}>Your cart is empty</p>
                    </div>
                ) : (
                    <div style={{ overflowY: "auto", flex: 1, padding: "0 24px" }}>
                        {cartGroups.map((group, gi) => (
                            <div key={gi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1.5px solid #f0f7f0" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#1a2e1a", fontFamily: "'Sora',sans-serif" }}>{group.vendor.name}</p>
                                        {group.pack && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8aaa8a" }}>{group.pack.name}</p>}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {group.pack && <span style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>₦{Number(group.pack.price).toLocaleString()}</span>}
                                        <button onClick={() => onRemoveGroup(gi)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f97316", fontSize: 18, padding: 0 }}>✕</button>
                                    </div>
                                </div>
                                <div style={{ height: 1, background: "#f0f7f0", marginBottom: 8 }}/>
                                {group.items.map(item => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 8px", color: "#3a4a3a", fontSize: 14 }}>
                                        <span style={{ color: "#4a6a4a" }}>{item.name} ×{item.qty}</span>
                                        <span style={{ fontWeight: 700 }}>₦{(item.price * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            
                            </div>
                        ))}
                    </div>
                )}

                {cartGroups.length > 0 && (
                    <div style={{ padding: "14px 24px 22px", borderTop: "1.5px solid #f0f7f0", flexShrink: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a2e1a" }}>Total</span>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#f97316" }}>₦{grandTotal.toLocaleString()}</span>
                        </div>
                        <button onClick={onCheckout} style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#f97316,#fb923c)", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(249,115,22,0.4)", transition: "transform 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >Continue to Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
};