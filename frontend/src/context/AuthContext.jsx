// On gère ici l'état d'authentification global et on l'expose via un contexte
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On recharge l'état d'authentification depuis le localStorage au démarrage
    useEffect(() => {
        const tokenStocke = localStorage.getItem('token');
        const utilisateurStocke = localStorage.getItem('utilisateur');

        if (tokenStocke && utilisateurStocke) {
            try {
                setToken(tokenStocke);
                setUtilisateur(JSON.parse(utilisateurStocke));
            } catch {
                // On nettoie le localStorage si les données sont corrompues
                localStorage.removeItem('token');
                localStorage.removeItem('utilisateur');
            }
        }
        setLoading(false);
    }, []);

    const login = (tokenRecu, utilisateurRecu) => {
        setToken(tokenRecu);
        setUtilisateur(utilisateurRecu);
        localStorage.setItem('token', tokenRecu);
        localStorage.setItem('utilisateur', JSON.stringify(utilisateurRecu));
    };

    const logout = () => {
        setToken(null);
        setUtilisateur(null);
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
    };

    return (
        <AuthContext.Provider value={{ utilisateur, token, login, logout, loading, estConnecte: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// On exporte un hook personnalisé pour accéder facilement au contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider.');
    }
    return context;
};
