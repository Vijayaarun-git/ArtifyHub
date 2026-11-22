import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('artify_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // ignore malformed storage
  }
  return config;
});

export default api;
