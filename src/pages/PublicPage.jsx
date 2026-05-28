// CompanyPublicPage.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ── Reusable Components ──────────────────────────────────────────────
const SectionHeader = ({ badge, title, subtitle, center = true }) => (
  <div className={`${center ? "text-center" : "text-left"} mb-12`}>
    {badge && (
      <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-orange-600 uppercase bg-orange-100 rounded-full mb-4">
        {badge}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
      {title}
    </h2>
    {subtitle && (
      <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

const StatCard = ({ number, label, icon }) => (
  <div className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl mb-3">{icon}</div>
    <div className="text-3xl md:text-4xl font-black text-green-700 mb-1">{number}</div>
    <div className="text-slate-500 text-sm font-medium">{label}</div>
  </div>
);

const ComparisonRow = ({ feature, us, competitor1, competitor2 }) => (
  <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-100">
    <div className="font-semibold text-slate-800">{feature}</div>
    <div className="text-green-600 font-semibold">✅ {us}</div>
    <div className="text-red-500">❌ {competitor1}</div>
    <div className="text-red-500">❌ {competitor2}</div>
  </div>
);

const StepCard = ({ number, title, description, icon }) => (
  <div className="text-center p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-2xl shadow-lg">
      {icon}
    </div>
    <div className="text-orange-500 text-sm font-bold mb-2">Step {number}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm">{description}</p>
  </div>
);

const VendorBenefit = ({ icon, title, description }) => (
  <div className="flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
    <div className="text-2xl flex-shrink-0">{icon}</div>
    <div>
      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  </div>
);

const RiderBenefit = ({ icon, title, value }) => (
  <div className="text-center p-5 rounded-xl bg-white border border-slate-100">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-green-700 mb-1">{value}</div>
    <div className="text-slate-600 text-sm font-medium">{title}</div>
  </div>
);

const TrustCard = ({ icon, title, description }) => (
  <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const PressCard = ({ date, title, source, link }) => (
  <a href={link} className="block p-5 rounded-xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all">
    <div className="text-xs text-orange-600 font-semibold mb-2">{date}</div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <div className="text-sm text-slate-500">— {source}</div>
  </a>
);

const BlogCard = ({ image, category, title, excerpt, date, link }) => (
  <Link to={link} className="group rounded-xl overflow-hidden bg-white border border-slate-100 hover:shadow-lg transition-all">
    <div className="h-48 bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center text-4xl">
      {image || "🍔"}
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{category}</span>
        <span className="text-xs text-slate-400">•</span>
        <span className="text-xs text-slate-400">{date}</span>
      </div>
      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-green-700 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 text-sm line-clamp-2">{excerpt}</p>
    </div>
  </Link>
);

// ── Main Component ──────────────────────────────────────────────────
export default function CompanyPublicPage() {
  const [activeTab, setActiveTab] = useState("customers");
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stats data
  const stats = [
    { number: "200,000+", label: "Happy Customers", icon: "😋" },
    { number: "500+", label: "Restaurant Partners", icon: "🏪" },
    { number: "30 min", label: "Avg Delivery Time", icon: "⚡" },
    { number: "₦2B+", label: "Paid to Vendors", icon: "💰" },
  ];

  // Trust features
  const trustFeatures = [
    { icon: "🔒", title: "Bank-Grade Security", description: "256-bit SSL encryption & PCI-DSS compliance. We never store raw card data." },
    { icon: "🛡️", title: "Rider Background Checks", description: "Every rider undergoes verification, training, and regular performance reviews." },
    { icon: "💰", title: "Money-Back Guarantee", description: "Not satisfied? Get a full refund within 24 hours — no questions asked." },
    { icon: "🍽️", title: "Food Safety Standards", description: "All partner kitchens are inspected and certified for hygiene." },
    { icon: "📞", title: "24/7 Customer Support", description: "Reach us via call, chat, or WhatsApp. Real humans, not bots." },
    { icon: "⚖️", title: "Dispute Resolution", description: "Fair mediation for any issues between customers, vendors, and riders." },
  ];

  // Press mentions
  const pressMentions = [
    { date: "Jan 15, 2026", title: "TastyCart Raises $5M to Expand Across West Africa", source: "TechCrunch", link: "#" },
    { date: "Dec 10, 2025", title: "How TastyCart is Changing Food Delivery in Lagos", source: "Business Day", link: "#" },
    { date: "Nov 5, 2025", title: "TastyCart Named Best Food Tech Startup 2025", source: "Africa Tech Summit", link: "#" },
    { date: "Oct 20, 2025", title: "From 0 to 200,000 Users: The TastyCart Story", source: "The Guardian NG", link: "#" },
  ];

  // Blog posts
  const blogPosts = [
    { image: "🍛", category: "Food Guide", title: "Top 10 Jollof Spots in Lagos", excerpt: "We ranked the best jollof rice restaurants based on customer ratings and taste tests.", date: "Mar 1, 2026", link: "/blog/jollof-guide" },
    { image: "🏍️", category: "Company", title: "TastyCart Launches in Port Harcourt", excerpt: "Our biggest expansion yet — now serving the Garden City!", date: "Feb 15, 2026", link: "/blog/ph-launch" },
    { image: "👨‍🍳", category: "Vendor Spotlight", title: "Meet Chef Bisi: From Home Kitchen to 1000 Orders", excerpt: "How one home chef built a thriving business on TastyCart.", date: "Feb 5, 2026", link: "/blog/chef-spotlight" },
    { image: "📱", category: "Product", title: "New Feature: Schedule Orders in Advance", excerpt: "Plan your meals up to 7 days ahead with TastyCart Pro.", date: "Jan 28, 2026", link: "/blog/schedule-feature" },
  ];

  return (
    <div className="bg-slate-50">
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        navScrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100" : "bg-white border-b border-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-sm">🍔</div>
              <span className="font-black text-xl text-slate-800">TastyCart</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {["Why Us", "How It Works", "Vendors", "Riders", "Trust", "Press", "Blog"].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm font-semibold text-slate-600 hover:text-green-700 transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-green-700">Log in</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── SECTION 1: WHY TASTYCART? ── */}
      <section id="why-us" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Why Choose Us"
            title="We're fixing what's broken about food delivery"
            subtitle="Long waits, cold food, and hidden fees? Not on our watch."
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">How We Compare</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-4 gap-4 py-3 border-b-2 border-slate-200 font-bold text-slate-800">
                  <div>Feature</div>
                  <div className="text-green-700">TastyCart</div>
                  <div className="text-slate-500">Competitor A</div>
                  <div className="text-slate-500">Competitor B</div>
                </div>
                <ComparisonRow feature="Avg Delivery Time" us="25-35 min" competitor1="45-60 min" competitor2="40-55 min" />
                <ComparisonRow feature="Delivery Fee" us="₦500-900" competitor1="₦800-1500" competitor2="₦700-1200" />
                <ComparisonRow feature="Customer Support" us="24/7 Live Chat" competitor1="Email only" competitor2="9-5 Phone" />
                <ComparisonRow feature="Live Order Tracking" us="Real-time map" competitor1="SMS updates" competitor2="Basic status" />
                <ComparisonRow feature="Cash on Delivery" us="✅ Yes" competitor1="❌ No" competitor2="✅ Yes" />
                <ComparisonRow feature="Vendor Commission" us="15% flat" competitor1="22-30%" competitor2="18-25%" />
              </div>
            </div>
          </div>

          {/* Our Promise */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-green-50 to-orange-50 border border-green-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="text-xl font-bold text-slate-800">Our Promise to You</h3>
                <p className="text-slate-600 mt-1">Hot food, fair prices, and support that actually helps.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4">
                  <div className="text-2xl">✅</div>
                  <div className="text-xs font-semibold text-slate-600">30-min or discount</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl">💰</div>
                  <div className="text-xs font-semibold text-slate-600">Price match guarantee</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl">🔄</div>
                  <div className="text-xs font-semibold text-slate-600">Free re-delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Simple & Fast"
            title="From craving to doorstep in 5 minutes"
            subtitle="No complicated steps. Just great food, delivered fast."
          />
          <div className="grid md:grid-cols-5 gap-6">
            <StepCard number="1" title="Browse & Discover" description="Explore 500+ restaurants & thousands of dishes" icon="🔍" />
            <StepCard number="2" title="Customize Order" description="Add special instructions, spice level & extras" icon="📝" />
            <StepCard number="3" title="Pay Securely" description="Card, transfer, USSD, or cash on delivery" icon="💳" />
            <StepCard number="4" title="Track Live" description="Watch your rider on the map in real-time" icon="📍" />
            <StepCard number="5" title="Enjoy & Rate" description="Hot food arrives. Rate and earn points!" icon="😋" />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: FOR RESTAURANTS (VENDORS) ── */}
      <section id="vendors" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Partner With Us"
            title="Grow your restaurant business"
            subtitle="Join 500+ restaurants already thriving on TastyCart"
          />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Benefits */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Why partner with TastyCart?</h3>
              <div className="space-y-4">
                <VendorBenefit icon="📈" title="Increased Reach" description="Access 200,000+ hungry customers in your area" />
                <VendorBenefit icon="💰" title="Lowest Commission" description="Only 15% — keep more of what you earn" />
                <VendorBenefit icon="📊" title="Free Analytics Dashboard" description="Track sales, popular items, and customer insights" />
                <VendorBenefit icon="🚀" title="Marketing Support" description="Featured placement, social media promotion, and email campaigns" />
                <VendorBenefit icon="⚡" title="Fast Onboarding" description="Go live in 48 hours with our dedicated support team" />
                <VendorBenefit icon="💸" title="Weekly Payouts" description="Get paid every Friday, no hidden fees" />
              </div>
            </div>

            {/* Right - Commission & CTA */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white">
              <div className="text-center mb-6">
                <div className="text-4xl font-black mb-2">15%</div>
                <div className="text-lg opacity-90">flat commission</div>
                <div className="text-sm opacity-70 mt-1">No setup fee. No monthly subscription.</div>
              </div>
              <div className="border-t border-white/20 my-6 pt-6">
                <h4 className="font-bold mb-3">What you get:</h4>
                <ul className="space-y-2 text-sm">
                  <li>✓ Free tablet for order management</li>
                  <li>✓ Dedicated account manager</li>
                  <li>✓ Professional food photography (selected partners)</li>
                  <li>✓ Priority customer support</li>
                </ul>
              </div>
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors mt-4">
                Apply to Become a Vendor →
              </button>
              <p className="text-xs text-center opacity-70 mt-4">No commitment. Cancel anytime.</p>
            </div>
          </div>

          {/* Vendor Testimonial */}
          <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="text-5xl">👩🏾‍🍳</div>
              <div>
                <p className="text-slate-600 italic mb-3">"TastyCart doubled our orders in the first month. The low commission means we actually make profit!"</p>
                <div className="font-bold text-slate-800">— Mama Bose's Kitchen</div>
                <div className="text-sm text-slate-500">Vendor since 2024 • 2,300+ orders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: FOR RIDERS ── */}
      <section id="riders" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Join Our Fleet"
            title="Earn on your own schedule"
            subtitle="Flexible hours, competitive pay, and weekly bonuses"
          />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Benefits */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <RiderBenefit icon="💰" title="Weekly Earnings" value="₦50,000 - ₦120,000" />
                <RiderBenefit icon="🏍️" title="Keep 85%" value="of delivery fees" />
                <RiderBenefit icon="💵" title="100% of Tips" value="Keep everything" />
                <RiderBenefit icon="🎁" title="Weekly Bonuses" value="Up to ₦20,000" />
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 mb-2">Perks for Riders:</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>✓ Free branded rider gear (helmet, jacket, bag)</li>
                  <li>✓ Fuel allowance for top performers</li>
                  <li>✓ Free accident insurance coverage</li>
                  <li>✓ Priority order assignment for high-rated riders</li>
                  <li>✓ Weekly cash bonuses and referral rewards</li>
                </ul>
              </div>
            </div>

            {/* Right - Requirements & CTA */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Requirements</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Valid rider's license</li>
                <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Functional smartphone (Android/iOS)</li>
                <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Reliable motorcycle/okada with papers</li>
                <li className="flex items-center gap-3"><span className="text-green-600">✓</span> Good knowledge of your city</li>
                <li className="flex items-center gap-3"><span className="text-green-600">✓</span> 18+ years old</li>
              </ul>
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors">
                Start Riding with TastyCart →
              </button>
              <p className="text-xs text-center text-slate-400 mt-3">No upfront costs. Weekly payouts every Friday.</p>
            </div>
          </div>

          {/* Rider Testimonial */}
          <div className="mt-12 p-5 rounded-xl bg-white border border-slate-100">
            <p className="text-slate-600 italic mb-2">"I make ₦80,000-₦100,000 weekly. The tips are amazing, and the support team actually cares."</p>
            <div className="font-bold text-slate-800">— Ibrahim, Lagos rider</div>
            <div className="text-sm text-slate-400">900+ deliveries • 4.9⭐ rating</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: TRUST & SAFETY ── */}
      <section id="trust" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Trust & Safety"
            title="Your security is our priority"
            subtitle="We've built multiple layers of protection for everyone on our platform"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {trustFeatures.map((feature, i) => (
              <TrustCard key={i} {...feature} />
            ))}
          </div>

          {/* Safety Stats */}
          <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-8 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-black text-green-700">100%</div>
                <div className="text-sm text-slate-600">Vendors inspected</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-700">24/7</div>
                <div className="text-sm text-slate-600">Support available</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-700">256-bit</div>
                <div className="text-sm text-slate-600">Encryption</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-700">15 min</div>
                <div className="text-sm text-slate-600">Avg response time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: PRESS & MEDIA ── */}
      <section id="press" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="In the News"
            title="Press & Media"
            subtitle="What people are saying about TastyCart"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {pressMentions.map((item, i) => (
              <PressCard key={i} {...item} />
            ))}
          </div>

          {/* Media Kit */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-3xl mb-2">📸</div>
                <h3 className="text-xl font-bold text-slate-800">Media Kit</h3>
                <p className="text-slate-500 text-sm mt-1">Logos, brand assets, screenshots, and team photos</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Download Logos
                </button>
                <button className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                  Press Contact →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: BLOG / NEWSROOM ── */}
      <section id="blog" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="From Our Blog"
            title="Stories, guides & updates"
            subtitle="Food inspiration, company news, and vendor spotlights"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {blogPosts.map((post, i) => (
              <BlogCard key={i} {...post} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:gap-3 transition-all">
              View all articles <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-4xl mb-4">🍔</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to taste the difference?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Join thousands of happy customers who've discovered better food delivery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
              Create Free Account
            </Link>
            <Link to="/vendors" className="px-8 py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-lg transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm">🍔</div>
                <span className="font-black text-xl text-white">TastyCart</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">Nigeria's fastest-growing food delivery platform. Built in Lagos, for Africa.</p>
              <div className="flex gap-3">
                {["𝕏", "in", "📘", "📷"].map(s => (
                  <div key={s} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-700 transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#why-us" className="hover:text-white transition-colors">Why Us</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#press" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Partner With Us</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#vendors" className="hover:text-white transition-colors">Become a Vendor</a></li>
                <li><a href="#riders" className="hover:text-white transition-colors">Become a Rider</a></li>
                <li><a href="/affiliates" className="hover:text-white transition-colors">Affiliate Program</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            © 2026 TastyCart Nigeria Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}