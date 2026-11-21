import axios from 'axios';

const hostActual =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${hostActual}:3000/api`
});

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem('ceresia_token') ||
        sessionStorage.getItem('ceresia_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
            localStorage.removeItem('ceresia_token');
            localStorage.removeItem('ceresia_usuario');
            sessionStorage.removeItem('ceresia_token');
            sessionStorage.removeItem('ceresia_usuario');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;