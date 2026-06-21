import { useEffect } from "react";

export const VendorClosedModal = ({ vendor, onClose }) => {
    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1100,
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
                    borderRadius: 24,
                    width: "100%",
                    maxWidth: 380,
                    padding: "32px 28px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
                    animation: "mIn 0.3s cubic-bezier(.34,1.56,.64,1)",
                    textAlign: "center",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {vendor?.image ? (
                    <img
                        src={vendor.image}
                        alt={vendor.name}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid #e8f5e0",
                            marginBottom: 16,
                            filter: "grayscale(60%)",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#e8f5e0,#c8e6c8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 32,
                            margin: "0 auto 16px",
                        }}
                    >
                        🍽️
                    </div>
                )}

                <h3
                    style={{
                        fontFamily: "'Sora',sans-serif",
                        fontWeight: 800,
                        fontSize: 20,
                        color: "#1a2e1a",
                        margin: "0 0 8px",
                    }}
                >
                    {vendor?.name || "This vendor"}
                </h3>

                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#fee2e2",
                        borderRadius: 20,
                        padding: "4px 14px",
                        marginBottom: 16,
                    }}
                >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", fontFamily: "'DM Sans',sans-serif" }}>CLOSED</span>
                </div>

                <p
                    style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 15,
                        color: "#5a7a5a",
                        lineHeight: 1.6,
                        margin: "0 0 24px",
                    }}
                >
                    This vendor is currently closed. Check back later 🙏
                </p>

                <button
                    onClick={onClose}
                    style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 50,
                        border: "none",
                        background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                        color: "white",
                        fontFamily: "'Sora',sans-serif",
                        fontWeight: 800,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(45,138,45,0.3)",
                        transition: "transform 0.18s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                    Got it
                </button>
            </div>
        </div>
    );
};
