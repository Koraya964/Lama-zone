import api from './api.js';

export const annoncesService = {
    getAll: (params = {}) => api.get('/annonces', { params }),
    getById: (id) => api.get(`/annonces/${id}`),
    getMesAnnonces: () => api.get('/annonces/utilisateur/mes-annonces'),
    create: (formData) => api.post('/annonces', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/annonces/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/annonces/${id}`),
    deleteImage: (annonceId, imageId) => api.delete(`/annonces/${annonceId}/images/${imageId}`),
};

// On retire le token du body des appels auth — il est maintenant géré par les cookies et les headers
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    // Ces deux méthodes sont maintenant appelées directement depuis le contexte
    refresh: () => api.post('/auth/refresh'),
    logout: () => api.post('/auth/logout'),
};

export const utilisateursService = {
    getProfil: () => api.get('/utilisateurs/profil'),
    getProfilPublic: (id) => api.get(`/utilisateurs/${id}/public`),
    updateProfil: (data) => api.put('/utilisateurs/profil', data),
    updatePassword: (data) => api.put('/utilisateurs/profil/password', data),
    deleteCompte: () => api.delete('/utilisateurs/profil'),
    getAvis: (vendeurId) => api.get(`/utilisateurs/${vendeurId}/avis`),
    envoyerAvis: (vendeurId, data) => api.post(`/utilisateurs/${vendeurId}/avis`, data),
    supprimerAvis: (vendeurId) => api.delete(`/utilisateurs/${vendeurId}/avis`),
};

export const categoriesService = {
    getAll: () => api.get('/categories'),
};

export const messagesService = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (annonce_id, interlocuteur_id) =>
        api.get('/messages', { params: { annonce_id, interlocuteur_id } }),
    send: (data) => api.post('/messages', data),
};