import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier la session au chargement (via refresh pour obtenir un access token)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Tenter d'obtenir un access token via le cookie refresh
        const { data } = await api.get('/auth/refresh');
        setAccessToken(data.accessToken);
        
        // Puis vérifier le statut complet
        const statusRes = await api.get('/auth/status');
        setIsAuthenticated(true);
        setAdmin(statusRes.data.admin);
      } catch (error) {
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
    await api.post('/auth/logout');
    setAccessToken(null);
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
