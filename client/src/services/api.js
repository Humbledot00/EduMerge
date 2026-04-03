import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token from storage on every request (fallback)
api.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem('edumerge_user');
    if (stored && !config.headers['Authorization']) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    console.error('Token recovery failed:', e);
    localStorage.removeItem('edumerge_user');
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      url: err.config?.url
    });
    if (err.response?.status === 401) {
      localStorage.removeItem('edumerge_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
