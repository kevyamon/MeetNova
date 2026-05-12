import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/auth/refresh');
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          const statusRes = await api.get('/auth/status');
          setIsAuthenticated(true);
          setAdmin(statusRes.data.admin);
        }
      } catch (error) {
        setAccessToken(null);
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setIsAuthenticated(true);
    setAdmin(data.admin);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      setAdmin(null);
      window.location.href = '/mnccadmin';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Vérifie bien que cet export est présent en bas !
export const useAuth = () => useContext(AuthContext);
