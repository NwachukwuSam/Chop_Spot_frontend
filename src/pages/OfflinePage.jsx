import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';

export default function OfflinePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOnline } = useNetwork();

    const [retrying, setRetrying] = useState(false);

    // Auto-redirect when connection is restored
    useEffect(() => {
        if (isOnline) {
            const returnTo = location.state?.returnTo ||
                new URLSearchParams(location.search).get('returnTo') ||
                '/';

            console.log(`[OfflinePage] Connection restored → redirecting to ${returnTo}`);
            navigate(returnTo, { replace: true });
        }
    }, [isOnline, navigate, location]);

    const handleRetry = async () => {
        setRetrying(true);

        try {
            // Force a real network check
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health-check`, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeout);

            // If we reach here, connection is back
            const returnTo = location.state?.returnTo ||
                new URLSearchParams(location.search).get('returnTo') ||
                '/';
            navigate(returnTo, { replace: true });

        } catch (err) {
            console.log("Still offline");
            // Stay on offline page
            setRetrying(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fdf8',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '420px' }}>
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>📡</div>

                <h1 style={{ fontSize: '28px', marginBottom: '12px', color: '#1a5c1a' }}>
                    No Internet Connection
                </h1>

                <p style={{ color: '#5a7a5a', marginBottom: '32px', lineHeight: 1.6 }}>
                    It looks like you're offline.<br />
                    Please check your network and try again.
                </p>

                <button
                    onClick={handleRetry}
                    disabled={retrying}
                    style={{
                        background: '#2d8a2d',
                        color: 'white',
                        border: 'none',
                        padding: '16px 40px',
                        borderRadius: '50px',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: retrying ? 'not-allowed' : 'pointer',
                        width: '100%',
                        marginBottom: '20px',
                        opacity: retrying ? 0.7 : 1
                    }}
                >
                    {retrying ? "Checking connection..." : "Retry Connection"}
                </button>

                <p style={{ fontSize: '13px', color: '#64748b' }}>
                    We'll automatically take you back once you're online.
                </p>
            </div>
        </div>
    );
}