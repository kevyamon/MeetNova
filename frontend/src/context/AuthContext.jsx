import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
        try {
          const res = await api.get('/auth/refresh');
          const newToken = res.data.accessToken;
          setAccessToken(newToken);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('accessToken');
          setAccessToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
