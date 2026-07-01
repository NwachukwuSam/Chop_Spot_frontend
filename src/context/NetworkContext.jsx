import { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);
    const [returnTo, setReturnTo] = useState(null);

    const checkRealConnection = async () => {
        if (!navigator.onLine) return false;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/restaurants`, {
                method: 'GET',
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
                if (reallyOnline && wasOffline && window.location.pathname !== '/offline') {
                    setWasOffline(false);
                    if (returnTo) {
                        window.location.href = returnTo;
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

        const interval = setInterval(async () => {
            if (document.visibilityState === 'hidden') return;
            if (navigator.onLine) {
                const reallyOnline = await checkRealConnection();
                if (mounted) setIsOnline(reallyOnline);
            }
        }, 15000);

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
