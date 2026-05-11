// On gère ici l'état d'authentification global
// L'access token est stocké uniquement en mémoire — jamais en localStorage
// Le refresh token vit dans un cookie httpOnly géré par le navigateur
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import api, { initialiserIntercepteurs } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [utilisateur, setUtilisateur] = useState(null);
  const [loading, setLoading] = useState(true);

  // On utilise une ref pour que l'intercepteur axios lise toujours le token courant
  // sans créer de stale closure
  const accessTokenRef = useRef(null);

  const setAuth = useCallback((token, user) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUtilisateur(user);
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setUtilisateur(null);
  }, []);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err.message);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // On initialise les intercepteurs axios avec les fonctions du contexte
  // après le premier rendu pour éviter les imports circulaires
  useEffect(() => {
    initialiserIntercepteurs(getAccessToken, clearAuth);
  }, [getAccessToken, clearAuth]);

  // On écoute l'event déclenché par l'intercepteur quand un refresh réussit
  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      setAuth(e.detail.accessToken, e.detail.utilisateur);
    };
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    return () =>
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
  }, [setAuth]);

  // Au démarrage, on tente un refresh silencieux
  // Si le cookie refresh_token est présent, l'utilisateur est reconnecté automatiquement
  useEffect(() => {
    const tenterRefreshSilencieux = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAuth(data.accessToken, data.utilisateur);
      } catch {
        // Aucun cookie valide — pas connecté, c'est normal
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    tenterRefreshSilencieux();
  }, []);

  const login = useCallback(
    (token, user) => {
      setAuth(token, user);
    },
    [setAuth],
  );

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        accessToken,
        login,
        logout,
        loading,
        estConnecte: !!accessToken,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider.",
    );
  }
  return context;
};
