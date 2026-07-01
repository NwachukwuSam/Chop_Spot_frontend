import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OfflinePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [retrying, setRetrying] = useState(false);
    const [failed, setFailed] = useState(false);

    const getReturnTo = () =>
        location.state?.returnTo ||
        new URLSearchParams(location.search).get('returnTo') ||
        '/';

    const handleRetry = async () => {
        setRetrying(true);
        setFailed(false);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants`, {
                method: 'GET',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (res.ok) {
                navigate(getReturnTo(), { replace: true });
            } else {
                setFailed(true);
                setRetrying(false);
            }
        } catch {
            setFailed(true);
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

                {failed && (
                    <p style={{ color: '#c0392b', marginBottom: '16px', fontSize: '14px' }}>
                        Still unable to reach the server. Please check your connection.
                    </p>
                )}

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
                    Click retry once your connection is restored.
                </p>
            </div>
        </div>
    );
}
