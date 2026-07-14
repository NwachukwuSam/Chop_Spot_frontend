import { useState, useEffect } from "react";

// Detects iOS devices (iPhone/iPad/iPod), including iPadOS 13+ which
// reports as "MacIntel" but has touch support.
function isIosDevice() {
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const iPadOS13Up = ua.includes("Macintosh") && "ontouchend" in document;
    return iOS || iPadOS13Up;
}

// Detects if the app is already running installed (standalone) so we can
// hide the button entirely once installed.
function isStandalone() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true // iOS Safari-specific flag
    );
}

export function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIos, setIsIos] = useState(false);
    const [showIosHint, setShowIosHint] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        setIsIos(isIosDevice());
        setInstalled(isStandalone());

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // stop the automatic mini-infobar
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setInstalled(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    // Already installed / running standalone -> render nothing.
    if (installed) return null;

    // Neither an Android/Chrome install prompt is available, nor is this iOS
    // -> most likely desktop Safari/Firefox or a browser without PWA install
    // support. Nothing useful to do, so render nothing.
    if (!deferredPrompt && !isIos) return null;

    const handleClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            return;
        }
        if (isIos) {
            setShowIosHint(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                style={{
                    background: "linear-gradient(135deg,#2d8a2d,#4caf50)",
                    color: "white",
                    border: "none",
                    borderRadius: 50,
                    padding: "12px 26px",
                    fontFamily: "'Sora',sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(45,138,45,0.38)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                📲 Click to Install
            </button>

            {showIosHint && (
                <div
                    onClick={() => setShowIosHint(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "white",
                            borderRadius: "20px 20px 0 0",
                            padding: "22px 20px 28px",
                            width: "100%",
                            maxWidth: 420,
                            fontFamily: "'DM Sans',sans-serif",
                            boxShadow: "0 -8px 30px rgba(0,0,0,0.2)",
                        }}
                    >
                        <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color: "#1a2e1a" }}>
                            Install TastyCart on your iPhone
                        </p>
                        <ol style={{ paddingLeft: 18, color: "#3a4a3a", fontSize: 14, lineHeight: 1.8 }}>
                            <li>
                                Tap the <strong>Share</strong> icon{" "}
                                <span aria-hidden="true">⬆️</span> in Safari's toolbar
                            </li>
                            <li>
                                Scroll down and tap <strong>"Add to Home Screen"</strong>
                            </li>
                            <li>
                                Tap <strong>"Add"</strong> in the top right corner
                            </li>
                        </ol>
                        <button
                            onClick={() => setShowIosHint(false)}
                            style={{
                                marginTop: 18,
                                width: "100%",
                                background: "#f2f2f2",
                                border: "none",
                                borderRadius: 12,
                                padding: "12px",
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#333",
                                cursor: "pointer",
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}