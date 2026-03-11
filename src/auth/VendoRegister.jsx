import { useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Nigerian", "Continental", "Fast Food", "Grills & BBQ",
  "Street Food", "Soups & Swallow", "Pastries & Drinks",
  "Healthy Bowls", "Seafood", "Snacks & Sides",
];

const PRESET_PACKAGES = [
  { id: "plastic",     name: "Plastic Container",    price: 200 },
  { id: "disposable",  name: "Disposable Takeaway",  price: 100 },
  { id: "nylon",       name: "Just Nylon",            price: 0   },
  { id: "foil",        name: "Foil Wrap",             price: 50  },
  { id: "styrofoam",   name: "Styrofoam Pack",        price: 150 },
  { id: "luxury",      name: "Luxury Box",            price: 500 },
  { id: "eco",         name: "Eco Compostable Box",   price: 300 },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const STEPS = [
  { id: 0, label: "Business",  icon: "🏪" },
  { id: 1, label: "Location",  icon: "📍" },
  { id: 2, label: "Packaging", icon: "📦" },
  { id: 3, label: "Menu",      icon: "🍽️" },
  { id: 4, label: "Review",    icon: "✅" },
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

// ─── Step 1 : Business Info ───────────────────────────────────────────────────
const Step1 = ({ data, set }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
    <Header emoji="🏪" title="Tell us about your business" sub="This is what hungry customers will see on ChopSpot" />

    {/* Logo upload */}
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <label style={lbl}>Restaurant Photo / Logo</label>
      <div
        onClick={() => document.getElementById("logo-inp").click()}
        style={{
          width:110, height:110, borderRadius:24, overflow:"hidden",
          background: data.logoPreview ? "transparent" : "#edf7ed",
          border:"2.5px dashed #8ac88a", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"border-color 0.2s",
        }}
        onMouseEnter={e=>e.currentTarget.style.borderColor="#2d8a2d"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="#8ac88a"}
      >
        {data.logoPreview
          ? <img src={data.logoPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="logo"/>
          : <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:32 }}>📸</div>
              <p style={{ margin:"4px 0 0", fontSize:11, color:"#7aaa7a", fontWeight:600 }}>Upload</p>
            </div>
        }
      </div>
      <input id="logo-inp" type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => {
          const f = e.target.files[0];
          if (f) set("logoPreview", URL.createObjectURL(f));
        }}
      />
      <span style={{ fontSize:11, color:"#9ab59a" }}>JPG · PNG · up to 5 MB</span>
    </div>

    <Field label="Restaurant / Business Name *">
      <input value={data.name||""} onChange={e=>set("name",e.target.value)}
        placeholder="e.g. Mama Titi's Kitchen" style={inp()} onFocus={focus} onBlur={blur}/>
    </Field>

    <Field label="Category *">
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {CATEGORIES.map(c => (
          <Chip key={c} label={c} active={data.category===c} onClick={()=>set("category",c)} />
        ))}
      </div>
    </Field>

    <Field label="Short Description">
      <textarea value={data.description||""} onChange={e=>set("description",e.target.value)}
        placeholder="Tell customers what makes your food special…" rows={3}
        style={{ ...inp(), resize:"none", lineHeight:1.65 }} onFocus={focus} onBlur={blur}
      />
    </Field>

    <div style={{ display:"flex", gap:12 }}>
      <Field label="WhatsApp / Phone *" style={{ flex:1 }}>
        <input value={data.phone||""} onChange={e=>set("phone",e.target.value)}
          placeholder="+234…" style={inp()} onFocus={focus} onBlur={blur}/>
      </Field>
      <Field label="Email (optional)" style={{ flex:1 }}>
        <input value={data.email||""} onChange={e=>set("email",e.target.value)}
          placeholder="you@example.com" style={inp()} onFocus={focus} onBlur={blur}/>
      </Field>
    </div>
  </div>
);

// ─── Step 2 : Location & Hours ────────────────────────────────────────────────
const Step2 = ({ data, set }) => {
  const toggleDay = d => {
    const cur = data.openDays || [];
    set("openDays", cur.includes(d) ? cur.filter(x=>x!==d) : [...cur, d]);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Header emoji="📍" title="Where are you located?" sub="Help customers find you easily" />

      <Field label="Full Address *">
        <input value={data.address||""} onChange={e=>set("address",e.target.value)}
          placeholder="e.g. Block C, Faculty Canteen Area" style={inp()} onFocus={focus} onBlur={blur}/>
      </Field>
      <Field label="Landmark / More Details">
        <input value={data.landmark||""} onChange={e=>set("landmark",e.target.value)}
          placeholder="e.g. Opposite the library, beside ATM" style={inp()} onFocus={focus} onBlur={blur}/>
      </Field>

      <Field label="Open Days *">
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {DAYS.map(d => (
            <div key={d} onClick={()=>toggleDay(d)} style={{
              width:46, height:46, borderRadius:13, display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer", fontSize:12, fontWeight:700,
              background: (data.openDays||[]).includes(d) ? "#2d8a2d" : "#f0f7f0",
              color: (data.openDays||[]).includes(d) ? "white" : "#4a7a4a",
              border:`1.5px solid ${(data.openDays||[]).includes(d) ? "#2d8a2d" : "#d0e8d0"}`,
              transition:"all 0.18s",
            }}>{d}</div>
          ))}
        </div>
      </Field>

      <div style={{ display:"flex", gap:12 }}>
        <Field label="Opening Time *" style={{ flex:1 }}>
          <input type="time" value={data.openTime||"08:00"} onChange={e=>set("openTime",e.target.value)}
            style={inp()} onFocus={focus} onBlur={blur}/>
        </Field>
        <Field label="Closing Time *" style={{ flex:1 }}>
          <input type="time" value={data.closeTime||"20:00"} onChange={e=>set("closeTime",e.target.value)}
            style={inp()} onFocus={focus} onBlur={blur}/>
        </Field>
      </div>

      <Field label="Minimum Delivery Price (₦) *">
        <input type="number" value={data.deliveryFrom||""} onChange={e=>set("deliveryFrom",e.target.value)}
          placeholder="e.g. 300" style={inp()} onFocus={focus} onBlur={blur}/>
      </Field>
    </div>
  );
};

// ─── Step 3 : Packaging ───────────────────────────────────────────────────────
const Step3 = ({ data, set }) => {
  const [custom, setCustom] = useState({ name:"", price:"" });

  const toggle = pkg => {
    const cur = data.packages || [];
    set("packages", cur.find(p=>p.id===pkg.id) ? cur.filter(p=>p.id!==pkg.id) : [...cur, pkg]);
  };

  const addCustom = () => {
    if (!custom.name.trim()) return;
    const p = { id:`custom-${Date.now()}`, name:custom.name, price:Number(custom.price)||0 };
    set("packages", [...(data.packages||[]), p]);
    setCustom({ name:"", price:"" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Header emoji="📦" title="Packaging Options" sub="Choose every pack type you offer customers" />

      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {PRESET_PACKAGES.map(pkg => {
          const on = (data.packages||[]).find(p=>p.id===pkg.id);
          return (
            <div key={pkg.id} onClick={()=>toggle(pkg)} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 18px", borderRadius:15, cursor:"pointer",
              background: on ? "#eaf6ea" : "#f7fbf7",
              border:`2px solid ${on ? "#2d8a2d" : "#e2ebe2"}`,
              transition:"all 0.18s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Radio on={!!on} />
                <span style={{ fontWeight:600, fontSize:14, color:"#1a2e1a" }}>{pkg.name}</span>
              </div>
              <span style={{ fontWeight:700, color:"#f97316", fontSize:14 }}>
                {pkg.price === 0 ? "Free" : `₦${pkg.price}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Custom package */}
      <div style={{ background:"#f7fbf7", borderRadius:16, padding:16, border:"1.5px dashed #b8d8b8" }}>
        <p style={{ ...lbl, marginBottom:10 }}>➕ Add Custom Package</p>
        <div style={{ display:"flex", gap:8 }}>
          <input value={custom.name} onChange={e=>setCustom(p=>({...p,name:e.target.value}))}
            placeholder="Package name" style={{ ...inp(), flex:2, padding:"11px 13px" }}
            onFocus={focus} onBlur={blur}
          />
          <input type="number" value={custom.price} onChange={e=>setCustom(p=>({...p,price:e.target.value}))}
            placeholder="₦ price" style={{ ...inp(), flex:1, padding:"11px 13px" }}
            onFocus={focus} onBlur={blur}
          />
          <button onClick={addCustom} style={{
            padding:"0 18px", borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white",
            fontWeight:800, fontSize:20, cursor:"pointer", flexShrink:0,
          }}>+</button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 4 : Menu ────────────────────────────────────────────────────────────
const Step4 = ({ data, set }) => {
  const [catName, setCatName] = useState("");
  const [pendingItem, setPending] = useState({ catId:null, name:"", price:"" });

  const addCat = () => {
    if (!catName.trim()) return;
    set("menuCategories", [...(data.menuCategories||[]), { id:`cat-${Date.now()}`, name:catName, items:[] }]);
    setCatName("");
  };

  const addItem = (catId) => {
    if (!pendingItem.name.trim() || !pendingItem.price) return;
    const item = { id:`item-${Date.now()}`, name:pendingItem.name, price:Number(pendingItem.price), available:true };
    set("menuCategories", (data.menuCategories||[]).map(c => c.id===catId ? {...c, items:[...c.items, item]} : c));
    setPending({ catId:null, name:"", price:"" });
  };

  const removeItem = (catId, itemId) =>
    set("menuCategories", (data.menuCategories||[]).map(c =>
      c.id===catId ? {...c, items:c.items.filter(i=>i.id!==itemId)} : c
    ));

  const removeCat = id =>
    set("menuCategories", (data.menuCategories||[]).filter(c=>c.id!==id));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Header emoji="🍽️" title="Build Your Menu" sub="Add categories then load each one with food items" />

      {/* Add category */}
      <div style={{ background:"#f7fbf7", borderRadius:16, padding:16, border:"1.5px solid #e2ebe2" }}>
        <p style={{ ...lbl, marginBottom:10 }}>New Category</p>
        <div style={{ display:"flex", gap:8 }}>
          <input value={catName} onChange={e=>setCatName(e.target.value)}
            placeholder="e.g. Main Dishes, Proteins, Extras…"
            style={{ ...inp(), flex:1, padding:"11px 13px" }}
            onFocus={focus} onBlur={blur}
            onKeyDown={e => e.key==="Enter" && addCat()}
          />
          <button onClick={addCat} style={{
            padding:"0 20px", borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#2d8a2d,#4caf50)", color:"white",
            fontWeight:800, fontSize:18, cursor:"pointer", flexShrink:0,
          }}>+</button>
        </div>
      </div>

      {!(data.menuCategories||[]).length && (
        <div style={{ textAlign:"center", padding:"28px 0", color:"#aac5aa" }}>
          <p style={{ fontSize:36 }}>📋</p>
          <p style={{ fontWeight:700, fontSize:14, marginTop:10 }}>No categories yet</p>
          <p style={{ fontSize:13 }}>Add a category above to start loading your menu</p>
        </div>
      )}

      {(data.menuCategories||[]).map(cat => (
        <div key={cat.id} style={{ background:"white", borderRadius:18, border:"1.5px solid #e2ebe2", overflow:"hidden" }}>
          {/* Cat header */}
          <div style={{ background:"linear-gradient(135deg,#e8f5e0,#d4edda)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontWeight:800, fontSize:12, color:"#1a6a1a", letterSpacing:1, textTransform:"uppercase" }}>
              🍽 {cat.name}
              <span style={{ marginLeft:8, fontWeight:400, color:"#5a8a5a", fontSize:11, textTransform:"none" }}>
                ({cat.items.length} items)
              </span>
            </span>
            <button onClick={()=>removeCat(cat.id)} style={{ background:"rgba(200,50,50,0.1)", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer", color:"#c0392b", fontWeight:700, fontSize:11 }}>Remove</button>
          </div>

          {/* Items list */}
          {cat.items.map(item => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 16px", borderBottom:"1px solid #f2f7f2" }}>
              <div>
                <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#1a2e1a" }}>{item.name}</p>
                <p style={{ margin:"2px 0 0", fontSize:13, color:"#2d8a2d", fontWeight:700 }}>₦{Number(item.price).toLocaleString()}</p>
              </div>
              <button onClick={()=>removeItem(cat.id,item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:20 }}>×</button>
            </div>
          ))}

          {/* Add item row */}
          <div style={{ padding:"11px 14px", background:"#fafcfa" }}>
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={pendingItem.catId===cat.id ? pendingItem.name : ""}
                onChange={e => setPending({ catId:cat.id, name:e.target.value, price: pendingItem.catId===cat.id ? pendingItem.price : "" })}
                placeholder="Item name…"
                style={{ ...inp(), flex:2, padding:"9px 12px", fontSize:13 }}
                onFocus={focus} onBlur={blur}
              />
              <input
                type="number"
                value={pendingItem.catId===cat.id ? pendingItem.price : ""}
                onChange={e => setPending(p=>({ ...p, catId:cat.id, price:e.target.value }))}
                placeholder="₦"
                style={{ ...inp(), flex:1, padding:"9px 12px", fontSize:13 }}
                onFocus={focus} onBlur={blur}
              />
              <button
                onClick={() => {
                  if (pendingItem.catId !== cat.id) { setPending({ catId:cat.id, name:"", price:"" }); }
                  else { addItem(cat.id); }
                }}
                style={{ padding:"0 14px", borderRadius:10, border:"none", background:"#2d8a2d", color:"white", fontWeight:800, fontSize:18, cursor:"pointer", flexShrink:0 }}
              >+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Step 5 : Review ─────────────────────────────────────────────────────────
const Step5 = ({ data }) => {
  const totalItems = (data.menuCategories||[]).reduce((a,c)=>a+c.items.length, 0);
  const sections = [
    { title:"Business Info", icon:"🏪", rows:[
      ["Name", data.name||"—"],
      ["Category", data.category||"—"],
      ["Phone", data.phone||"—"],
      ...(data.email ? [["Email", data.email]] : []),
      ["Description", data.description||"—"],
    ]},
    { title:"Location & Hours", icon:"📍", rows:[
      ["Address", data.address||"—"],
      ...(data.landmark ? [["Landmark", data.landmark]] : []),
      ["Open Days", (data.openDays||[]).join(", ")||"—"],
      ["Hours", data.openTime&&data.closeTime ? `${data.openTime} – ${data.closeTime}` : "—"],
      ["Delivery from", data.deliveryFrom ? `₦${data.deliveryFrom}` : "—"],
    ]},
    { title:"Packaging", icon:"📦", rows: (data.packages||[]).map(p=>[p.name, p.price===0?"Free":`₦${p.price}`]) },
    { title:"Menu", icon:"🍽️", rows:[
      ["Categories", String((data.menuCategories||[]).length)],
      ["Total Items", String(totalItems)],
    ]},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Header emoji="✅" title="Review your profile" sub="Everything look good? Hit submit to go live!" />

      {/* Logo preview */}
      {data.logoPreview && (
        <div style={{ display:"flex", justifyContent:"center" }}>
          <img src={data.logoPreview} style={{ width:80, height:80, borderRadius:20, objectFit:"cover", border:"3px solid #e0eee0" }} alt="logo"/>
        </div>
      )}

      {sections.map(s => (
        <div key={s.title} style={{ background:"#f7fbf7", borderRadius:16, overflow:"hidden", border:"1.5px solid #e2ebe2" }}>
          <div style={{ background:"linear-gradient(135deg,#e8f5e0,#d4edda)", padding:"10px 16px", display:"flex", gap:8, alignItems:"center" }}>
            <span>{s.icon}</span>
            <span style={{ fontWeight:700, fontSize:12, color:"#1a6a1a", letterSpacing:0.8 }}>{s.title}</span>
          </div>
          {s.rows.length === 0 && (
            <p style={{ padding:"12px 16px", fontSize:13, color:"#aaa", margin:0 }}>Nothing added yet</p>
          )}
          {s.rows.map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 16px", borderBottom:"1px solid #f0f7f0", fontSize:13 }}>
              <span style={{ color:"#7a9a7a", fontWeight:600, flexShrink:0, marginRight:12 }}>{k}</span>
              <span style={{ color:"#1a2e1a", fontWeight:600, textAlign:"right", wordBreak:"break-word", maxWidth:"62%" }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Small shared components ──────────────────────────────────────────────────
const Header = ({ emoji, title, sub }) => (
  <div style={{ textAlign:"center", marginBottom:4 }}>
    <div style={{ fontSize:46, marginBottom:10 }}>{emoji}</div>
    <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:"#1a2e1a", margin:"0 0 5px" }}>{title}</h2>
    <p style={{ color:"#7a9a7a", fontSize:14, margin:0 }}>{sub}</p>
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
    padding:"7px 15px", borderRadius:50, cursor:"pointer", fontSize:13, fontWeight:600,
    background: active ? "#2d8a2d" : "#f0f7f0",
    color: active ? "white" : "#3a6a3a",
    border:`1.5px solid ${active ? "#2d8a2d" : "#d0e8d0"}`,
    transition:"all 0.18s",
  }}>{label}</div>
);

const Radio = ({ on }) => (
  <div style={{
    width:22, height:22, borderRadius:"50%", flexShrink:0,
    border:`2px solid ${on ? "#2d8a2d" : "#c0d5c0"}`,
    background: on ? "#2d8a2d" : "transparent",
    display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s",
  }}>
    {on && <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
  </div>
);

// ─── Validation per step ──────────────────────────────────────────────────────
const canAdvance = (step, data) => {
  if (step === 0) return !!(data.name?.trim() && data.category && data.phone?.trim());
  if (step === 1) return !!(data.address?.trim() && (data.openDays||[]).length && data.deliveryFrom);
  if (step === 2) return (data.packages||[]).length > 0;
  if (step === 3) return (data.menuCategories||[]).some(c=>c.items.length>0);
  return true;
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function VendorRegister({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ openDays:[], packages:[], menuCategories:[] });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const setField = (k, v) => setData(p => ({ ...p, [k]:v }));

  const submit = () => {
    setSubmitting(true);
    const vendor = {
      ...data,
      id: `v-${Date.now()}`,
      rating: 4.5,
      isOpen: true,
      totalOrders: 0,
      registeredAt: new Date().toISOString(),
      // Generate demo orders for a richer initial dashboard
      orders: DEMO_ORDERS(data.name || "Your Restaurant"),
    };
    try {
      localStorage.setItem("chopspot_vendor", JSON.stringify(vendor));
    } catch(_) {}
    setTimeout(() => { setDone(true); setTimeout(() => onSuccess?.(vendor), 1800); }, 600);
  };

  const steps = [
    <Step1 key={0} data={data} set={setField} />,
    <Step2 key={1} data={data} set={setField} />,
    <Step3 key={2} data={data} set={setField} />,
    <Step4 key={3} data={data} set={setField} />,
    <Step5 key={4} data={data} />,
  ];

  if (done) return <SuccessScreen name={data.name} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
        input::placeholder,textarea::placeholder{color:#b0c8b0}
        select{cursor:pointer}
        .step-content{animation:fadeSlide 0.3s ease both}
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#ecf7ec 0%,#ddf0dd 45%,#cde8cd 100%)" }}>

        {/* ── Navbar ── */}
        <nav style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(18px)", height:60, display:"flex", alignItems:"center", justifyContent:"center", borderBottom:"1px solid rgba(45,138,45,0.1)", position:"sticky", top:0, zIndex:200 }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:"#1a6a1a" }}>
            Chop<span style={{ color:"#f97316" }}>Spot</span>
            <span style={{ color:"#9ab59a", fontWeight:400, fontSize:14, marginLeft:8 }}>· Vendor Registration</span>
          </span>
        </nav>

        <div style={{ maxWidth:580, margin:"0 auto", padding:"32px 16px 72px" }}>
          <div style={{ background:"white", borderRadius:28, boxShadow:"0 24px 80px rgba(0,0,0,0.09)", overflow:"hidden" }}>

            {/* ── Progress header ── */}
            <div style={{ background:"linear-gradient(135deg,#155a15,#2d8a2d 55%,#3daa3d)", padding:"24px 28px 20px" }}>
              {/* Step dots */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                {STEPS.map((s,i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1 }}>
                    <div style={{
                      width:36, height:36, borderRadius:"50%",
                      background: i<step ? "rgba(255,255,255,0.92)" : i===step ? "white" : "rgba(255,255,255,0.2)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize: i<step ? 14 : 13,
                      color: i<=step ? "#2d8a2d" : "rgba(255,255,255,0.45)",
                      fontWeight:800, fontFamily:"'Sora',sans-serif",
                      boxShadow: i===step ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
                      transition:"all 0.35s",
                    }}>
                      {i < step
                        ? <svg width="14" height="14" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        : s.icon
                      }
                    </div>
                    <span style={{ fontSize:9, color: i===step?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.4)", fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:10, height:5, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"white", borderRadius:10, width:`${(step/(STEPS.length-1))*100}%`, transition:"width 0.4s ease" }}/>
              </div>
              <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12, margin:"10px 0 0", textAlign:"center" }}>
                Step {step+1} of {STEPS.length} — <strong style={{ color:"white" }}>{STEPS[step].label}</strong>
              </p>
            </div>

            {/* ── Step content ── */}
            <div className="step-content" key={step} style={{ padding:"30px 28px 22px" }}>
              {steps[step]}
            </div>

            {/* ── Nav buttons ── */}
            <div style={{ padding:"0 28px 30px", display:"flex", gap:12 }}>
              {step > 0 && (
                <button onClick={()=>setStep(s=>s-1)} style={{
                  flex:1, padding:"14px", borderRadius:50, border:"1.5px solid #d0e8d0",
                  background:"white", color:"#2d8a2d", fontWeight:700, fontSize:14,
                  cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f7f0"}
                  onMouseLeave={e=>e.currentTarget.style.background="white"}
                >← Back</button>
              )}

              {step < STEPS.length-1
                ? (
                  <button onClick={()=>canAdvance(step,data) && setStep(s=>s+1)} style={{
                    flex:2, padding:"15px", borderRadius:50, border:"none",
                    background: canAdvance(step,data) ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d4e8d4",
                    color: canAdvance(step,data) ? "white" : "#8aaa8a",
                    fontWeight:800, fontSize:15, cursor: canAdvance(step,data) ? "pointer" : "not-allowed",
                    fontFamily:"'Sora',sans-serif",
                    boxShadow: canAdvance(step,data) ? "0 5px 20px rgba(45,138,45,0.32)" : "none",
                    transition:"all 0.2s",
                  }}>Continue →</button>
                )
                : (
                  <button onClick={submit} disabled={submitting} style={{
                    flex:2, padding:"15px", borderRadius:50, border:"none",
                    background: submitting ? "#e0e8e0" : "linear-gradient(135deg,#f97316,#fb923c)",
                    color: submitting ? "#aaa" : "white",
                    fontWeight:800, fontSize:15, cursor: submitting ? "wait" : "pointer",
                    fontFamily:"'Sora',sans-serif",
                    boxShadow: submitting ? "none" : "0 5px 20px rgba(249,115,22,0.35)",
                  }}>
                    {submitting ? "Submitting…" : "🚀 Submit & Go Live"}
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ name }) => (
  <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(155deg,#ecf7ec,#cde8cd)", padding:20 }}>
    <div style={{ background:"white", borderRadius:28, padding:"52px 44px", maxWidth:400, width:"100%", textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,0.1)", animation:"popIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
      <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#2d8a2d,#4caf50)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", fontSize:44 }}>🎉</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:26, color:"#1a2e1a", margin:"0 0 10px" }}>Welcome aboard!</h2>
      <p style={{ color:"#5a7a5a", fontSize:15, margin:"0 0 6px" }}>
        <strong>{name}</strong> is now listed on ChopSpot.
      </p>
      <p style={{ color:"#9ab59a", fontSize:13, marginBottom:22 }}>Opening your vendor dashboard…</p>
      <div style={{ height:5, background:"#e8f5e0", borderRadius:10, overflow:"hidden" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#2d8a2d,#4caf50)", borderRadius:10, animation:"loadBar 1.8s linear forwards" }}/>
      </div>
    </div>
  </div>
);

// ─── Seed demo orders so dashboard isn't empty ────────────────────────────────
function DEMO_ORDERS(vendorName) {
  const now = Date.now();
  return [
    {
      id:"ORD-8821", date:new Date(now-1000*60*14).toISOString(),
      customer:"Aisha Bello", whatsapp:"+234 812 000 0001",
      location:"Hall 2 Block B, Room 204", status:"Pending",
      paymentMethod:"Transfer", total:2450,
      items:[{name:"White Rice + Chicken",qty:2,price:900},{name:"Peppered Gizzard",qty:1,price:650}],
      pack:{name:"Plastic Container", price:200},
    },
    {
      id:"ORD-8820", date:new Date(now-1000*60*60*2).toISOString(),
      customer:"Emeka Okonkwo", whatsapp:"+234 803 000 0002",
      location:"Porter's Lodge, collect at gate", status:"Delivered",
      paymentMethod:"Card", total:1800,
      items:[{name:"Jollof Rice + Beef",qty:1,price:1100},{name:"Fried Plantain",qty:1,price:400}],
      pack:{name:"Disposable Takeaway", price:100},
    },
    {
      id:"ORD-8819", date:new Date(now-1000*60*60*5).toISOString(),
      customer:"Funmilayo Adeyemi", whatsapp:"+234 705 000 0003",
      location:"Faculty Area, Dept of Law", status:"Delivered",
      paymentMethod:"USSD", total:3200,
      items:[{name:"Pounded Yam + Egusi",qty:2,price:1300},{name:"Assorted Meat",qty:1,price:900}],
      pack:{name:"Styrofoam Pack", price:150},
    },
    {
      id:"ORD-8818", date:new Date(now-1000*60*60*24).toISOString(),
      customer:"Chukwudi Eze", whatsapp:"+234 816 000 0004",
      location:"Hall 1, Room 108", status:"Cancelled",
      paymentMethod:"Card", total:1550,
      items:[{name:"Fried Rice + Turkey",qty:1,price:1200}],
      pack:{name:"Foil Wrap", price:50},
    },
    {
      id:"ORD-8817", date:new Date(now-1000*60*60*26).toISOString(),
      customer:"Ngozi Okafor", whatsapp:"+234 809 000 0005",
      location:"Hall 2 Block A, Room 312", status:"Delivered",
      paymentMethod:"Transfer", total:2700,
      items:[{name:"Banga Soup + Starch",qty:1,price:1600},{name:"Goat Meat",qty:2,price:700}],
      pack:{name:"Plastic Container", price:200},
    },
  ];
}