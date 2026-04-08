import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
                  const parsed = JSON.parse(userData);
                  setUser({
                      token,
                      role: userRole || parsed.role || (parsed.roles?.[0] ?? ""),
                      ...parsed,
                  });
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

  const login = useCallback((token, userData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userData', JSON.stringify(userData));
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
            // Clear all variants so both auth systems are wiped
            ['token', 'chopspot_token', 'userRole', 'userData', 'chopspot_user',
                'refreshToken', 'adminToken'].forEach(k => localStorage.removeItem(k));
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