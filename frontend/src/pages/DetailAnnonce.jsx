// On affiche ici le détail complet d'une annonce avec le formulaire de contact
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { annoncesService, messagesService } from '../services/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const DetailAnnonce = () => {
    const { id } = useParams();
    const { utilisateur, estConnecte } = useAuth();
    const navigate = useNavigate();

    const [annonce, setAnnonce] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageActive, setImageActive] = useState(0);
    const [message, setMessage] = useState('');
    const [envoi, setEnvoi] = useState({ loading: false, succes: false, erreur: '' });

    useEffect(() => {
        annoncesService.getById(id)
            .then((res) => setAnnonce(res.data))
            .catch(() => navigate('/annonces', { replace: true }))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleEnvoyerMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setEnvoi({ loading: true, succes: false, erreur: '' });
        try {
            await messagesService.send({ contenu: message, annonce_id: annonce.id });
            setMessage('');
            setEnvoi({ loading: false, succes: true, erreur: '' });
        } catch (err) {
            setEnvoi({
                loading: false,
                succes: false,
                erreur: err.response?.data?.message || 'Impossible d\'envoyer le message.',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!annonce) return null;

    const prixFormate = new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(annonce.prix);

    const dateFormatee = new Date(annonce.date_publication).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    // On determine si l'utilisateur connecté est le propriétaire de l'annonce
    const estProprietaire = estConnecte && utilisateur?.id === annonce.utilisateur_id;
    const images = annonce.images || [];

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/annonces" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                Retour aux annonces
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne principale : images et description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Galerie d'images */}
                    <div className="card">
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                            {images.length > 0 ? (
                                <img
                                    src={images[imageActive]?.url}
                                    alt={annonce.titre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Pas d'image
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 p-4 overflow-x-auto">
                                {images.map((img, index) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setImageActive(index)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                                            index === imageActive ? 'border-primary-500' : 'border-transparent'
                                        }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Détails de l'annonce */}
                    <div className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className="text-xs text-primary-500 font-medium uppercase tracking-wide">
                                    {annonce.categorie_nom}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900 mt-1">{annonce.titre}</h1>
                            </div>
                            <p className="text-3xl font-bold text-primary-600">{prixFormate}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <span>{annonce.localisation}</span>
                            <span>Publie le {dateFormatee}</span>
                        </div>

                        <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{annonce.description}</p>
                    </div>
                </div>

                {/* Colonne droite : vendeur et contact */}
                <div className="space-y-4">
                    <div className="card p-5">
                        <h2 className="font-semibold text-gray-900 mb-3">Vendeur</h2>
                        <p className="text-gray-700 font-medium">{annonce.utilisateur_nom}</p>

                        {estProprietaire && (
                            <div className="flex gap-2 mt-4">
                                <Link
                                    to={`/annonces/${annonce.id}/modifier`}
                                    className="btn-secondary text-sm flex-1 text-center"
                                >
                                    Modifier
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Formulaire de contact, masqué si c'est le proprietaire */}
                    {!estProprietaire && (
                        <div className="card p-5">
                            <h2 className="font-semibold text-gray-900 mb-3">Contacter le vendeur</h2>

                            {!estConnecte ? (
                                <p className="text-sm text-gray-600">
                                    <Link to="/connexion" className="text-primary-500 font-medium">
                                        Connectez-vous
                                    </Link>{' '}
                                    pour envoyer un message.
                                </p>
                            ) : envoi.succes ? (
                                <p className="text-green-600 text-sm font-medium">
                                    Votre message a ete envoye avec succes.
                                </p>
                            ) : (
                                <form onSubmit={handleEnvoyerMessage} className="space-y-3">
                                    {envoi.erreur && (
                                        <p className="text-red-500 text-sm">{envoi.erreur}</p>
                                    )}
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Bonjour, je suis interesse par votre annonce..."
                                        rows={4}
                                        className="input-field resize-none"
                                        aria-label="Votre message au vendeur"
                                    />
                                    <button
                                        type="submit"
                                        disabled={envoi.loading || !message.trim()}
                                        className="btn-primary w-full"
                                    >
                                        {envoi.loading ? 'Envoi...' : 'Envoyer le message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailAnnonce;
