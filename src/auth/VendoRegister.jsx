// // VendorRegister.jsx
// import { useState } from "react";
// import * as API from "../utils/Api";

// // ─── Constants ───────────────────────────────────────────────────────────────
// const CATEGORIES = [
//     "Nigerian", "Continental", "Fast Food", "Grills & BBQ",
//     "Street Food", "Soups & Swallow", "Pastries & Drinks",
//     "Healthy Bowls", "Seafood", "Snacks & Sides",
// ];

// const PRESET_PACKAGES = [
//     { id: "plastic",    name: "Plastic Container",   price: 200 },
//     { id: "disposable", name: "Disposable Takeaway",  price: 100 },
//     { id: "nylon",      name: "Just Nylon",           price: 0   },
//     { id: "foil",       name: "Foil Wrap",            price: 50  },
//     { id: "styrofoam",  name: "Styrofoam Pack",       price: 150 },
//     { id: "luxury",     name: "Luxury Box",           price: 500 },
//     { id: "eco",        name: "Eco Compostable Box",  price: 300 },
// ];

// const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const STEPS = [
//     { id: 0, label: "Business",  icon: "🏪" },
//     { id: 1, label: "Location",  icon: "📍" },
//     { id: 2, label: "Packaging", icon: "📦" },
//     { id: 3, label: "Menu",      icon: "🍽️" },
//     { id: 4, label: "Review",    icon: "✅" },
// ];

// // ─── Shared styles ────────────────────────────────────────────────────────────
// const inp = (extra = {}) => ({
//     width: "100%", padding: "13px 16px", borderRadius: 14,
//     border: "1.5px solid #e2ebe2", background: "#f7fbf7",
//     fontSize: 14, color: "#1a2e1a", fontFamily: "'Plus Jakarta Sans', sans-serif",
//     outline: "none", boxSizing: "border-box", transition: "all 0.2s",
//     ...extra,
// });

// const lbl = {
//     fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: "#6a8a6a",
//     textTransform: "uppercase", display: "block", marginBottom: 6,
// };

// const focus = e => {
//     e.target.style.borderColor = "#2d8a2d";
//     e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)";
//     e.target.style.background = "#fff";
// };

// const blur = e => {
//     e.target.style.borderColor = "#e2ebe2";
//     e.target.style.boxShadow = "none";
//     e.target.style.background = "#f7fbf7";
// };

// // ─── Small shared components ──────────────────────────────────────────────────
// const Header = ({ emoji, title, sub }) => (
//     <div style={{ textAlign: "center", marginBottom: 4 }}>
//         <div style={{ fontSize: 46, marginBottom: 10 }}>{emoji}</div>
//         <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1a2e1a", margin: "0 0 5px" }}>{title}</h2>
//         <p style={{ color: "#7a9a7a", fontSize: 14, margin: 0 }}>{sub}</p>
//     </div>
// );

// const Field = ({ label, children, style }) => (
//     <div style={{ ...style }}>
//         <label style={lbl}>{label}</label>
//         {children}
//     </div>
// );

// const Chip = ({ label, active, onClick }) => (
//     <div onClick={onClick} style={{
//         padding: "7px 15px", borderRadius: 50, cursor: "pointer", fontSize: 13, fontWeight: 600,
//         background: active ? "#2d8a2d" : "#f0f7f0",
//         color: active ? "white" : "#3a6a3a",
//         border: `1.5px solid ${active ? "#2d8a2d" : "#d0e8d0"}`,
//         transition: "all 0.18s",
//     }}>{label}</div>
// );

// const Radio = ({ on }) => (
//     <div style={{
//         width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
//         border: `2px solid ${on ? "#2d8a2d" : "#c0d5c0"}`,
//         background: on ? "#2d8a2d" : "transparent",
//         display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s",
//     }}>
//         {on && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
//     </div>
// );

// // ─── Step 1: Business Info ────────────────────────────────────────────────────
// const Step1 = ({ data, set }) => (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//         <Header emoji="🏪" title="Tell us about your business" sub="This is what hungry customers will see on ChopSpot" />

//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
//             <label style={lbl}>Restaurant Photo / Logo</label>
//             <div
//                 onClick={() => document.getElementById("logo-inp").click()}
//                 style={{
//                     width: 110, height: 110, borderRadius: 24, overflow: "hidden",
//                     background: data.logoPreview ? "transparent" : "#edf7ed",
//                     border: "2.5px dashed #8ac88a", cursor: "pointer",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     transition: "border-color 0.2s",
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.borderColor = "#2d8a2d"}
//                 onMouseLeave={e => e.currentTarget.style.borderColor = "#8ac88a"}
//             >
//                 {data.logoPreview
//                     ? <img src={data.logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
//                     : <div style={{ textAlign: "center" }}>
//                         <div style={{ fontSize: 32 }}>📸</div>
//                         <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7aaa7a", fontWeight: 600 }}>Upload</p>
//                     </div>
//                 }
//             </div>
//             <input id="logo-inp" type="file" accept="image/*" style={{ display: "none" }}
//                    onChange={e => { const f = e.target.files[0]; if (f) set("logoPreview", URL.createObjectURL(f)); }}
//             />
//             <span style={{ fontSize: 11, color: "#9ab59a" }}>JPG · PNG · up to 5 MB</span>
//         </div>

//         <Field label="Restaurant / Business Name *">
//             <input value={data.name || ""} onChange={e => set("name", e.target.value)}
//                    placeholder="e.g. Mama Titi's Kitchen" style={inp()} onFocus={focus} onBlur={blur} />
//         </Field>

//         <Field label="Category *">
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//                 {CATEGORIES.map(c => (
//                     <Chip key={c} label={c} active={data.category === c} onClick={() => set("category", c)} />
//                 ))}
//             </div>
//         </Field>

//         <Field label="Short Description">
//       <textarea value={data.description || ""} onChange={e => set("description", e.target.value)}
//                 placeholder="Tell customers what makes your food special…" rows={3}
//                 style={{ ...inp(), resize: "none", lineHeight: 1.65 }} onFocus={focus} onBlur={blur}
//       />
//         </Field>

//         <div style={{ display: "flex", gap: 12 }}>
//             <Field label="WhatsApp / Phone *" style={{ flex: 1 }}>
//                 <input value={data.phone || ""} onChange={e => set("phone", e.target.value)}
//                        placeholder="+234…" style={inp()} onFocus={focus} onBlur={blur} />
//             </Field>
//             <Field label="Email (optional)" style={{ flex: 1 }}>
//                 <input value={data.email || ""} onChange={e => set("email", e.target.value)}
//                        placeholder="you@example.com" style={inp()} onFocus={focus} onBlur={blur} />
//             </Field>
//         </div>
//     </div>
// );

// // ─── Step 2: Location & Hours ─────────────────────────────────────────────────
// const Step2 = ({ data, set }) => {
//     const toggleDay = d => {
//         const cur = data.openDays || [];
//         set("openDays", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
//     };
//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             <Header emoji="📍" title="Where are you located?" sub="Help customers find you easily" />

//             <Field label="Full Address *">
//                 <input value={data.address || ""} onChange={e => set("address", e.target.value)}
//                        placeholder="e.g. Block C, Faculty Canteen Area" style={inp()} onFocus={focus} onBlur={blur} />
//             </Field>
//             <Field label="Landmark / More Details">
//                 <input value={data.landmark || ""} onChange={e => set("landmark", e.target.value)}
//                        placeholder="e.g. Opposite the library, beside ATM" style={inp()} onFocus={focus} onBlur={blur} />
//             </Field>

//             <Field label="Open Days *">
//                 <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                     {DAYS.map(d => (
//                         <div key={d} onClick={() => toggleDay(d)} style={{
//                             width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center",
//                             justifyContent: "center", cursor: "pointer", fontSize: 12, fontWeight: 700,
//                             background: (data.openDays || []).includes(d) ? "#2d8a2d" : "#f0f7f0",
//                             color: (data.openDays || []).includes(d) ? "white" : "#4a7a4a",
//                             border: `1.5px solid ${(data.openDays || []).includes(d) ? "#2d8a2d" : "#d0e8d0"}`,
//                             transition: "all 0.18s",
//                         }}>{d}</div>
//                     ))}
//                 </div>
//             </Field>

//             <div style={{ display: "flex", gap: 12 }}>
//                 <Field label="Opening Time *" style={{ flex: 1 }}>
//                     <input type="time" value={data.openTime || "08:00"} onChange={e => set("openTime", e.target.value)}
//                            style={inp()} onFocus={focus} onBlur={blur} />
//                 </Field>
//                 <Field label="Closing Time *" style={{ flex: 1 }}>
//                     <input type="time" value={data.closeTime || "20:00"} onChange={e => set("closeTime", e.target.value)}
//                            style={inp()} onFocus={focus} onBlur={blur} />
//                 </Field>
//             </div>

//             <Field label="Minimum Delivery Price (₦) *">
//                 <input type="number" value={data.deliveryFrom || ""} onChange={e => set("deliveryFrom", e.target.value)}
//                        placeholder="e.g. 300" style={inp()} onFocus={focus} onBlur={blur} />
//             </Field>
//         </div>
//     );
// };

// // ─── Step 3: Packaging ────────────────────────────────────────────────────────
// const Step3 = ({ data, set }) => {
//     const [custom, setCustom] = useState({ name: "", price: "" });

//     const toggle = pkg => {
//         const cur = data.packages || [];
//         set("packages", cur.find(p => p.id === pkg.id) ? cur.filter(p => p.id !== pkg.id) : [...cur, pkg]);
//     };

//     const addCustom = () => {
//         if (!custom.name.trim()) return;
//         const p = { id: `custom-${Date.now()}`, name: custom.name, price: Number(custom.price) || 0 };
//         set("packages", [...(data.packages || []), p]);
//         setCustom({ name: "", price: "" });
//     };

//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             <Header emoji="📦" title="Packaging Options" sub="Choose every pack type you offer customers" />

//             <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
//                 {PRESET_PACKAGES.map(pkg => {
//                     const on = (data.packages || []).find(p => p.id === pkg.id);
//                     return (
//                         <div key={pkg.id} onClick={() => toggle(pkg)} style={{
//                             display: "flex", alignItems: "center", justifyContent: "space-between",
//                             padding: "14px 18px", borderRadius: 15, cursor: "pointer",
//                             background: on ? "#eaf6ea" : "#f7fbf7",
//                             border: `2px solid ${on ? "#2d8a2d" : "#e2ebe2"}`,
//                             transition: "all 0.18s",
//                         }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                                 <Radio on={!!on} />
//                                 <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{pkg.name}</span>
//                             </div>
//                             <span style={{ fontWeight: 700, color: "#f97316", fontSize: 14 }}>
//                 {pkg.price === 0 ? "Free" : `₦${pkg.price}`}
//               </span>
//                         </div>
//                     );
//                 })}
//             </div>

//             <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px dashed #b8d8b8" }}>
//                 <p style={{ ...lbl, marginBottom: 10 }}>➕ Add Custom Package</p>
//                 <div style={{ display: "flex", gap: 8 }}>
//                     <input value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))}
//                            placeholder="Package name" style={{ ...inp(), flex: 2, padding: "11px 13px" }}
//                            onFocus={focus} onBlur={blur}
//                     />
//                     <input type="number" value={custom.price} onChange={e => setCustom(p => ({ ...p, price: e.target.value }))}
//                            placeholder="₦ price" style={{ ...inp(), flex: 1, padding: "11px 13px" }}
//                            onFocus={focus} onBlur={blur}
//                     />
//                     <button onClick={addCustom} style={{
//                         padding: "0 18px", borderRadius: 12, border: "none",
//                         background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white",
//                         fontWeight: 800, fontSize: 20, cursor: "pointer", flexShrink: 0,
//                     }}>+</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─── Step 4: Menu ─────────────────────────────────────────────────────────────
// const Step4 = ({ data, set }) => {
//     const [catName, setCatName] = useState("");
//     const [pendingItem, setPending] = useState({ catId: null, name: "", price: "" });

//     const addCat = () => {
//         if (!catName.trim()) return;
//         set("menuCategories", [...(data.menuCategories || []), { id: `cat-${Date.now()}`, name: catName, items: [] }]);
//         setCatName("");
//     };

//     const addItem = catId => {
//         if (!pendingItem.name.trim() || !pendingItem.price) return;
//         const item = { id: `item-${Date.now()}`, name: pendingItem.name, price: Number(pendingItem.price), available: true };
//         set("menuCategories", (data.menuCategories || []).map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c));
//         setPending({ catId: null, name: "", price: "" });
//     };

//     const removeItem = (catId, itemId) =>
//         set("menuCategories", (data.menuCategories || []).map(c =>
//             c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
//         ));

//     const removeCat = id =>
//         set("menuCategories", (data.menuCategories || []).filter(c => c.id !== id));

//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//             <Header emoji="🍽️" title="Build Your Menu" sub="Add categories then load each one with food items" />

//             <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px solid #e2ebe2" }}>
//                 <p style={{ ...lbl, marginBottom: 10 }}>New Category</p>
//                 <div style={{ display: "flex", gap: 8 }}>
//                     <input value={catName} onChange={e => setCatName(e.target.value)}
//                            placeholder="e.g. Main Dishes, Proteins, Extras…"
//                            style={{ ...inp(), flex: 1, padding: "11px 13px" }}
//                            onFocus={focus} onBlur={blur}
//                            onKeyDown={e => e.key === "Enter" && addCat()}
//                     />
//                     <button onClick={addCat} style={{
//                         padding: "0 20px", borderRadius: 12, border: "none",
//                         background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white",
//                         fontWeight: 800, fontSize: 18, cursor: "pointer", flexShrink: 0,
//                     }}>+</button>
//                 </div>
//             </div>

//             {!(data.menuCategories || []).length && (
//                 <div style={{ textAlign: "center", padding: "28px 0", color: "#aac5aa" }}>
//                     <p style={{ fontSize: 36 }}>📋</p>
//                     <p style={{ fontWeight: 700, fontSize: 14, marginTop: 10 }}>No categories yet</p>
//                     <p style={{ fontSize: 13 }}>Add a category above to start loading your menu</p>
//                 </div>
//             )}

//             {(data.menuCategories || []).map(cat => (
//                 <div key={cat.id} style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2ebe2", overflow: "hidden" }}>
//                     <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <span style={{ fontWeight: 800, fontSize: 12, color: "#1a6a1a", letterSpacing: 1, textTransform: "uppercase" }}>
//               🍽 {cat.name}
//                 <span style={{ marginLeft: 8, fontWeight: 400, color: "#5a8a5a", fontSize: 11, textTransform: "none" }}>
//                 ({cat.items.length} items)
//               </span>
//             </span>
//                         <button onClick={() => removeCat(cat.id)} style={{ background: "rgba(200,50,50,0.1)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#c0392b", fontWeight: 700, fontSize: 11 }}>Remove</button>
//                     </div>
//                     {cat.items.map(item => (
//                         <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid #f2f7f2" }}>
//                             <div>
//                                 <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{item.name}</p>
//                                 <p style={{ margin: "2px 0 0", fontSize: 13, color: "#2d8a2d", fontWeight: 700 }}>₦{Number(item.price).toLocaleString()}</p>
//                             </div>
//                             <button onClick={() => removeItem(cat.id, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20 }}>×</button>
//                         </div>
//                     ))}
//                     <div style={{ padding: "11px 14px", background: "#fafcfa" }}>
//                         <div style={{ display: "flex", gap: 8 }}>
//                             <input
//                                 value={pendingItem.catId === cat.id ? pendingItem.name : ""}
//                                 onChange={e => setPending({ catId: cat.id, name: e.target.value, price: pendingItem.catId === cat.id ? pendingItem.price : "" })}
//                                 placeholder="Item name…"
//                                 style={{ ...inp(), flex: 2, padding: "9px 12px", fontSize: 13 }}
//                                 onFocus={focus} onBlur={blur}
//                             />
//                             <input
//                                 type="number"
//                                 value={pendingItem.catId === cat.id ? pendingItem.price : ""}
//                                 onChange={e => setPending(p => ({ ...p, catId: cat.id, price: e.target.value }))}
//                                 placeholder="₦"
//                                 style={{ ...inp(), flex: 1, padding: "9px 12px", fontSize: 13 }}
//                                 onFocus={focus} onBlur={blur}
//                             />
//                             <button
//                                 onClick={() => {
//                                     if (pendingItem.catId !== cat.id) { setPending({ catId: cat.id, name: "", price: "" }); }
//                                     else { addItem(cat.id); }
//                                 }}
//                                 style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "#2d8a2d", color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer", flexShrink: 0 }}
//                             >+</button>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ─── Step 5: Review ───────────────────────────────────────────────────────────
// const Step5 = ({ data }) => {
//     const totalItems = (data.menuCategories || []).reduce((a, c) => a + c.items.length, 0);
//     const sections = [
//         {
//             title: "Business Info", icon: "🏪", rows: [
//                 ["Name", data.name || "—"],
//                 ["Category", data.category || "—"],
//                 ["Phone", data.phone || "—"],
//                 ...(data.email ? [["Email", data.email]] : []),
//                 ["Description", data.description || "—"],
//             ],
//         },
//         {
//             title: "Location & Hours", icon: "📍", rows: [
//                 ["Address", data.address || "—"],
//                 ...(data.landmark ? [["Landmark", data.landmark]] : []),
//                 ["Open Days", (data.openDays || []).join(", ") || "—"],
//                 ["Hours", data.openTime && data.closeTime ? `${data.openTime} – ${data.closeTime}` : "—"],
//                 ["Delivery from", data.deliveryFrom ? `₦${data.deliveryFrom}` : "—"],
//             ],
//         },
//         {
//             title: "Packaging", icon: "📦",
//             rows: (data.packages || []).map(p => [p.name, p.price === 0 ? "Free" : `₦${p.price}`]),
//         },
//         {
//             title: "Menu", icon: "🍽️", rows: [
//                 ["Categories", String((data.menuCategories || []).length)],
//                 ["Total Items", String(totalItems)],
//             ],
//         },
//     ];

//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             <Header emoji="✅" title="Review your profile" sub="Everything look good? Hit submit to go live!" />

//             {data.logoPreview && (
//                 <div style={{ display: "flex", justifyContent: "center" }}>
//                     <img src={data.logoPreview} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "3px solid #e0eee0" }} alt="logo" />
//                 </div>
//             )}

//             {sections.map(s => (
//                 <div key={s.title} style={{ background: "#f7fbf7", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e2ebe2" }}>
//                     <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
//                         <span>{s.icon}</span>
//                         <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a", letterSpacing: 0.8 }}>{s.title}</span>
//                     </div>
//                     {s.rows.length === 0 && (
//                         <p style={{ padding: "12px 16px", fontSize: 13, color: "#aaa", margin: 0 }}>Nothing added yet</p>
//                     )}
//                     {s.rows.map(([k, v]) => (
//                         <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid #f0f7f0", fontSize: 13 }}>
//                             <span style={{ color: "#7a9a7a", fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{k}</span>
//                             <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{v}</span>
//                         </div>
//                     ))}
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ─── Validation ───────────────────────────────────────────────────────────────
// const canAdvance = (step, data) => {
//     if (step === 0) return !!(data.name?.trim() && data.category && data.phone?.trim());
//     if (step === 1) return !!(data.address?.trim() && (data.openDays || []).length && data.deliveryFrom);
//     if (step === 2) return (data.packages || []).length > 0;
//     if (step === 3) return (data.menuCategories || []).some(c => c.items.length > 0);
//     return true;
// };

// // ─── Success Screen ───────────────────────────────────────────────────────────
// const SuccessScreen = ({ name }) => (
//     <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
//         <div style={{ background: "white", borderRadius: 28, padding: "52px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.1)", animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
//             <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 44 }}>🎉</div>
//             <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", margin: "0 0 10px" }}>Welcome aboard!</h2>
//             <p style={{ color: "#5a7a5a", fontSize: 15, margin: "0 0 6px" }}>
//                 <strong>{name}</strong> is now listed on ChopSpot.
//             </p>
//             <p style={{ color: "#9ab59a", fontSize: 13, marginBottom: 22 }}>Opening your vendor dashboard…</p>
//             <div style={{ height: 5, background: "#e8f5e0", borderRadius: 10, overflow: "hidden" }}>
//                 <div style={{ height: "100%", background: "linear-gradient(90deg,#2d8a2d,#4caf50)", borderRadius: 10, animation: "loadBar 1.8s linear forwards" }} />
//             </div>
//         </div>
//     </div>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function VendorRegister({ onSuccess }) {
//     const [step, setStep] = useState(0);
//     const [data, setData] = useState({ openDays: [], packages: [], menuCategories: [] });
//     const [submitting, setSubmitting] = useState(false);
//     const [done, setDone] = useState(false);
//     const [error, setError] = useState(null);

//     const setField = (k, v) => setData(p => ({ ...p, [k]: v }));

//     const submit = async () => {
//         setSubmitting(true);
//         setError(null);

//         try {
//             const payload = {
//                 restaurantName:        data.name,
//                 category:              data.category,
//                 restaurantDescription: data.description || null,
//                 restaurantPhone:       data.phone,
//                 restaurantEmail:       data.email || null,
//                 restaurantAddress:     data.address,
//                 landmark:              data.landmark || null,
//                 openDays:              data.openDays,
//                 openTime:              data.openTime  || "08:00",
//                 closeTime:             data.closeTime || "20:00",
//                 deliveryFromPrice:     Number(data.deliveryFrom) || 0,
//                 packages:              (data.packages || []).map(p => ({ name: p.name, price: p.price })),
//                 menuCategories: (data.menuCategories || []).map(cat => ({
//                     name: cat.name,
//                     items: cat.items.map(i => ({ name: i.name, price: i.price, available: i.available ?? true })),
//                 })),
//             };

//             const result = await API.vendorApi.register(payload);
//             setDone(true);
//             setTimeout(() => onSuccess?.(result), 1800);
//         } catch (err) {
//             setError(err.message || "Registration failed. Please try again.");
//             setSubmitting(false);
//             window.scrollTo({ top: 0, behavior: "smooth" });
//         }
//     };

//     const steps = [
//         <Step1 key={0} data={data} set={setField} />,
//         <Step2 key={1} data={data} set={setField} />,
//         <Step3 key={2} data={data} set={setField} />,
//         <Step4 key={3} data={data} set={setField} />,
//         <Step5 key={4} data={data} />,
//     ];

//     if (done) return <SuccessScreen name={data.name} />;

//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0;}
//         body{font-family:'Plus Jakarta Sans',sans-serif;}
//         @keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes loadBar{from{width:0}to{width:100%}}
//         @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
//         @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
//         ::-webkit-scrollbar{width:5px}
//         ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
//         input::placeholder,textarea::placeholder{color:#b0c8b0}
//         .step-content{animation:fadeSlide 0.3s ease both}
//       `}</style>

//             <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#ecf7ec 0%,#ddf0dd 45%,#cde8cd 100%)" }}>

//                 {/* Navbar */}
//                 <nav style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)", height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(45,138,45,0.1)", position: "sticky", top: 0, zIndex: 200 }}>
//           <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a6a1a" }}>
//             Chop<span style={{ color: "#f97316" }}>Spot</span>
//             <span style={{ color: "#9ab59a", fontWeight: 400, fontSize: 14, marginLeft: 8 }}>· Vendor Registration</span>
//           </span>
//                 </nav>

//                 <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 16px 72px" }}>
//                     <div style={{ background: "white", borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.09)", overflow: "hidden" }}>

//                         {/* Error Banner */}
//                         {error && (
//                             <div style={{ background: "#fee2e2", borderLeft: "4px solid #dc2626", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
//                                 <span style={{ fontSize: 18 }}>⚠️</span>
//                                 <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#991b1b", flex: 1 }}>{error}</span>
//                                 <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 18, lineHeight: 1 }}>×</button>
//                             </div>
//                         )}

//                         {/* Progress header */}
//                         <div style={{ background: "linear-gradient(135deg,#155a15,#2d8a2d 55%,#3daa3d)", padding: "24px 28px 20px" }}>
//                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//                                 {STEPS.map((s, i) => (
//                                     <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
//                                         <div style={{
//                                             width: 36, height: 36, borderRadius: "50%",
//                                             background: i < step ? "rgba(255,255,255,0.92)" : i === step ? "white" : "rgba(255,255,255,0.2)",
//                                             display: "flex", alignItems: "center", justifyContent: "center",
//                                             fontSize: i < step ? 14 : 13,
//                                             color: i <= step ? "#2d8a2d" : "rgba(255,255,255,0.45)",
//                                             fontWeight: 800, fontFamily: "'Sora',sans-serif",
//                                             boxShadow: i === step ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
//                                             transition: "all 0.35s",
//                                         }}>
//                                             {i < step
//                                                 ? <svg width="14" height="14" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
//                                                 : s.icon
//                                             }
//                                         </div>
//                                         <span style={{ fontSize: 9, color: i === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
//                       {s.label}
//                     </span>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, height: 5, overflow: "hidden" }}>
//                                 <div style={{ height: "100%", background: "white", borderRadius: 10, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
//                             </div>
//                             <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>
//                                 Step {step + 1} of {STEPS.length} — <strong style={{ color: "white" }}>{STEPS[step].label}</strong>
//                             </p>
//                         </div>

//                         {/* Step content */}
//                         <div className="step-content" key={step} style={{ padding: "30px 28px 22px" }}>
//                             {steps[step]}
//                         </div>

//                         {/* Nav buttons */}
//                         <div style={{ padding: "0 28px 30px", display: "flex", gap: 12 }}>
//                             {step > 0 && (
//                                 <button onClick={() => setStep(s => s - 1)} disabled={submitting} style={{
//                                     flex: 1, padding: "14px", borderRadius: 50, border: "1.5px solid #d0e8d0",
//                                     background: "white", color: "#2d8a2d", fontWeight: 700, fontSize: 14,
//                                     cursor: submitting ? "not-allowed" : "pointer",
//                                     fontFamily: "'Sora',sans-serif", opacity: submitting ? 0.5 : 1,
//                                 }}
//                                         onMouseEnter={e => !submitting && (e.currentTarget.style.background = "#f0f7f0")}
//                                         onMouseLeave={e => !submitting && (e.currentTarget.style.background = "white")}
//                                 >← Back</button>
//                             )}

//                             {step < STEPS.length - 1 ? (
//                                 <button onClick={() => canAdvance(step, data) && setStep(s => s + 1)} style={{
//                                     flex: 2, padding: "15px", borderRadius: 50, border: "none",
//                                     background: canAdvance(step, data) ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d4e8d4",
//                                     color: canAdvance(step, data) ? "white" : "#8aaa8a",
//                                     fontWeight: 800, fontSize: 15,
//                                     cursor: canAdvance(step, data) ? "pointer" : "not-allowed",
//                                     fontFamily: "'Sora',sans-serif",
//                                     boxShadow: canAdvance(step, data) ? "0 5px 20px rgba(45,138,45,0.32)" : "none",
//                                     transition: "all 0.2s",
//                                 }}>Continue →</button>
//                             ) : (
//                                 <button onClick={submit} disabled={submitting} style={{
//                                     flex: 2, padding: "15px", borderRadius: 50, border: "none",
//                                     background: submitting ? "#e0e8e0" : "linear-gradient(135deg,#f97316,#fb923c)",
//                                     color: submitting ? "#aaa" : "white",
//                                     fontWeight: 800, fontSize: 15,
//                                     cursor: submitting ? "wait" : "pointer",
//                                     fontFamily: "'Sora',sans-serif",
//                                     boxShadow: submitting ? "none" : "0 5px 20px rgba(249,115,22,0.35)",
//                                 }}>
//                                     {submitting ? (
//                                         <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
//                       <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
//                         <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30 30" />
//                       </svg>
//                       Submitting…
//                     </span>
//                                     ) : "🚀 Submit & Go Live"}
//                                 </button>
//                             )}
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// VendorRegister.jsx  –  TastyCart
// Route: /vendor-registration
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as API from "../utils/Api";

const CATEGORIES = [
  "Nigerian", "Continental", "Fast Food", "Grills & BBQ",
  "Street Food", "Soups & Swallow", "Pastries & Drinks",
  "Healthy Bowls", "Seafood", "Snacks & Sides",
];

const PRESET_PACKAGES = [
  { id: "plastic",    name: "Plastic Container",   price: 200 },
  { id: "disposable", name: "Disposable Takeaway",  price: 100 },
  { id: "nylon",      name: "Just Nylon",           price: 0   },
  { id: "foil",       name: "Foil Wrap",            price: 50  },
  { id: "styrofoam",  name: "Styrofoam Pack",       price: 150 },
  { id: "luxury",     name: "Luxury Box",           price: 500 },
  { id: "eco",        name: "Eco Compostable Box",  price: 300 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = [
  { id: 0, label: "Account",   icon: "🔐" },
  { id: 1, label: "Business",  icon: "🏪" },
  { id: 2, label: "Location",  icon: "📍" },
  { id: 3, label: "Packaging", icon: "📦" },
  { id: 4, label: "Menu",      icon: "🍽️" },
  { id: 5, label: "Review",    icon: "✅" },
];

// ── shared styles ─────────────────────────────────────────────────────────────
const inp = (extra = {}) => ({
  width: "100%", padding: "13px 16px", borderRadius: 14,
  border: "1.5px solid #e2ebe2", background: "#f7fbf7",
  fontSize: 14, color: "#1a2e1a",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: "none", boxSizing: "border-box", transition: "all 0.2s",
  ...extra,
});
const lbl = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: "#6a8a6a",
  textTransform: "uppercase", display: "block", marginBottom: 6,
};
const onFocus = e => { e.target.style.borderColor = "#1a5c1a"; e.target.style.boxShadow = "0 0 0 3px rgba(26,92,26,0.12)"; e.target.style.background = "#fff"; };
const onBlur  = e => { e.target.style.borderColor = "#e2ebe2"; e.target.style.boxShadow = "none"; e.target.style.background = "#f7fbf7"; };

// ── micro-components ──────────────────────────────────────────────────────────
const SectionHeader = ({ emoji, title, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 8 }}>
    <div style={{ fontSize: 46, marginBottom: 10 }}>{emoji}</div>
    <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1a2e1a", margin: "0 0 5px" }}>{title}</h2>
    <p style={{ color: "#7a9a7a", fontSize: 14, margin: 0 }}>{sub}</p>
  </div>
);

const Field = ({ label, required, children, style, error }) => (
  <div style={style}>
    <label style={lbl}>
      {label}
      {required && <span style={{ color: "#f5920a", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 500 }}>⚠ {error}</p>}
  </div>
);

const Chip = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    padding: "7px 15px", borderRadius: 50, cursor: "pointer", fontSize: 13, fontWeight: 600,
    background: active ? "#1a5c1a" : "#f0f7f0",
    color:      active ? "white"   : "#3a6a3a",
    border: `1.5px solid ${active ? "#1a5c1a" : "#d0e8d0"}`,
    transition: "all 0.18s",
    boxShadow: active ? "0 3px 10px rgba(26,92,26,0.2)" : "none",
  }}>{label}</div>
);

const DayToggle = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    width: 48, height: 48, borderRadius: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 12, fontWeight: 700,
    background: active ? "#1a5c1a" : "#f0f7f0",
    color:      active ? "white"   : "#4a7a4a",
    border: `1.5px solid ${active ? "#1a5c1a" : "#d0e8d0"}`,
    transition: "all 0.18s",
    boxShadow: active ? "0 3px 10px rgba(26,92,26,0.2)" : "none",
  }}>{label}</div>
);

const Radio = ({ on }) => (
  <div style={{
    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
    border:    `2px solid ${on ? "#1a5c1a" : "#c0d5c0"}`,
    background: on ? "#1a5c1a" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.18s",
  }}>
    {on && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
  </div>
);

const PasswordInput = ({ value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value} onChange={onChange}
        placeholder={placeholder}
        style={inp({ paddingRight: 48, ...(error ? { borderColor: "#ef4444" } : {}) })}
        onFocus={onFocus} onBlur={onBlur}
      />
      <button type="button" onClick={() => setShow(s => !s)} style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ab59a",
      }}>{show ? "🙈" : "👁️"}</button>
    </div>
  );
};

const InfoBox = ({ icon = "💡", children }) => (
  <div style={{ background: "#fff8ee", border: "1.5px solid rgba(245,146,10,0.25)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
    <p style={{ margin: 0, fontSize: 13, color: "#7a5000", lineHeight: 1.65 }}>{children}</p>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 0 — Account Credentials
// ════════════════════════════════════════════════════════════
const Step0 = ({ data, set, errors }) => {
  const len      = (data.password || "").length;
  const hasUpper = /[A-Z]/.test(data.password || "");
  const hasNum   = /\d/.test(data.password || "");
  const strength = !len ? 0 : len < 6 ? 1 : len < 8 ? 2 : hasUpper && hasNum ? 4 : 3;
  const sColors  = ["#e2ebe2", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  const sLabels  = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader emoji="🔐" title="Create your account" sub="Use these credentials to log into your vendor dashboard" />

      <InfoBox>Your login email can be different from your restaurant's public contact email — you'll set that in the next step.</InfoBox>

      <Field label="Login Email" required error={errors.email}>
        <input type="email" value={data.email || ""} onChange={e => set("email", e.target.value)}
          placeholder="e.g. owner@yourrestaurant.com"
          style={inp(errors.email ? { borderColor: "#ef4444" } : {})}
          onFocus={onFocus} onBlur={onBlur}
        />
      </Field>

      <Field label="Password" required error={errors.password}>
        <PasswordInput value={data.password || ""} onChange={e => set("password", e.target.value)}
          placeholder="Minimum 8 characters" error={errors.password} />
        {data.password && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength ? sColors[strength] : "#e2ebe2", transition: "background 0.3s" }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: sColors[strength], fontWeight: 700, margin: 0 }}>{sLabels[strength]}</p>
          </div>
        )}
      </Field>

      <Field label="Confirm Password" required error={errors.confirmPassword}>
        <PasswordInput value={data.confirmPassword || ""} onChange={e => set("confirmPassword", e.target.value)}
          placeholder="Re-enter your password" error={errors.confirmPassword} />
        {data.confirmPassword && data.password === data.confirmPassword && !errors.confirmPassword && (
          <p style={{ color: "#10b981", fontSize: 12, marginTop: 5, fontWeight: 600 }}>✓ Passwords match</p>
        )}
      </Field>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 1 — Business Info
// ════════════════════════════════════════════════════════════
const Step1 = ({ data, set, errors }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <SectionHeader emoji="🏪" title="Tell us about your business" sub="This is what hungry customers will see on TastyCart" />

    {/* Logo upload */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <label style={lbl}>Restaurant Photo / Logo</label>
      <div onClick={() => document.getElementById("logo-inp").click()}
        style={{ width: 110, height: 110, borderRadius: 24, overflow: "hidden", background: data.logoPreview ? "transparent" : "#edf7ed", border: "2.5px dashed #8ac88a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#1a5c1a"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#8ac88a"}
      >
        {data.logoPreview
          ? <img src={data.logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
          : <div style={{ textAlign: "center" }}><div style={{ fontSize: 32 }}>📸</div><p style={{ margin: "4px 0 0", fontSize: 11, color: "#7aaa7a", fontWeight: 600 }}>Upload</p></div>}
      </div>
      <input id="logo-inp" type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) set("logoPreview", URL.createObjectURL(f)); }} />
      <span style={{ fontSize: 11, color: "#9ab59a" }}>JPG · PNG · up to 5 MB</span>
    </div>

    <Field label="Restaurant / Business Name" required error={errors.restaurantName}>
      <input value={data.restaurantName || ""} onChange={e => set("restaurantName", e.target.value)}
        placeholder="e.g. Mama Titi's Kitchen"
        style={inp(errors.restaurantName ? { borderColor: "#ef4444" } : {})}
        onFocus={onFocus} onBlur={onBlur} />
    </Field>

    <Field label="Owner's Full Name" required error={errors.ownerName}>
      <input value={data.ownerName || ""} onChange={e => set("ownerName", e.target.value)}
        placeholder="e.g. Fatima Abubakar"
        style={inp(errors.ownerName ? { borderColor: "#ef4444" } : {})}
        onFocus={onFocus} onBlur={onBlur} />
    </Field>

    <Field label="Category" required error={errors.category}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.map(c => <Chip key={c} label={c} active={data.category === c} onClick={() => set("category", c)} />)}
      </div>
    </Field>

    <Field label="Short Description">
      <textarea value={data.description || ""} onChange={e => set("description", e.target.value)}
        placeholder="Tell customers what makes your food special…" rows={3}
        style={{ ...inp(), resize: "none", lineHeight: 1.65 }} onFocus={onFocus} onBlur={onBlur} />
    </Field>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field label="Restaurant Phone" required error={errors.restaurantPhone}>
        <input value={data.restaurantPhone || ""} onChange={e => set("restaurantPhone", e.target.value)}
          placeholder="+234…" style={inp(errors.restaurantPhone ? { borderColor: "#ef4444" } : {})}
          onFocus={onFocus} onBlur={onBlur} />
      </Field>
      <Field label="Public Contact Email">
        <input type="email" value={data.restaurantEmail || ""} onChange={e => set("restaurantEmail", e.target.value)}
          placeholder="customers@yourplace.com" style={inp()} onFocus={onFocus} onBlur={onBlur} />
      </Field>
    </div>

    <InfoBox icon="ℹ️"><strong>Restaurant Phone</strong> and <strong>Public Contact Email</strong> are shown to customers — use business contact details, not personal ones.</InfoBox>
  </div>
);

// ════════════════════════════════════════════════════════════
// STEP 2 — Location & Hours
// ════════════════════════════════════════════════════════════
const Step2 = ({ data, set, errors }) => {
  const toggleDay = d => {
    const cur = data.openDays || [];
    set("openDays", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader emoji="📍" title="Where are you located?" sub="Help customers find you easily" />

      <Field label="Full Restaurant Address" required error={errors.restaurantAddress}>
        <input value={data.restaurantAddress || ""} onChange={e => set("restaurantAddress", e.target.value)}
          placeholder="e.g. Block C, Faculty Canteen Area, Ile-Ife"
          style={inp(errors.restaurantAddress ? { borderColor: "#ef4444" } : {})}
          onFocus={onFocus} onBlur={onBlur} />
      </Field>

      <Field label="Landmark / Extra Directions">
        <input value={data.landmark || ""} onChange={e => set("landmark", e.target.value)}
          placeholder="e.g. Opposite the library, beside ATM" style={inp()} onFocus={onFocus} onBlur={onBlur} />
      </Field>

      <Field label="Open Days" required error={errors.openDays}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DAYS.map(d => <DayToggle key={d} label={d} active={(data.openDays || []).includes(d)} onClick={() => toggleDay(d)} />)}
        </div>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Opening Time" required>
          <input type="time" value={data.openTime || "08:00"} onChange={e => set("openTime", e.target.value)}
            style={inp()} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <Field label="Closing Time" required>
          <input type="time" value={data.closeTime || "20:00"} onChange={e => set("closeTime", e.target.value)}
            style={inp()} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      <Field label="Minimum Delivery Price (₦)" required error={errors.deliveryFromPrice}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ab59a", fontWeight: 700, pointerEvents: "none" }}>₦</span>
          <input type="number" min="0" value={data.deliveryFromPrice || ""}
            onChange={e => set("deliveryFromPrice", e.target.value)}
            placeholder="e.g. 300"
            style={inp({ paddingLeft: 30, ...(errors.deliveryFromPrice ? { borderColor: "#ef4444" } : {}) })}
            onFocus={onFocus} onBlur={onBlur} />
        </div>
      </Field>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 3 — Packaging
// ════════════════════════════════════════════════════════════
const Step3 = ({ data, set, errors }) => {
  const [custom, setCustom] = useState({ name: "", price: "" });

  const toggle = pkg => {
    const cur = data.packages || [];
    set("packages", cur.find(p => p.id === pkg.id)
      ? cur.filter(p => p.id !== pkg.id)
      : [...cur, { id: pkg.id, name: pkg.name, price: pkg.price }]);
  };

  const addCustom = () => {
    if (!custom.name.trim()) return;
    const p = { id: `custom-${Date.now()}`, name: custom.name, price: Number(custom.price) || 0 };
    set("packages", [...(data.packages || []), p]);
    setCustom({ name: "", price: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader emoji="📦" title="Packaging Options" sub="Choose every pack type you offer customers" />

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {PRESET_PACKAGES.map(pkg => {
          const on = (data.packages || []).find(p => p.id === pkg.id);
          return (
            <div key={pkg.id} onClick={() => toggle(pkg)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderRadius: 15, cursor: "pointer",
              background: on ? "#eaf6ea" : "#f7fbf7",
              border: `2px solid ${on ? "#1a5c1a" : "#e2ebe2"}`,
              transition: "all 0.18s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Radio on={!!on} />
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{pkg.name}</span>
              </div>
              <span style={{ fontWeight: 700, color: "#f5920a", fontSize: 14 }}>
                {pkg.price === 0 ? "Free" : `₦${pkg.price}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Custom package */}
      <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px dashed #b8d8b8" }}>
        <p style={{ ...lbl, marginBottom: 10 }}>➕ Add Custom Package</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))}
            placeholder="Package name" style={{ ...inp(), flex: 2, padding: "11px 13px" }}
            onFocus={onFocus} onBlur={onBlur} />
          <input type="number" value={custom.price} onChange={e => setCustom(p => ({ ...p, price: e.target.value }))}
            placeholder="₦ price" style={{ ...inp(), flex: 1, padding: "11px 13px" }}
            onFocus={onFocus} onBlur={onBlur} />
          <button onClick={addCustom} style={{ padding: "0 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontWeight: 800, fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
      </div>

      {/* Selected summary chips */}
      {(data.packages || []).length > 0 && (
        <div style={{ background: "#eaf6ea", borderRadius: 12, padding: "12px 16px" }}>
          <p style={{ ...lbl, marginBottom: 8, color: "#1a5c1a" }}>Selected ({(data.packages || []).length})</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(data.packages || []).map(p => (
              <span key={p.id} style={{ background: "white", borderRadius: 50, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#1a5c1a", border: "1px solid #b8d8b8", display: "flex", alignItems: "center", gap: 6 }}>
                {p.name}
                <button onClick={e => { e.stopPropagation(); set("packages", (data.packages || []).filter(x => x.id !== p.id)); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ab59a", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {errors.packages && <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 500 }}>⚠ {errors.packages}</p>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 4 — Menu Builder
// ════════════════════════════════════════════════════════════
const Step4 = ({ data, set }) => {
  const [catName, setCatName]     = useState("");
  const [pending, setPending]     = useState({ catId: null, name: "", price: "" });

  const addCat = () => {
    if (!catName.trim()) return;
    set("menuCategories", [...(data.menuCategories || []), { id: `cat-${Date.now()}`, name: catName, items: [] }]);
    setCatName("");
  };
  const addItem = catId => {
    if (!pending.name.trim() || !pending.price) return;
    const item = { id: `item-${Date.now()}`, name: pending.name, price: Number(pending.price), available: true };
    set("menuCategories", (data.menuCategories || []).map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c));
    setPending({ catId: null, name: "", price: "" });
  };
  const removeItem = (catId, itemId) =>
    set("menuCategories", (data.menuCategories || []).map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  const removeCat = id =>
    set("menuCategories", (data.menuCategories || []).filter(c => c.id !== id));
  const toggleAvail = (catId, itemId) =>
    set("menuCategories", (data.menuCategories || []).map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, available: !i.available } : i) } : c));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader emoji="🍽️" title="Build Your Menu" sub="Add categories then load each one with food items" />

      <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px solid #e2ebe2" }}>
        <p style={{ ...lbl, marginBottom: 10 }}>New Category</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={catName} onChange={e => setCatName(e.target.value)}
            placeholder="e.g. Main Dishes, Proteins, Drinks…"
            style={{ ...inp(), flex: 1, padding: "11px 13px" }}
            onFocus={onFocus} onBlur={onBlur}
            onKeyDown={e => e.key === "Enter" && addCat()} />
          <button onClick={addCat} style={{ padding: "0 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>+</button>
        </div>
      </div>

      {!(data.menuCategories || []).length && (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#aac5aa" }}>
          <p style={{ fontSize: 36 }}>📋</p>
          <p style={{ fontWeight: 700, fontSize: 14, marginTop: 10 }}>No categories yet</p>
          <p style={{ fontSize: 13 }}>Add a category above to get started</p>
        </div>
      )}

      {(data.menuCategories || []).map(cat => (
        <div key={cat.id} style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2ebe2", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: "#1a6a1a", letterSpacing: 1, textTransform: "uppercase" }}>
              🍽 {cat.name}
              <span style={{ marginLeft: 8, fontWeight: 400, color: "#5a8a5a", fontSize: 11, textTransform: "none" }}>
                ({cat.items.length} item{cat.items.length !== 1 ? "s" : ""})
              </span>
            </span>
            <button onClick={() => removeCat(cat.id)} style={{ background: "rgba(200,50,50,0.12)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#c0392b", fontWeight: 700, fontSize: 11 }}>Remove</button>
          </div>

          {cat.items.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid #f2f7f2", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{item.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#1a5c1a", fontWeight: 700 }}>₦{Number(item.price).toLocaleString()}</p>
              </div>
              {/* available toggle */}
              <div onClick={() => toggleAvail(cat.id, item.id)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 50, cursor: "pointer",
                background: item.available ? "#d1fae5" : "#fee2e2",
                color: item.available ? "#059669" : "#b91c1c",
                fontSize: 11, fontWeight: 700, transition: "all 0.18s",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.available ? "#10b981" : "#ef4444" }} />
                {item.available ? "Available" : "Unavailable"}
              </div>
              <button onClick={() => removeItem(cat.id, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
          ))}

          <div style={{ padding: "11px 14px", background: "#fafcfa" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={pending.catId === cat.id ? pending.name : ""}
                onChange={e => setPending({ catId: cat.id, name: e.target.value, price: pending.catId === cat.id ? pending.price : "" })}
                placeholder="Item name…" style={{ ...inp(), flex: 2, padding: "9px 12px", fontSize: 13 }}
                onFocus={onFocus} onBlur={onBlur} />
              <input
                type="number"
                value={pending.catId === cat.id ? pending.price : ""}
                onChange={e => setPending(p => ({ ...p, catId: cat.id, price: e.target.value }))}
                placeholder="₦" style={{ ...inp(), flex: 1, padding: "9px 12px", fontSize: 13 }}
                onFocus={onFocus} onBlur={onBlur} />
              <button
                onClick={() => { if (pending.catId !== cat.id) setPending({ catId: cat.id, name: "", price: "" }); else addItem(cat.id); }}
                style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "#1a5c1a", color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 5 — Review
// ════════════════════════════════════════════════════════════
const Step5 = ({ data }) => {
  const totalItems = (data.menuCategories || []).reduce((a, c) => a + c.items.length, 0);

  const Section = ({ title, icon, rows }) => (
    <div style={{ background: "#f7fbf7", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e2ebe2" }}>
      <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
        <span>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a", letterSpacing: 0.8 }}>{title}</span>
      </div>
      {rows.length === 0
        ? <p style={{ padding: "12px 16px", fontSize: 13, color: "#aaa", margin: 0 }}>Nothing added yet</p>
        : rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid #f0f7f0", fontSize: 13 }}>
            <span style={{ color: "#7a9a7a", fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{k}</span>
            <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", wordBreak: "break-word", maxWidth: "60%" }}>{v}</span>
          </div>
        ))
      }
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader emoji="✅" title="Review your profile" sub="Everything look good? Hit submit to go live!" />

      {data.logoPreview && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={data.logoPreview} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "3px solid #e0eee0" }} alt="logo" />
        </div>
      )}

      <Section title="ACCOUNT" icon="🔐" rows={[
        ["Login Email", data.email || "—"],
        ["Password",    data.password ? "••••••••" : "—"],
      ]} />

      <Section title="BUSINESS INFO" icon="🏪" rows={[
        ["Restaurant Name",  data.restaurantName   || "—"],
        ["Owner Name",       data.ownerName         || "—"],
        ["Category",         data.category          || "—"],
        ["Restaurant Phone", data.restaurantPhone   || "—"],
        ["Public Email",     data.restaurantEmail   || "—"],
        ["Description",      data.description       || "—"],
      ]} />

      <Section title="LOCATION & HOURS" icon="📍" rows={[
        ["Address",       data.restaurantAddress  || "—"],
        ...(data.landmark ? [["Landmark", data.landmark]] : []),
        ["Open Days",     (data.openDays || []).join(", ") || "—"],
        ["Hours",         (data.openTime && data.closeTime) ? `${data.openTime} – ${data.closeTime}` : "—"],
        ["Delivery from", data.deliveryFromPrice ? `₦${Number(data.deliveryFromPrice).toLocaleString()}` : "—"],
      ]} />

      <Section title="PACKAGING" icon="📦"
        rows={(data.packages || []).map(p => [p.name, p.price === 0 ? "Free" : `₦${p.price}`])} />

      <Section title="MENU" icon="🍽️" rows={[
        ["Categories",  String((data.menuCategories || []).length)],
        ["Total Items", String(totalItems)],
      ]} />

      <InfoBox icon="📋">
        By submitting, you confirm this information is accurate and you agree to TastyCart's Vendor Terms of Service.
      </InfoBox>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Validation
// ════════════════════════════════════════════════════════════
const validate = (step, data) => {
  const e = {};
  if (step === 0) {
    if (!data.email?.trim())                          e.email           = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email))        e.email           = "Enter a valid email address";
    if (!data.password)                               e.password        = "Password is required";
    else if (data.password.length < 8)                e.password        = "Minimum 8 characters";
    if (!data.confirmPassword)                        e.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword)  e.confirmPassword = "Passwords do not match";
  }
  if (step === 1) {
    if (!data.restaurantName?.trim())  e.restaurantName  = "Restaurant name is required";
    if (!data.ownerName?.trim())       e.ownerName       = "Owner's full name is required";
    if (!data.category)                e.category        = "Please select a category";
    if (!data.restaurantPhone?.trim()) e.restaurantPhone = "Restaurant phone is required";
  }
  if (step === 2) {
    if (!data.restaurantAddress?.trim()) e.restaurantAddress = "Address is required";
    if (!(data.openDays || []).length)   e.openDays          = "Select at least one open day";
    if (!data.deliveryFromPrice)         e.deliveryFromPrice  = "Minimum delivery price is required";
  }
  if (step === 3) {
    if (!(data.packages || []).length) e.packages = "Select at least one packaging option";
  }
  return e;
};

// ════════════════════════════════════════════════════════════
// Success screen
// ════════════════════════════════════════════════════════════
const SuccessScreen = ({ name }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
    <div style={{ background: "white", borderRadius: 28, padding: "52px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.1)", animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 44 }}>🎉</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", margin: "0 0 10px" }}>Welcome aboard!</h2>
      <p style={{ color: "#5a7a5a", fontSize: 15, margin: "0 0 6px" }}><strong>{name}</strong> is now listed on TastyCart.</p>
      <p style={{ color: "#9ab59a", fontSize: 13, marginBottom: 22 }}>Opening your vendor dashboard…</p>
      <div style={{ height: 5, background: "#e8f5e0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#1a5c1a,#2d7a2d)", borderRadius: 10, animation: "loadBar 1.8s linear forwards" }} />
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function VendorRegister({ onSuccess }) {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(0);
  const [data,       setData]       = useState({ openDays: [], packages: [], menuCategories: [] });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [apiError,   setApiError]   = useState(null);

  const setField = (k, v) => setData(p => ({ ...p, [k]: v }));

  const goNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      // Payload fields match the Java DTO exactly
      const payload = {
        email:             data.email,
        password:          data.password,
        confirmPassword:   data.confirmPassword,
        restaurantName:    data.restaurantName,
        ownerName:         data.ownerName,
        category:          data.category,
        description:       data.description      || null,
        restaurantPhone:   data.restaurantPhone,
        restaurantEmail:   data.restaurantEmail  || null,
        logoUrl:           data.logoUrl          || null,
        restaurantAddress: data.restaurantAddress,
        landmark:          data.landmark         || null,
        openDays:          data.openDays,
        openTime:          data.openTime         || "08:00",
        closeTime:         data.closeTime        || "20:00",
        deliveryFromPrice: Number(data.deliveryFromPrice) || 0,
        isOpen:            true,
        packages: (data.packages || []).map(p => ({
          id:    p.id,
          name:  p.name,
          price: Number(p.price),
        })),
        menuCategories: (data.menuCategories || []).map(cat => ({
          name:  cat.name,
          items: cat.items.map(i => ({
            name:      i.name,
            price:     Number(i.price),
            available: i.available ?? true,
          })),
        })),
      };

      const result = await API.vendorApi.register(payload);
      setDone(true);
      setTimeout(() => onSuccess?.(result), 1800);
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const steps = [
    <Step0 key={0} data={data} set={setField} errors={errors} />,
    <Step1 key={1} data={data} set={setField} errors={errors} />,
    <Step2 key={2} data={data} set={setField} errors={errors} />,
    <Step3 key={3} data={data} set={setField} errors={errors} />,
    <Step4 key={4} data={data} set={setField} />,
    <Step5 key={5} data={data} />,
  ];

  if (done) return <SuccessScreen name={data.restaurantName} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
        input::placeholder,textarea::placeholder{color:#b0c8b0}
        .step-content{animation:fadeSlide 0.3s ease both}
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#ecf7ec 0%,#ddf0dd 45%,#cde8cd 100%)" }}>

        {/* Navbar */}
        <nav style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(18px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(26,92,26,0.1)", position: "sticky", top: 0, zIndex: 200 }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a6a1a" }}>
            Tasty<span style={{ color: "#f5920a" }}>cart</span>
            <span style={{ color: "#9ab59a", fontWeight: 400, fontSize: 14, marginLeft: 8 }}>· Vendor Registration</span>
          </span>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a9a7a", fontWeight: 600, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>← Back</button>
        </nav>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{ background: "white", borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.09)", overflow: "hidden" }}>

            {/* API error */}
            {apiError && (
              <div style={{ background: "#fee2e2", borderLeft: "4px solid #dc2626", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠️</span>
                <span style={{ fontSize: 13, color: "#991b1b", flex: 1 }}>{apiError}</span>
                <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 18 }}>×</button>
              </div>
            )}

            {/* Progress header */}
            <div style={{ background: "linear-gradient(135deg,#0f3a0f,#1a5c1a 55%,#2d7a2d)", padding: "24px 20px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background:  i < step ? "rgba(255,255,255,0.92)" : i === step ? "white" : "rgba(255,255,255,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: i <= step ? "#1a5c1a" : "rgba(255,255,255,0.4)",
                      fontSize: 13, fontWeight: 800,
                      boxShadow: i === step ? "0 4px 16px rgba(0,0,0,0.22)" : "none",
                      transition: "all 0.35s",
                    }}>
                      {i < step
                        ? <svg width="13" height="13" fill="#1a5c1a" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        : s.icon}
                    </div>
                    <span style={{ fontSize: 8, color: i === step ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", textAlign: "center" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "white", borderRadius: 10, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>
                Step {step + 1} of {STEPS.length} — <strong style={{ color: "white" }}>{STEPS[step].label}</strong>
              </p>
            </div>

            {/* Content */}
            <div className="step-content" key={step} style={{ padding: "30px 28px 20px" }}>
              {steps[step]}
            </div>

            {/* Nav */}
            <div style={{ padding: "0 28px 32px", display: "flex", gap: 12 }}>
              {step > 0 && (
                <button onClick={goBack} disabled={submitting} style={{ flex: 1, padding: "14px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#1a5c1a", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7f0"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}>← Back</button>
              )}
              {step < STEPS.length - 1
                ? <button onClick={goNext} style={{ flex: 2, padding: "15px", borderRadius: 50, border: "none", background: "linear-gradient(135deg,#1a5c1a,#2d7a2d)", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Sora',sans-serif", boxShadow: "0 5px 20px rgba(26,92,26,0.32)" }}>Continue →</button>
                : <button onClick={submit} disabled={submitting} style={{ flex: 2, padding: "15px", borderRadius: 50, border: "none", background: submitting ? "#d0e8d0" : "linear-gradient(135deg,#f5920a,#e07d00)", color: submitting ? "#8aaa8a" : "white", fontWeight: 800, fontSize: 15, cursor: submitting ? "wait" : "pointer", fontFamily: "'Sora',sans-serif", boxShadow: submitting ? "none" : "0 5px 20px rgba(245,146,10,0.35)" }}>
                    {submitting
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30 30"/></svg>
                          Submitting…
                        </span>
                      : "🚀 Submit & Go Live"}
                  </button>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}