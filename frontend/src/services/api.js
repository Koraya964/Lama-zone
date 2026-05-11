import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Indispensable pour envoyer et recevoir les cookies httpOnly
    headers: {
        'Content-Type': 'application/json',
    },
});

// On stocke une référence vers la fonction getAccessToken du contexte
// Elle est injectée au démarrage de l'app pour éviter les dépendances circulaires
let _getAccessToken = null;
let _onLogout = null;

export const initialiserIntercepteurs = (getAccessToken, onLogout) => {
    _getAccessToken = getAccessToken;
    _onLogout = onLogout;
};

// On injecte l'access token dans chaque requête sortante
api.interceptors.request.use((config) => {
    const token = _getAccessToken?.();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On gère le renouvellement automatique quand le serveur répond 401
let renouvellementEnCours = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const requeteOriginale = error.config;

        // On ne tente le refresh que pour un 401 et uniquement une fois par requête
        // On exclut aussi les routes auth elles-mêmes pour éviter les boucles infinies
        if (
            error.response?.status === 401 &&
            !requeteOriginale._retry &&
            !requeteOriginale.url?.includes('/auth/')
        ) {
            requeteOriginale._retry = true;

            try {
                // Si un refresh est déjà en cours, on attend le même plutôt que d'en lancer un second
                if (!renouvellementEnCours) {
                    renouvellementEnCours = api.post('/auth/refresh');
                }

                const { data } = await renouvellementEnCours;
                renouvellementEnCours = null;

                // On met à jour le token en mémoire via le contexte
                if (_getAccessToken && data.accessToken) {
                    // On dispatch un event custom pour que le context puisse mettre à jour son état
                    window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
                        detail: { accessToken: data.accessToken, utilisateur: data.utilisateur },
                    }));
                }

                // On refresh la requête originale avec le nouveau token
                requeteOriginale.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(requeteOriginale);
            } catch {
                renouvellementEnCours = null;
                // Le refresh a échoué — session vraiment expirée, on déconnecte
                _onLogout?.();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;