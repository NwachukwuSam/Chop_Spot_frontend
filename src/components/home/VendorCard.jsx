export const VendorCard = ({ vendor, onClick }) => {
    const vendorData = {
        id: vendor.id,
        name: vendor.restaurantName,
        image: vendor.logoUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
        rating: vendor.rating || 4.5,
        deliveryFrom: vendor.deliveryFromPrice || 0,
        category: vendor.category,
        isOpen: vendor.open || vendor.isOpen,
        address: vendor.restaurantAddress,
        packages: (vendor.packages || []).map(p => ({ ...p, id: p.id || p._id })),
    };

    return (
        <div onClick={() => onClick(vendorData)} style={{
            background: "rgba(255,255,255,0.88)", borderRadius: 22, overflow: "hidden",
            boxShadow: "0 2px 16px rgba(20,80,20,0.10)", cursor: "pointer",
            transition: "transform 0.22s, box-shadow 0.22s",
            border: "1.5px solid rgba(60,140,60,0.13)", backdropFilter: "blur(8px)",
        }}
             onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(20,80,20,0.18)"; }}
             onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(20,80,20,0.10)"; }}
        >
            <div style={{ height: 148, position: "relative", overflow: "hidden" }}>
                <img src={vendorData.image} alt={vendorData.name} style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: !vendorData.isOpen ? "grayscale(80%) brightness(0.8)" : "none",
                    transition: "transform 0.4s",
                }}
                     onMouseEnter={e => e.target.style.transform = "scale(1.07)"}
                     onMouseLeave={e => e.target.style.transform = "scale(1)"}
                     onError={e => e.target.style.background = "#c8e6c9"}
                />
                {!vendorData.isOpen && (
                    <div style={{ position: "absolute", bottom: 10, left: 12, background: "#1a1a1a", color: "white", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: 1.2 }}>CLOSED</div>
                )}
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.93)", borderRadius: 20, padding: "3px 9px", fontSize: 12, fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 3 }}>
                    ⭐ {vendorData.rating}
                </div>
            </div>
            <div style={{ padding: "13px 15px 15px" }}>
                <h3 style={{ margin: "0 0 3px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2e1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vendorData.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#5a7a5a", fontSize: 12 }}>
                    <svg width="12" height="12" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    From ₦{vendorData.deliveryFrom.toLocaleString()}
                </div>
                <span style={{ display: "inline-block", marginTop: 8, background: "#e8f5e0", color: "#2d6a2d", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5 }}>{vendorData.category}</span>
            </div>
        </div>
    );
};