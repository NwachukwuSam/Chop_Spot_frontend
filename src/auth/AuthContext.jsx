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
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userData = localStorage.getItem('userData');

        if (token && userRole && userData) {
          setUser({
            token,
            role: userRole,
            ...JSON.parse(userData)
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
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
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      setUser(null);
      setError(null);
      // Optionally dispatch event for any cleanup
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