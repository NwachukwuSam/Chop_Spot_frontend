import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as API from "../utils/Api";
import Dashboard from "../dashboards/CustomerDashboard";
import logo from "../assets/logo.jpeg";
import { useCart }        from "../hooks/useCart";
import { useAuth }        from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";
import { useToast }       from "../context/ToastContext";

import { BG }            from "../components/home/BG";
import { ProfileAvatar } from "../components/home/ProfileAvatar";
import { VendorCard }    from "../components/home/VendorCard";
import { VendorModal }   from "../components/home/VendorModal";
import { CartModal }     from "../components/home/CartModal";
import { CheckoutModal } from "../components/home/CheckoutModal";
import { PaymentModal }  from "../components/home/PaymentModal";

const DELIVERY_FEE = 350;

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Auth ─────────────────────────────────────────────────────────────────
    const { isLoggedIn, userId, user, logout, refresh } = useAuth();

    // ── Cart ─────────────────────────────────────────────────────────────────
    const {
        cartGroups,
        cartLoading: cartSyncing,
        addGroup,
        removeGroup,
        clearCart,
        mergeGuestCartOnLogin,
        totalItems: totalCartItems,
    } = useCart({ isLoggedIn, userId, onError: (msg) => toast.error(msg) });

    const toast = useToast();

    // ── User profile (API-backed) ─────────────────────────────────────────────
    // FIX: Home.jsx previously never called useUserProfile, so the profile
    // was always the old localStorage shape. Now we fetch the real UserProfile
    // from GET /api/users/profile on login and pass it to CheckoutModal and
    // ProfileAvatar so pre-fill works correctly.
    const { profile, saveProfile } = useUserProfile({ isLoggedIn });

    // ── UI state ─────────────────────────────────────────────────────────────
    const [vendors,        setVendors]        = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);
    const [search,         setSearch]         = useState("");
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showCart,       setShowCart]       = useState(false);
    const [showCheckout,   setShowCheckout]   = useState(false);
    const [showPayment,    setShowPayment]    = useState(false);
    const [orderInfo,      setOrderInfo]      = useState(null);
    const [showDashboard,  setShowDashboard]  = useState(false);

    // ── After returning from login ────────────────────────────────────────────
    useEffect(() => {
        if (!location.state?.openCheckout) return;
        refresh();
        mergeGuestCartOnLogin().then(() => setShowCheckout(true));
        navigate("/", { replace: true, state: {} });
    }, [location.state]);

    // ── Fetch vendor list ─────────────────────────────────────────────────────
    useEffect(() => {
        const loadVendors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await API.publicApi.getRestaurants();

                let list = [];
                if      (Array.isArray(data))                                  list = data;
                else if (data?.content     && Array.isArray(data.content))     list = data.content;
                else if (data?.data        && Array.isArray(data.data))        list = data.data;
                else if (data?.restaurants && Array.isArray(data.restaurants)) list = data.restaurants;
                else if (data?.vendors     && Array.isArray(data.vendors))     list = data.vendors;
                else {
                    console.error("Unexpected API response structure:", data);
                    setError("Invalid data format received from server");
                }

                setVendors(list);
            } catch (err) {
                console.error("Failed to load vendors:", err);
                setError(err.message || "Could not load restaurants. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        loadVendors();
    }, []);

    // ── Derived ───────────────────────────────────────────────────────────────
    const filtered = vendors.filter(v => {
        const name     = v.restaurantName || v.businessName || v.name || "";
        const category = v.category       || v.cuisineType  || "";
        return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            category.toLowerCase().includes(search.toLowerCase())
        );
    });

    const cartTotal =
        cartGroups.reduce(
            (s, g) => s + (g.pack?.price || 0) + g.items.reduce((a, i) => a + i.price * i.qty, 0),
            0
        ) + DELIVERY_FEE;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleVendorClick = (vendorData) => setSelectedVendor(vendorData);

    const handleGoToCart = (group) => {
        addGroup(group);
        const itemCount = group.items.reduce((a, i) => a + i.qty, 0);
        toast.success(`${itemCount} item${itemCount > 1 ? "s" : ""} added to your cart 🛒`);
        setShowCart(true);
    };

    const handleCheckout = () => {
        setShowCart(false);
        if (!isLoggedIn) {
            navigate("/login", { state: { returnTo: "/", openCheckout: true } });
            return;
        }
        setShowCheckout(true);
    };

    const handlePay = async (info) => {
        if (info.saveDetails) {
            saveProfile({
                whatsapp: info.whatsapp,
                hostel: info.hostel,
                room: info.room,
                defaultDeliveryLocation: info.location?.value,
            });
        }

        // ── Step 1: Create the order NOW (before payment) ──────────────
        const loadingId = toast.loading("Creating your order…");
        try {
            const firstGroup   = cartGroups[0] || {};
            const packagePrice = firstGroup.pack?.price || 0;
            const packageName  = firstGroup.pack?.name  || null;
            const itemsSubtotal = cartGroups.reduce(
                (s, g) => s + g.items.reduce((a, i) => a + i.price * i.qty, 0), 0
            );
            const subtotal    = itemsSubtotal + packagePrice;
            const deliveryFee = info.location?.fee || DELIVERY_FEE;
            const totalAmount = subtotal + deliveryFee;

            const orderPayload = {
                vendorId:        firstGroup.vendor?.id || null,
                items: cartGroups.flatMap(g =>
                    g.items.map(i => ({
                        menuItemId: i.id,
                        name:       i.name,
                        price:      i.price,
                        quantity:   i.qty,
                    }))
                ),
                packageName,
                packagePrice,
                subtotal,
                deliveryFee,
                totalAmount,
                deliveryLocation: info.location?.label || "",
                hostel:           info.hostel           || "",
                room:             info.room             || "",
                whatsappNumber:   info.whatsapp         || "",
                paymentMethod:    "CARD",
            };

            const createdOrder = await API.orderApi.createOrder(orderPayload);
            toast.dismiss(loadingId);

            // Pass orderId + orderInfo into payment modal
            setOrderInfo({ ...info, orderId: createdOrder.id, orderTotal: totalAmount });
            setShowCheckout(false);
            setShowPayment(true);
        } catch (err) {
            toast.dismiss(loadingId);
            toast.error(err.message || "Could not create order. Please try again.");
        }
    };

    const handleConfirm = async (paystackReference, paymentMethod = "CARD") => {
        const loadingId = toast.loading("Confirming your payment…");
        try {
            await API.orderApi.confirmPayment(orderInfo.orderId, {
                paystackReference,
                paymentMethod,
            });
            await clearCart();
            toast.dismiss(loadingId);
            toast.success("Order confirmed! 🎉 We'll WhatsApp you when it's ready.", 7000);
        } catch (err) {
            toast.dismiss(loadingId);
            toast.error(
                err.message ||
                "Payment received but confirmation failed. Contact support with your reference."
            );
        }
    };

    const handlePaymentClose = async () => {
        setShowPayment(false);
        // Cancel the pending order if user backs out
        if (orderInfo?.orderId) {
            try {
                await API.orderApi.cancelOrder(orderInfo.orderId);
                toast.info("Order cancelled. Your cart is still saved.");
            } catch (_) {
                // silent — order stays as PENDING_PAYMENT, will expire/be cleaned up
            }
        }
        setOrderInfo(null);
    };

    const handleLogin  = () => navigate("/login", { state: { returnTo: "/" } });

    // ── Dashboard full-screen takeover ────────────────────────────────────────
    if (showDashboard) {
        return (
            <Dashboard
                profile={profile}
                onBack={() => setShowDashboard(false)}
            />
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'DM Sans', sans-serif; }
                @keyframes mIn    { from { opacity:0; transform:scale(0.93) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes floatC { 0%,100%{transform:rotate(20deg) translateY(0)} 50%{transform:rotate(20deg) translateY(-6px)} }
                @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                ::-webkit-scrollbar       { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #b0d5b0; border-radius: 10px; }
                input::placeholder { color: rgba(255,255,255,0.35); }
                select { cursor: pointer; }
                .vendor-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
                @media (max-width: 480px) { .vendor-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 700px) {
                    .hero-image-col { display: none !important; }
                    .nav-links      { display: none !important; }
                    .nav-search     { display: none !important; }
                    .mobile-search  { display: block !important; }
                }
            `}</style>

            <BG />

            <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

                {/* ── Navbar ─────────────────────────────────────────────────── */}
                <nav style={{ background: "rgba(20,42,20,0.96)", backdropFilter: "blur(20px)", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 800, boxShadow: "0 2px 24px rgba(0,0,0,0.25)" }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <img src={logo} alt="ChopSpot Logo" style={{ height: 40, width: "auto" }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="nav-links">
                        {[["Find Food", "#"], ["Vendors", "#"], ["About", "#"]].map(([label, href]) => (
                            <a key={label} href={href}
                               style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, padding: "8px 16px", borderRadius: 50, transition: "all 0.18s" }}
                               onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "white"; }}
                               onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(255,255,255,0.75)"; }}
                            >{label}</a>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                        {/* Search (desktop) */}
                        <div style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, display: "flex", alignItems: "center", padding: "6px 14px", gap: 8, width: 190 }} className="nav-search">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.45)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="search"
                                style={{ border: "none", background: "transparent", outline: "none", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: 13, width: "100%" }}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
                            )}
                        </div>

                        {/* Cart icon */}
                        <button
                            onClick={() => setShowCart(true)}
                            title={cartSyncing ? "Syncing your cart…" : "View cart"}
                            style={{ position: "relative", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,0.25)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                        >
                            {cartSyncing
                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                                : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                            }
                            {totalCartItems > 0 && !cartSyncing && (
                                <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#f97316", borderRadius: "50%", fontSize: 10, fontWeight: 800, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", border: "2px solid rgba(20,42,20,0.96)" }}>
                                    {totalCartItems}
                                </div>
                            )}
                        </button>

                        {/* Profile avatar — now receives API profile, not old localStorage shape */}
                        <ProfileAvatar
                            profile={profile}
                            isLoggedIn={isLoggedIn}
                            onDashboard={() => setShowDashboard(true)}
                            onLogout={logout}
                            onLogin={handleLogin}
                        />
                    </div>
                </nav>

                {/* ── Hero ───────────────────────────────────────────────────── */}
                <div style={{ position: "relative", overflow: "hidden", minHeight: 420, display: "flex", alignItems: "center" }}>
                    <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(249,115,22,0.10)", filter: "blur(60px)", pointerEvents: "none" }}/>
                    <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(45,138,45,0.12)", filter: "blur(50px)", pointerEvents: "none" }}/>

                    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "40px 24px 36px", display: "flex", alignItems: "center", gap: 32, justifyContent: "space-between" }}>
                        <div style={{ flex: "0 0 auto", maxWidth: 520, zIndex: 1 }}>
                            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4.5vw,52px)", color: "#1a2e1a", lineHeight: 1.12, margin: "0 0 16px", letterSpacing: -1 }}>
                                Taste the Best<br />
                                <span style={{ color: "#f97316", fontStyle: "italic" }}>That Surprises</span><br />
                                You. 🔥
                            </h1>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <button
                                    onClick={() => document.getElementById("restaurant-grid")?.scrollIntoView({ behavior: "smooth" })}
                                    style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", border: "none", borderRadius: 50, padding: "14px 30px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px rgba(45,138,45,0.38)", transition: "transform 0.18s" }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                >Order Now →</button>
                                <button
                                    style={{ background: "transparent", color: "#2d8a2d", border: "2px solid #2d8a2d", borderRadius: 50, padding: "14px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#2d8a2d"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2d8a2d"; }}
                                >See Menu</button>
                            </div>
                        </div>

                        <div style={{ flex: "0 0 auto", position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} className="hero-image-col">
                            <div style={{ position: "absolute", width: "clamp(260px,35vw,420px)", height: "clamp(260px,35vw,420px)", borderRadius: "50%", background: "linear-gradient(135deg,rgba(249,115,22,0.15),rgba(45,138,45,0.15))", filter: "blur(2px)" }}/>
                            <div style={{ position: "absolute", width: "clamp(280px,37vw,440px)", height: "clamp(280px,37vw,440px)", borderRadius: "50%", border: "2px dashed rgba(45,138,45,0.20)" }}/>
                            <div style={{ width: "clamp(220px,30vw,360px)", height: "clamp(220px,30vw,360px)", borderRadius: "50%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 6px rgba(255,255,255,0.6)", position: "relative", zIndex: 2 }}>
                                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" alt="Delicious food" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ position: "absolute", top: "8%", left: "-5%", background: "white", borderRadius: 16, padding: "10px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 8, zIndex: 3, animation: "floatA 3s ease-in-out infinite" }}>
                                <span style={{ fontSize: 20 }}>🍔</span>
                                <div>
                                    <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "#1a2e1a" }}>Burger King</p>
                                    <p style={{ margin: 0, fontSize: 10, color: "#f97316", fontWeight: 600 }}>Ready in 15 min</p>
                                </div>
                            </div>
                            <div style={{ position: "absolute", bottom: "10%", right: "-8%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", borderRadius: 16, padding: "10px 16px", boxShadow: "0 8px 24px rgba(45,138,45,0.35)", display: "flex", alignItems: "center", gap: 8, zIndex: 3, animation: "floatB 3.5s ease-in-out infinite" }}>
                                <span style={{ fontSize: 18 }}>⭐</span>
                                <div>
                                    <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: "white" }}>Top Rated</p>
                                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>4.9 / 5.0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Mobile search ──────────────────────────────────────────── */}
                <div style={{ padding: "0 16px 20px", display: "none" }} className="mobile-search">
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderRadius: 50, boxShadow: "0 4px 20px rgba(20,80,20,0.11)", display: "flex", alignItems: "center", padding: "4px 16px", border: "1.5px solid rgba(45,138,45,0.18)" }}>
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#2d8a2d" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search restaurants..."
                            style={{ border: "none", flex: 1, padding: "9px 10px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "transparent", color: "#1a2e1a", outline: "none" }}
                        />
                    </div>
                </div>

                {/* ── Vendor grid ─────────────────────────────────────────────── */}
                <div style={{ padding: "0 16px 80px", maxWidth: 1280, margin: "0 auto" }}>
                    <h2 id="restaurant-grid" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#1a2e1a", marginBottom: 14, padding: "0 4px" }}>
                        {search ? `Results for "${search}"` : "All Restaurants"}
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#7aaa7a", marginLeft: 8 }}>({filtered.length})</span>
                    </h2>

                    {error && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#d32f2f", background: "#ffebee", borderRadius: 12, marginBottom: 20 }}>
                            <p style={{ fontWeight: 600 }}>⚠️ {error}</p>
                            <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: "8px 16px", background: "#2d8a2d", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Retry</button>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#8aaa8a" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
                            <p style={{ fontSize: 16, fontWeight: 700 }}>Loading delicious restaurants...</p>
                            <p style={{ fontSize: 12, marginTop: 8 }}>Please wait while we fetch the best spots for you</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "#8aaa8a" }}>
                            <p style={{ fontSize: 40 }}>🍽️</p>
                            <p style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>No restaurants found</p>
                            {search && <p style={{ fontSize: 14, marginTop: 8 }}>Try searching for something else</p>}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 14 }} className="vendor-grid">
                            {filtered.map(v => (
                                <VendorCard
                                    key={v.id || v._id}
                                    vendor={v}
                                    onClick={handleVendorClick}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── FAB cart button ──────────────────────────────────────────── */}
                {(totalCartItems > 0 || cartSyncing) && (
                    <div
                        onClick={() => !cartSyncing && setShowCart(true)}
                        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 700, background: cartSyncing ? "linear-gradient(135deg,#94a3b8,#cbd5e1)" : "linear-gradient(135deg,#f97316,#fb923c)", borderRadius: 50, padding: "14px 22px", display: "flex", alignItems: "center", gap: 8, cursor: cartSyncing ? "default" : "pointer", boxShadow: cartSyncing ? "0 6px 24px rgba(0,0,0,0.15)" : "0 6px 24px rgba(249,115,22,0.45)", color: "white", fontWeight: 800, fontFamily: "'Sora',sans-serif", fontSize: 15, animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)", transition: "background 0.3s" }}
                    >
                        {cartSyncing
                            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Syncing cart…</>
                            : <>🛒 View Cart · {totalCartItems}</>
                        }
                    </div>
                )}

                {/* ── WhatsApp support button ──────────────────────────────────── */}
                <a
                    href="https://wa.me/2348000000000"
                    target="_blank"
                    rel="noreferrer"
                    style={{ position: "fixed", bottom: 28, left: 28, zIndex: 700, background: "#25D366", borderRadius: 50, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(37,211,102,0.35)", color: "white", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}
                >
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Contact ChopSpot
                </a>
            </div>

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            {selectedVendor && (
                <VendorModal
                    vendor={selectedVendor}
                    onClose={() => setSelectedVendor(null)}
                    onGoToCart={handleGoToCart}
                />
            )}
            {showCart && (
                <CartModal
                    cartGroups={cartGroups}
                    onClose={() => setShowCart(false)}
                    onCheckout={handleCheckout}
                    onRemoveGroup={removeGroup}
                />
            )}
            {showCheckout && (
                // FIX: passes API profile (from useUserProfile) not old localStorage shape.
                // CheckoutModal handles both firstName+lastName and fullName gracefully.
                <CheckoutModal
                    totalAmount={cartTotal}
                    profile={profile}
                    onClose={() => setShowCheckout(false)}
                    onPay={handlePay}
                />
            )}
            {showPayment && (
                <PaymentModal
                    orderInfo={orderInfo}
                    userEmail={user?.email}
                    onClose={handlePaymentClose}
                    onConfirm={handleConfirm}
                />
            )}
        </>
    );
}