import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ── Floating food orbs (reused from login aesthetic) ──────────────────────────
const FOOD_EMOJIS = ["🍛", "🍗", "🥗", "🥘", "🍜", "🫔", "🍔", "🌽", "🍱", "🥙", "🍣", "🧆"];

function FoodOrb({ emoji, style }) {
  return (
    <div style={{
      position: "absolute", width: 52, height: 52, borderRadius: "50%",
      background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, backdropFilter: "blur(4px)", pointerEvents: "none", ...style,
    }}>{emoji}</div>
  );
}

// ── Intersection Observer hook for scroll reveals ─────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      borderRadius: 16, border: `1.5px solid ${open ? "#1a5c1a" : "#e9ecef"}`,
      background: open ? "#f0fdf4" : "#fff", marginBottom: 12,
      transition: "all 0.3s ease", overflow: "hidden",
      boxShadow: open ? "0 4px 24px rgba(26,92,26,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s, border 0.3s, background 0.3s, box-shadow 0.3s`,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: open ? "#1a5c1a" : "#0f172a", lineHeight: 1.4, paddingRight: 16 }}>{q}</span>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: open ? "#1a5c1a" : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s ease",
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={open ? "white" : "#64748b"} strokeWidth="2.5"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div style={{
        maxHeight: open ? 300 : 0, overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#475569", lineHeight: 1.75, padding: "0 24px 20px" }}>{a}</p>
      </div>
    </div>
  );
}

// ── Team Card ─────────────────────────────────────────────────────────────────
function TeamCard({ emoji, name, role, bio, index }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 20, padding: "32px 24px", textAlign: "center",
        border: `1.5px solid ${hovered ? "#1a5c1a" : "#f0f0f0"}`,
        boxShadow: hovered ? "0 12px 48px rgba(26,92,26,0.14)" : "0 2px 12px rgba(0,0,0,0.05)",
        transition: `all 0.35s ease, opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)",
        cursor: "default",
      }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
        background: "linear-gradient(135deg,#0d2e0d,#1a5c1a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 34, boxShadow: "0 6px 24px rgba(26,92,26,0.25)",
        transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.3s ease",
      }}>{emoji}</div>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 4 }}>{name}</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#1a5c1a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{role}</p>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{bio}</p>
    </div>
  );
}

// ── Value Card ────────────────────────────────────────────────────────────────
function ValueCard({ icon, title, desc, color, index }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      background: "#fff", borderRadius: 20, padding: "28px 24px",
      border: "1.5px solid #f0f0f0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: color + "18", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 16,
      }}>{icon}</div>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ num, icon, title, desc, index }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      display: "flex", gap: 20, alignItems: "flex-start",
      opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-32px)",
      transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#0d2e0d,#2d7a2d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 4px 16px rgba(26,92,26,0.3)",
        }}>{icon}</div>
        <div style={{
          position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
          background: "#f5920a", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: 10, color: "#fff",
        }}>{num}</div>
      </div>
      <div style={{ paddingTop: 6 }}>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>{title}</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN ABOUT PAGE
// ════════════════════════════════════════════════════════════
export default function AboutPage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError("Please fill in all required fields.");
      return;
    }
    setContactError("");
    setContactLoading(true);
    setTimeout(() => { setContactLoading(false); setContactSent(true); }, 1600);
  };

  const FAQ_ITEMS = [
    { q: "What is TastyCart and how does it work?", a: "TastyCart is Nigeria's premier food e-commerce platform connecting hungry customers with top-quality restaurants and home chefs. Simply browse, choose your meals, pay securely, and track your delivery in real time — all from one seamless app." },
    { q: "Which cities does TastyCart currently serve?", a: "We currently operate in Lagos, Abuja, Port Harcourt, Ibadan, and Kano, with rapid expansion underway. New cities are onboarded every quarter — follow our social channels for launch announcements." },
    { q: "How do I become a vendor (restaurant) on TastyCart?", a: "Visit quickconsult.ng/register/vendor or contact our partnerships team at vendors@tastycart.ng. Our team will walk you through onboarding, menu setup, and go-live within 48 hours." },
    { q: "How long does delivery typically take?", a: "Average delivery time is 25–45 minutes depending on your location and order complexity. You'll receive real-time GPS tracking once your rider picks up your order." },
    { q: "Is my payment information safe?", a: "Absolutely. TastyCart uses bank-grade 256-bit SSL encryption and is PCI-DSS compliant. We support Paystack, Flutterwave, bank transfer, and cash on delivery. We never store raw card data." },
    { q: "Can I schedule orders in advance?", a: "Yes! TastyCart Pro subscribers can schedule orders up to 7 days in advance. Simply select 'Schedule Order' during checkout and pick your preferred delivery window." },
    { q: "What is your refund and cancellation policy?", a: "Orders can be cancelled within 3 minutes of placement for a full refund. For quality issues, our support team processes refunds within 24 hours — no questions asked for first-time issues." },
    { q: "How do riders earn on TastyCart?", a: "Riders keep 85% of their delivery fees plus 100% of tips. Weekly payouts are processed every Friday directly to your bank account. Top performers unlock bonus tiers and priority order assignments." },
  ];

  const TEAM = [
    { emoji: "👨🏾‍💻", name: "Emeka Okonkwo", role: "CEO & Co-founder", bio: "Former Andela engineer with 10+ years building fintech and logistics platforms across West Africa." },
    { emoji: "👩🏾‍🎨", name: "Fatima Al-Hassan", role: "Chief Design Officer", bio: "Ex-Figma, loves obsessing over micro-interactions and the perfect shade of green." },
    { emoji: "👨🏽‍🍳", name: "Chef Babatunde", role: "Head of Vendor Success", bio: "Michelin-trained chef who left the kitchen to help 1,000+ Nigerian restaurants scale digitally." },
    { emoji: "👩🏿‍💼", name: "Ngozi Eze", role: "VP of Operations", bio: "Built delivery networks for Jumia and Bolt before joining TastyCart to crack last-mile logistics." },
    { emoji: "👨🏾‍🔬", name: "Kolade Adeyemi", role: "CTO & Co-founder", bio: "Distributed systems enthusiast. Prev: AWS, Paystack. Believes great infra is invisible." },
    { emoji: "👩🏾‍📊", name: "Amina Bello", role: "Head of Growth", bio: "Performance marketer who scaled TastyCart from 200 to 200,000 users in 18 months." },
  ];

  const VALUES = [
    { icon: "🔥", title: "Food First", desc: "Every decision we make starts with one question: does this make the food experience better? Quality is non-negotiable.", color: "#f5920a" },
    { icon: "⚡", title: "Speed Without Compromise", desc: "Fast delivery shouldn't mean cold food or careless service. We've engineered both ends of that equation.", color: "#1a5c1a" },
    { icon: "🤝", title: "Vendors Win Too", desc: "We succeed when our restaurant partners succeed. That's why our commission rates are the most competitive in the market.", color: "#2563eb" },
    { icon: "🛡️", title: "Trust is Everything", desc: "Transparent pricing, honest reviews, zero hidden fees. We'd rather lose a transaction than lose your trust.", color: "#7c3aed" },
    { icon: "🌍", title: "Built for Africa", desc: "From USSD payments to low-bandwidth optimization, TastyCart is engineered for Nigerian realities, not Silicon Valley assumptions.", color: "#dc2626" },
    { icon: "♻️", title: "Sustainable Delivery", desc: "We're partnering with eco-packaging vendors and piloting electric bikes in Lagos to reduce our carbon footprint.", color: "#059669" },
  ];

  const STEPS = [
    { num: 1, icon: "🔍", title: "Browse & Discover", desc: "Explore thousands of dishes from local favourites to premium restaurants — filtered by cuisine, rating, delivery time, and budget." },
    { num: 2, icon: "🛒", title: "Build Your Cart", desc: "Customize your order with special instructions, add-ons, and quantities. Dietary filters help you find halal, vegan, and allergen-free options." },
    { num: 3, icon: "💳", title: "Pay Securely", desc: "Choose from card, bank transfer, USSD, or cash on delivery. Split payments with friends coming soon." },
    { num: 4, icon: "🏍️", title: "Real-Time Tracking", desc: "Watch your rider navigate to you on a live map. Get SMS and push notifications at every stage from kitchen to doorstep." },
    { num: 5, icon: "😋", title: "Enjoy & Rate", desc: "Eat great food, rate your experience, and earn TastyPoints redeemable for discounts on your next order." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fafafa; }
        @keyframes heroFadeUp  { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:translateY(0); } }
        @keyframes heroFadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes orbFloat1   { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-18px) rotate(8deg); } }
        @keyframes orbFloat2   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-24px) rotate(-5deg); } }
        @keyframes orbFloat3   { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-14px); } }
        @keyframes spinRing    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes successPop  { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .stat-num { font-family:'Sora',sans-serif; font-weight:900; font-size:clamp(2.4rem,5vw,3.4rem); line-height:1; }
        .hero-title { font-family:'Sora',sans-serif; font-weight:900; font-size:clamp(2.6rem,6vw,4.2rem); line-height:1.12; letter-spacing:-0.03em; }
        input::placeholder, textarea::placeholder { color:#94a3b8; }
        input:focus, textarea:focus { outline:none; }
        .contact-input { transition: all 0.25s ease; }
        .contact-input:focus { border-color:#1a5c1a !important; background:#f0fdf4 !important; box-shadow:0 0 0 3px rgba(26,92,26,0.12) !important; }
        .nav-link { font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:#374151; text-decoration:none; padding:6px 2px; position:relative; transition:color 0.2s; }
        .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:#1a5c1a; transition:width 0.25s ease; border-radius:2px; }
        .nav-link:hover { color:#1a5c1a; }
        .nav-link:hover::after { width:100%; }
        @media (max-width:768px) {
          .hero-grid { flex-direction:column !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .values-grid { grid-template-columns:1fr !important; }
          .team-grid { grid-template-columns:repeat(2,1fr) !important; }
          .how-grid { grid-template-columns:1fr !important; }
          .contact-grid { grid-template-columns:1fr !important; }
          .hide-mobile { display:none !important; }
        }
        @media (max-width:480px) {
          .team-grid { grid-template-columns:1fr !important; }
          .stats-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: navScrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: navScrolled ? "blur(16px)" : "none",
        borderBottom: navScrolled ? "1px solid #e9ecef" : "none",
        transition: "all 0.3s ease",
        padding: "0 clamp(16px,4vw,64px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍔</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: -0.5 }}>TastyCart</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hide-mobile">
            {["#mission", "#how-it-works", "#team", "#faq", "#contact"].map((href, i) => (
              <a key={href} href={href} className="nav-link">{["Our Mission", "How It Works", "Team", "FAQ", "Contact"][i]}</a>
            ))}
          </div>
          <Link to="/login" style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13,
            color: "#fff", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)",
            padding: "10px 22px", borderRadius: 10, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(26,92,26,0.35)",
          }}>Get Started →</Link>
        </div>
      </nav>

      {/* ── TICKER TAPE ── */}
      <div style={{ background: "#f5920a", overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", animation: "tickerScroll 22s linear infinite", whiteSpace: "nowrap" }}>
          {Array(2).fill(["🍛 Order in seconds", "🏍️ 30-min delivery", "🥗 500+ restaurants", "💳 Secure payments", "⭐ 4.8 rating", "🎉 Free delivery on first order"]).flat().map((t, i) => (
            <span key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", paddingRight: 48, letterSpacing: "0.04em" }}>• {t}</span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg,#0d2e0d 0%,#1a4a1a 55%,#0d2e0d 100%)",
        position: "relative", overflow: "hidden",
        padding: "clamp(64px,10vw,120px) clamp(16px,4vw,64px)",
      }}>
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
          <svg width="100%" height="100%"><defs><pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.5" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg>
        </div>
        <div style={{ position: "absolute", top: -160, right: -160, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,45,0.22) 0%,transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: -120, left: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,146,10,0.14) 0%,transparent 70%)" }}/>

        {FOOD_EMOJIS.slice(0, 8).map((emoji, i) => (
          <FoodOrb key={i} emoji={emoji} style={{
            top: `${[10,25,45,70,80,55,20,38][i]}%`,
            left: `${[72,86,80,90,65,77,93,68][i]}%`,
            animation: `orbFloat${(i % 3) + 1} ${3.5 + i * 0.45}s ease-in-out infinite`,
            animationDelay: `${i * 0.28}s`,
          }} />
        ))}

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,146,10,0.15)", border: "1px solid rgba(245,146,10,0.3)", borderRadius: 50, padding: "6px 16px", marginBottom: 28, animation: "heroFadeIn 0.7s ease both" }}>
            <span style={{ fontSize: 14 }}>🇳🇬</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, color: "#f5920a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Nigeria's Fastest Growing Food Platform</span>
          </div>
          <h1 className="hero-title" style={{ color: "#fff", marginBottom: 24, maxWidth: 700, animation: "heroFadeUp 0.8s ease 0.1s both" }}>
            We're on a mission to feed{" "}
            <span style={{ color: "#4caf50", fontStyle: "italic" }}>every Nigerian,</span>{" "}
            <span style={{ color: "#f5920a" }}>every day.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(15px,2vw,18px)", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 560, marginBottom: 40, animation: "heroFadeUp 0.8s ease 0.22s both" }}>
            TastyCart connects food lovers with the best local restaurants and home chefs, delivering exceptional meals in minutes — not hours. Built in Lagos, for Africa.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", animation: "heroFadeUp 0.8s ease 0.34s both" }}>
            <a href="#mission" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", padding: "14px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 6px 24px rgba(26,92,26,0.45)" }}>Our Story →</a>
            <a href="#contact" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", padding: "14px 28px", borderRadius: 12, textDecoration: "none" }}>Get in Touch</a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#fff", padding: "clamp(48px,7vw,80px) clamp(16px,4vw,64px)", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
            {[
              { val: 200000, suf: "+", label: "Happy Customers", icon: "😋" },
              { val: 500, suf: "+", label: "Restaurant Partners", icon: "🏪" },
              { val: 30, suf: " min", label: "Avg Delivery Time", icon: "⚡" },
              { val: 98, suf: "%", label: "Customer Satisfaction", icon: "⭐" },
            ].map(({ val, suf, label, icon }, i) => (
              <div key={i} style={{ padding: "24px 16px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div className="stat-num" style={{ color: "#1a5c1a", marginBottom: 8 }}>
                  <Counter target={val} suffix={suf} />
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#64748b", fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section id="mission" style={{ padding: "clamp(64px,8vw,100px) clamp(16px,4vw,64px)", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="hero-grid" style={{ display: "flex", gap: 64, alignItems: "center" }}>
            {/* Left — dark card */}
            <div style={{ flex: "0 0 48%", background: "linear-gradient(160deg,#0d2e0d,#1a4a1a)", borderRadius: 24, padding: "48px 40px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,146,10,0.2),transparent 70%)" }}/>
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(76,175,80,0.18),transparent 70%)" }}/>
              <div style={{ position: "relative", zIndex: 2 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f5920a", marginBottom: 16 }}>Our Mission</p>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#fff", lineHeight: 1.2, marginBottom: 24 }}>
                  Food shouldn't be complicated. Or slow.
                </h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 32 }}>
                  We started TastyCart in 2022 with a simple frustration: ordering food in Lagos was unreliable, overpriced, and stressful. We decided to fix it — not with a copy-paste of Western apps, but with something built from scratch for how Nigerians actually eat, pay, and live.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {["Founded in Lagos 🏙️", "Team of 80+", "Seed-funded 🚀"].map(tag => (
                    <span key={tag} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "5px 14px" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Right — values */}
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a5c1a", marginBottom: 16 }}>What We Stand For</p>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.6rem,2.8vw,2.2rem)", color: "#0f172a", lineHeight: 1.2, marginBottom: 32 }}>The values that guide every delivery</h2>
              <div className="values-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {VALUES.map((v, i) => <ValueCard key={i} {...v} index={i} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: "#fff", padding: "clamp(64px,8vw,100px) clamp(16px,4vw,64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f5920a", marginBottom: 12 }}>Simple & Fast</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#0f172a", lineHeight: 1.15 }}>
              From craving to doorstep<br />in 5 easy steps
            </h2>
          </div>
          <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px", maxWidth: 900, margin: "0 auto" }}>
            {STEPS.map((step, i) => <StepCard key={i} {...step} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" style={{ background: "linear-gradient(180deg,#fafafa 0%,#f0fdf4 100%)", padding: "clamp(64px,8vw,100px) clamp(16px,4vw,64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a5c1a", marginBottom: 12 }}>The People</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#0f172a", lineHeight: 1.15 }}>Meet the team behind the taste</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#64748b", lineHeight: 1.7, maxWidth: 520, margin: "16px auto 0" }}>
              A tight-knit crew of builders, foodies, and operators who wake up every day thinking about how to make your meal experience better.
            </p>
          </div>
          <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {TEAM.map((member, i) => <TeamCard key={i} {...member} index={i} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="mailto:careers@tastycart.ng" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a5c1a", textDecoration: "none", borderBottom: "2px solid #1a5c1a", paddingBottom: 2 }}>We're hiring — join the team →</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: "#fff", padding: "clamp(64px,8vw,100px) clamp(16px,4vw,64px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f5920a", marginBottom: 12 }}>Got Questions?</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#0f172a", lineHeight: 1.15 }}>Frequently asked questions</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#64748b", marginTop: 14 }}>Can't find what you're looking for? <a href="#contact" style={{ color: "#1a5c1a", fontWeight: 700, textDecoration: "none" }}>Contact our team ↓</a></p>
          </div>
          <div>
            {FAQ_ITEMS.map((item, i) => <FaqItem key={i} {...item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "linear-gradient(160deg,#0d2e0d,#1a4a1a)", padding: "clamp(64px,8vw,100px) clamp(16px,4vw,64px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,146,10,0.15),transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(76,175,80,0.15),transparent 70%)" }}/>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f5920a", marginBottom: 12 }}>Reach Out</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#fff", lineHeight: 1.15 }}>We'd love to hear from you</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 14, maxWidth: 480, margin: "14px auto 0" }}>Whether you're a customer, restaurant partner, investor, or job seeker — our inbox is always open.</p>
          </div>

          <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 40, alignItems: "start" }}>
            {/* Info column */}
            <div>
              {[
                { icon: "📍", label: "Office Address", value: "14 Marina Street, Victoria Island, Lagos, Nigeria" },
                { icon: "📞", label: "Phone", value: "+234 800 TASTYCART" },
                { icon: "✉️", label: "General Enquiries", value: "hello@tastycart.ng" },
                { icon: "🤝", label: "Vendor Partnerships", value: "vendors@tastycart.ng" },
                { icon: "🏍️", label: "Rider Recruitment", value: "riders@tastycart.ng" },
                { icon: "📰", label: "Press & Media", value: "press@tastycart.ng" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{value}</p>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Follow Us</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {["𝕏", "in", "📘", "📷"].map((s, i) => (
                    <div key={i} style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#fff" }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px 36px", backdropFilter: "blur(12px)" }}>
              {contactSent ? (
                <div style={{ textAlign: "center", padding: "24px 0", animation: "successPop 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✅</div>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 10 }}>Message sent!</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Thanks for reaching out. Our team will get back to you within 24 hours. 🚀</p>
                  <button onClick={() => { setContactSent(false); setContactForm({ name:"",email:"",subject:"",message:"" }); }}
                    style={{ marginTop: 24, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#1a5c1a", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer" }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 6 }}>Send us a message</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28, lineHeight: 1.6 }}>We typically respond within 2–4 business hours.</p>
                  {contactError && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>⚠️ {contactError}</p>}
                  <form onSubmit={handleContact} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {[
                        { placeholder: "Your name *", key: "name", type: "text" },
                        { placeholder: "Your email *", key: "email", type: "email" },
                      ].map(({ placeholder, key, type }) => (
                        <input key={key} type={type} placeholder={placeholder} value={contactForm[key]} required
                          onChange={e => setContactForm(p => ({ ...p, [key]: e.target.value }))} className="contact-input"
                          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#fff", transition: "all 0.25s" }}
                        />
                      ))}
                    </div>
                    <select value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                      style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: contactForm.subject ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", outline: "none" }}>
                      <option value="" style={{ background: "#1a4a1a" }}>Select a topic</option>
                      {["General Enquiry","Customer Support","Vendor Partnership","Rider Recruitment","Press & Media","Investor Relations","Bug Report"].map(o => (
                        <option key={o} value={o} style={{ background: "#1a4a1a" }}>{o}</option>
                      ))}
                    </select>
                    <textarea placeholder="Your message *" value={contactForm.message} required rows={5}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} className="contact-input"
                      style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#fff", resize: "vertical", outline: "none", minHeight: 120 }}
                    />
                    <button type="submit" disabled={contactLoading} style={{
                      width: "100%", padding: "15px", borderRadius: 12, border: "none",
                      background: contactLoading ? "rgba(76,175,80,0.5)" : "linear-gradient(135deg,#1a5c1a,#2d7a2d)",
                      color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14,
                      cursor: contactLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      boxShadow: contactLoading ? "none" : "0 4px 20px rgba(26,92,26,0.4)",
                      transition: "all 0.2s",
                    }}>
                      {contactLoading
                        ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spinRing 0.8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Sending…</>
                        : <>Send Message <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080f08", padding: "32px clamp(16px,4vw,64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍔</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>TastyCart</span>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 TastyCart Nigeria Ltd. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Cookies"].map(l => (
              <a key={l} href="#" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}