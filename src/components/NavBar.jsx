import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/tasty.jpg.jpeg";
import { ProfileAvatar } from "../components/home/ProfileAvatar";

export default function Navbar({
  profile,
  isLoggedIn,
  logout,
  // ── Cart (optional) ──
  showCart = false,
  cartSyncing = false,
  totalCartItems = 0,
  onCartClick = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    ["Home", "/"],
    ["About", "/about-us"],
    ["Join Us", "/join-us"],
    ["Contact", "/contact-us"],
  ];

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(20,42,20,0.96)] backdrop-blur-md border-b border-white/10 shadow-lg w-full">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 h-16 min-h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src={logo} alt="Tasty Cart Logo" className="h-10 w-auto rounded-[15%]" />
        </div>

        {/* Desktop Nav Links (centered) - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center mx-4">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-white/75 hover:text-white hover:bg-white/10 font-semibold text-xs lg:text-sm px-3 lg:px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right side: Cart + Avatar + Hamburger */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Cart Button (conditional) */}
          {showCart && (
            <button
              onClick={onCartClick}
              title={cartSyncing ? "Syncing…" : "View cart"}
              className="relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center bg-white/10 border border-white/15 rounded-full hover:bg-orange-500/25 transition-all duration-200 flex-shrink-0"
            >
              {cartSyncing ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              )}
              {totalCartItems > 0 && !cartSyncing && (
                <div className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-orange-500 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center border-2 border-[rgba(20,42,20,0.96)]">
                  {totalCartItems}
                </div>
              )}
            </button>
          )}

          {/* Profile Avatar */}
          <div className="flex-shrink-0">
            <ProfileAvatar
              profile={profile}
              isLoggedIn={isLoggedIn}
              onDashboard={() => navigate("/dashboard")}
              onLogout={logout}
              onLogin={() => navigate("/login", { state: { returnTo: location.pathname } })}
            />
          </div>

          {/* Hamburger (visible on mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-md hover:bg-white/10 transition flex-shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (only nav links) */}
      <div
        className={`
          w-full bg-[rgba(20,42,20,0.98)] backdrop-blur-md border-b border-white/10
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "max-h-screen py-3 opacity-100" : "max-h-0 py-0 opacity-0"}
        `}
      >
        <div className="flex flex-col gap-1 px-4">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-white/80 hover:text-white hover:bg-white/10 font-semibold text-sm px-4 py-2 rounded-full transition"
              onClick={handleLinkClick}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}