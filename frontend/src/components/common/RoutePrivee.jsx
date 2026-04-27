// On redirige vers la page de connexion si l'utilisateur n'est pas authentifié
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const RoutePrivee = () => {
    const { estConnecte, loading } = useAuth();
    const location = useLocation();

    // On attend que le contexte auth soit initialisé avant de décider de la redirection
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // On mémorise la page demandée pour y rediriger après connexion
    if (!estConnecte) {
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RoutePrivee;
