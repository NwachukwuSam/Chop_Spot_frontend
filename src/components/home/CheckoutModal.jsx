
/**
 * CheckoutModal.jsx
 *
 * Checkout form with integrated live delivery map + 20% service charge.
 *
 * Pricing:
 *  subtotal      = items + package
 *  serviceCharge = subtotal × 20%
 *  orderTotal    = subtotal + deliveryFee + serviceCharge
 *
 * Field mapping (UI → DB):
 *  location   → deliveryLocation
 *  hostel     → hostel  (labelled "Landmark" in UI)
 *  room       → room    (labelled "House Number" in UI)
 */

// import { useState, useEffect, useRef } from "react";
// import { DeliveryMap } from "./DeliveryMap.jsx";
// import { useGeocoder } from "../../hooks/useGeocoder.js";
// import { AddressAutocomplete } from "../../utils/AddressAutocomplete.jsx";

// const SERVICE_CHARGE_RATE = 0.20; // 20%
// const FLAT_DELIVERY_FEE = 400;    // ₦400 flat delivery fee (adjust as needed)

// export const CheckoutModal = ({ totalAmount, profile, onClose, onPay, vendor }) => {
//   const { geocode } = useGeocoder();
//   const [customPinCoords, setCustomPinCoords] = useState(null);

//   // totalAmount coming in is the cart subtotal (items + package, no delivery fee yet)
//   // We strip the old flat delivery fee that may have been added upstream and recompute cleanly.
//   const subtotal =
//     totalAmount - FLAT_DELIVERY_FEE > 0
//       ? totalAmount - FLAT_DELIVERY_FEE
//       : totalAmount;

//   const [form, setForm] = useState({
//     fullName:
//       profile?.firstName && profile?.lastName
//         ? `${profile.firstName} ${profile.lastName}`
//         : profile?.fullName || "",
//     whatsapp: profile?.whatsapp || profile?.phoneNumber || "",
//     // FIX: also fall back to defaultDeliveryAddress to cover different profile field names
//     location: profile?.defaultDeliveryLocation || profile?.defaultDeliveryAddress || "",
//     hostel: profile?.hostel || "",
//     room: profile?.room || "",
//     saveDetails: false,
//     customPinCoords: null,
//   });

//   const [restaurantCoords, setRestaurantCoords] = useState(null);
//   const [deliveryCoords, setDeliveryCoords] = useState(null);
//   const labelCacheRef = useRef({});
//   const restaurantGeoRef = useRef(false);

//   const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const deliveryFee = FLAT_DELIVERY_FEE;
//   const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
//   const orderTotal = subtotal + deliveryFee + serviceCharge;

//   const isValid = form.fullName.trim() && form.whatsapp.trim();
//   const preFilled = Boolean(profile?.whatsapp || profile?.hostel);

//   // ── Geocode vendor address (once per open) ──────────────────────────────
//   useEffect(() => {
//     if (restaurantGeoRef.current) return;
//     restaurantGeoRef.current = true;

//     if (vendor?.latitude && vendor?.longitude) {
//       setRestaurantCoords({
//         lat: parseFloat(vendor.latitude),
//         lng: parseFloat(vendor.longitude),
//       });
//       return;
//     }
//     if (vendor?.lat && vendor?.lng) {
//       setRestaurantCoords({
//         lat: parseFloat(vendor.lat),
//         lng: parseFloat(vendor.lng),
//       });
//       return;
//     }

//     const address =
//       vendor?.address ||
//       vendor?.restaurantAddress ||
//       vendor?.businessAddress ||
//       vendor?.restaurantName ||
//       vendor?.name ||
//       null;

//     if (address) {
//       geocode(address).then((coords) => {
//         if (coords) setRestaurantCoords(coords);
//       });
//     }
//   }, [vendor, geocode]);

//   // ── Geocode delivery location (when user types / selects an address) ────
//   useEffect(() => {
//     const addressText = form.location;
//     if (!addressText || addressText.length < 3) return;

//     // Don't geocode if we already have coordinates for this exact address
//     if (labelCacheRef.current[addressText] !== undefined) {
//       setDeliveryCoords(labelCacheRef.current[addressText]);
//       return;
//     }

//     geocode(addressText).then((coords) => {
//       labelCacheRef.current[addressText] = coords;
//       setDeliveryCoords(coords);
//     });
//   }, [form.location, geocode]);

//   // ── Styles ────────────────────────────────────────────────────────────────
//   const iStyle = {
//     width: "100%",
//     padding: "14px 16px",
//     borderRadius: 14,
//     border: "1.5px solid #d8eed8",
//     background: "#f4f8f4",
//     fontSize: 15,
//     color: "#1a2e1a",
//     fontFamily: "'DM Sans',sans-serif",
//     outline: "none",
//     boxSizing: "border-box",
//     transition: "border-color 0.2s",
//   };
//   const lStyle = {
//     fontSize: 11,
//     fontWeight: 800,
//     letterSpacing: 1.4,
//     color: "#5a7a5a",
//     textTransform: "uppercase",
//     display: "block",
//     marginBottom: 7,
//   };

//   const customerCoords = form.customPinCoords || deliveryCoords;

//   // FIX: handle both object { label, coords } and plain string from AddressAutocomplete
//   const handleAddressSelect = (addressData) => {
//     const label = typeof addressData === "string" ? addressData : addressData.label;
//     const coords = typeof addressData === "string" ? null : (addressData.coords ?? null);

//     setForm((prev) => ({
//       ...prev,
//       location: label,
//       // Only overwrite customPinCoords if we actually received new coords
//       customPinCoords: coords ?? prev.customPinCoords,
//     }));

//     if (coords) setCustomPinCoords(coords);
//   };

//   // ── Submit order + optionally save delivery details to profile ───────────
//   const handleOrderSubmit = async () => {
//     if (!isValid) return;

//     // Resolve the final delivery address string
//     const deliveryLocation = form.location?.trim() || "";

//     // 1. Create the order (call parent's onPay)
//     await onPay({
//       ...form,
//       // FIX: ensure deliveryLocation is always populated from form.location
//       deliveryLocation,
//       subtotal,
//       deliveryFee,
//       serviceCharge,
//       orderTotal,
//       pinLat: customerCoords?.lat ?? null,
//       pinLng: customerCoords?.lng ?? null,
//     });

//     // 2. If user wants to save details, update their profile
//     if (form.saveDetails) {
//       try {
//         const response = await fetch("/api/users/profile", {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             // FIX: persist the delivery address so it pre-fills next time
//             defaultDeliveryLocation: deliveryLocation,
//             hostel: form.hostel,
//             room: form.room,
//             whatsapp: form.whatsapp,
//             fullName: form.fullName,
//           }),
//         });
//         if (!response.ok) throw new Error("Profile update failed");
//         console.log("Profile updated with new delivery details");
//       } catch (err) {
//         console.error("Failed to save delivery details:", err);
//         // Optionally show a toast notification to the user
//       }
//     }
//   };


//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 1200,
//         background: "rgba(0,0,0,0.55)",
//         backdropFilter: "blur(4px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 16,
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: 26,
//           width: "100%",
//           maxWidth: 490,
//           maxHeight: "92vh",
//           display: "flex",
//           flexDirection: "column",
//           boxShadow: "0 28px 90px rgba(0,0,0,0.22)",
//           animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           style={{
//             padding: "22px 24px 10px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             flexShrink: 0,
//           }}
//         >
//           <h2
//             style={{
//               fontFamily: "'Sora',sans-serif",
//               fontWeight: 800,
//               fontSize: 24,
//               margin: 0,
//               color: "#1a2e1a",
//             }}
//           >
//             Checkout
//           </h2>
//           <button
//             onClick={onClose}
//             style={{
//               background: "#f0f7f0",
//               border: "none",
//               borderRadius: "50%",
//               width: 36,
//               height: 36,
//               cursor: "pointer",
//               fontSize: 18,
//               color: "#555",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ overflowY: "auto", flex: 1, padding: "4px 24px 0" }}>
//           {/* Pre-fill notice */}
//           {preFilled && (
//             <div
//               style={{
//                 background: "#e8f5e0",
//                 border: "1.5px solid #b8ddb8",
//                 borderRadius: 12,
//                 padding: "10px 14px",
//                 marginBottom: 16,
//                 fontSize: 13,
//                 color: "#2d6a2d",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//               }}
//             >
//               ✅ Pre-filled from your saved profile — edit if needed
//             </div>
//           )}

//           {/* Full Name */}
//           <div style={{ marginBottom: 16 }}>
//             <label style={lStyle}>Full Name</label>
//             <input
//               value={form.fullName}
//               onChange={(e) => set("fullName", e.target.value)}
//               placeholder="Your full name"
//               style={iStyle}
//               onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
//               onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
//             />
//           </div>

//           {/* WhatsApp */}
//           <div style={{ marginBottom: 16 }}>
//             <label style={lStyle}>WhatsApp Number</label>
//             <input
//               value={form.whatsapp}
//               onChange={(e) => set("whatsapp", e.target.value)}
//               placeholder="+234..."
//               style={iStyle}
//               onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
//               onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
//             />
//           </div>

//           {/* Delivery Address (autocomplete) */}
//           <div style={{ marginBottom: 16 }}>
//             <label style={lStyle}>Delivery Address</label>
//             <AddressAutocomplete
//               placeholder="Start typing your street, building, or landmark"
//               onSelect={handleAddressSelect}
//               initialValue={form.location === "custom" ? "" : form.location}
//             />
//           </div>

//           {/* Map */}
//           <div style={{ marginBottom: 16 }}>
//             <DeliveryMap
//               mode="checkout"
//               restaurantCoords={restaurantCoords}
//               customerCoords={customPinCoords || deliveryCoords}
//               onPinMoved={(coords) => {
//                 setForm((prev) => ({ ...prev, customPinCoords: coords }));
//                 setCustomPinCoords(coords);
//               }}
//               height={220}
//             />
//             <p
//               style={{
//                 margin: "6px 0 0",
//                 fontSize: 11,
//                 color: "#8aaa8a",
//                 textAlign: "center",
//               }}
//             >
//               🟠 Restaurant · 🟢 Delivery location (drag to adjust)
//             </p>
//           </div>

//           {/* Landmark + House Number */}
//           <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
//             {[
//               ["Landmark", "hostel", "e.g. City college"],
//               ["House Number", "room", "e.g. Room 204"],
//             ].map(([label, key, ph]) => (
//               <div key={key} style={{ flex: 1 }}>
//                 <label style={lStyle}>{label}</label>
//                 <input
//                   value={form[key]}
//                   onChange={(e) => set(key, e.target.value)}
//                   placeholder={ph}
//                   style={iStyle}
//                   onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
//                   onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Save details toggle */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               marginBottom: 16,
//             }}
//           >
//             <div
//               onClick={() => set("saveDetails", !form.saveDetails)}
//               style={{
//                 width: 20,
//                 height: 20,
//                 borderRadius: 4,
//                 border: `2px solid ${
//                   form.saveDetails ? "#2d8a2d" : "#bcd5bc"
//                 }`,
//                 background: form.saveDetails ? "#2d8a2d" : "white",
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 transition: "all 0.18s",
//                 flexShrink: 0,
//               }}
//             >
//               {form.saveDetails && (
//                 <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
//                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
//                 </svg>
//               )}
//             </div>
//             <span style={{ fontSize: 14, color: "#5a7a5a" }}>
//               Update my delivery details for next time
//             </span>
//           </div>

//           {/* Price Breakdown */}
//           <div
//             style={{
//               background: "#f4f8f4",
//               borderRadius: 16,
//               padding: "14px 18px",
//               marginBottom: 4,
//               border: "1.5px solid #d8eed8",
//             }}
//           >
//             <p
//               style={{
//                 margin: "0 0 10px",
//                 fontFamily: "'Sora',sans-serif",
//                 fontWeight: 700,
//                 fontSize: 13,
//                 color: "#1a2e1a",
//               }}
//             >
//               Order Summary
//             </p>
//             {[
//               ["Subtotal", `₦${subtotal.toLocaleString()}`],
//               ["Delivery Fee", `₦${deliveryFee.toLocaleString()}`],
//               [
//                 `Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`,
//                 `₦${serviceCharge.toLocaleString()}`,
//               ],
//             ].map(([label, val]) => (
//               <div
//                 key={label}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginBottom: 6,
//                   fontSize: 13,
//                   color: "#5a7a5a",
//                 }}
//               >
//                 <span>{label}</span>
//                 <span style={{ fontWeight: 600, color: "#1a2e1a" }}>
//                   {val}
//                 </span>
//               </div>
//             ))}
//             <div
//               style={{
//                 borderTop: "1.5px solid #d8eed8",
//                 marginTop: 8,
//                 paddingTop: 8,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 fontSize: 15,
//                 fontWeight: 800,
//                 color: "#1a2e1a",
//               }}
//             >
//               <span>Total</span>
//               <span style={{ color: "#f97316" }}>
//                 ₦{orderTotal.toLocaleString()}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* CTA */}
//         <div
//           style={{
//             padding: "14px 24px 22px",
//             borderTop: "1.5px solid #f0f7f0",
//             flexShrink: 0,
//           }}
//         >
//           <button
//             onClick={isValid ? handleOrderSubmit : undefined}
//             style={{
//               width: "100%",
//               padding: "17px",
//               borderRadius: 50,
//               border: "none",
//               background: isValid
//                 ? "linear-gradient(135deg,#f97316,#fb923c)"
//                 : "#e0e8e0",
//               color: isValid ? "white" : "#aaa",
//               fontFamily: "'Sora',sans-serif",
//               fontWeight: 800,
//               fontSize: 16,
//               cursor: isValid ? "pointer" : "not-allowed",
//               boxShadow: isValid
//                 ? "0 4px 20px rgba(249,115,22,0.38)"
//                 : "none",
//               transition: "all 0.2s",
//             }}
//           >
//             Order Now · ₦{orderTotal.toLocaleString()}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

/**
 * CheckoutModal.jsx
 *
 * Checkout form with integrated live delivery map + 20% service charge.
 *
 * Pricing:
 *  subtotal      = items + package
 *  serviceCharge = subtotal × 20%
 *  orderTotal    = subtotal + deliveryFee + serviceCharge
 *
 * Field mapping (UI → DB):
 *  location   → deliveryLocation
 *  hostel     → hostel  (labelled "Landmark" in UI)
 *  room       → room    (labelled "House Number" in UI)
 */

import { useState, useEffect, useRef } from "react";
import { DeliveryMap } from "./DeliveryMap.jsx";
import { useGeocoder } from "../../hooks/useGeocoder.js";
import { AddressAutocomplete } from "../../utils/AddressAutocomplete.jsx";

const SERVICE_CHARGE_RATE = 0.20; // 20%
const FLAT_DELIVERY_FEE = 400;    // ₦400 flat delivery fee (adjust as needed)

export const CheckoutModal = ({ totalAmount, profile, onClose, onPay, vendor }) => {
  const { geocode } = useGeocoder();
  const [customPinCoords, setCustomPinCoords] = useState(null);

  // totalAmount coming in is the cart subtotal (items + package, no delivery fee yet)
  // We strip the old flat delivery fee that may have been added upstream and recompute cleanly.
  const subtotal =
    totalAmount - FLAT_DELIVERY_FEE > 0
      ? totalAmount - FLAT_DELIVERY_FEE
      : totalAmount;

  const [form, setForm] = useState({
    fullName:
      profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile?.fullName || "",
    whatsapp: profile?.whatsapp || profile?.phoneNumber || "",
    // Delivery address (autocomplete) → saved as hostel in DB
    hostel: profile?.defaultDeliveryLocation || profile?.defaultDeliveryAddress || profile?.hostel || "",
    // Landmark → saved as room in DB
    room: profile?.room || "",
    saveDetails: false,
    customPinCoords: null,
  });

  const [restaurantCoords, setRestaurantCoords] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const labelCacheRef = useRef({});
  const restaurantGeoRef = useRef(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const deliveryFee = FLAT_DELIVERY_FEE;
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const orderTotal = subtotal + deliveryFee + serviceCharge;

  const isValid = form.fullName.trim() && form.whatsapp.trim();
  const preFilled = Boolean(profile?.whatsapp || profile?.hostel);

  // ── Geocode vendor address (once per open) ──────────────────────────────
  useEffect(() => {
    if (restaurantGeoRef.current) return;
    restaurantGeoRef.current = true;

    if (vendor?.latitude && vendor?.longitude) {
      setRestaurantCoords({
        lat: parseFloat(vendor.latitude),
        lng: parseFloat(vendor.longitude),
      });
      return;
    }
    if (vendor?.lat && vendor?.lng) {
      setRestaurantCoords({
        lat: parseFloat(vendor.lat),
        lng: parseFloat(vendor.lng),
      });
      return;
    }

    const address =
      vendor?.address ||
      vendor?.restaurantAddress ||
      vendor?.businessAddress ||
      vendor?.restaurantName ||
      vendor?.name ||
      null;

    if (address) {
      geocode(address).then((coords) => {
        if (coords) setRestaurantCoords(coords);
      });
    }
  }, [vendor, geocode]);

  // ── Geocode delivery location (when user types / selects an address) ────
  useEffect(() => {
    const addressText = form.hostel;
    if (!addressText || addressText.length < 3) return;

    // Don't geocode if we already have coordinates for this exact address
    if (labelCacheRef.current[addressText] !== undefined) {
      setDeliveryCoords(labelCacheRef.current[addressText]);
      return;
    }

    geocode(addressText).then((coords) => {
      labelCacheRef.current[addressText] = coords;
      setDeliveryCoords(coords);
    });
  }, [form.hostel, geocode]);

  // ── Styles ────────────────────────────────────────────────────────────────
  const iStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1.5px solid #d8eed8",
    background: "#f4f8f4",
    fontSize: 15,
    color: "#1a2e1a",
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const lStyle = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: "#5a7a5a",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 7,
  };

  const customerCoords = form.customPinCoords || deliveryCoords;
  // deliveryLocation mirrors hostel for the backend field that was previously empty
  const deliveryLocation = form.hostel?.trim() || "";

  // Autocomplete result → written directly into hostel (which the backend saves reliably)
  const handleAddressSelect = (addressData) => {
    const label = typeof addressData === "string" ? addressData : addressData.label;
    const coords = typeof addressData === "string" ? null : (addressData.coords ?? null);

    setForm((prev) => ({
      ...prev,
      hostel: label,
      customPinCoords: coords ?? prev.customPinCoords,
    }));

    if (coords) setCustomPinCoords(coords);
  };

  // ── Submit order + optionally save delivery details to profile ───────────
  const handleOrderSubmit = async () => {
    if (!isValid) return;

    // 1. Create the order (call parent's onPay)
    // hostel = delivery address (autocomplete), room = landmark — both save reliably in DB
    await onPay({
      ...form,
      deliveryLocation,   // also populate the deliveryLocation field for completeness
      subtotal,
      deliveryFee,
      serviceCharge,
      orderTotal,
      pinLat: customerCoords?.lat ?? null,
      pinLng: customerCoords?.lng ?? null,
    });

    // 2. If user wants to save details, update their profile
    if (form.saveDetails) {
      try {
        const response = await fetch("/api/users/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            defaultDeliveryLocation: deliveryLocation, // pre-fills next checkout
            hostel: form.hostel,
            room: form.room,
            whatsapp: form.whatsapp,
            fullName: form.fullName,
          }),
        });
        if (!response.ok) throw new Error("Profile update failed");
        console.log("Profile updated with new delivery details");
      } catch (err) {
        console.error("Failed to save delivery details:", err);
        // Optionally show a toast notification to the user
      }
    }
  };


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 26,
          width: "100%",
          maxWidth: 490,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 28px 90px rgba(0,0,0,0.22)",
          animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 24px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 24,
              margin: 0,
              color: "#1a2e1a",
            }}
          >
            Checkout
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f0f7f0",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              color: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "4px 24px 0" }}>
          {/* Pre-fill notice */}
          {preFilled && (
            <div
              style={{
                background: "#e8f5e0",
                border: "1.5px solid #b8ddb8",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "#2d6a2d",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ✅ Pre-filled from your saved profile — edit if needed
            </div>
          )}

          {/* Full Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={lStyle}>Full Name</label>
            <input
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Your full name"
              style={iStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
              onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
            />
          </div>

          {/* WhatsApp */}
          <div style={{ marginBottom: 16 }}>
            <label style={lStyle}>WhatsApp Number</label>
            <input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+234..."
              style={iStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
              onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
            />
          </div>

          {/* Delivery Address (autocomplete) → saved as hostel in DB */}
          <div style={{ marginBottom: 16 }}>
            <label style={lStyle}>Delivery Address</label>
            <AddressAutocomplete
              placeholder="Start typing your street, building, or landmark"
              onSelect={handleAddressSelect}
              initialValue={form.hostel === "custom" ? "" : form.hostel}
            />
          </div>

          {/* Map */}
          <div style={{ marginBottom: 16 }}>
            <DeliveryMap
              mode="checkout"
              restaurantCoords={restaurantCoords}
              customerCoords={customPinCoords || deliveryCoords}
              onPinMoved={(coords) => {
                setForm((prev) => ({ ...prev, customPinCoords: coords }));
                setCustomPinCoords(coords);
              }}
              height={220}
            />
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                color: "#8aaa8a",
                textAlign: "center",
              }}
            >
              🟠 Restaurant · 🟢 Delivery location (drag to adjust)
            </p>
          </div>

          {/* Landmark → saved as room in DB */}
          <div style={{ marginBottom: 16 }}>
            <label style={lStyle}>Landmark</label>
            <input
              value={form.room}
              onChange={(e) => set("room", e.target.value)}
              placeholder="e.g. City college gate"
              style={iStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2d8a2d")}
              onBlur={(e) => (e.target.style.borderColor = "#d8eed8")}
            />
          </div>

          {/* Save details toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              onClick={() => set("saveDetails", !form.saveDetails)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: `2px solid ${
                  form.saveDetails ? "#2d8a2d" : "#bcd5bc"
                }`,
                background: form.saveDetails ? "#2d8a2d" : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.18s",
                flexShrink: 0,
              }}
            >
              {form.saveDetails && (
                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 14, color: "#5a7a5a" }}>
              Update my delivery details for next time
            </span>
          </div>

          {/* Price Breakdown */}
          <div
            style={{
              background: "#f4f8f4",
              borderRadius: 16,
              padding: "14px 18px",
              marginBottom: 4,
              border: "1.5px solid #d8eed8",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#1a2e1a",
              }}
            >
              Order Summary
            </p>
            {[
              ["Subtotal", `₦${subtotal.toLocaleString()}`],
              ["Delivery Fee", `₦${deliveryFee.toLocaleString()}`],
              [
                `Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`,
                `₦${serviceCharge.toLocaleString()}`,
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontSize: 13,
                  color: "#5a7a5a",
                }}
              >
                <span>{label}</span>
                <span style={{ fontWeight: 600, color: "#1a2e1a" }}>
                  {val}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1.5px solid #d8eed8",
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 800,
                color: "#1a2e1a",
              }}
            >
              <span>Total</span>
              <span style={{ color: "#f97316" }}>
                ₦{orderTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            padding: "14px 24px 22px",
            borderTop: "1.5px solid #f0f7f0",
            flexShrink: 0,
          }}
        >
          <button
            onClick={isValid ? handleOrderSubmit : undefined}
            style={{
              width: "100%",
              padding: "17px",
              borderRadius: 50,
              border: "none",
              background: isValid
                ? "linear-gradient(135deg,#f97316,#fb923c)"
                : "#e0e8e0",
              color: isValid ? "white" : "#aaa",
              fontFamily: "'Sora',sans-serif",
              fontWeight: 800,
              fontSize: 16,
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: isValid
                ? "0 4px 20px rgba(249,115,22,0.38)"
                : "none",
              transition: "all 0.2s",
            }}
          >
            Order Now · ₦{orderTotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};