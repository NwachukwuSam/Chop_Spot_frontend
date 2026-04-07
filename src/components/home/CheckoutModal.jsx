/**
 * CheckoutModal.jsx
 *
 * Checkout form with an integrated live delivery map.
 *
 * Map behaviour:
 *  • On open: geocodes the vendor's address (restaurant pin) and the
 *    initially selected delivery location label (customer pin).
 *  • When the user changes delivery location: geocodes the new label.
 *  • User can drag the green pin to fine-tune their exact spot.
 *  • All geocoding goes through useGeocoder → Nominatim (free, no key).
 *  • Set VITE_CAMPUS_HINT in .env to anchor ambiguous labels like
 *    "Hall 1" to your campus.  e.g.:
 *      VITE_CAMPUS_HINT=Babcock University, Ilishan-Remo, Ogun State
 *
 * Nothing is hardcoded — coordinates are always resolved from text.
 * If the backend later stores lat/lng on restaurant records, those
 * are used directly and geocoding is skipped.
 */

import { useState, useEffect, useRef } from "react";
import {DeliveryMap} from "./DeliveryMap.jsx";
import {useGeocoder} from "../../hooks/useGeocoder.js";

const DELIVERY_FEE = 350;

const DELIVERY_LOCATIONS = [
    { label: "Porter's Lodge (₦300)", value: "porters", fee: 300 },
    { label: "Hall 1 (₦350)",         value: "hall1",   fee: 350 },
    { label: "Hall 2 (₦350)",         value: "hall2",   fee: 350 },
    { label: "Main Gate (₦400)",      value: "maingate",fee: 400 },
    { label: "Faculty Area (₦450)",   value: "faculty", fee: 450 },
];

export const CheckoutModal = ({ totalAmount, profile, onClose, onPay, vendor }) => {
    const { geocode } = useGeocoder();

    const [form, setForm] = useState({
        fullName: profile?.firstName && profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : (profile?.fullName || ""),
        whatsapp:        profile?.whatsapp || profile?.phoneNumber || "",
        location:        profile?.defaultDeliveryLocation || DELIVERY_LOCATIONS[0].value,
        hostel:          profile?.hostel || "",
        room:            profile?.room   || "",
        saveDetails:     false,
        customPinCoords: null, // set when user drags the map pin
    });

    // Geocoded coords — resolved from text, never hardcoded
    const [restaurantCoords, setRestaurantCoords] = useState(null);
    const [deliveryCoords,   setDeliveryCoords]   = useState(null);

    // Per-session label → coords cache so we don't re-geocode the same label
    const labelCacheRef      = useRef({});
    const restaurantGeoRef   = useRef(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const selectedLoc = DELIVERY_LOCATIONS.find(l => l.value === form.location);
    const orderTotal  = totalAmount - DELIVERY_FEE + (selectedLoc?.fee || DELIVERY_FEE);
    const isValid     = form.fullName.trim() && form.whatsapp.trim();
    const preFilled   = Boolean(profile?.whatsapp || profile?.hostel);

    // ── Geocode vendor / restaurant address (once per open) ──────────────────
    useEffect(() => {
        if (restaurantGeoRef.current) return;
        restaurantGeoRef.current = true;

        // Prefer stored lat/lng on the vendor object (fastest path)
        if (vendor?.latitude && vendor?.longitude) {
            setRestaurantCoords({ lat: parseFloat(vendor.latitude), lng: parseFloat(vendor.longitude) });
            return;
        }
        if (vendor?.lat && vendor?.lng) {
            setRestaurantCoords({ lat: parseFloat(vendor.lat), lng: parseFloat(vendor.lng) });
            return;
        }

        // Fallback: geocode from text address
        const address = vendor?.address
            || vendor?.restaurantAddress
            || vendor?.businessAddress
            || vendor?.restaurantName
            || vendor?.name
            || null;

        if (address) {
            geocode(address).then(coords => {
                if (coords) setRestaurantCoords(coords);
            });
        }
    }, [vendor, geocode]);

    // ── Geocode delivery location label whenever selection changes ────────────
    useEffect(() => {
        const label = selectedLoc?.label;
        if (!label) return;

        // Reset custom pin when location changes
        set("customPinCoords", null);

        // Already geocoded this label this session
        if (labelCacheRef.current[label] !== undefined) {
            setDeliveryCoords(labelCacheRef.current[label]);
            return;
        }

        geocode(label).then(coords => {
            labelCacheRef.current[label] = coords; // cache for this session
            setDeliveryCoords(coords);
        });
    }, [form.location, geocode]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Styles ────────────────────────────────────────────────────────────────
    const iStyle = {
        width: "100%", padding: "14px 16px", borderRadius: 14,
        border: "1.5px solid #d8eed8", background: "#f4f8f4",
        fontSize: 15, color: "#1a2e1a", fontFamily: "'DM Sans',sans-serif",
        outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
    };
    const lStyle = {
        fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: "#5a7a5a",
        textTransform: "uppercase", display: "block", marginBottom: 7,
    };

    // Effective customer pin: custom-dragged position takes priority
    const customerCoords = form.customPinCoords || deliveryCoords;

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={onClose}
        >
            <div
                style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 490, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 28px 90px rgba(0,0,0,0.22)", animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: "22px 24px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, margin: 0, color: "#1a2e1a" }}>Checkout</h2>
                    <button onClick={onClose} style={{ background: "#f0f7f0", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>

                <div style={{ overflowY: "auto", flex: 1, padding: "4px 24px 0" }}>

                    {/* Pre-fill notice */}
                    {preFilled && (
                        <div style={{ background: "#e8f5e0", border: "1.5px solid #b8ddb8", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#2d6a2d", display: "flex", alignItems: "center", gap: 8 }}>
                            ✅ Pre-filled from your saved profile — edit if needed
                        </div>
                    )}

                    {/* Full Name */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={lStyle}>Full Name</label>
                        <input
                            value={form.fullName}
                            onChange={e => set("fullName", e.target.value)}
                            placeholder="Your full name"
                            style={iStyle}
                            onFocus={e => e.target.style.borderColor = "#2d8a2d"}
                            onBlur={e => e.target.style.borderColor = "#d8eed8"}
                        />
                    </div>

                    {/* WhatsApp */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={lStyle}>WhatsApp Number</label>
                        <input
                            value={form.whatsapp}
                            onChange={e => set("whatsapp", e.target.value)}
                            placeholder="+234..."
                            style={iStyle}
                            onFocus={e => e.target.style.borderColor = "#2d8a2d"}
                            onBlur={e => e.target.style.borderColor = "#d8eed8"}
                        />
                    </div>

                    {/* Delivery Location */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={lStyle}>Delivery Location</label>
                        <select
                            value={form.location}
                            onChange={e => set("location", e.target.value)}
                            style={{ ...iStyle, appearance: "none" }}
                        >
                            {DELIVERY_LOCATIONS.map(l => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Map */}
                    <div style={{ marginBottom: 16 }}>
                        <DeliveryMap
                            mode="checkout"
                            restaurantCoords={restaurantCoords}
                            restaurantName={
                                vendor?.restaurantName || vendor?.businessName || vendor?.name || "Restaurant"
                            }
                            customerCoords={customerCoords}
                            onPinMoved={coords => set("customPinCoords", coords)}
                            height={220}
                            borderRadius="14px"
                        />
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#8aaa8a", textAlign: "center" }}>
                            🟠 Restaurant · 🟢 Delivery location (drag to adjust)
                        </p>
                    </div>

                    {/* Hostel + Room */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        {[
                            ["HOSTEL / BUILDING", "hostel", "e.g. Block C"],
                            ["ROOM / FLAT",       "room",   "e.g. Room 204"],
                        ].map(([label, key, ph]) => (
                            <div key={key} style={{ flex: 1 }}>
                                <label style={lStyle}>{label}</label>
                                <input
                                    value={form[key]}
                                    onChange={e => set(key, e.target.value)}
                                    placeholder={ph}
                                    style={iStyle}
                                    onFocus={e => e.target.style.borderColor = "#2d8a2d"}
                                    onBlur={e => e.target.style.borderColor = "#d8eed8"}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Save details toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <div
                            onClick={() => set("saveDetails", !form.saveDetails)}
                            style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${form.saveDetails ? "#2d8a2d" : "#bcd5bc"}`, background: form.saveDetails ? "#2d8a2d" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", flexShrink: 0 }}
                        >
                            {form.saveDetails && (
                                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: 14, color: "#5a7a5a" }}>Update my delivery details for next time</span>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ padding: "14px 24px 22px", borderTop: "1.5px solid #f0f7f0", flexShrink: 0 }}>
                    <button
                        onClick={isValid ? () => onPay({
                            ...form,
                            location:   selectedLoc,
                            orderTotal,
                            // Pass resolved pin coords so the backend can store them
                            pinLat: customerCoords?.lat ?? null,
                            pinLng: customerCoords?.lng ?? null,
                        }) : undefined}
                        style={{ width: "100%", padding: "17px", borderRadius: 50, border: "none", background: isValid ? "linear-gradient(135deg,#f97316,#fb923c)" : "#e0e8e0", color: isValid ? "white" : "#aaa", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, cursor: isValid ? "pointer" : "not-allowed", boxShadow: isValid ? "0 4px 20px rgba(249,115,22,0.38)" : "none", transition: "all 0.2s" }}
                    >
                        Order Now · ₦{orderTotal.toLocaleString()}
                    </button>
                </div>
            </div>
        </div>
    );
};