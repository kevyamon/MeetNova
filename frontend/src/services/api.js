import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://meetnova-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const getStoredToken = () => localStorage.getItem('accessToken');
const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setAccessToken = setStoredToken;

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.get('/auth/refresh');
        const newToken = res.data.accessToken;
        setStoredToken(newToken);
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        setStoredToken(null);
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
