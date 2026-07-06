import { useState, useEffect } from "react";
import * as API from "../../utils/Api";

const StarDisplay = ({ value }) => (
    <span style={{ color: "#f97316", fontSize: 13, letterSpacing: 1 }}>
        {"★".repeat(Math.round(value || 0))}{"☆".repeat(5 - Math.round(value || 0))}
    </span>
);

export const VendorModal = ({ vendor, onClose, onGoToCart }) => {
    const [selectedPack, setSelectedPack] = useState(null);
    const [quantities, setQuantities]     = useState({});
    const [menuCategories, setMenuCategories] = useState([]);
    const [menuLoading, setMenuLoading]   = useState(true);
    const [reviews, setReviews]           = useState([]);

    useEffect(() => {
        API.reviewApi.getVendorReviews(vendor.id)
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.content ?? res?.data ?? res?.reviews ?? []);
                setReviews(list.slice(0, 3));
            })
            .catch(() => {});
    }, [vendor.id]);

    useEffect(() => {
        const fetchMenu = async () => {
            setMenuLoading(true);
            try {
                const data = await API.publicApi.getRestaurantMenu(vendor.id);
                let items = [];
                if (Array.isArray(data))                          items = data;
                else if (data?.items   && Array.isArray(data.items))   items = data.items;
                else if (data?.menuItems && Array.isArray(data.menuItems)) items = data.menuItems;
                else if (data?.data    && Array.isArray(data.data))    items = data.data;
                else if (data?.content && Array.isArray(data.content)) items = data.content;

                const grouped = {};
                items.forEach(item => {
                    const norm = { ...item, id: item.id || item._id };
                    const cat  = norm.category || "Menu";
                    if (!grouped[cat]) grouped[cat] = { name: cat, items: [] };
                    grouped[cat].items.push(norm);
                });
                setMenuCategories(Object.values(grouped));
            } catch (err) {
                console.error("Failed to load menu:", err);
                setMenuCategories([]);
            } finally {
                setMenuLoading(false);
            }
        };
        fetchMenu();
    }, [vendor.id]);

    const handleQty = (itemId, delta) =>
        setQuantities(p => ({ ...p, [itemId]: Math.max(0, (p[itemId] || 0) + delta) }));

    const hasItems  = Object.values(quantities).some(q => q > 0);
    const itemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleAddToCart = () => {
        const cartItems = [];
        menuCategories.forEach(section =>
            (section.items || []).forEach(item => {
                if (quantities[item.id] > 0)
                    cartItems.push({ ...item, qty: quantities[item.id] });
            })
        );
        onGoToCart({ items: cartItems, pack: selectedPack, vendor });
        onClose();
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 490, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

                {/* Hero image */}
                <div style={{ position: "relative", height: 200, flexShrink: 0 }}>
                    <img src={vendor.image} alt={vendor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.background = "#c8e6c9"}/>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.4),transparent)" }}/>
                    <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.92)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}>×</button>
                </div>

                <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, margin: "0 0 3px", color: "#1a2e1a" }}>{vendor.name}</h2>
                    <p style={{ color: "#6a8a6a", fontSize: 13, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                        {vendor.address}
                    </p>

                    {/* Recent reviews */}
                    {reviews.length > 0 && (
                        <div style={{ marginBottom: 20, background: "#f9fdf9", borderRadius: 14, padding: "12px 14px", border: "1px solid #e0eee0" }}>
                            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 11, color: "#3a6a3a", textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 10px" }}>⭐ Customer Reviews</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {reviews.map((r, i) => (
                                    <div key={i} style={{ borderBottom: i < reviews.length - 1 ? "1px solid #eaf4ea" : "none", paddingBottom: i < reviews.length - 1 ? 8 : 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a" }}>{r.customerName || r.userName || "Customer"}</span>
                                            <StarDisplay value={r.vendorRating || r.rating || 0} />
                                        </div>
                                        {(r.vendorComment || r.comment) && (
                                            <p style={{ margin: 0, fontSize: 12, color: "#5a7a5a", lineHeight: 1.5 }}>{r.vendorComment || r.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pack selection */}
                    {vendor.packages && vendor.packages.length > 0 && (
                        <div style={{ marginBottom: 22 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 24, height: 2.5, background: "#2d8a2d", borderRadius: 2 }}/>
                                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#3a6a3a", textTransform: "uppercase" }}>1 &nbsp; Select a Pack</span>
                            </div>
                            {vendor.packages.map(pkg => (
                                <div key={pkg.id} onClick={() => setSelectedPack(pkg)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 17px", borderRadius: 14, cursor: "pointer", marginBottom: 8, background: selectedPack?.id === pkg.id ? "#eaf6ea" : "#f4f8f4", border: `2px solid ${selectedPack?.id === pkg.id ? "#2d8a2d" : "transparent"}`, transition: "all 0.18s" }}>
                                    <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{pkg.name}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>{pkg.price === 0 ? "Free" : `₦${Number(pkg.price).toLocaleString()}`}</span>
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selectedPack?.id === pkg.id ? "#2d8a2d" : "#bcd5bc"}`, background: selectedPack?.id === pkg.id ? "#2d8a2d" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {selectedPack?.id === pkg.id && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Menu */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 24, height: 2.5, background: "#ccc", borderRadius: 2 }}/>
                            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#999", textTransform: "uppercase" }}>
                                {vendor.packages?.length > 0 ? "2" : "1"} &nbsp; Choose Your Food
                            </span>
                        </div>
                        {menuLoading ? (
                            <div style={{ textAlign: "center", padding: "36px 0", color: "#8aaa8a" }}>
                                <div style={{ fontSize: 32, marginBottom: 10 }}>🍽️</div>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>Loading menu…</p>
                            </div>
                        ) : menuCategories.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "28px 0", color: "#bbb" }}>
                                <p style={{ fontSize: 32 }}>🍴</p>
                                <p style={{ fontSize: 13, marginTop: 8 }}>No menu items available yet.</p>
                            </div>
                        ) : menuCategories.map(section => (
                            <div key={section.name} style={{ marginBottom: 18 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e8f0e8" }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#7aaa7a", letterSpacing: 1, textTransform: "uppercase" }}>🍽 {section.name}</span>
                                </div>
                                {section.items.map(item => (
                                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f2f7f2" }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, color: item.available !== false ? "#1a2e1a" : "#bbb", fontSize: 14 }}>{item.name}</p>
                                            <p style={{ margin: "2px 0 0", color: item.available !== false ? "#2d8a2d" : "#ccc", fontWeight: 700, fontSize: 13 }}>₦{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        {item.available !== false ? (
                                            <div style={{ display: "flex", alignItems: "center", background: "#f0f7f0", borderRadius: 50, overflow: "hidden" }}>
                                                <button onClick={() => handleQty(item.id, -1)} style={{ background: "none", border: "none", width: 34, height: 34, cursor: "pointer", fontSize: 20, color: "#6a9a6a", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                                <span style={{ width: 26, textAlign: "center", fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>{quantities[item.id] || 0}</span>
                                                <button onClick={() => handleQty(item.id, 1)} style={{ background: "none", border: "none", width: 34, height: 34, cursor: "pointer", fontSize: 20, color: "#2d8a2d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>+</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Out of stock</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: "14px 24px 20px", borderTop: "1px solid #e8f0e8", flexShrink: 0, background: "#fff" }}>
                    <button onClick={hasItems ? handleAddToCart : undefined} style={{ width: "100%", padding: "16px", borderRadius: 50, border: "none", background: hasItems ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d4e8d4", color: hasItems ? "white" : "#8aaa8a", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: hasItems ? "pointer" : "not-allowed", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: hasItems ? "0 4px 20px rgba(45,138,45,0.35)" : "none" }}>
                        🛒 {hasItems ? `Add ${itemCount} item${itemCount > 1 ? "s" : ""} to Cart` : "Select items to add to cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};