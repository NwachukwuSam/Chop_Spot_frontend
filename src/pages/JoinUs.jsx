import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { useAuth } from "../auth/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/NavBar";

// ─── Ticker (reusable) ──────────────────────────────────────────────────────
const Ticker = () => {
  const items = [
    "🍛 Order in seconds",
    "🏍️ 30-min delivery",
    "🥗 500+ restaurants",
    "💳 Secure payments",
    "⭐ 4.8 rating",
    "🎉 Fast delivery on all orders",
  ];
  const looped = [...items, ...items, ...items];
  return (
    <div className="bg-[#f5920a] h-9 flex items-center overflow-hidden w-full">
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-track { animation: tickerScroll 24s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track flex whitespace-nowrap">
        {looped.map((item, i) => (
          <span key={i} className="text-white font-bold text-[11px] tracking-[0.08em] pr-12">
            • {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Partner Modal ──────────────────────────────────────────────────────────
const PartnerModal = ({ isOpen, onClose, onSubmit }) => {
  const [role, setRole] = useState("vendor");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    vehicleType: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, role });
    setFormData({
      name: "",
      email: "",
      phone: "",
      businessName: "",
      vehicleType: "",
      message: "",
    });
    setRole("vendor");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
        <h2 className="fraunces font-black text-2xl text-[#1c2e1c] mb-1">Join Tasty Cart</h2>
        <p className="text-[#5a7a5a] text-sm mb-6">Fill in your details and we'll get in touch.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">I want to join as a</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-bold border transition ${
                  role === "vendor"
                    ? "border-[#2d8a2d] bg-[#2d8a2d] text-white"
                    : "border-[#d6ebd6] text-[#1c2e1c] hover:bg-[#f0faf0]"
                }`}
              >
                Vendor
              </button>
              <button
                type="button"
                onClick={() => setRole("rider")}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-bold border transition ${
                  role === "rider"
                    ? "border-[#f28c00] bg-[#f28c00] text-white"
                    : "border-[#d6ebd6] text-[#1c2e1c] hover:bg-[#f0faf0]"
                }`}
              >
                Rider
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
            />
          </div>

          {role === "vendor" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Business / Restaurant Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
              />
            </div>
          )}

          {role === "rider" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Vehicle Type (e.g., motorcycle, bicycle) *</label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Additional Message (optional)</label>
            <textarea
              name="message"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-[#d6ebd6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2d8a2d] hover:bg-[#1a5c1a] text-white font-bold py-3 rounded-full transition duration-200 shadow-lg shadow-[#2d8a2d]/30"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function JoinUs() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { profile } = useUserProfile({ isLoggedIn });
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // ── Hero slider slides ──
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80",
      label: "🍕 Join Our Restaurant Network",
    },
    {
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
      label: "🚚 Delivery Riders Wanted",
    },
    {
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80",
      label: "🏪 Partner with Local Businesses",
    },
  ];

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // ── Scroll reveal ──
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal], [data-reveal-r]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── EmailJS config ──
  const SERVICE_ID = "service_your_service_id";
  const TEMPLATE_ID = "template_your_template_id";
  const PUBLIC_KEY = "your_public_key";

  const handlePartnerSubmit = async (data) => {
    try {
      const templateParams = {
        role: data.role,
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName || "N/A",
        vehicleType: data.vehicleType || "N/A",
        message: data.message || "No additional message",
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      showToast("Application submitted successfully! We'll reach out soon.", "success");
      setModalOpen(false);
    } catch (error) {
      console.error("EmailJS error:", error);
      showToast("Failed to submit. Please try again later.", "error");
    }
  };

  return (
    <div className="font-sans text-[#1c2e1c] overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }

        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.4; transform:scale(.7); }
        }
        @keyframes fadeLeft {
          from { opacity:0; transform:translateX(30px); }
          to { opacity:1; transform:translateX(0); }
        }

        .hero-badge-dot {
          animation: dotPulse 1.6s ease-in-out infinite;
        }

        .hero-copy .hero-badge,
        .hero-copy .hero-h1,
        .hero-copy .hero-divider,
        .hero-copy .hero-desc,
        .hero-copy .hero-actions,
        .hero-copy .hero-stats {
          opacity:0;
        }
        .hero-copy .hero-badge { animation: fadeLeft .7s .1s both; }
        .hero-copy .hero-h1 { animation: fadeLeft .7s .25s both; }
        .hero-copy .hero-divider { animation: fadeLeft .7s .38s both; }
        .hero-copy .hero-desc { animation: fadeLeft .7s .48s both; }
        .hero-copy .hero-actions { animation: fadeLeft .7s .58s both; }
        .hero-copy .hero-stats { animation: fadeLeft .7s .7s both; }

        [data-reveal] { opacity:0; transform:translateY(32px); transition:opacity .75s ease, transform .75s ease; }
        [data-reveal].on { opacity:1; transform:translateY(0); }
        [data-reveal-r] { opacity:0; transform:translateX(36px); transition:opacity .75s ease, transform .75s ease; }
        [data-reveal-r].on { opacity:1; transform:translateX(0); }
        .d1 { transition-delay:.1s; } .d2 { transition-delay:.2s; }
        .d3 { transition-delay:.3s; } .d4 { transition-delay:.4s; }
        .d5 { transition-delay:.5s; }

        .hero-ring {
          position:absolute;
          border-radius:50%;
          border:1px solid rgba(45,138,45,0.12);
        }
        .hero-ring-1 { width:480px; height:480px; bottom:-120px; right:-120px; }
        .hero-ring-2 { width:720px; height:720px; bottom:-240px; right:-240px; }
      `}</style>

      <Ticker />
      <Navbar profile={profile} isLoggedIn={isLoggedIn} logout={logout} />

      {/* ─── Hero ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 h-[550px] overflow-hidden">
        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)]"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="min-w-full h-full relative flex-shrink-0">
                <img
                  src={slide.img}
                  alt={slide.label}
                  className="w-full h-full object-cover block"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/15">
                  {slide.label}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === slideIndex ? "bg-[#f28c00] w-6" : "bg-white/40"
                }`}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* Copy */}
        <div className="bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a] flex flex-col justify-center px-8 md:px-14 py-12 relative overflow-hidden">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#f28c00]/15 border border-[#f28c00]/30 text-[#f28c00] text-[11px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full mb-7 mt-7 hero-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f28c00] hero-badge-dot" />
              Partner with Us
            </div>
            <h1 className="fraunces font-black text-white text-[clamp(34px,4.5vw,58px)] leading-[1.04] tracking-[-2px] mb-5 mt-12 hero-h1">
              Join the Network<br />
              <span className="text-[#f28c00]">Powering Food Delivery</span>
            </h1>
            <div className="w-14 h-[3px] rounded-full bg-gradient-to-r from-[#f28c00] to-[#2d8a2d] mb-5 hero-divider" />
            <p className="text-white/55 text-[17px] leading-relaxed max-w-md mb-9 hero-desc">
              Whether you're a food vendor or a rider, Tasty Cart provides the platform, technology, and support to help you grow.
            </p>
            <div className="flex flex-wrap gap-3 mb-12 hero-actions">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-block bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-[#2d8a2d]/35 hover:-translate-y-0.5 transition"
              >
                🛵 Join Now
              </button>
              <a
                href="#vendors"
                className="inline-block border border-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/10 transition"
              >
                Learn More
              </a>
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─── */}
      <div className="bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a] py-1 border-t border-white/5">
       
      </div>

      {/* ─── For Vendors ─── */}
      <section className="py-20 px-6 bg-white" id="vendors">
        <div className="max-w-[1100px] mx-auto">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#2d8a2d] mb-3">
              <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
              For Vendors
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c]">
              Grow Your Food Business <br />
              <span className="text-[#2d8a2d]">with Tasty Cart</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mt-14">
            <div className="space-y-5">
              {[
                { icon: "📈", title: "Reach More Customers", desc: "Expand beyond walk‑in traffic and serve customers wherever they are." },
                { icon: "💰", title: "Increase Revenue", desc: "Generate additional income through online orders and delivery sales." },
                { icon: "🚚", title: "We Handle Delivery", desc: "Focus on preparing great meals while our riders handle the logistics." },
                { icon: "📋", title: "Simple Order Management", desc: "Receive, prepare, and fulfill orders efficiently through our platform." },
                { icon: "📣", title: "Marketing Support", desc: "Benefit from promotions, featured listings, and campaigns designed to grow your visibility." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-[#d6ebd6] bg-[#f0faf0] hover:border-[#2d8a2d] hover:bg-white hover:shadow-md transition-all"
                  data-reveal
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#1c2e1c]">{item.title}</div>
                    <div className="text-xs text-[#5a7a5a] leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="bg-[#f0faf0] rounded-3xl p-8 border border-[#d6ebd6]">
                <h3 className="fraunces font-black text-xl text-[#1c2e1c] mb-4">Who Can Join?</h3>
                <ul className="space-y-2 text-[#4a6a4a]">
                  <li>• Restaurants</li>
                  <li>• Cafeterias</li>
                  <li>• Local Kitchens</li>
                  <li>• Fast Food Vendors</li>
                  <li>• Bakeries</li>
                  <li>• Grills and Barbecue Spots</li>
                  <li>• Smoothie and Juice Bars</li>
                  <li>• Dessert Vendors</li>
                </ul>
              </div>
              <div className="bg-[#f0faf0] rounded-3xl p-8 border border-[#d6ebd6]">
                <h3 className="fraunces font-black text-xl text-[#1c2e1c] mb-4">Vendor Requirements</h3>
                <ul className="space-y-2 text-[#4a6a4a]">
                  <li>• Valid business information</li>
                  <li>• Consistent operating hours</li>
                  <li>• Commitment to quality service</li>
                  <li>• Ability to fulfill orders promptly</li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#2d8a2d] hover:bg-[#1a5c1a] text-white font-bold text-sm px-8 py-3.5 rounded-full transition shadow-lg shadow-[#2d8a2d]/30"
                  >
                    Become a Vendor Today
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Riders ─── */}
      <section className="py-20 px-6 bg-[#f0faf0]" id="riders">
        <div className="max-w-[1100px] mx-auto">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#f28c00] mb-3">
              <span className="w-6 h-0.5 rounded bg-[#2d8a2d]" />
              For Riders
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c]">
              Earn While Delivering <br />
              <span className="text-[#f28c00]">with Tasty Cart</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start mt-14">
            <div className="space-y-5 order-2 md:order-1">
              {[
                { icon: "💵", title: "Competitive Earnings", desc: "Earn from every completed delivery with opportunities for incentives and bonuses." },
                { icon: "⏰", title: "Flexible Schedule", desc: "Choose delivery periods that work for you." },
                { icon: "📦", title: "Consistent Orders", desc: "Benefit from deliveries generated by our growing customer and vendor base." },
                { icon: "📈", title: "Growth Opportunities", desc: "Grow with the company as we expand into new communities." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-[#d6ebd6] bg-white hover:border-[#f28c00] hover:bg-white hover:shadow-md transition-all"
                  data-reveal
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f28c00] to-[#d97706] flex items-center justify-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#1c2e1c]">{item.title}</div>
                    <div className="text-xs text-[#5a7a5a] leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <div className="bg-white rounded-3xl p-8 border border-[#d6ebd6]">
                <h3 className="fraunces font-black text-xl text-[#1c2e1c] mb-4">Rider Responsibilities</h3>
                <ul className="space-y-2 text-[#4a6a4a]">
                  <li>• Pick up orders from vendors promptly.</li>
                  <li>• Deliver meals safely and professionally.</li>
                  <li>• Maintain excellent customer service.</li>
                  <li>• Represent the Tasty Cart brand positively.</li>
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-[#d6ebd6]">
                <h3 className="fraunces font-black text-xl text-[#1c2e1c] mb-4">Rider Requirements</h3>
                <ul className="space-y-2 text-[#4a6a4a]">
                  <li>• Valid identification.</li>
                  <li>• Good knowledge of the local area.</li>
                  <li>• Access to a smartphone.</li>
                  <li>• Professional and customer-friendly attitude.</li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#f28c00] hover:bg-[#d97706] text-white font-bold text-sm px-8 py-3.5 rounded-full transition shadow-lg shadow-[#f28c00]/30"
                  >
                    Join as a Rider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Service Areas ─── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center" data-reveal>
          <h2 className="fraunces font-black text-3xl md:text-4xl text-[#1c2e1c] mb-3">
            Areas We Currently Serve
          </h2>
          <p className="text-[#4a6a4a] text-lg">
            City College and its environs • Becky One Estate • Becky Two Estate • Nurses Estate • Zamani Estate • Surrounding businesses and residential communities
          </p>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 px-6 text-center relative overflow-hidden bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial-circle from-[rgba(45,138,45,0.12)] to-transparent" />
        <div className="relative" data-reveal>
          <h2 className="fraunces font-black text-white text-3xl md:text-5xl leading-tight mb-4">
            Let's Grow Together
          </h2>
          <p className="text-white/60 text-lg mb-6">
            At Tasty Cart, we believe great partnerships create great experiences.<br />
            Whether you're serving delicious meals or delivering them to customers, there's a place for you in our ecosystem.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#f28c00] hover:bg-[#d97706] text-white font-bold text-base px-10 py-4 rounded-full transition shadow-xl shadow-[#f28c00]/30"
          >
            Join Tasty Cart as a Vendor or Rider
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0d1f0d] border-t border-white/5 px-6 md:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="fraunces font-black text-white text-lg">
          Tasty<span className="text-[#f28c00]">cart</span>
        </span>
        <span className="text-white/30 text-sm text-center">© 2025 Tastycart. Building the future of local commerce.</span>
      </footer>

      {/* ─── Modal ─── */}
      <PartnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handlePartnerSubmit}
      />
    </div>
  );
}