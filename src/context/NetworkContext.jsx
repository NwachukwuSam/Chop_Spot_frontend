import { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);
    const [returnTo, setReturnTo] = useState(null);

    // Better detection: combine navigator.onLine with actual fetch test
    const checkRealConnection = async () => {
        if (!navigator.onLine) return false;

        try {
            // Lightweight test endpoint (you can use your own backend /ping or a public one)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health-check`, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeout);
            return res.ok;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;

        const handleOnline = async () => {
            const reallyOnline = await checkRealConnection();
            if (mounted) {
                setIsOnline(reallyOnline);
                if (reallyOnline && wasOffline) {
                    setWasOffline(false);
                    // Auto-redirect back if we have a saved location
                    if (returnTo) {
                        window.location.href = returnTo; // or use navigate if in router context
                        setReturnTo(null);
                    }
                }
            }
        };

        const handleOffline = () => {
            if (mounted) {
                setIsOnline(false);
                setWasOffline(true);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check + periodic verification
        const interval = setInterval(async () => {
            if (navigator.onLine) {
                const reallyOnline = await checkRealConnection();
                if (mounted) setIsOnline(reallyOnline);
            }
        }, 15000); // every 15s

        return () => {
            mounted = false;
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [wasOffline, returnTo]);

    const saveReturnPath = (path) => setReturnTo(path);

    return (
        <NetworkContext.Provider value={{ isOnline, wasOffline, saveReturnPath }}>
            {children}
        </NetworkContext.Provider>
    );
}

export const useNetwork = () => useContext(NetworkContext);