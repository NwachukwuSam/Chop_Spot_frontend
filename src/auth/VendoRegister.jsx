import { useState } from "react";
import * as API from "../utils/Api";

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "dwqxxunes";
const CLOUDINARY_UPLOAD_PRESET = "sales_book";

const uploadToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    uploadData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
    uploadData.append("folder", "user_profiles");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadData }
    );
    if (!response.ok) throw new Error("Image upload failed");
    const result = await response.json();
    return result.secure_url;
};

// Upload a remote URL image to Cloudinary (for preset picks)
const uploadUrlToCloudinary = async (imageUrl) => {
    const uploadData = new FormData();
    uploadData.append("file", imageUrl);
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    uploadData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
    uploadData.append("folder", "user_profiles");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadData }
    );
    if (!response.ok) throw new Error("Image upload failed");
    const result = await response.json();
    return result.secure_url;
};

// ─── Constants ────────────────────────────────────────────────────────────────
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
    { id: 0, label: "Business",  icon: "🏪" },
    { id: 1, label: "Location",  icon: "📍" },
    { id: 2, label: "Packaging", icon: "📦" },
    { id: 3, label: "Menu",      icon: "🍽️" },
    { id: 4, label: "Review",    icon: "✅" },
];

export const vendorImage = [
    { id: 1,  image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop" },
    { id: 2,  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop" },
    { id: 3,  image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop" },
    { id: 4,  image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop" },
    { id: 5,  image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop" },
    { id: 6,  image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop" },
    { id: 7,  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop" },
    { id: 8,  image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop" },
    { id: 9,  image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop" },
    { id: 10, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop" },
    { id: 11, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop" },
    { id: 12, image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop" },
    { id: 13, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop" },
    { id: 14, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop" },
    { id: 15, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inp = (extra = {}) => ({
    width: "100%", padding: "13px 16px", borderRadius: 14,
    border: "1.5px solid #e2ebe2", background: "#f7fbf7",
    fontSize: 14, color: "#1a2e1a", fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none", boxSizing: "border-box", transition: "all 0.2s",
    ...extra,
});

const lbl = {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: "#6a8a6a",
    textTransform: "uppercase", display: "block", marginBottom: 6,
};

const focus = e => {
    e.target.style.borderColor = "#2d8a2d";
    e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)";
    e.target.style.background = "#fff";
};

const blur = e => {
    e.target.style.borderColor = "#e2ebe2";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#f7fbf7";
};

// ─── Small shared components ──────────────────────────────────────────────────
const Header = ({ emoji, title, sub }) => (
    <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 46, marginBottom: 10 }}>{emoji}</div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#1a2e1a", margin: "0 0 5px" }}>{title}</h2>
        <p style={{ color: "#7a9a7a", fontSize: 14, margin: 0 }}>{sub}</p>
    </div>
);

const Field = ({ label, children, style }) => (
    <div style={{ ...style }}>
        <label style={lbl}>{label}</label>
        {children}
    </div>
);

const Chip = ({ label, active, onClick }) => (
    <div onClick={onClick} style={{
        padding: "7px 15px", borderRadius: 50, cursor: "pointer", fontSize: 13, fontWeight: 600,
        background: active ? "#2d8a2d" : "#f0f7f0",
        color: active ? "white" : "#3a6a3a",
        border: `1.5px solid ${active ? "#2d8a2d" : "#d0e8d0"}`,
        transition: "all 0.18s",
    }}>{label}</div>
);

const Radio = ({ on }) => (
    <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${on ? "#2d8a2d" : "#c0d5c0"}`,
        background: on ? "#2d8a2d" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s",
    }}>
        {on && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
    </div>
);

// ─── Step 1: Business Info ────────────────────────────────────────────────────
const Step1 = ({ data, set }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadErr, setUploadErr] = useState(null);
    const [showGallery, setShowGallery] = useState(false);

    // Upload a local file the user picked
    const handleFileUpload = async (file) => {
        setUploading(true);
        setUploadErr(null);
        try {
            // Show preview immediately
            set("logoPreview", URL.createObjectURL(file));
            const url = await uploadToCloudinary(file);
            set("logoUrl", url);
        } catch (err) {
            setUploadErr("Upload failed. Please try again.");
            set("logoPreview", null);
            set("logoUrl", null);
        } finally {
            setUploading(false);
        }
    };

    // Upload a preset vendor image URL to Cloudinary
    const handleGalleryPick = async (imgUrl) => {
        setShowGallery(false);
        setUploading(true);
        setUploadErr(null);
        set("logoPreview", imgUrl); // show immediately as preview
        try {
            const url = await uploadUrlToCloudinary(imgUrl);
            set("logoUrl", url);
            set("logoPreview", url);
        } catch (err) {
            setUploadErr("Could not save image. Please try another.");
            set("logoUrl", null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Header emoji="🏪" title="Tell us about your business" sub="This is what hungry customers will see on ChopSpot" />

            {/* Logo / Photo Picker */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <label style={lbl}>Restaurant Photo / Logo</label>

                {/* Preview circle */}
                <div
                    onClick={() => !uploading && document.getElementById("logo-inp").click()}
                    style={{
                        width: 110, height: 110, borderRadius: 24, overflow: "hidden",
                        background: data.logoPreview ? "transparent" : "#edf7ed",
                        border: "2.5px dashed #8ac88a", cursor: uploading ? "wait" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.2s", position: "relative",
                    }}
                    onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = "#2d8a2d")}
                    onMouseLeave={e => !uploading && (e.currentTarget.style.borderColor = "#8ac88a")}
                >
                    {uploading ? (
                        <div style={{ textAlign: "center" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                <circle cx="12" cy="12" r="10" stroke="#2d8a2d" strokeWidth="3" fill="none" strokeDasharray="30 30" />
                            </svg>
                            <p style={{ fontSize: 10, color: "#7aaa7a", marginTop: 4, fontWeight: 600 }}>Uploading…</p>
                        </div>
                    ) : data.logoPreview ? (
                        <img src={data.logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32 }}>📸</div>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7aaa7a", fontWeight: 600 }}>Upload</p>
                        </div>
                    )}
                </div>

                <input id="logo-inp" type="file" accept="image/*" style={{ display: "none" }}
                       onChange={e => { const f = e.target.files[0]; if (f) handleFileUpload(f); }}
                />

                {/* Two action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => document.getElementById("logo-inp").click()}
                        disabled={uploading}
                        style={{
                            padding: "7px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700,
                            border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d",
                            cursor: uploading ? "wait" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                        }}
                    >
                        📁 Upload File
                    </button>
                    <button
                        onClick={() => setShowGallery(true)}
                        disabled={uploading}
                        style={{
                            padding: "7px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700,
                            border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d",
                            cursor: uploading ? "wait" : "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                        }}
                    >
                        🖼️ Pick from Gallery
                    </button>
                </div>

                {data.logoUrl && !uploading && (
                    <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 700 }}>✓ Image saved to cloud</span>
                )}
                {uploadErr && (
                    <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>{uploadErr}</span>
                )}
                <span style={{ fontSize: 11, color: "#9ab59a" }}>JPG · PNG · up to 5 MB</span>
            </div>

            {/* Gallery Modal */}
            {showGallery && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                }} onClick={() => setShowGallery(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "white", borderRadius: 24, padding: 24, maxWidth: 520, width: "100%",
                            maxHeight: "80vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: "#1a2e1a", margin: 0 }}>
                                🖼️ Pick a Restaurant Photo
                            </h3>
                            <button onClick={() => setShowGallery(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>×</button>
                        </div>
                        <p style={{ fontSize: 12, color: "#9ab59a", marginBottom: 16 }}>Select one — it will be saved to your cloud storage automatically.</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                            {vendorImage.map(img => (
                                <div
                                    key={img.id}
                                    onClick={() => handleGalleryPick(img.image)}
                                    style={{
                                        borderRadius: 14, overflow: "hidden", cursor: "pointer",
                                        border: data.logoPreview === img.image ? "3px solid #2d8a2d" : "2px solid transparent",
                                        aspectRatio: "1 / 1", transition: "all 0.18s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                >
                                    <img src={img.image} alt={`food ${img.id}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Field label="Restaurant / Business Name *">
                <input value={data.restaurantName || ""} onChange={e => set("restaurantName", e.target.value)}
                       placeholder="e.g. Mama Titi's Kitchen" style={inp()} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Owner's Full Name *">
                <input value={data.ownerName || ""} onChange={e => set("ownerName", e.target.value)}
                       placeholder="e.g. Titi Adeyemi" style={inp()} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Category *">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CATEGORIES.map(c => (
                        <Chip key={c} label={c} active={data.category === c} onClick={() => set("category", c)} />
                    ))}
                </div>
            </Field>

            <Field label="Short Description">
                <textarea value={data.description || ""} onChange={e => set("description", e.target.value)}
                          placeholder="Tell customers what makes your food special…" rows={3}
                          style={{ ...inp(), resize: "none", lineHeight: 1.65 }} onFocus={focus} onBlur={blur}
                />
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
                <Field label="WhatsApp / Phone *" style={{ flex: 1 }}>
                    <input value={data.restaurantPhone || ""} onChange={e => set("restaurantPhone", e.target.value)}
                           placeholder="+234…" style={inp()} onFocus={focus} onBlur={blur} />
                </Field>
                <Field label="Contact Email (optional)" style={{ flex: 1 }}>
                    <input value={data.restaurantEmail || ""} onChange={e => set("restaurantEmail", e.target.value)}
                           placeholder="you@example.com" style={inp()} onFocus={focus} onBlur={blur} />
                </Field>
            </div>

            <div style={{ background: "#f0f7f0", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #d0e8d0" }}>
                <p style={{ ...lbl, marginBottom: 10 }}>Account Credentials</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Field label="Email Address *">
                        <input type="email" value={data.email || ""} onChange={e => set("email", e.target.value)}
                               placeholder="login@example.com" style={inp()} onFocus={focus} onBlur={blur} />
                    </Field>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Field label="Password *" style={{ flex: 1 }}>
                            <input type="password" value={data.password || ""} onChange={e => set("password", e.target.value)}
                                   placeholder="••••••••" style={inp()} onFocus={focus} onBlur={blur} />
                        </Field>
                        <Field label="Confirm Password *" style={{ flex: 1 }}>
                            <input type="password" value={data.confirmPassword || ""} onChange={e => set("confirmPassword", e.target.value)}
                                   placeholder="••••••••" style={inp()} onFocus={focus} onBlur={blur} />
                        </Field>
                    </div>
                    {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
                        <p style={{ fontSize: 12, color: "#dc2626", margin: 0, fontWeight: 600 }}>⚠️ Passwords do not match</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Step 2: Location & Hours ─────────────────────────────────────────────────
const Step2 = ({ data, set }) => {
    const toggleDay = d => {
        const cur = data.openDays || [];
        set("openDays", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Header emoji="📍" title="Where are you located?" sub="Help customers find you easily" />

            <Field label="Full Address *">
                <input value={data.restaurantAddress || ""} onChange={e => set("restaurantAddress", e.target.value)}
                       placeholder="e.g. Block C, Faculty Canteen Area" style={inp()} onFocus={focus} onBlur={blur} />
            </Field>
            <Field label="Landmark / More Details">
                <input value={data.landmark || ""} onChange={e => set("landmark", e.target.value)}
                       placeholder="e.g. Opposite the library, beside ATM" style={inp()} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Open Days *">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DAYS.map(d => (
                        <div key={d} onClick={() => toggleDay(d)} style={{
                            width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", fontSize: 12, fontWeight: 700,
                            background: (data.openDays || []).includes(d) ? "#2d8a2d" : "#f0f7f0",
                            color: (data.openDays || []).includes(d) ? "white" : "#4a7a4a",
                            border: `1.5px solid ${(data.openDays || []).includes(d) ? "#2d8a2d" : "#d0e8d0"}`,
                            transition: "all 0.18s",
                        }}>{d}</div>
                    ))}
                </div>
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
                <Field label="Opening Time *" style={{ flex: 1 }}>
                    <input type="time" value={data.openTime || "08:00"} onChange={e => set("openTime", e.target.value)}
                           style={inp()} onFocus={focus} onBlur={blur} />
                </Field>
                <Field label="Closing Time *" style={{ flex: 1 }}>
                    <input type="time" value={data.closeTime || "20:00"} onChange={e => set("closeTime", e.target.value)}
                           style={inp()} onFocus={focus} onBlur={blur} />
                </Field>
            </div>

            <Field label="Minimum Delivery Price (₦) *">
                <input type="number" value={data.deliveryFromPrice || ""} onChange={e => set("deliveryFromPrice", e.target.value)}
                       placeholder="e.g. 300" style={inp()} onFocus={focus} onBlur={blur} />
            </Field>
        </div>
    );
};

// ─── Step 3: Packaging ────────────────────────────────────────────────────────
const Step3 = ({ data, set }) => {
    const [custom, setCustom] = useState({ name: "", price: "" });

    const toggle = pkg => {
        const cur = data.packages || [];
        set("packages", cur.find(p => p.id === pkg.id) ? cur.filter(p => p.id !== pkg.id) : [...cur, pkg]);
    };

    const addCustom = () => {
        if (!custom.name.trim()) return;
        const p = { id: `custom-${Date.now()}`, name: custom.name, price: Number(custom.price) || 0 };
        set("packages", [...(data.packages || []), p]);
        setCustom({ name: "", price: "" });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Header emoji="📦" title="Packaging Options" sub="Choose every pack type you offer customers" />

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {PRESET_PACKAGES.map(pkg => {
                    const on = (data.packages || []).find(p => p.id === pkg.id);
                    return (
                        <div key={pkg.id} onClick={() => toggle(pkg)} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 18px", borderRadius: 15, cursor: "pointer",
                            background: on ? "#eaf6ea" : "#f7fbf7",
                            border: `2px solid ${on ? "#2d8a2d" : "#e2ebe2"}`,
                            transition: "all 0.18s",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <Radio on={!!on} />
                                <span style={{ fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{pkg.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: "#f97316", fontSize: 14 }}>
                                {pkg.price === 0 ? "Free" : `₦${pkg.price}`}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px dashed #b8d8b8" }}>
                <p style={{ ...lbl, marginBottom: 10 }}>➕ Add Custom Package</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <input value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))}
                           placeholder="Package name" style={{ ...inp(), flex: 2, padding: "11px 13px" }}
                           onFocus={focus} onBlur={blur}
                    />
                    <input type="number" value={custom.price} onChange={e => setCustom(p => ({ ...p, price: e.target.value }))}
                           placeholder="₦ price" style={{ ...inp(), flex: 1, padding: "11px 13px" }}
                           onFocus={focus} onBlur={blur}
                    />
                    <button onClick={addCustom} style={{
                        padding: "0 18px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white",
                        fontWeight: 800, fontSize: 20, cursor: "pointer", flexShrink: 0,
                    }}>+</button>
                </div>
            </div>
        </div>
    );
};

// ─── Step 4: Menu ─────────────────────────────────────────────────────────────
const Step4 = ({ data, set }) => {
    const [catName, setCatName] = useState("");
    const [pendingItem, setPending] = useState({ catId: null, name: "", price: "" });

    const addCat = () => {
        if (!catName.trim()) return;
        set("menuCategories", [...(data.menuCategories || []), { id: `cat-${Date.now()}`, name: catName, items: [] }]);
        setCatName("");
    };

    const addItem = catId => {
        if (!pendingItem.name.trim() || !pendingItem.price) return;
        const item = { id: `item-${Date.now()}`, name: pendingItem.name, price: Number(pendingItem.price), available: true };
        set("menuCategories", (data.menuCategories || []).map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c));
        setPending({ catId: null, name: "", price: "" });
    };

    const removeItem = (catId, itemId) =>
        set("menuCategories", (data.menuCategories || []).map(c =>
            c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
        ));

    const removeCat = id =>
        set("menuCategories", (data.menuCategories || []).filter(c => c.id !== id));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Header emoji="🍽️" title="Build Your Menu" sub="Add categories then load each one with food items" />

            <div style={{ background: "#f7fbf7", borderRadius: 16, padding: 16, border: "1.5px solid #e2ebe2" }}>
                <p style={{ ...lbl, marginBottom: 10 }}>New Category</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <input value={catName} onChange={e => setCatName(e.target.value)}
                           placeholder="e.g. Main Dishes, Proteins, Extras…"
                           style={{ ...inp(), flex: 1, padding: "11px 13px" }}
                           onFocus={focus} onBlur={blur}
                           onKeyDown={e => e.key === "Enter" && addCat()}
                    />
                    <button onClick={addCat} style={{
                        padding: "0 20px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#2d8a2d,#4caf50)", color: "white",
                        fontWeight: 800, fontSize: 18, cursor: "pointer", flexShrink: 0,
                    }}>+</button>
                </div>
            </div>

            {!(data.menuCategories || []).length && (
                <div style={{ textAlign: "center", padding: "28px 0", color: "#aac5aa" }}>
                    <p style={{ fontSize: 36 }}>📋</p>
                    <p style={{ fontWeight: 700, fontSize: 14, marginTop: 10 }}>No categories yet</p>
                    <p style={{ fontSize: 13 }}>Add a category above to start loading your menu</p>
                </div>
            )}

            {(data.menuCategories || []).map(cat => (
                <div key={cat.id} style={{ background: "white", borderRadius: 18, border: "1.5px solid #e2ebe2", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 800, fontSize: 12, color: "#1a6a1a", letterSpacing: 1, textTransform: "uppercase" }}>
                            🍽 {cat.name}
                            <span style={{ marginLeft: 8, fontWeight: 400, color: "#5a8a5a", fontSize: 11, textTransform: "none" }}>
                                ({cat.items.length} items)
                            </span>
                        </span>
                        <button onClick={() => removeCat(cat.id)} style={{ background: "rgba(200,50,50,0.1)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#c0392b", fontWeight: 700, fontSize: 11 }}>Remove</button>
                    </div>
                    {cat.items.map(item => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid #f2f7f2" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a2e1a" }}>{item.name}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#2d8a2d", fontWeight: 700 }}>₦{Number(item.price).toLocaleString()}</p>
                            </div>
                            <button onClick={() => removeItem(cat.id, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20 }}>×</button>
                        </div>
                    ))}
                    <div style={{ padding: "11px 14px", background: "#fafcfa" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                value={pendingItem.catId === cat.id ? pendingItem.name : ""}
                                onChange={e => setPending({ catId: cat.id, name: e.target.value, price: pendingItem.catId === cat.id ? pendingItem.price : "" })}
                                placeholder="Item name…"
                                style={{ ...inp(), flex: 2, padding: "9px 12px", fontSize: 13 }}
                                onFocus={focus} onBlur={blur}
                            />
                            <input
                                type="number"
                                value={pendingItem.catId === cat.id ? pendingItem.price : ""}
                                onChange={e => setPending(p => ({ ...p, catId: cat.id, price: e.target.value }))}
                                placeholder="₦"
                                style={{ ...inp(), flex: 1, padding: "9px 12px", fontSize: 13 }}
                                onFocus={focus} onBlur={blur}
                            />
                            <button
                                onClick={() => {
                                    if (pendingItem.catId !== cat.id) { setPending({ catId: cat.id, name: "", price: "" }); }
                                    else { addItem(cat.id); }
                                }}
                                style={{ padding: "0 14px", borderRadius: 10, border: "none", background: "#2d8a2d", color: "white", fontWeight: 800, fontSize: 18, cursor: "pointer", flexShrink: 0 }}
                            >+</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Step 5: Review ───────────────────────────────────────────────────────────
const Step5 = ({ data }) => {
    const totalItems = (data.menuCategories || []).reduce((a, c) => a + c.items.length, 0);
    const sections = [
        {
            title: "Business Info", icon: "🏪", rows: [
                ["Restaurant Name", data.restaurantName || "—"],
                ["Owner Name", data.ownerName || "—"],
                ["Category", data.category || "—"],
                ["Phone", data.restaurantPhone || "—"],
                ...(data.restaurantEmail ? [["Contact Email", data.restaurantEmail]] : []),
                ["Login Email", data.email || "—"],
                ["Description", data.description || "—"],
            ],
        },
        {
            title: "Location & Hours", icon: "📍", rows: [
                ["Address", data.restaurantAddress || "—"],
                ...(data.landmark ? [["Landmark", data.landmark]] : []),
                ["Open Days", (data.openDays || []).join(", ") || "—"],
                ["Hours", data.openTime && data.closeTime ? `${data.openTime} – ${data.closeTime}` : "—"],
                ["Delivery from", data.deliveryFromPrice ? `₦${data.deliveryFromPrice}` : "—"],
            ],
        },
        {
            title: "Packaging", icon: "📦",
            rows: (data.packages || []).map(p => [p.name, p.price === 0 ? "Free" : `₦${p.price}`]),
        },
        {
            title: "Menu", icon: "🍽️", rows: [
                ["Categories", String((data.menuCategories || []).length)],
                ["Total Items", String(totalItems)],
            ],
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Header emoji="✅" title="Review your profile" sub="Everything look good? Hit submit to go live!" />

            {data.logoPreview && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img src={data.logoPreview} style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "3px solid #e0eee0" }} alt="logo" />
                </div>
            )}
            {data.logoUrl && (
                <p style={{ textAlign: "center", fontSize: 11, color: "#4caf50", fontWeight: 700, margin: "-8px 0 0" }}>✓ Logo saved to cloud</p>
            )}

            {sections.map(s => (
                <div key={s.title} style={{ background: "#f7fbf7", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e2ebe2" }}>
                    <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
                        <span>{s.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a", letterSpacing: 0.8 }}>{s.title}</span>
                    </div>
                    {s.rows.length === 0 && (
                        <p style={{ padding: "12px 16px", fontSize: 13, color: "#aaa", margin: 0 }}>Nothing added yet</p>
                    )}
                    {s.rows.map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid #f0f7f0", fontSize: 13 }}>
                            <span style={{ color: "#7a9a7a", fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{k}</span>
                            <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{v}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// ─── Validation ───────────────────────────────────────────────────────────────
const canAdvance = (step, data) => {
    if (step === 0) {
        const pwMatch = !data.password || !data.confirmPassword || data.password === data.confirmPassword;
        return !!(
            data.restaurantName?.trim() &&
            data.ownerName?.trim() &&
            data.category &&
            data.restaurantPhone?.trim() &&
            data.email?.trim() &&
            data.password?.trim() &&
            pwMatch
        );
    }
    if (step === 1) return !!(data.restaurantAddress?.trim() && (data.openDays || []).length && data.deliveryFromPrice);
    if (step === 2) return (data.packages || []).length > 0;
    if (step === 3) return (data.menuCategories || []).some(c => c.items.length > 0);
    return true;
};

// ─── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ name }) => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
        <div style={{ background: "white", borderRadius: 28, padding: "52px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.1)", animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 44 }}>🎉</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", margin: "0 0 10px" }}>Welcome aboard!</h2>
            <p style={{ color: "#5a7a5a", fontSize: 15, margin: "0 0 6px" }}>
                <strong>{name}</strong> is now listed on ChopSpot.
            </p>
            <p style={{ color: "#9ab59a", fontSize: 13, marginBottom: 22 }}>Opening your vendor dashboard…</p>
            <div style={{ height: 5, background: "#e8f5e0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#2d8a2d,#4caf50)", borderRadius: 10, animation: "loadBar 1.8s linear forwards" }} />
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VendorRegister({ onSuccess }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ openDays: [], packages: [], menuCategories: [] });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);

    const setField = (k, v) => setData(p => ({ ...p, [k]: v }));

    const submit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                // Account credentials
                email:           data.email,
                password:        data.password,
                confirmPassword: data.confirmPassword,

                // Step 1 — Business Info
                restaurantName:  data.restaurantName,
                ownerName:       data.ownerName,
                category:        data.category,
                description:     data.description || null,
                restaurantPhone: data.restaurantPhone,
                restaurantEmail: data.restaurantEmail || null,
                logoUrl:         data.logoUrl || null,

                // Step 2 — Location & Hours
                restaurantAddress: data.restaurantAddress,
                landmark:          data.landmark || null,
                openDays:          data.openDays,
                openTime:          data.openTime  || "08:00",
                closeTime:         data.closeTime || "20:00",
                deliveryFromPrice: Number(data.deliveryFromPrice) || 0,

                // Step 3 — Packaging
                packages: (data.packages || []).map(p => ({
                    id:    p.id,
                    name:  p.name,
                    price: p.price,
                })),

                // Step 4 — Menu
                menuCategories: (data.menuCategories || []).map(cat => ({
                    name:  cat.name,
                    items: cat.items.map(i => ({
                        name:      i.name,
                        price:     i.price,
                        available: i.available ?? true,
                    })),
                })),
            };

            const result = await API.vendorApi.register(payload);
            setDone(true);
            setTimeout(() => onSuccess?.(result), 1800);
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const steps = [
        <Step1 key={0} data={data} set={setField} />,
        <Step2 key={1} data={data} set={setField} />,
        <Step3 key={2} data={data} set={setField} />,
        <Step4 key={3} data={data} set={setField} />,
        <Step5 key={4} data={data} />,
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
                ::-webkit-scrollbar{width:5px}
                ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
                input::placeholder,textarea::placeholder{color:#b0c8b0}
                .step-content{animation:fadeSlide 0.3s ease both}
            `}</style>

            <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#ecf7ec 0%,#ddf0dd 45%,#cde8cd 100%)" }}>

                {/* Navbar */}
                <nav style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)", height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(45,138,45,0.1)", position: "sticky", top: 0, zIndex: 200 }}>
                    <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a6a1a" }}>
                        Chop<span style={{ color: "#f97316" }}>Spot</span>
                        <span style={{ color: "#9ab59a", fontWeight: 400, fontSize: 14, marginLeft: 8 }}>· Vendor Registration</span>
                    </span>
                </nav>

                <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 16px 72px" }}>
                    <div style={{ background: "white", borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.09)", overflow: "hidden" }}>

                        {/* Error Banner */}
                        {error && (
                            <div style={{ background: "#fee2e2", borderLeft: "4px solid #dc2626", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 18 }}>⚠️</span>
                                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#991b1b", flex: 1 }}>{error}</span>
                                <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 18, lineHeight: 1 }}>×</button>
                            </div>
                        )}

                        {/* Progress header */}
                        <div style={{ background: "linear-gradient(135deg,#155a15,#2d8a2d 55%,#3daa3d)", padding: "24px 28px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                {STEPS.map((s, i) => (
                                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%",
                                            background: i < step ? "rgba(255,255,255,0.92)" : i === step ? "white" : "rgba(255,255,255,0.2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: i < step ? 14 : 13,
                                            color: i <= step ? "#2d8a2d" : "rgba(255,255,255,0.45)",
                                            fontWeight: 800, fontFamily: "'Sora',sans-serif",
                                            boxShadow: i === step ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
                                            transition: "all 0.35s",
                                        }}>
                                            {i < step
                                                ? <svg width="14" height="14" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                : s.icon
                                            }
                                        </div>
                                        <span style={{ fontSize: 9, color: i === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, height: 5, overflow: "hidden" }}>
                                <div style={{ height: "100%", background: "white", borderRadius: 10, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
                            </div>
                            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "10px 0 0", textAlign: "center" }}>
                                Step {step + 1} of {STEPS.length} — <strong style={{ color: "white" }}>{STEPS[step].label}</strong>
                            </p>
                        </div>

                        {/* Step content */}
                        <div className="step-content" key={step} style={{ padding: "30px 28px 22px" }}>
                            {steps[step]}
                        </div>

                        {/* Nav buttons */}
                        <div style={{ padding: "0 28px 30px", display: "flex", gap: 12 }}>
                            {step > 0 && (
                                <button onClick={() => setStep(s => s - 1)} disabled={submitting} style={{
                                    flex: 1, padding: "14px", borderRadius: 50, border: "1.5px solid #d0e8d0",
                                    background: "white", color: "#2d8a2d", fontWeight: 700, fontSize: 14,
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    fontFamily: "'Sora',sans-serif", opacity: submitting ? 0.5 : 1,
                                }}
                                        onMouseEnter={e => !submitting && (e.currentTarget.style.background = "#f0f7f0")}
                                        onMouseLeave={e => !submitting && (e.currentTarget.style.background = "white")}
                                >← Back</button>
                            )}

                            {step < STEPS.length - 1 ? (
                                <button onClick={() => canAdvance(step, data) && setStep(s => s + 1)} style={{
                                    flex: 2, padding: "15px", borderRadius: 50, border: "none",
                                    background: canAdvance(step, data) ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d4e8d4",
                                    color: canAdvance(step, data) ? "white" : "#8aaa8a",
                                    fontWeight: 800, fontSize: 15,
                                    cursor: canAdvance(step, data) ? "pointer" : "not-allowed",
                                    fontFamily: "'Sora',sans-serif",
                                    boxShadow: canAdvance(step, data) ? "0 5px 20px rgba(45,138,45,0.32)" : "none",
                                    transition: "all 0.2s",
                                }}>Continue →</button>
                            ) : (
                                <button onClick={submit} disabled={submitting} style={{
                                    flex: 2, padding: "15px", borderRadius: 50, border: "none",
                                    background: submitting ? "#e0e8e0" : "linear-gradient(135deg,#f97316,#fb923c)",
                                    color: submitting ? "#aaa" : "white",
                                    fontWeight: 800, fontSize: 15,
                                    cursor: submitting ? "wait" : "pointer",
                                    fontFamily: "'Sora',sans-serif",
                                    boxShadow: submitting ? "none" : "0 5px 20px rgba(249,115,22,0.35)",
                                }}>
                                    {submitting ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30 30" />
                                            </svg>
                                            Submitting…
                                        </span>
                                    ) : "🚀 Submit & Go Live"}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}