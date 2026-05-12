import axios from 'axios';

// URL du backend déployé sur Render
const API_URL = import.meta.env.VITE_API_URL || 'https://meetnova-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Pour envoyer/recevoir le Refresh Token dans le cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable pour stocker le token en mémoire (évite le vol via XSS comparé au localStorage)
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Intercepteur pour injecter l'Access Token dans chaque requête
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer le renouvellement automatique (JWT Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on reçoit un 401 et que ce n'est pas déjà une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Appeler la route de refresh
        const { data } = await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
        
        // Mettre à jour le token en mémoire
        setAccessToken(data.accessToken);
        
        // Relancer la requête initiale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue (session expirée), on redirige vers le login
        accessToken = null;
        if (window.location.pathname.startsWith('/mnccadmin')) {
          window.location.href = '/mnccadmin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
