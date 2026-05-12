import axios from 'axios';

// URL du backend déployé sur Render
const API_URL = import.meta.env.VITE_API_URL || 'https://meetnova-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Pour gérer les cookies (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globales (ex: 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Logique de refresh token ici si nécessaire
    return Promise.reject(error);
  }
);

export default api;
