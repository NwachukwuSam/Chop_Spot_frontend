import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp && payload.exp < Date.now() / 1000;
    } catch { return true; }
}

const AUTH_KEYS = ['token','chopspot_token','userRole','userData','chopspot_user','refreshToken','adminToken','accessToken','tastycart_token','authToken','jwt','chopspot_refresh_token'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const loadUser = async () => {
          try {
              // Read from either key name — LoginPage writes both
              const token    = localStorage.getItem('token') || localStorage.getItem('chopspot_token');
              const userRole = localStorage.getItem('userRole');
              const userData = localStorage.getItem('userData') || localStorage.getItem('chopspot_user');

              if (token && userData) {
                  if (isTokenExpired(token)) {
                      // Token expired — attempt silent refresh before giving up.
                      const rt = localStorage.getItem('chopspot_refresh_token');
                      let refreshed = false;
                      if (rt) {
                          try {
                              const res = await fetch(`${API_BASE}/api/auth/refresh`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ refreshToken: rt }),
                              });
                              if (res.ok) {
                                  const data = await res.json();
                                  const newToken = data.accessToken || data.token;
                                  if (newToken) {
                                      localStorage.setItem('chopspot_token', newToken);
                                      localStorage.setItem('token', newToken);
                                      if (data.refreshToken) {
                                          localStorage.setItem('chopspot_refresh_token', data.refreshToken);
                                      }
                                      const parsed = JSON.parse(userData);
                                      setUser({
                                          token: newToken,
                                          role: userRole || parsed.role || (parsed.roles?.[0] ?? ""),
                                          ...parsed,
                                      });
                                      refreshed = true;
                                  }
                              }
                          } catch { /* fall through to clearing storage */ }
                      }
                      if (!refreshed) {
                          AUTH_KEYS.forEach(k => localStorage.removeItem(k));
                      }
                  } else {
                      const parsed = JSON.parse(userData);
                      setUser({
                          token,
                          role: userRole || parsed.role || (parsed.roles?.[0] ?? ""),
                          ...parsed,
                      });
                  }
              }
          } catch (err) {
              console.error('Error loading user data:', err);
              localStorage.removeItem('token');
              localStorage.removeItem('chopspot_token');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userData');
              localStorage.removeItem('chopspot_user');
          } finally {
              setLoading(false);
          }
      };

    loadUser();
  }, []);

  const login = useCallback((token, userData, refreshToken = null) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userData', JSON.stringify(userData));
      const rt = refreshToken || userData.refreshToken || null;
      if (rt) localStorage.setItem('chopspot_refresh_token', rt);
      setUser({ token, role: userData.role, ...userData });
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login');
      return false;
    }
  }, []);

    const logout = useCallback(() => {
        try {
            const rt = localStorage.getItem('chopspot_refresh_token');
            if (rt) {
                // Fire-and-forget: invalidate the refresh token server-side.
                fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: rt }),
                }).catch(() => {});
            }
            // Clear all auth keys including the refresh token
            AUTH_KEYS.forEach(k => localStorage.removeItem(k));
            setUser(null);
            setError(null);
            window.dispatchEvent(new CustomEvent('chopspot:logout'));
            return true;
        } catch (err) {
            console.error('Logout error:', err);
            return false;
        }
    }, []);

  const updateUser = useCallback((updatedData) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(newUserData));
      if (updatedData.role) {
        localStorage.setItem('userRole', updatedData.role);
      }
      setUser(newUserData);
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    userRole: user?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};