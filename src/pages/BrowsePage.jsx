import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const CUISINES = [
  { id: "all",      label: "All",          emoji: "🍽️" },
  { id: "jollof",   label: "Jollof & Rice",emoji: "🍛" },
  { id: "grills",   label: "Grills",        emoji: "🍗" },
  { id: "burgers",  label: "Burgers",       emoji: "🍔" },
  { id: "soups",    label: "Soups & Stew",  emoji: "🥘" },
  { id: "noodles",  label: "Noodles",       emoji: "🍜" },
  { id: "pizza",    label: "Pizza",         emoji: "🍕" },
  { id: "salads",   label: "Salads",        emoji: "🥗" },
  { id: "wraps",    label: "Wraps",         emoji: "🫔" },
  { id: "seafood",  label: "Seafood",       emoji: "🦐" },
  { id: "desserts", label: "Desserts",      emoji: "🍰" },
  { id: "drinks",   label: "Drinks",        emoji: "🥤" },
];

const RESTAURANTS = [
  {
    id: 1, name: "Mama Titi's Kitchen",
    cuisine: ["jollof","soups"], tags: ["Best Jollof", "Local Favourite"],
    emoji: "🍛", bg: "#FFF3E0", rating: 4.9, reviews: 2841,
    deliveryTime: "20–30", deliveryFee: "Free", minOrder: 1500,
    priceRange: "₦₦", open: true, featured: true, discount: "20% OFF",
    description: "Authentic Lagos home cooking. Mama Titi's jollof is legendary.",
    popular: ["Jollof Rice + Chicken", "Egusi Soup", "Fried Plantain"],
  },
  {
    id: 2, name: "The Grill Republic",
    cuisine: ["grills"], tags: ["Top Rated", "Premium"],
    emoji: "🍗", bg: "#FBE9E7", rating: 4.8, reviews: 1923,
    deliveryTime: "25–40", deliveryFee: "₦400", minOrder: 3000,
    priceRange: "₦₦₦", open: true, featured: true, discount: null,
    description: "Slow-smoked meats, charcoal grills, and bold marinades.",
    popular: ["Suya Platter", "BBQ Ribs", "Peri-Peri Chicken"],
  },
  {
    id: 3, name: "Burger Factory NG",
    cuisine: ["burgers"], tags: ["Fast Delivery", "Popular"],
    emoji: "🍔", bg: "#FFFDE7", rating: 4.7, reviews: 3102,
    deliveryTime: "15–25", deliveryFee: "₦250", minOrder: 2000,
    priceRange: "₦₦", open: true, featured: false, discount: "Buy 2 Get 1",
    description: "Smash burgers, crispy fries, and thick milkshakes since 2019.",
    popular: ["Double Smash Burger", "Spicy Chicken Burger", "Loaded Fries"],
  },
  {
    id: 4, name: "Noodle House Lagos",
    cuisine: ["noodles"], tags: ["Trending", "Healthy Options"],
    emoji: "🍜", bg: "#F3E5F5", rating: 4.6, reviews: 887,
    deliveryTime: "20–35", deliveryFee: "₦300", minOrder: 2500,
    priceRange: "₦₦", open: true, featured: false, discount: null,
    description: "Pan-Asian noodles adapted for Nigerian taste buds.",
    popular: ["Jollof Ramen", "Spicy Pad Thai", "Beef Udon"],
  },
  {
    id: 5, name: "Eko Pizza Co.",
    cuisine: ["pizza"], tags: ["New", "Wood-fired"],
    emoji: "🍕", bg: "#E8F5E9", rating: 4.5, reviews: 432,
    deliveryTime: "30–45", deliveryFee: "₦500", minOrder: 4000,
    priceRange: "₦₦₦", open: true, featured: false, discount: "15% OFF first order",
    description: "Wood-fired Neapolitan pizza with local toppings like suya and peppered beef.",
    popular: ["Suya Pizza", "Margherita", "Pepperoni + Shito"],
  },
  {
    id: 6, name: "Seafresh Market",
    cuisine: ["seafood"], tags: ["Fresh Daily", "Premium"],
    emoji: "🦐", bg: "#E0F7FA", rating: 4.8, reviews: 1204,
    deliveryTime: "35–50", deliveryFee: "₦600", minOrder: 5000,
    priceRange: "₦₦₦₦", open: false, featured: false, discount: null,
    description: "Freshly sourced Lagos Atlantic seafood. Opens at 11AM daily.",
    popular: ["Grilled Lobster", "Peppered Snail", "Catfish Pepper Soup"],
  },
  {
    id: 7, name: "Sweet Surrender",
    cuisine: ["desserts","drinks"], tags: ["Vegan Friendly", "Halal"],
    emoji: "🍰", bg: "#FCE4EC", rating: 4.9, reviews: 2310,
    deliveryTime: "20–30", deliveryFee: "Free", minOrder: 1000,
    priceRange: "₦", open: true, featured: false, discount: "Free drink on ₦3k+",
    description: "Artisan cakes, frozen yogurt, fresh juice, and bubble tea.",
    popular: ["Mango Cheesecake", "Boba Tea", "Vegan Chocolate Lava"],
  },
  {
    id: 8, name: "Wrap & Roll Naija",
    cuisine: ["wraps","salads"], tags: ["Healthy", "Low-Cal"],
    emoji: "🫔", bg: "#F1F8E9", rating: 4.4, reviews: 756,
    deliveryTime: "15–25", deliveryFee: "₦200", minOrder: 2000,
    priceRange: "₦₦", open: true, featured: false, discount: null,
    description: "Clean eating wraps, power bowls, and fresh salads for the health-conscious.",
    popular: ["Suya Chicken Wrap", "Power Bowl", "Avocado Caesar"],
  },
  {
    id: 9, name: "Buka 2.0",
    cuisine: ["soups","jollof"], tags: ["Traditional", "Local Favourite"],
    emoji: "🥘", bg: "#FFF8E1", rating: 4.7, reviews: 1567,
    deliveryTime: "25–40", deliveryFee: "₦300", minOrder: 1500,
    priceRange: "₦₦", open: true, featured: false, discount: null,
    description: "The modern buka experience — traditional soups, amala, eba, and more.",
    popular: ["Banga Soup + Starch", "Ofe Onugbu", "Amala + Ewedu"],
  },
];

const DEALS = [
  { emoji: "🎉", title: "First Order Free Delivery", desc: "Use code FIRST at checkout", color: "#1a5c1a", bg: "linear-gradient(135deg,#0d2e0d,#1a5c1a)" },
  { emoji: "⚡", title: "Flash Sale: 30% Off Grills", desc: "Today only · Ends 9PM", color: "#f5920a", bg: "linear-gradient(135deg,#b45309,#f5920a)" },
  { emoji: "👥", title: "Group Orders Save More", desc: "4+ items = 15% discount", color: "#7c3aed", bg: "linear-gradient(135deg,#4c1d95,#7c3aed)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CART STORE (simple in-memory)
// ─────────────────────────────────────────────────────────────────────────────
const useCart = () => {
  const [cart, setCart] = useState([]);
  const addItem  = (restaurantId, restaurantName, item, price) =>
    setCart(p => {
      const exists = p.find(c => c.item === item && c.restaurantId === restaurantId);
      if (exists) return p.map(c => c.item === item && c.restaurantId === restaurantId ? { ...c, qty: c.qty + 1 } : c);
      return [...p, { restaurantId, restaurantName, item, price, qty: 1, id: Date.now() }];
    });
  const removeItem = (id) => setCart(p => p.filter(c => c.id !== id));
  const changeQty  = (id, delta) => setCart(p =>
    p.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0)
  );
  const total   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count   = cart.reduce((s, c) => s + c.qty, 0);
  return { cart, addItem, removeItem, changeQty, total, count };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <span style={{ color: "#f5920a", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))} {rating}
    </span>
  );
}

function Badge({ label, color = "#1a5c1a" }) {
  return (
    <span style={{
      fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800,
      letterSpacing: "0.06em", textTransform: "uppercase",
      background: color + "18", color, border: `1px solid ${color}33`,
      borderRadius: 50, padding: "2px 9px",
    }}>{label}</span>
  );
}

function RestaurantCard({ r, onOpen, onQuickAdd, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer",
        border: `1.5px solid ${hovered ? "#1a5c1a33" : "#f0f0f0"}`,
        boxShadow: hovered ? "0 16px 48px rgba(26,92,26,0.12)" : "0 2px 12px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        opacity: 1,
        animation: `cardIn 0.5s ease ${index * 0.06}s both`,
        position: "relative",
      }}
      onClick={() => onOpen(r)}
    >
      {/* Card header */}
      <div style={{
        height: 130, background: r.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 58, position: "relative",
        transition: "filter 0.3s",
        filter: !r.open ? "grayscale(0.4) brightness(0.9)" : "none",
      }}>
        {r.emoji}
        {r.discount && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#f5920a", color: "#fff",
            fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 10,
            letterSpacing: "0.05em", borderRadius: 8, padding: "4px 10px",
            boxShadow: "0 2px 8px rgba(245,146,10,0.4)",
          }}>{r.discount}</div>
        )}
        {!r.open && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0",
          }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 8 }}>Closed Now</span>
          </div>
        )}
        {r.featured && r.open && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "#1a5c1a", color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 10, borderRadius: 8, padding: "4px 10px" }}>⭐ Featured</div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{r.name}</h3>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{r.priceRange}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <StarRating rating={r.rating} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>({r.reviews.toLocaleString()})</span>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b", lineHeight: 1.55, marginBottom: 12 }}>{r.description}</p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {r.tags.map(t => <Badge key={t} label={t} color={t === "Premium" ? "#7c3aed" : t === "New" ? "#0891b2" : "#1a5c1a"} />)}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f8f8f8", paddingTop: 12 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 3 }}>
              <span>🕐</span> {r.deliveryTime} min
            </span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: r.deliveryFee === "Free" ? "#1a5c1a" : "#475569", fontWeight: r.deliveryFee === "Free" ? 700 : 400, display: "flex", alignItems: "center", gap: 3 }}>
              <span>🏍️</span> {r.deliveryFee}
            </span>
          </div>
          {r.open && (
            <button
              onClick={e => { e.stopPropagation(); onOpen(r); }}
              style={{
                background: hovered ? "#1a5c1a" : "#f0fdf4",
                color: hovered ? "#fff" : "#1a5c1a",
                border: "none", borderRadius: 10, padding: "7px 16px",
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >Order →</button>
          )}
        </div>
      </div>
    </div>
  );
}

function RestaurantModal({ r, onClose, onAdd }) {
  const [added, setAdded] = useState({});
  const MENU_ITEMS = [
    { item: r.popular[0], price: 2800, desc: "Our signature dish, cooked fresh daily." },
    { item: r.popular[1], price: 3500, desc: "Rich, slow-cooked with premium ingredients." },
    { item: r.popular[2] || "House Special", price: 2200, desc: "A crowd favourite since day one." },
    { item: "Soft Drink", price: 400, desc: "Chilled bottle or can, your choice." },
    { item: "Extra Protein", price: 1200, desc: "Add extra meat or fish to any dish." },
  ];

  const handleAdd = (item, price) => {
    onAdd(r.id, r.name, item, price);
    setAdded(p => ({ ...p, [item]: (p[item] || 0) + 1 }));
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0",
        width: "100%", maxWidth: 680, maxHeight: "88vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.35s cubic-bezier(0.34,1.06,0.64,1)",
      }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={{ background: r.bg, padding: "28px 28px 20px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.12)", border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ fontSize: 52 }}>{r.emoji}</div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 22, color: "#0f172a", margin: "10px 0 4px" }}>{r.name}</h2>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <StarRating rating={r.rating} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b" }}>({r.reviews.toLocaleString()} reviews)</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b" }}>🕐 {r.deliveryTime} min</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: r.deliveryFee === "Free" ? "#1a5c1a" : "#64748b", fontWeight: r.deliveryFee === "Free" ? 700 : 400 }}>🏍️ {r.deliveryFee}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#64748b" }}>Min order: ₦{r.minOrder.toLocaleString()}</span>
          </div>
        </div>

        {/* Menu */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 28px 28px" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 16 }}>Popular Items</p>
          {MENU_ITEMS.map(({ item, price, desc }) => (
            <div key={item} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 0", borderBottom: "1px solid #f8f8f8", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 3 }}>{item}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#1a5c1a" }}>₦{price.toLocaleString()}</span>
                <button onClick={() => handleAdd(item, price)} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: added[item] ? "#1a5c1a" : "#f0fdf4",
                  border: `2px solid ${added[item] ? "#1a5c1a" : "#dcfce7"}`,
                  color: added[item] ? "#fff" : "#1a5c1a",
                  fontSize: 18, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s", flexShrink: 0,
                }}>
                  {added[item] ? `+${added[item]}` : "+"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, total, count, onClose, onRemove, onChangeQty }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", justifyContent: "flex-end", animation: "fadeIn 0.2s ease" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{
        width: 380, background: "#fff", height: "100%", overflowY: "auto",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        animation: "slideRight 0.35s cubic-bezier(0.34,1.06,0.64,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 20, color: "#0f172a" }}>Your Cart</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{count} item{count !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "#f8f8f8", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "16px 24px", overflowY: "auto" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "#374151", marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8" }}>Browse restaurants and add items to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #f8f8f8" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{item.item}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8" }}>{item.restaurantName}</p>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#1a5c1a", marginTop: 2 }}>₦{(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onChangeQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a5c1a", border: "none", cursor: "pointer", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b" }}>Subtotal</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>₦{total.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b" }}>Delivery fee</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a5c1a" }}>₦300</span>
            </div>
            <div style={{ height: 1, background: "#f0f0f0", marginBottom: 16 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Total</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 18, color: "#1a5c1a" }}>₦{(total + 300).toLocaleString()}</span>
            </div>
            <button onClick={() => { onClose(); navigate("/checkout"); }} style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)",
              color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15,
              cursor: "pointer", boxShadow: "0 6px 24px rgba(26,92,26,0.35)",
            }}>Proceed to Checkout →</button>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 12 }}>🔒 Secure checkout · Multiple payment options</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function BrowsePage() {
  const [activeCuisine, setActiveCuisine]   = useState("all");
  const [search, setSearch]                 = useState("");
  const [sortBy, setSortBy]                 = useState("popular");
  const [openOnly, setOpenOnly]             = useState(false);
  const [freeDelivery, setFreeDelivery]     = useState(false);
  const [activeModal, setActiveModal]       = useState(null);
  const [cartOpen, setCartOpen]             = useState(false);
  const [navScrolled, setNavScrolled]       = useState(false);
  const [location, setLocation]             = useState("Victoria Island, Lagos");
  const [cartBump, setCartBump]             = useState(false);
  const { cart, addItem, removeItem, changeQty, total, count } = useCart();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdd = useCallback((rid, rname, item, price) => {
    addItem(rid, rname, item, price);
    setCartBump(true);
    setTimeout(() => setCartBump(false), 400);
  }, [addItem]);

  const filtered = RESTAURANTS
    .filter(r => activeCuisine === "all" || r.cuisine.includes(activeCuisine))
    .filter(r => !openOnly || r.open)
    .filter(r => !freeDelivery || r.deliveryFee === "Free")
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "delivery") return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
      if (sortBy === "popular") return b.reviews - a.reviews;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        body { background:#fafafa; font-family:'DM Sans',sans-serif; }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes slideUp    { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes cardIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bump       { 0%,100%{transform:scale(1)} 40%{transform:scale(1.25)} 70%{transform:scale(0.92)} }
        @keyframes shimmer    { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes dealSlide  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .cuisine-pill { transition: all 0.2s ease; white-space:nowrap; cursor:pointer; }
        .cuisine-pill:hover { transform: translateY(-1px); }
        .sort-select { border:1.5px solid #e2e8f0; border-radius:10px; padding:8px 12px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; background:#fff; color:#374151; cursor:pointer; outline:none; }
        .toggle-pill { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:50px; border:1.5px solid #e2e8f0; background:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#374151; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .toggle-pill.active { border-color:#1a5c1a; background:#f0fdf4; color:#1a5c1a; }
        @media(max-width:900px) { .results-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:560px) { .results-grid { grid-template-columns: 1fr !important; } .deals-row { flex-direction:column !important; } .filter-row { flex-wrap:wrap !important; } }
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: navScrolled ? "rgba(255,255,255,0.97)" : "#fff",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #f0f0f0",
        transition: "box-shadow 0.3s",
        boxShadow: navScrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,48px)", height: 64, display: "flex", alignItems: "center", gap: 20 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🍔</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a" }}>TastyCart</span>
          </Link>

          {/* Location */}
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fafafa", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#374151", flexShrink: 0 }}>
            <span>📍</span> {location} <span style={{ color: "#94a3b8" }}>▾</span>
          </button>

          {/* Search */}
          <div style={{ flex: 1, position: "relative", maxWidth: 480 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants, dishes, cuisines…"
              style={{
                width: "100%", padding: "10px 16px 10px 42px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0f172a",
                outline: "none", transition: "all 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor="#1a5c1a"; e.target.style.background="#f0fdf4"; e.target.style.boxShadow="0 0 0 3px rgba(26,92,26,0.1)"; }}
              onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexShrink: 0 }}>
            <Link to="/about" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>About</Link>

            {/* Cart button */}
            <button onClick={() => setCartOpen(true)} style={{
              position: "relative", display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)",
              border: "none", borderRadius: 12, padding: "10px 18px",
              color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(26,92,26,0.3)",
              animation: cartBump ? "bump 0.4s ease" : "none",
            }}>
              🛒
              {count > 0 && (
                <span style={{ background: "#f5920a", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{count}</span>
              )}
              {count > 0 && <span>₦{total.toLocaleString()}</span>}
              {count === 0 && <span>Cart</span>}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,48px)" }}>

        {/* ── HERO GREETING ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d2e0d 0%,#1a5c1a 100%)",
          borderRadius: 24, margin: "24px 0 20px", padding: "clamp(28px,4vw,44px)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,146,10,0.18),transparent 70%)" }}/>
          <div style={{ position: "absolute", bottom: -40, left: 200, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(76,175,80,0.2),transparent 70%)" }}/>
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Good afternoon 👋</p>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem,3vw,2.4rem)", color: "#fff", lineHeight: 1.15, letterSpacing: -0.03 }}>
                What are you craving<br />
                <span style={{ color: "#f5920a" }}>today?</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["🍽️", "500+", "Restaurants"], ["⚡", "25 min", "Avg Delivery"], ["⭐", "4.8", "Rating"]].map(([icon, val, label]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ fontSize: 22 }}>{icon}</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 18, color: "#fff", marginTop: 4 }}>{val}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DEALS STRIP ── */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }} className="deals-row">
          {DEALS.map((deal, i) => (
            <div key={i} style={{
              background: deal.bg, borderRadius: 16, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 14,
              minWidth: 260, flexShrink: 0, cursor: "pointer",
              animation: `dealSlide 0.5s ease ${i * 0.1}s both`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{deal.emoji}</div>
              <div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>{deal.title}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{deal.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CUISINE PILLS ── */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
          {CUISINES.map(c => (
            <button key={c.id} className="cuisine-pill" onClick={() => setActiveCuisine(c.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 50,
              border: `1.5px solid ${activeCuisine === c.id ? "#1a5c1a" : "#e2e8f0"}`,
              background: activeCuisine === c.id ? "#1a5c1a" : "#fff",
              color: activeCuisine === c.id ? "#fff" : "#374151",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13,
              boxShadow: activeCuisine === c.id ? "0 4px 14px rgba(26,92,26,0.25)" : "none",
              flexShrink: 0,
            }}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* ── FILTER ROW ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }} className="filter-row">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className={`toggle-pill ${openOnly ? "active" : ""}`} onClick={() => setOpenOnly(o => !o)}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: openOnly ? "#1a5c1a" : "#d1d5db" }} />
              Open Now
            </button>
            <button className={`toggle-pill ${freeDelivery ? "active" : ""}`} onClick={() => setFreeDelivery(f => !f)}>
              🏍️ Free Delivery
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{filtered.length} restaurants</span>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="delivery">Fastest Delivery</option>
            </select>
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#374151", marginBottom: 8 }}>No restaurants found</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#94a3b8" }}>Try a different search or remove some filters</p>
            <button onClick={() => { setSearch(""); setActiveCuisine("all"); setOpenOnly(false); setFreeDelivery(false); }} style={{ marginTop: 20, background: "#1a5c1a", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Clear Filters</button>
          </div>
        ) : (
          <div className="results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 48 }}>
            {filtered.map((r, i) => (
              <RestaurantCard key={r.id} r={r} index={i} onOpen={setActiveModal} onQuickAdd={handleAdd} />
            ))}
          </div>
        )}
      </main>

      {/* ── MODALS & OVERLAYS ── */}
      {activeModal && (
        <RestaurantModal r={activeModal} onClose={() => setActiveModal(null)} onAdd={handleAdd} />
      )}
      {cartOpen && (
        <CartDrawer cart={cart} total={total} count={count} onClose={() => setCartOpen(false)} onRemove={removeItem} onChangeQty={changeQty} />
      )}
    </>
  );
}