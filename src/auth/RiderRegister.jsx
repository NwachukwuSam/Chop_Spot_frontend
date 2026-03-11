import { useState } from "react";

const BIKE_TYPES = ["Motorcycle", "Bicycle", "Tricycle (Keke)", "Scooter", "On Foot"];
const AVAILABILITY = ["Morning (6am–12pm)", "Afternoon (12pm–6pm)", "Evening (6pm–11pm)", "All Day", "Weekends Only"];
const STEPS = [
  { id: 0, label: "Personal",  icon: "👤" },
  { id: 1, label: "Vehicle",   icon: "🏍️" },
  { id: 2, label: "Logistics", icon: "📦" },
  { id: 3, label: "Review",    icon: "✅" },
];

// ── Shared input/label styles (mirrors vendor theme) ─────────────────────────
const inp = (extra = {}) => ({
  width: "100%", padding: "13px 16px", borderRadius: 14,
  border: "1.5px solid #d8eed8", background: "#f4f8f4",
  fontSize: 14, color: "#1a2e1a", fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box", transition: "all 0.2s",
  ...extra,
});
const lbl = {
  fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: "#5a7a5a",
  textTransform: "uppercase", display: "block", marginBottom: 6,
};
const foc = e => {
  e.target.style.borderColor = "#2d8a2d";
  e.target.style.boxShadow = "0 0 0 3px rgba(45,138,45,0.12)";
  e.target.style.background = "#fff";
};
const blr = e => {
  e.target.style.borderColor = "#d8eed8";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#f4f8f4";
};

// ── Shared small components ───────────────────────────────────────────────────
const Field = ({ label, children, style }) => (
  <div style={style}>
    <label style={lbl}>{label}</label>
    {children}
  </div>
);

const Chip = ({ label, active, onClick }) => (
  <div onClick={onClick} style={{
    padding: "7px 15px", borderRadius: 50, cursor: "pointer",
    fontSize: 13, fontWeight: 600, transition: "all 0.18s",
    background: active ? "#2d8a2d" : "#f0f7f0",
    color: active ? "white" : "#3a6a3a",
    border: `1.5px solid ${active ? "#2d8a2d" : "#d0e8d0"}`,
    boxShadow: active ? "0 3px 12px rgba(45,138,45,0.22)" : "none",
  }}>{label}</div>
);

const StepHeader = ({ emoji, title, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 26 }}>
    <div style={{ fontSize: 48, marginBottom: 10 }}>{emoji}</div>
    <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: "#1a2e1a", margin: "0 0 6px" }}>{title}</h2>
    <p style={{ color: "#7a9a7a", fontSize: 14, margin: 0 }}>{sub}</p>
  </div>
);

// ── Steps ─────────────────────────────────────────────────────────────────────
const Step1 = ({ data, set }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <StepHeader emoji="👤" title="Your Personal Details" sub="We'll use this to set up your rider profile" />

    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div onClick={() => document.getElementById("rider-avatar").click()} style={{
        width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
        background: data.avatarPreview ? "transparent" : "#e8f5e0",
        border: "2.5px dashed #7aaa7a", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d8a2d"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(45,138,45,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#7aaa7a"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {data.avatarPreview
          ? <img src={data.avatarPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
          : <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30 }}>📸</div>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "#7aaa7a", fontWeight: 700 }}>ADD PHOTO</p>
            </div>
        }
      </div>
      <input id="rider-avatar" type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) set("avatarPreview", URL.createObjectURL(f)); }} />
      <span style={{ fontSize: 11, color: "#9ab59a" }}>Profile photo (optional)</span>
    </div>

    <div style={{ display: "flex", gap: 12 }}>
      <Field label="First Name *" style={{ flex: 1 }}>
        <input value={data.firstName || ""} onChange={e => set("firstName", e.target.value)} placeholder="e.g. Emeka" style={inp()} onFocus={foc} onBlur={blr} />
      </Field>
      <Field label="Last Name *" style={{ flex: 1 }}>
        <input value={data.lastName || ""} onChange={e => set("lastName", e.target.value)} placeholder="e.g. Okafor" style={inp()} onFocus={foc} onBlur={blr} />
      </Field>
    </div>

    <Field label="WhatsApp Number *">
      <input value={data.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+234 800 000 0000" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Email (optional)">
      <input value={data.email || ""} onChange={e => set("email", e.target.value)} placeholder="you@example.com" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Home Address / Base Location">
      <input value={data.address || ""} onChange={e => set("address", e.target.value)} placeholder="e.g. Near Faculty Gate, OAU" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Gender">
      <div style={{ display: "flex", gap: 10 }}>
        {["Male", "Female", "Other"].map(g => <Chip key={g} label={g} active={data.gender === g} onClick={() => set("gender", g)} />)}
      </div>
    </Field>
  </div>
);

const Step2 = ({ data, set }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <StepHeader emoji="🏍️" title="Your Vehicle" sub="Tell us how you'll make deliveries" />

    <Field label="Vehicle Type *">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {BIKE_TYPES.map(t => <Chip key={t} label={t} active={data.vehicleType === t} onClick={() => set("vehicleType", t)} />)}
      </div>
    </Field>

    {data.vehicleType && data.vehicleType !== "On Foot" && (
      <>
        <Field label="Vehicle Make / Model">
          <input value={data.vehicleModel || ""} onChange={e => set("vehicleModel", e.target.value)} placeholder="e.g. Honda CB125, Bajaj Boxer" style={inp()} onFocus={foc} onBlur={blr} />
        </Field>
        <Field label="Plate Number (optional)">
          <input value={data.plateNumber || ""} onChange={e => set("plateNumber", e.target.value.toUpperCase())} placeholder="e.g. OY 234 ABC" style={{ ...inp(), letterSpacing: 2, textTransform: "uppercase" }} onFocus={foc} onBlur={blr} />
        </Field>
      </>
    )}

    <Field label="Vehicle Photo (optional)">
      <div onClick={() => document.getElementById("bike-photo").click()} style={{
        height: 130, borderRadius: 16, overflow: "hidden",
        background: data.bikePreview ? "transparent" : "#f0f7f0",
        border: "1.5px dashed #b8d8b8", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#2d8a2d"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#b8d8b8"}
      >
        {data.bikePreview
          ? <img src={data.bikePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="bike" />
          : <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36 }}>🏍️</div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#8aaa8a" }}>Click to upload photo</p>
            </div>
        }
      </div>
      <input id="bike-photo" type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) set("bikePreview", URL.createObjectURL(f)); }} />
    </Field>

    <Field label="Valid ID (NIN / Driver's License / School ID)">
      <input value={data.idType || ""} onChange={e => set("idType", e.target.value)} placeholder="e.g. Driver's License — LD 12345678" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>
  </div>
);

const Step3 = ({ data, set }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <StepHeader emoji="📦" title="Your Preferences" sub="Set your availability so we can match you to orders" />

    <Field label="Availability *">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {AVAILABILITY.map(a => (
          <Chip key={a} label={a}
            active={(data.availability || []).includes(a)}
            onClick={() => {
              const cur = data.availability || [];
              set("availability", cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
            }}
          />
        ))}
      </div>
    </Field>

    <Field label="Delivery Zone / Campus Area">
      <input value={data.zone || ""} onChange={e => set("zone", e.target.value)} placeholder="e.g. OAU Campus, Ile-Ife" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Bank Name">
      <input value={data.bankName || ""} onChange={e => set("bankName", e.target.value)} placeholder="e.g. First Bank, GTBank, Opay" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Account Number">
      <input type="tel" value={data.accountNumber || ""} onChange={e => set("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="0123456789" style={{ ...inp(), letterSpacing: 2 }} onFocus={foc} onBlur={blr} />
    </Field>

    <Field label="Account Name">
      <input value={data.accountName || ""} onChange={e => set("accountName", e.target.value)} placeholder="As on your bank account" style={inp()} onFocus={foc} onBlur={blr} />
    </Field>

    <div style={{ background: "#e8f5e0", border: "1.5px solid #b8d8b8", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 10 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
      <p style={{ margin: 0, fontSize: 13, color: "#4a7a4a", lineHeight: 1.65 }}>
        Your bank details are used for weekly earnings payouts. You can update this anytime from your profile.
      </p>
    </div>
  </div>
);

const Step4 = ({ data }) => {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "—";
  const sections = [
    { title: "Personal", icon: "👤", rows: [["Name", fullName], ["Phone", data.phone || "—"], ["Email", data.email || "—"], ["Gender", data.gender || "—"], ["Address", data.address || "—"]] },
    { title: "Vehicle", icon: "🏍️", rows: [["Type", data.vehicleType || "—"], ...(data.vehicleModel ? [["Model", data.vehicleModel]] : []), ...(data.plateNumber ? [["Plate", data.plateNumber]] : []), ...(data.idType ? [["ID", data.idType]] : [])] },
    { title: "Preferences", icon: "📦", rows: [["Availability", (data.availability || []).join(", ") || "—"], ["Zone", data.zone || "—"]] },
    { title: "Payout", icon: "🏦", rows: [["Bank", data.bankName || "—"], ["Account No.", data.accountNumber || "—"], ["Account Name", data.accountName || "—"]] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StepHeader emoji="✅" title="Almost there!" sub="Review your details before going live" />

      {data.avatarPreview && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={data.avatarPreview} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #b8d8b8", boxShadow: "0 4px 16px rgba(45,138,45,0.15)" }} alt="avatar" />
        </div>
      )}

      {sections.map(s => (
        <div key={s.title} style={{ background: "#f8faf8", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e0eee0" }}>
          <div style={{ background: "linear-gradient(135deg,#e8f5e0,#d4edda)", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
            <span>{s.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#1a6a1a", letterSpacing: 0.8 }}>{s.title}</span>
          </div>
          {s.rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid #f0f7f0", fontSize: 13 }}>
              <span style={{ color: "#7a9a7a", fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{k}</span>
              <span style={{ color: "#1a2e1a", fontWeight: 600, textAlign: "right", wordBreak: "break-word", maxWidth: "62%" }}>{v}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: "#e8f5e0", border: "1.5px solid #b8d8b8", borderRadius: 14, padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#4a7a4a", lineHeight: 1.7 }}>
          By registering, you agree to ChopSpot's Rider Terms of Service. You'll receive order notifications via WhatsApp. Earnings are paid weekly to your registered bank account.
        </p>
      </div>
    </div>
  );
};

// ── Success ───────────────────────────────────────────────────────────────────
const SuccessScreen = ({ name }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(155deg,#ecf7ec,#cde8cd)", padding: 20 }}>
    <div style={{ background: "white", borderRadius: 28, padding: "52px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.1)", animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#2d8a2d,#4caf50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 44, boxShadow: "0 8px 30px rgba(45,138,45,0.35)" }}>🏍️</div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: "#1a2e1a", margin: "0 0 10px" }}>You're on the road!</h2>
      <p style={{ color: "#5a7a5a", fontSize: 15, margin: "0 0 6px" }}>Welcome, <strong style={{ color: "#2d8a2d" }}>{name}</strong>!</p>
      <p style={{ color: "#9ab59a", fontSize: 13, marginBottom: 24 }}>Setting up your rider dashboard…</p>
      <div style={{ height: 5, background: "#e8f5e0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#2d8a2d,#4caf50)", borderRadius: 10, animation: "loadBar 1.8s linear forwards" }} />
      </div>
    </div>
  </div>
);

const canAdvance = (step, data) => {
  if (step === 0) return !!(data.firstName?.trim() && data.lastName?.trim() && data.phone?.trim());
  if (step === 1) return !!data.vehicleType;
  if (step === 2) return !!(data.availability?.length);
  return true;
};

export default function RiderRegister({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ availability: [] });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const submit = () => {
    setSubmitting(true);
    const rider = {
      ...data,
      id: `rider-${Date.now()}`,
      fullName: `${data.firstName} ${data.lastName}`,
      isOnline: false,
      totalDeliveries: 0,
      earnings: 0,
      rating: 4.8,
      registeredAt: new Date().toISOString(),
      completedOrders: [],
    };
    try { localStorage.setItem("chopspot_rider", JSON.stringify(rider)); } catch (_) {}
    setTimeout(() => { setDone(true); setTimeout(() => onSuccess?.(rider), 1800); }, 600);
  };

  const steps = [
    <Step1 key={0} data={data} set={set} />,
    <Step2 key={1} data={data} set={set} />,
    <Step3 key={2} data={data} set={set} />,
    <Step4 key={3} data={data} />,
  ];

  if (done) return <SuccessScreen name={data.firstName} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;}
        @keyframes popIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#b0d5b0;border-radius:10px}
        input::placeholder,textarea::placeholder{color:#aac5aa}
        select{cursor:pointer}
        .step-anim{animation:slideUp 0.3s ease both}
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#ecf7ec 0%,#ddf0dd 45%,#cde8cd 100%)" }}>

        {/* Nav */}
        <nav style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)", height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(45,138,45,0.1)", position: "sticky", top: 0, zIndex: 200 }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#1a6a1a" }}>
            Chop<span style={{ color: "#f97316" }}>Spot</span>
            <span style={{ color: "#9ab59a", fontWeight: 400, fontSize: 14, marginLeft: 8 }}>· Rider Registration</span>
          </span>
        </nav>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 72px" }}>
          <div style={{ background: "white", borderRadius: 28, boxShadow: "0 20px 80px rgba(0,0,0,0.09)", overflow: "hidden" }}>

            {/* Green progress header */}
            <div style={{ background: "linear-gradient(135deg,#155a15,#2d8a2d 55%,#3daa3d)", padding: "24px 28px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: i < step ? "rgba(255,255,255,0.92)" : i === step ? "white" : "rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: i <= step ? "#2d8a2d" : "rgba(255,255,255,0.45)",
                      fontSize: i < step ? 14 : 16, fontWeight: 800,
                      boxShadow: i === step ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
                      transition: "all 0.35s",
                    }}>
                      {i < step
                        ? <svg width="14" height="14" fill="#2d8a2d" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        : s.icon
                      }
                    </div>
                    <span style={{ fontSize: 9, color: i === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</span>
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

            {/* Content */}
            <div className="step-anim" key={step} style={{ padding: "30px 28px 22px" }}>
              {steps[step]}
            </div>

            {/* Buttons */}
            <div style={{ padding: "0 28px 30px", display: "flex", gap: 12 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "14px", borderRadius: 50, border: "1.5px solid #d0e8d0", background: "white", color: "#2d8a2d", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Sora',sans-serif", transition: "all 0.18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7f0"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => canAdvance(step, data) && setStep(s => s + 1)} style={{
                  flex: 2, padding: "15px", borderRadius: 50, border: "none",
                  background: canAdvance(step, data) ? "linear-gradient(135deg,#2d8a2d,#4caf50)" : "#d4e8d4",
                  color: canAdvance(step, data) ? "white" : "#8aaa8a",
                  fontWeight: 800, fontSize: 15, cursor: canAdvance(step, data) ? "pointer" : "not-allowed",
                  fontFamily: "'Sora',sans-serif",
                  boxShadow: canAdvance(step, data) ? "0 5px 20px rgba(45,138,45,0.32)" : "none",
                  transition: "all 0.2s",
                }}>Continue →</button>
              ) : (
                <button onClick={submit} disabled={submitting} style={{
                  flex: 2, padding: "15px", borderRadius: 50, border: "none",
                  background: submitting ? "#e8e8e8" : "linear-gradient(135deg,#f97316,#fb923c)",
                  color: submitting ? "#aaa" : "white",
                  fontWeight: 800, fontSize: 15, cursor: submitting ? "wait" : "pointer",
                  fontFamily: "'Sora',sans-serif",
                  boxShadow: submitting ? "none" : "0 5px 20px rgba(249,115,22,0.35)",
                  transition: "all 0.2s",
                }}>{submitting ? "Submitting…" : "🚀 Start Riding!"}</button>
              )}
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#8aaa8a" }}>
            Already registered? Your profile is saved automatically.
          </p>
        </div>
      </div>
    </>
  );
}