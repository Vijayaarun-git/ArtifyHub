import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('artify_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore malformed persisted auth state.
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        const auth = JSON.parse(localStorage.getItem('artify_auth') || 'null');
        // Demo accounts intentionally use client-only tokens and must not be logged
        // out when a backend-only request is unavailable.
        if (!String(auth?.token || '').startsWith('demo-jwt-')) {
          localStorage.removeItem('artify_auth');
          window.dispatchEvent(new Event('artify:auth-expired'));
        }
      } catch (e) {
        localStorage.removeItem('artify_auth');
        window.dispatchEvent(new Event('artify:auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
