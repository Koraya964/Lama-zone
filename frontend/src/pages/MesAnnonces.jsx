// On affiche ici la liste des annonces publiées par l'utilisateur connecté
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { annoncesService } from '../services/index.js';

const MesAnnonces = () => {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        annoncesService.getMesAnnonces()
            .then((res) => setAnnonces(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleSupprimer = async (id) => {
        if (!window.confirm('Supprimer definitivement cette annonce ?')) return;
        try {
            await annoncesService.delete(id);
            setAnnonces((prev) => prev.filter((a) => a.id !== id));
        } catch {
            alert('Impossible de supprimer cette annonce.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
                <Link to="/annonces/nouvelle" className="btn-primary text-sm">
                    Nouvelle annonce
                </Link>
            </div>

            {annonces.length === 0 ? (
                <div className="card p-12 text-center text-gray-500">
                    <p>Vous n'avez pas encore publie d'annonce.</p>
                    <Link to="/annonces/nouvelle" className="btn-primary inline-block mt-4">
                        Deposer ma premiere annonce
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {annonces.map((annonce) => (
                        <div key={annonce.id} className="card p-4 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {annonce.image_principale ? (
                                    <img
                                        src={annonce.image_principale}
                                        alt={annonce.titre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        N/A
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{annonce.titre}</h3>
                                <p className="text-sm text-gray-500">
                                    {annonce.categorie_nom} - {annonce.localisation}
                                </p>
                            </div>
                            <p className="font-bold text-primary-600 flex-shrink-0">
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(annonce.prix)}
                            </p>
                            <div className="flex gap-2 flex-shrink-0">
                                <Link to={`/annonces/${annonce.id}/modifier`} className="btn-secondary text-xs px-3 py-1">
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => handleSupprimer(annonce.id)}
                                    className="btn-danger text-xs px-3 py-1"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MesAnnonces;
