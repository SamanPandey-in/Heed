// Axios instance with automatic token refresh on 401

import axios from 'axios';

// In development Vite proxies /api/* to http://localhost:5000, so we use '/api'
// as a relative base. In production set VITE_API_BASE_URL to the deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // IMPORTANT: sends HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Restore token from localStorage on init
const storedToken = localStorage.getItem(TOKEN_KEY);
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = String(originalRequest.url || '');
    // Only skip the refresh loop for the /auth/refresh endpoint itself,
    // otherwise expired tokens on /auth/me or /auth/change-password would never auto-recover.
    const isRefreshEndpoint = requestUrl.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const { accessToken } = data;
        localStorage.setItem(TOKEN_KEY, accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → user session expired, clear state
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
