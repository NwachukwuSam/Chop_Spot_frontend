import { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import logo from "../assets/tasty.jpg.jpeg";
import { useAuth } from "../auth/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";
import { useToast } from "../context/ToastContext";
import { ProfileAvatar } from "../components/home/ProfileAvatar";
import Navbar from "../components/NavBar";

// ─── Ticker ────────────────────────────────────────────────────────────────────
const Ticker = () => {
  const TICKER_ITEMS = [
    "🍛 Order in seconds",
    "🏍️ 30-min delivery",
    "🥗 500+ restaurants",
    "💳 Secure payments",
    "⭐ 4.8 rating",
    "🎉 Fast delivery on all orders",
  ];
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-[#f5920a] overflow-hidden h-9 flex items-center w-full">
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track { animation: tickerScroll 22s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track flex whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="text-white font-bold text-xs tracking-wide pr-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            • {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ContactUs() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { profile } = useUserProfile({ isLoggedIn });
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── EmailJS configuration (replace with your own) ──────────────────────
  const SERVICE_ID = "service_your_service_id";
  const TEMPLATE_ID = "template_your_template_id";
  const PUBLIC_KEY = "your_public_key";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      showToast("Message sent successfully! We'll get back to you soon.", "success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("EmailJS error:", error);
      showToast("Failed to send message. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-[#1c2e1c] overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }

        .contact-hero {
          background: linear-gradient(160deg, #0d1f0d 0%, #0f2e0f 45%, #1a4a1a 100%);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          nav { padding: 0 16px; }
          .nav-search { width: 140px !important; }
        }
      `}</style>

      <Ticker />

      {/* ─── Navbar ────────────────────────────────────────────────────────────── */}
     <Navbar profile={profile} isLoggedIn={isLoggedIn} logout={logout} />

      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="contact-hero min-h-[40vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#f28c00]/15 border border-[#f28c00]/30 text-[#f28c00] text-[11px] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f28c00]" />
            Get in Touch
          </div>
          <h1 className="fraunces font-black text-white leading-tight tracking-tight" style={{ fontSize: "clamp(36px,5vw,56px)" }}>
            We'd love to hear <br className="hidden sm:block" />
            <span className="text-[#f28c00]">from you</span>
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto mt-4">
            Have a question, suggestion, or partnership idea? Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ─── Contact Form + Info ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div>
            <h2 className="fraunces font-black text-3xl text-[#1c2e1c] mb-2">Send us a message</h2>
            <p className="text-[#5a7a5a] text-sm mb-6">We'll respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#d6ebd6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
                  placeholder="John Doe"
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
                  className="w-full border border-[#d6ebd6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#d6ebd6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5a7a5a] mb-1">Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#d6ebd6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8a2d] focus:border-transparent resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2d8a2d] hover:bg-[#1a5c1a] disabled:bg-[#a0c0a0] text-white font-bold py-3.5 rounded-full transition shadow-lg shadow-[#2d8a2d]/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="fraunces font-black text-2xl text-[#1c2e1c] mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] text-lg flex-shrink-0">📧</div>
                  <div>
                    <p className="text-sm font-bold text-[#1c2e1c]">Email</p>
                    <a href="mailto:hello@tastycart.com" className="text-[#2d8a2d] hover:underline text-sm">hello@tastycart.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] text-lg flex-shrink-0">📞</div>
                  <div>
                    <p className="text-sm font-bold text-[#1c2e1c]">Phone</p>
                    <a href="tel:+2348012345678" className="text-[#2d8a2d] hover:underline text-sm">+234 801 234 5678</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] text-lg flex-shrink-0">📍</div>
                  <div>
                    <p className="text-sm font-bold text-[#1c2e1c]">Address</p>
                    <p className="text-[#5a7a5a] text-sm">City College, Abuja-Nasarawa Corridor</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f0faf0] rounded-2xl p-6 border border-[#d6ebd6]">
              <h4 className="fraunces font-black text-lg text-[#1c2e1c] mb-2">Office Hours</h4>
              <ul className="text-[#4a6a4a] text-sm space-y-1">
                <li><span className="font-semibold">Mon – Fri:</span> 8:00 AM – 8:00 PM</li>
                <li><span className="font-semibold">Sat:</span> 9:00 AM – 6:00 PM</li>
                <li><span className="font-semibold">Sun:</span> Closed</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] hover:bg-[#2d8a2d] hover:text-white transition text-lg">📘</a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] hover:bg-[#2d8a2d] hover:text-white transition text-lg">🐦</a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#f0faf0] flex items-center justify-center text-[#2d8a2d] hover:bg-[#2d8a2d] hover:text-white transition text-lg">📸</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1f0d] border-t border-white/5 px-6 md:px-10 py-7 flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="fraunces font-black text-white text-lg">
          Tasty<span className="text-[#f28c00]">cart</span>
        </span>
        <span className="text-white/30 text-sm text-center">© 2025 Tastycart. Building the future of local commerce.</span>
      </footer>
    </div>
  );
}