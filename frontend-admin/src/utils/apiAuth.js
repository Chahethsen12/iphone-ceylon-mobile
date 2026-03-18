import axios from 'axios';

const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercept requests and add the JWT token
apiAuth.interceptors.request.use((config) => {
  const adminInfo = localStorage.getItem('adminInfo');
  if (adminInfo) {
    const { token } = JSON.parse(adminInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401 Unauthorized
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiAuth;
