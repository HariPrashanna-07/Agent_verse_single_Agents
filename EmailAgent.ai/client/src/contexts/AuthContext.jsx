import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setIsDemoMode(res.data.isDemoMode);
      }
    } catch (err) {
      console.warn('User not authenticated, loading demo fallback context');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginWithDemo = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-login');
      if (res.data.success) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, loginWithDemo, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
