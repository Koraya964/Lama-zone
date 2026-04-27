// On regroupe ici tous les appels API liés aux annonces
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

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export const utilisateursService = {
    getProfil: () => api.get('/utilisateurs/profil'),
    getProfilPublic: (id) => api.get(`/utilisateurs/${id}/public`),
    updateProfil: (data) => api.put('/utilisateurs/profil', data),
    updatePassword: (data) => api.put('/utilisateurs/profil/password', data),
    deleteCompte: () => api.delete('/utilisateurs/profil'),
    // On récupère les avis reçus par un vendeur donné
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