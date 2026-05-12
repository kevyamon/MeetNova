import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://meetnova-backend.onrender.com/api',
  withCredentials: true,
});

// Variable pour éviter les boucles infinies de rafraîchissement
let isRefreshing = false;

export const setAccessToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on a une erreur 401 et que ce n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      
      if (isRefreshing) return Promise.reject(error); // Évite les appels multiples
      
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Si le refresh échoue, on ne boucle pas, on redirige juste si on est sur une page protégée
        if (window.location.pathname.startsWith('/mnccadmin/')) {
          window.location.href = '/mnccadmin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
