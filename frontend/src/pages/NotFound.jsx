// On affiche une page d'erreur sobre lorsque la route demandée n'existe pas
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="max-w-md mx-auto text-center py-20">
            <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
            <p className="text-gray-500 mb-8">La page que vous cherchez n'existe pas ou a ete deplacee.</p>
            <Link to="/" className="btn-primary">
                Retour a l'accueil
            </Link>
        </div>
    );
};

export default NotFound;
