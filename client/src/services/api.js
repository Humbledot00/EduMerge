import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token from storage on every request (fallback)
api.interceptors.request.use(config => {
  const stored = localStorage.getItem('edumerge_user');
  if (stored && !config.headers['Authorization']) {
    const { token } = JSON.parse(stored);
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('edumerge_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
