import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import { useAuth } from "../auth/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import daniel from '../assets/daniel.jpg';
import grace from '../assets/Grace.png';
import ken from '../assets/ken.jpeg';
import marv from '../assets/marv.jpeg';
import Sam from '../assets/SamPortrait.jpeg';
import Moyin from '../assets/moyin.jpeg';

// ─── Ticker ──────────────────────────────────────────────────────────────────
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

// ─── Team data ──────────────────────────────────────────────────────────────
const TEAM = [
  {
    initials: "NS",
    name: "Nwachukwu Samuel",
    role: "Founder & CEO",
    avatarGrad: "linear-gradient(135deg,#2d8a2d,#f28c00)",
    bio: "The visionary force behind Tastycart. With a deep-rooted passion for technology, Samuel founded the company to bridge the gap between local businesses and modern consumers.",
    fullBio: "Nwachukwu Samuel is a serial entrepreneur and technology enthusiast with over a decade of experience in building digital products. He founded Tastycart with a mission to empower local communities through seamless delivery solutions. Under his leadership, the company has grown from a small startup to a trusted platform serving thousands of customers. Samuel holds a degree in Computer Science and is a passionate advocate for community-driven innovation.",
    img: Sam,
  },
  {
    initials: "MM",
    name: "Moyinoluwa Michael",
    role: "Co-Founder & CTO",
    avatarGrad: "linear-gradient(135deg,#1a5c1a,#2d8a2d)",
    bio: "The technical mastermind who brings Tastycart's vision to life. His obsession with speed, reliability, and clean code ensures every tap is a smooth, delightful journey.",
    fullBio: "Moyinoluwa Michael is a full-stack engineer with a passion for scalable systems. He co-founded Tastycart to solve the technical challenges of last-mile delivery. Moyinoluwa has worked with leading tech companies and holds a Master's in Software Engineering. He is responsible for the platform's architecture, security, and performance, ensuring that Tastycart remains fast, reliable, and always available.",
    img: Moyin,
  },
  {
    initials: "KA",
    name: "Kenneth Akhabue",
    role: "Business Development Lead",
    avatarGrad: "linear-gradient(135deg,#1a4a8a,#f28c00)",
    bio: "The growth engine of Tastycart, forging strategic partnerships and expanding the company's footprint across Nigeria.",
    fullBio: "Kenneth Akhabue is a business development specialist with a knack for identifying and seizing opportunities. He joined Tastycart to drive the company's expansion into new markets. Kenneth has a background in economics and has successfully led several partnership initiatives that have increased the vendor base by 300%. He is deeply committed to creating value for both vendors and customers through win-win collaborations.",
    img: ken,
  },
  {
    initials: "MA",
    name: "Marvelous Ameh",
    role: "Brand Communication Strategist",
    avatarGrad: "linear-gradient(135deg,#6a2d8a,#f28c00)",
    bio: "The storyteller shaping Tastycart's voice. She crafts compelling brand narratives that resonate with our community and build lasting trust.",
    fullBio: "Marvelous Ameh is a creative brand strategist with a passion for storytelling. She has over 8 years of experience in marketing and communications, working with both startups and established brands. At Tastycart, she leads the brand communication efforts, ensuring that every message reflects the company's values and connects with the community. Marvelous believes that authentic storytelling is the key to building a loyal customer base.",
    img: marv,
  },
  {
    initials: "DB",
    name: "Daniel Bassey",
    role: "Social Media Manager",
    avatarGrad: "linear-gradient(135deg,#1a5c1a,#7aba00)",
    bio: "The digital face of Tastycart. His energy and creativity drive online visibility, turning followers into loyal customers and brand advocates.",
    fullBio: "Daniel Bassey is a digital marketing expert with a flair for creating engaging content. He has managed social media for several high-profile brands and brings a wealth of experience to Tastycart. Daniel is responsible for building an active online community, running campaigns, and leveraging social platforms to grow the brand's reach. His creative approach has helped Tastycart become a beloved name on social media.",
    img: daniel,
  },
  {
    initials: "GI",
    name: "Grace Iberuoluwa",
    role: "Marketing Specialist",
    avatarGrad: "linear-gradient(135deg,#1a5c1a,#7aba00)",
    bio: "The marketing strategist behind Tastycart's campaigns. She leverages data-driven insights to craft targeted marketing strategies that drive engagement and growth.",
    fullBio: "Grace Iberuoluwa is a data-driven marketing professional with a strong background in digital strategy. She holds a degree in Marketing and has worked with various startups to scale their user base. At Tastycart, Grace designs and executes marketing campaigns that resonate with local communities, using analytics to optimise performance. She is passionate about using marketing as a tool for positive community impact.",
    img: grace,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AboutUsNew() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { profile } = useUserProfile({ isLoggedIn });

  // ── Hero slider state ──
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
      label: "🍛 Freshly Prepared Meals",
    },
    {
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80",
      label: "🍕 Local Restaurant Partners",
    },
    {
      img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&q=80",
      label: "🥗 Healthy Options",
    },
    {
      img: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&q=80",
      label: "🌮 Street Food Favourites",
    },
    {
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80",
      label: "🏪 500+ Restaurants",
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

  // ── Team modal state ──
  const [selectedMember, setSelectedMember] = useState(null);

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

      <Navbar
        profile={profile}
        isLoggedIn={isLoggedIn}
        logout={logout}
        // cart not needed here
      />

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
          {/* Dots */}
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
        <div className="bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a] flex flex-col justify-center px-8 md:px-14 py-16 relative overflow-hidden">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#f28c00]/15 border border-[#f28c00]/30 text-[#f28c00] text-[11px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full mb-7 hero-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f28c00] hero-badge-dot" />
              Our Story
            </div>
            <h1 className="fraunces font-black text-white text-[clamp(38px,4.5vw,66px)] leading-[1.04] tracking-[-2px] mb-5 hero-h1">
              Built for <em className="text-[#f28c00] not-italic">your</em><br />
              neighbourhood
            </h1>
            <div className="w-14 h-[3px] rounded-full bg-gradient-to-r from-[#f28c00] to-[#2d8a2d] mb-5 hero-divider" />
            <p className="text-white/55 text-[17px] leading-relaxed max-w-md mb-9 hero-desc">
              A technology company on a mission to simplify how people access daily essentials — one delivery at a time.
            </p>
            <div className="flex flex-wrap gap-3 mb-12 hero-actions">
              <a
                href="/"
                className="inline-block bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-[#2d8a2d]/35 hover:-translate-y-0.5 transition"
              >
                🛵 Order Now
              </a>
              <a
                href="#mission"
                className="inline-block border border-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-white/10 transition"
              >
                Our Mission
              </a>
            </div>
            <div className="flex gap-8 hero-stats">
              <div>
                <div className="fraunces font-black text-3xl text-[#f28c00]">1k+</div>
                <div className="text-[10px] font-semibold text-white/35 tracking-[0.15em] uppercase mt-1">Orders</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="fraunces font-black text-3xl text-[#f28c00]">50+</div>
                <div className="text-[10px] font-semibold text-white/35 tracking-[0.15em] uppercase mt-1">Vendors</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="fraunces font-black text-3xl text-[#f28c00]">4.8★</div>
                <div className="text-[10px] font-semibold text-white/35 tracking-[0.15em] uppercase mt-1">Rating</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="fraunces font-black text-3xl text-[#f28c00]">25m</div>
                <div className="text-[10px] font-semibold text-white/35 tracking-[0.15em] uppercase mt-1">Avg Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section className="bg-[#f0faf0] py-24">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-reveal>
              <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#2d8a2d] mb-3">
                <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
                Who We Are
              </div>
              <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c] mb-5">
                More than a<br />
                <em className="text-[#2d8a2d] not-italic">delivery app</em>
              </h2>
              <p className="text-[#4a6a4a] text-base leading-relaxed mb-4">
                Born from a vision to redefine speed and efficiency in digital experiences, Tastycart is a comprehensive,
                technology-driven platform designed to be your one-stop shop for all local needs.
              </p>
              <p className="text-[#4a6a4a] text-base leading-relaxed">
                We bridge the gap between local businesses and consumers — making meals, groceries, and medicine
                available instantly at your doorstep.
              </p>
              <div className="flex flex-wrap gap-4 mt-7">
                <div className="bg-white border border-[#d6ebd6] rounded-2xl px-5 py-4 text-center">
                  <div className="fraunces font-black text-[28px] text-[#f28c00]">25m</div>
                  <div className="text-[11px] font-semibold text-[#5a7a5a] tracking-[0.1em] uppercase mt-0.5">
                    Avg Delivery
                  </div>
                </div>
                <div className="bg-white border border-[#d6ebd6] rounded-2xl px-5 py-4 text-center">
                  <div className="fraunces font-black text-[28px] text-[#2d8a2d]">50+</div>
                  <div className="text-[11px] font-semibold text-[#5a7a5a] tracking-[0.1em] uppercase mt-0.5">
                    Partners
                  </div>
                </div>
                <div className="bg-white border border-[#d6ebd6] rounded-2xl px-5 py-4 text-center">
                  <div className="fraunces font-black text-[28px] text-[#f28c00]">4.9★</div>
                  <div className="text-[11px] font-semibold text-[#5a7a5a] tracking-[0.1em] uppercase mt-0.5">
                    Avg Rating
                  </div>
                </div>
              </div>
            </div>
            <div data-reveal-r className="d2">
              <div className="grid grid-cols-2 grid-rows-[220px_160px] gap-3">
                <img
                  src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80"
                  alt="Cooking"
                  className="row-span-2 h-full w-full object-cover rounded-2xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80"
                  alt="Burger"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=80"
                  alt="Fresh produce"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Banner ─── */}
      <div className="bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a] py-16">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { num: "1,000+", label: "Orders Delivered" },
              { num: "50+", label: "Local Vendors" },
              { num: "4.8", label: "Customer Rating" },
              { num: "5", label: "Team Members" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center py-6 relative border-r border-white/10 last:border-r-0"
                data-reveal
              >
                <div className="fraunces font-black text-4xl text-[#f28c00]">{stat.num}</div>
                <div className="text-xs font-semibold text-white/40 tracking-[0.14em] uppercase mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Mission ─── */}
      <section className="py-24 bg-white" id="mission">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#2d8a2d] mb-3">
              <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
              Purpose
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c]">
              What drives us<br />
              <em className="text-[#2d8a2d] not-italic">every single day</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mt-14">
            <div
              className="bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a] rounded-3xl p-10 relative overflow-hidden text-white"
              data-reveal
            >
              <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-[#f28c00]/10" />
              <div className="text-4xl mb-5">🎯</div>
              <h3 className="fraunces font-black text-2xl mb-4">Our Mission</h3>
              <p className="text-white/65 text-sm leading-relaxed">
                Empower local communities by providing a seamless, reliable, and hyper-local delivery ecosystem.
                We connect consumers with the best local stores and restaurants — ensuring access to quality food
                and essentials is just a few taps away.
              </p>
            </div>
            <div
              className="bg-[#e8f5e0] border border-[#d6ebd6] rounded-3xl p-10 relative overflow-hidden"
              data-reveal
            >
              <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-[#f28c00]/10" />
              <div className="text-4xl mb-5">🌍</div>
              <h3 className="fraunces font-black text-2xl text-[#1c2e1c] mb-4">Our Vision</h3>
              <p className="text-[#5a7a5a] text-sm leading-relaxed">
                To be the most trusted and beloved local delivery platform — recognized for speed, reliability,
                and community. A world where accessing daily necessities is effortless, supporting local economies
                and fostering a more connected lifestyle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="py-24 bg-gradient-to-br from-[#0d1f0d] via-[#0f2e0f] to-[#1a4a1a]" id="values">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-white/60 mb-3">
              <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
              What We Stand For
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-white">
              The way we work <em className="text-[#f28c00] not-italic">matters</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-14">
            {[
              { icon: "💚", title: "Customer First", body: "Obsessed with delivering exceptional experiences that consistently exceed expectations." },
              { icon: "💡", title: "Innovation at Core", body: "Pushing the boundaries of what's possible — constantly finding better ways to serve." },
              { icon: "⚡", title: "Speed & Efficiency", body: "Lightning-fast performance and reliable service, every single time." },
              { icon: "🤝", title: "Transparency", body: "Open communication and lasting relationships with every partner and customer." },
              { icon: "🏘️", title: "Community Focused", body: "Dedicated to strengthening local communities by uplifting the businesses within them." },
            ].map((val, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-[#2d8a2d]/20 hover:border-[#2d8a2d]/30 transition-all hover:-translate-y-1"
                data-reveal
              >
                <div className="w-12 h-12 rounded-xl bg-[#f28c00]/15 border border-[#f28c00]/30 flex items-center justify-center text-2xl mb-4">
                  {val.icon}
                </div>
                <div className="font-extrabold text-sm text-white mb-2">{val.title}</div>
                <div className="text-xs text-white/50 leading-relaxed">{val.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Technology ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#2d8a2d] mb-3">
              <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
              Our Technology
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c]">
              Built to <em className="text-[#2d8a2d] not-italic">scale</em><br />
              with your community
            </h2>
            <p className="text-[#4a6a4a] text-base leading-relaxed max-w-lg mt-3">
              At the heart of Tastycart is a robust, scalable technology stack designed to handle the complexities
              of modern on-demand delivery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start mt-14">
            <div className="flex flex-col gap-3" data-reveal>
              {[
                { icon: "✨", title: "Seamless User Experience", body: "Sleek, modern design with an intuitive interface that makes navigation and checkout a breeze." },
                { icon: "📱", title: "Cross-Platform Access", body: "A consistent, optimized experience across all devices — from phone to tablet to desktop." },
                { icon: "🛠️", title: "Advanced Tech Stack", body: "Built with ReactJS and modern technologies, engineered for performance and scalability." },
                { icon: "🔮", title: "Innovative Features", body: "Constantly developing features that meet and exceed user expectations." },
              ].map((tech, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-[#d6ebd6] bg-[#f0faf0] hover:border-[#2d8a2d] hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] flex items-center justify-center text-2xl flex-shrink-0">
                    {tech.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#1c2e1c]">{tech.title}</div>
                    <div className="text-xs text-[#5a7a5a] leading-relaxed">{tech.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative rounded-2xl overflow-hidden h-[460px]" data-reveal-r>
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=80"
                alt="Technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,31,13,0.85)] to-transparent" />
              <div className="absolute bottom-7 left-7 right-7">
                <h4 className="fraunces font-black text-xl text-white mb-2">Technology that connects</h4>
                <p className="text-white/60 text-sm">Real-time tracking, secure payments, and instant communication — all in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team ─── */}
      <section className="py-24 bg-[#f0faf0]" id="team">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div data-reveal>
            <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#2d8a2d] mb-3">
              <span className="w-6 h-0.5 rounded bg-[#f28c00]" />
              Our People
            </div>
            <h2 className="fraunces font-black text-[clamp(28px,3.5vw,44px)] leading-[1.1] tracking-[-1px] text-[#1c2e1c]">
              The <em className="text-[#2d8a2d] not-italic">humans</em> behind<br />
              every delivery
            </h2>
            <p className="text-[#4a6a4a] text-base leading-relaxed max-w-md mt-3">
              A diverse group of problem-solvers united by a shared vision to revolutionize local commerce.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {TEAM.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#d6ebd6] overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all cursor-pointer"
                data-reveal
                onClick={() => setSelectedMember(member)}
              >
                <div className="h-[160px] relative overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div
                    className="absolute -bottom-8 left-6 w-[68px] h-[68px] rounded-full border-4 border-white flex items-center justify-center shadow-md"
                    style={{ background: member.avatarGrad }}
                  >
                    <span className="fraunces font-black text-xl text-white">{member.initials}</span>
                  </div>
                </div>
                <div className="pt-10 px-6 pb-6">
                  <div className="fraunces font-extrabold text-lg text-[#1c2e1c]">{member.name}</div>
                  <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#f28c00] mt-0.5 mb-3">
                    {member.role}
                  </div>
                  <div className="text-xs text-[#5a7a5a] leading-relaxed">{member.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team Member Modal ─── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none z-10"
              onClick={() => setSelectedMember(null)}
            >
              ×
            </button>
            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
              <img
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div
                className="absolute bottom-4 left-6 w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                style={{ background: selectedMember.avatarGrad }}
              >
                <span className="fraunces font-black text-2xl text-white">{selectedMember.initials}</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="fraunces font-black text-3xl text-[#1c2e1c]">{selectedMember.name}</h3>
              <div className="text-sm font-bold tracking-[0.12em] uppercase text-[#f28c00] mt-1 mb-4">
                {selectedMember.role}
              </div>
              <p className="text-[#4a6a4a] text-base leading-relaxed">
                {selectedMember.fullBio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <section className="py-24 text-center relative overflow-hidden bg-gradient-to-br from-[#0d1f0d] to-[#1a4a1a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial-circle from-[rgba(45,138,45,0.12)] to-transparent" />
        <div className="relative" data-reveal>
          <h2 className="fraunces font-black text-white text-[clamp(32px,5vw,58px)] leading-tight tracking-[-1.5px] mb-4">
            Hungry? Let's get you<br />
            <em className="text-[#f28c00] not-italic">sorted</em>.
          </h2>
          <p className="text-white/50 text-lg mb-9">Order from the best local restaurants in your area.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#1a5c1a] to-[#2d8a2d] text-white font-bold text-base px-10 py-4 rounded-full shadow-lg shadow-[#2d8a2d]/35 hover:-translate-y-0.5 transition"
          >
            🛵 Order Now
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0d1f0d] border-t border-white/5 px-6 md:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="fraunces font-black text-white text-lg">
          Tasty<span className="text-[#f28c00]">cart</span>
        </span>
        <div className="flex gap-5 text-sm">
          <a href="#" className="text-white/40 hover:text-white transition">Home</a>
          <a href="#mission" className="text-white/40 hover:text-white transition">Mission</a>
          <a href="#team" className="text-white/40 hover:text-white transition">Team</a>
        </div>
        <span className="text-white/30 text-sm text-center">
          © 2025 Tastycart. Building the future of local commerce.
        </span>
      </footer>
    </div>
  );
}