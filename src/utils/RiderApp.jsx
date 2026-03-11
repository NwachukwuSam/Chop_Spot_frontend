import { useState, useEffect } from "react";
import RiderRegister from "./RiderRegister";
import RiderDashboard from "./RiderDashboard";

/**
 * RiderApp — drop into your React app wherever needed.
 * Reads `chopspot_rider` from localStorage.
 * If found → Dashboard. Otherwise → Registration.
 * Pass `onExitToHome` to wire a back button.
 */
export default function RiderApp({ onExitToHome }) {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chopspot_rider");
      if (saved) setRider(JSON.parse(saved));
    } catch (_) {}
    setLoading(false);
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 8px 28px rgba(45,138,45,0.3)" }}>🏍️</div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: "#2d8a2d", fontSize: 16 }}>
        Loading ChopSpot Rider…
      </p>
    </div>
  );

  if (rider) {
    return (
      <RiderDashboard
        initialRider={rider}
        onLogout={onExitToHome}
      />
    );
  }

  return (
    <RiderRegister
      onSuccess={newRider => setRider(newRider)}
    />
  );
}