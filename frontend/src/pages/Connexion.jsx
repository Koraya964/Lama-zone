// On gère ici le formulaire de connexion et la redirection après succès
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/index.js';

const Connexion = () => {
    const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // On redirige vers la page demandée avant la connexion ou vers l'accueil par defaut
    const destination = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErreur('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authService.login(formData);
            login(data.token, data.utilisateur);
            navigate(destination, { replace: true });
        } catch (err) {
            setErreur(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="card p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Se connecter</h1>

                {erreur && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {erreur}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            className="input-field"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Pas encore de compte ?{' '}
                    <Link to="/inscription" className="text-primary-500 hover:text-primary-600 font-medium">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Connexion;
