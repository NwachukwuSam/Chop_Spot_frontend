import { useState, useEffect } from "react";
import VendorRegister from "./VendorRegister";
import VendorDashboard from "./VendorDashboard";

/**
 * VendorApp
 * Drop this anywhere in your React app.
 * It reads `chopspot_vendor` from localStorage.
 * If found → show Dashboard. Otherwise → show Registration.
 * Pass `onExitToHome` prop to add a "Back to Home" button.
 */
export default function VendorApp({ onExitToHome }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chopspot_vendor");
      if (saved) setVendor(JSON.parse(saved));
    } catch (_) {}
    setLoading(false);
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(155deg,#ecf7ec,#cde8cd)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🍊</div>
        <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:"#2d8a2d" }}>Loading ChopSpot Vendor…</p>
      </div>
    </div>
  );

  if (vendor) {
    return (
      <VendorDashboard
        initialVendor={vendor}
        onLogout={onExitToHome}
      />
    );
  }

  return (
    <VendorRegister
      onSuccess={newVendor => setVendor(newVendor)}
    />
  );
}