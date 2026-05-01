import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as API from "../utils/Api";
import logo from "../assets/tasty.jpg.jpeg";
import { useCart }        from "../hooks/useCart";
import { useAuth } from "../auth/AuthContext";
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

    // ── Auth ──────────────────────────────────────────────────────────────────
    // useAuth (hooks/useAuth) may expose either { isLoggedIn, user, userId }
    // or the AuthContext shape { isAuthenticated, user }. We normalise here.
    const auth = useAuth();
    const { isAuthenticated: isLoggedIn, user, logout } = useAuth();
    const userId = user?.id ?? user?.userId ?? null;
    const refresh = () => {};

    // ── Cart ──────────────────────────────────────────────────────────────────
    const toast = useToast();

    const {
        cartGroups,
        cartLoading: cartSyncing,
        addGroup,
        removeGroup,
        clearCart,
        mergeGuestCartOnLogin,
        totalItems: totalCartItems,
    } = useCart({ isLoggedIn, userId, onError: (msg) => toast.error(msg) });

    // ── User profile ──────────────────────────────────────────────────────────
    const { profile, saveProfile } = useUserProfile({ isLoggedIn });

    // ── UI state ──────────────────────────────────────────────────────────────
    const [vendors,        setVendors]     = useState([]);
    const [loading,        setLoading]     = useState(true);
    const [error,          setError]       = useState(null);
    const [search,         setSearch]      = useState("");
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showCart,       setShowCart]    = useState(false);
    const [showCheckout,   setShowCheckout] = useState(false);
    const [showPayment,    setShowPayment]  = useState(false);
    const [orderInfo,      setOrderInfo]   = useState(null);
    const [orderReady,     setOrderReady]  = useState(false);

    const paymentConfirmedRef = useRef(false);

    // ── After login redirect ──────────────────────────────────────────────────
// ── After successful login redirect handling ─────────────────────────────
    useEffect(() => {
        const state = location.state;

        if (state?.openCheckout && isLoggedIn) {
            console.log("🔄 Login redirect detected - opening checkout");

            // Merge guest cart if any
            mergeGuestCartOnLogin().then(() => {
                setShowCheckout(true);
            }).catch(err => {
                console.error("Failed to merge guest cart:", err);
                toast.error("Could not restore your cart. Please try adding items again.");
            });

            // Clear the state so it doesn't run again on re-renders
            navigate("/", { replace: true, state: {} });
        }
    }, [location.state, isLoggedIn, mergeGuestCartOnLogin, navigate, toast]);

    // ── Fetch vendors ─────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
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
                else setError("Invalid data format from server");
                setVendors(list);
            } catch (err) {
                setError(err.message || "Could not load restaurants.");
            } finally {
                setLoading(false);
            }
        })();
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

    const handlePay = (info) => {
        if (info.saveDetails) {
            saveProfile({
                whatsapp:                info.whatsapp,
                hostel:                  info.hostel,
                room:                    info.room,
                defaultDeliveryLocation: info.location?.value,
            });
        }

        const firstGroup    = cartGroups[0] || {};
        const packagePrice  = firstGroup.pack?.price || 0;
        const packageName   = firstGroup.pack?.name  || null;
        const itemsSubtotal = cartGroups.reduce(
            (s, g) => s + g.items.reduce((a, i) => a + i.price * i.qty, 0), 0
        );
        const subtotal    = itemsSubtotal + packagePrice;
        const deliveryFee = info.location?.fee || DELIVERY_FEE;
        // Use the serviceCharge already calculated by CheckoutModal (passed via info),
        // falling back to 20% of subtotal so the Paystack amount always matches checkout.
        const serviceCharge = info.serviceCharge ?? Math.round(subtotal * 0.20);
        const totalAmount   = subtotal + deliveryFee + serviceCharge;

        // ── Generate the Paystack reference NOW, before anything else ────────────
        // We own the reference so the webhook can always find the order by it,
        // even if the user closes the modal before confirmPayment runs.
        const paystackRef = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        paymentConfirmedRef.current = false;
        setOrderInfo({ ...info, orderTotal: totalAmount, orderId: null, paystackRef });
        setOrderReady(false);
        setShowCheckout(false);
        setShowPayment(true);

        const orderPayload = {
            vendorId: firstGroup.vendor?.id || null,
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
            serviceCharge,
            totalAmount,
            deliveryLocation:  info.location?.label || "",
            hostel:            info.hostel           || "",
            room:              info.room             || "",
            whatsappNumber:    info.whatsapp         || "",
            paymentMethod:     "CARD",
            paystackReference: paystackRef,   // ← stored immediately on the order
        };

        API.orderApi.createOrder(orderPayload)
            .then(createdOrder => {
                setOrderInfo(prev => ({ ...prev, orderId: createdOrder.id }));
                setOrderReady(true);
            })
            .catch(err => {
                setShowPayment(false);
                setOrderInfo(null);
                setOrderReady(false);
                toast.error(err.message || "Could not prepare order. Please try again.");
            });
    };

    const handleConfirm = async (paymentMethod = "CARD") => {
        paymentConfirmedRef.current = true;
        clearCart();
        toast.success("Order confirmed! 🎉 We'll WhatsApp you when it's ready.", 7000);

        try {
            // paystackRef is already on the order in the DB — just confirm payment
            // await API.orderApi.confirmPayment(orderInfo?.orderId, {
            //     paystackReference: orderInfo?.paystackRef,
            //     paymentMethod,
            // });
        } catch (err) {
            console.error("confirmPayment failed:", err);
            if (!err.message?.includes("already paid")) {
                toast.error("Payment received but confirmation had an issue.");
            }
        } finally {
            setOrderInfo(null);
            setOrderReady(false);
            paymentConfirmedRef.current = false;
        }
    };

    const handlePaymentClose = async () => {
        setShowPayment(false);

        if (paymentConfirmedRef.current) {
            setOrderInfo(null);
            setOrderReady(false);
            paymentConfirmedRef.current = false;
            return;
        }

        const orderId = orderInfo?.orderId;
        setOrderInfo(null);
        setOrderReady(false);

        if (orderId) {
            try {
                await API.orderApi.cancelOrder(orderId);
                toast.info("Order cancelled. Your cart is still saved.");
            } catch (err) {
                console.warn("Could not cancel order:", err.message);
            }
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'DM Sans', sans-serif; }
                @keyframes mIn    { from { opacity:0; transform:scale(0.93) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
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

                {/* ── Navbar ── */}
                <nav style={{ background: "rgba(20,42,20,0.96)", backdropFilter: "blur(20px)", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 800, boxShadow: "0 2px 24px rgba(0,0,0,0.25)" }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <img src={logo} alt="ChopSpot Logo" style={{ height: 40, width: "auto", borderRadius: "15%" }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="nav-links">
                        {[["Find Food", "#"], ["Vendors", "#"], ["About", "#"]].map(([label, href]) => (
                            <a key={label} href={href} style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, padding: "8px 16px", borderRadius: 50, transition: "all 0.18s" }}
                               onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "white"; }}
                               onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(255,255,255,0.75)"; }}>
                                {label}
                            </a>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, display: "flex", alignItems: "center", padding: "6px 14px", gap: 8, width: 190 }} className="nav-search">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.45)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search" style={{ border: "none", background: "transparent", outline: "none", color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: 13, width: "100%" }} />
                            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>}
                        </div>

                        <button onClick={() => setShowCart(true)} title={cartSyncing ? "Syncing…" : "View cart"} style={{ position: "relative", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,0.25)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}>
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

                        <ProfileAvatar
                            profile={profile}
                            isLoggedIn={isLoggedIn}
                            onDashboard={() => navigate("/dashboard")}
                            onLogout={logout}
                            onLogin={() => navigate("/login", { state: { returnTo: "/" } })}
                        />
                    </div>
                </nav>

                {/* ── Hero ── */}
                <div style={{ position: "relative", overflow: "hidden", padding: "28px 0 20px" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 280, height: 280, borderRadius: "50%", background: "rgba(249,115,22,0.08)", filter: "blur(55px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, left: -30, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,138,45,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />

                    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                        <div style={{ flex: 1, zIndex: 1 }}>
                            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", color: "#1a2e1a", lineHeight: 1.2, margin: "8px 0 10px", letterSpacing: "-0.01em" }}>
                                Crave it.{" "}
                                <span style={{ color: "#f97316", position: "relative", display: "inline-block" }}>
                                    Click it.
                                    <svg style={{ position: "absolute", bottom: -4, left: 0, right: 0, width: "100%" }} viewBox="0 0 200 6" fill="none">
                                        <path d="M2 4.5C45 2 155 2 198 4.5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
                                    </svg>
                                </span>{" "}
                                Enjoy it
                            </h1>
                            <p style={{ fontSize: "clamp(13px,2.8vw,15px)", color: "#6b7a6b", maxWidth: 460, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif", marginBottom: 16 }}>
                                Experience a smarter way to enjoy meals from the best vendors around you
                            </p>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <button onClick={() => document.getElementById("restaurant-grid")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white", border: "none", borderRadius: 50, padding: "14px 30px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px rgba(45,138,45,0.38)", transition: "transform 0.18s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>Order Now →</button>
                                {!isLoggedIn && <button onClick={() => navigate("/login")} style={{ background: "rgba(255,255,255,0.08)", color: "#1a2e1a", border: "1.5px solid rgba(45,138,45,0.2)", borderRadius: 50, padding: "14px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.18s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(45,138,45,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>Sign In</button>}
                            </div>
                        </div>

                        <div style={{ flexShrink: 0, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} className="hero-image-col">
                            <div style={{ position: "absolute", width: "clamp(180px,26vw,260px)", height: "clamp(180px,26vw,260px)", borderRadius: "50%", border: "1px solid rgba(249,115,22,0.2)", zIndex: 0 }} />
                            <div style={{ width: "clamp(160px,24vw,240px)", height: "clamp(160px,24vw,240px)", borderRadius: "50%", overflow: "hidden", boxShadow: "0 15px 30px -10px rgba(0,0,0,0.15)", position: "relative", zIndex: 2, border: "3px solid rgba(255,255,255,0.9)" }}>
                                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80" alt="Delicious food" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ position: "absolute", bottom: "0%", right: "-5%", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderRadius: 40, padding: "6px 14px", boxShadow: "0 8px 20px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 6, zIndex: 3, border: "1px solid rgba(255,255,255,0.3)" }}>
                                <span style={{ fontSize: 16 }}>⭐</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: "#1a2e1a" }}>4.9</p>
                                    <p style={{ margin: 0, fontSize: 9, color: "#f97316", fontWeight: 500 }}>2k+ reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Mobile search ── */}
                <div style={{ padding: "0 16px 20px", display: "none" }} className="mobile-search">
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderRadius: 50, boxShadow: "0 4px 20px rgba(20,80,20,0.11)", display: "flex", alignItems: "center", padding: "4px 16px", border: "1.5px solid rgba(45,138,45,0.18)" }}>
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#2d8a2d" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..." style={{ border: "none", flex: 1, padding: "9px 10px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "transparent", color: "#1a2e1a", outline: "none" }} />
                    </div>
                </div>

                {/* ── Vendor grid ── */}
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
                                <VendorCard key={v.id || v._id} vendor={v} onClick={setSelectedVendor} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── FAB cart ── */}
                {(totalCartItems > 0 || cartSyncing) && (
                    <div onClick={() => !cartSyncing && setShowCart(true)} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 700, background: cartSyncing ? "linear-gradient(135deg,#94a3b8,#cbd5e1)" : "linear-gradient(135deg,#f97316,#fb923c)", borderRadius: 50, padding: "14px 22px", display: "flex", alignItems: "center", gap: 8, cursor: cartSyncing ? "default" : "pointer", boxShadow: cartSyncing ? "0 6px 24px rgba(0,0,0,0.15)" : "0 6px 24px rgba(249,115,22,0.45)", color: "white", fontWeight: 800, fontFamily: "'Sora',sans-serif", fontSize: 15, animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)" }}>
                        {cartSyncing
                            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Syncing cart…</>
                            : <>🛒 View Cart · {totalCartItems}</>
                        }
                    </div>
                )}

                {/* ── WhatsApp ── */}
                <a href="https://wa.me/2348078168804" target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: 28, left: 28, zIndex: 700, background: "#25D366", borderRadius: 50, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(37,211,102,0.35)", color: "white", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif", textDecoration: "none" }}>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Contact TastyCart <img src={logo} alt="TastyCart Logo" srcset="" className="h-[20px] w-[20px] rounded-full" />
                </a>
            </div>

            {/* ── Modals ── */}
            {selectedVendor && <VendorModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onGoToCart={handleGoToCart} />}
            {showCart      && <CartModal cartGroups={cartGroups} onClose={() => setShowCart(false)} onCheckout={handleCheckout} onRemoveGroup={removeGroup} />}
            {showCheckout  && <CheckoutModal totalAmount={cartTotal} profile={profile} onClose={() => setShowCheckout(false)} onPay={handlePay} vendor={cartGroups[0]?.vendor} />}
            {showPayment   && (
                <PaymentModal
                    orderInfo={orderInfo}
                    orderReady={orderReady}
                    userEmail={user?.email}
                    onClose={handlePaymentClose}
                    onConfirm={handleConfirm}
                />
            )}
        </>
    );
}