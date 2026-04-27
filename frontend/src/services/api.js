// On configure ici l'instance axios avec l'URL de base et l'injection automatique du token
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// On injecte le token JWT dans chaque requête si l'utilisateur est connecté
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On redirige vers la page de connexion si le token a expiré
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('utilisateur');
            window.location.href = '/connexion';
        }
        return Promise.reject(error);
    }
);

export default api;
