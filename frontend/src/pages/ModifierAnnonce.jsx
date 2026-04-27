// On pré-remplit le formulaire avec les données existantes et on gère la modification
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { annoncesService, categoriesService } from '../services/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const ModifierAnnonce = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { utilisateur } = useAuth();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        titre: '', description: '', prix: '', localisation: '', categorie_id: '',
    });
    const [imagesExistantes, setImagesExistantes] = useState([]);
    const [nouveauxFichiers, setNouveauxFichiers] = useState([]);
    const [erreurs, setErreurs] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        // On charge les catégories et l'annonce en parallèle pour gagner du temps
        Promise.all([
            categoriesService.getAll(),
            annoncesService.getById(id),
        ]).then(([catRes, annonceRes]) => {
            setCategories(catRes.data);
            const annonce = annonceRes.data;

            // On vérifie que l'utilisateur connecté est bien le propriétaire avant d'afficher le formulaire
            if (annonce.utilisateur_id !== utilisateur?.id) {
                navigate('/mes-annonces', { replace: true });
                return;
            }

            setFormData({
                titre: annonce.titre,
                description: annonce.description,
                prix: annonce.prix,
                localisation: annonce.localisation,
                categorie_id: annonce.categorie_id,
            });
            setImagesExistantes(annonce.images || []);
        }).catch(() => {
            navigate('/mes-annonces', { replace: true });
        }).finally(() => setLoading(false));
    }, [id, utilisateur, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (erreurs[e.target.name]) setErreurs({ ...erreurs, [e.target.name]: '' });
    };

    const handleSupprimerImage = async (imageId) => {
        if (!window.confirm('Supprimer cette image ?')) return;
        try {
            await annoncesService.deleteImage(id, imageId);
            setImagesExistantes((prev) => prev.filter((img) => img.id !== imageId));
        } catch {
            alert('Impossible de supprimer cette image.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setErreurs({});

        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => data.append(key, val));
        nouveauxFichiers.forEach((file) => data.append('images', file));

        try {
            await annoncesService.update(id, data);
            navigate(`/annonces/${id}`);
        } catch (err) {
            if (err.response?.data?.errors) {
                const errMap = {};
                err.response.data.errors.forEach((e) => { errMap[e.path] = e.msg; });
                setErreurs(errMap);
            } else {
                setErreurs({ global: err.response?.data?.message || 'Une erreur est survenue.' });
            }
        } finally {
            setSubmitLoading(false);
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
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier l'annonce</h1>

            <div className="card p-6">
                {erreurs.global && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {erreurs.global}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                            type="text" id="titre" name="titre" value={formData.titre}
                            onChange={handleChange}
                            className={`input-field ${erreurs.titre ? 'border-red-400' : ''}`}
                        />
                        {erreurs.titre && <p className="text-red-500 text-xs mt-1">{erreurs.titre}</p>}
                    </div>

                    <div>
                        <label htmlFor="categorie_id" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                        <select
                            id="categorie_id" name="categorie_id" value={formData.categorie_id}
                            onChange={handleChange}
                            className={`input-field ${erreurs.categorie_id ? 'border-red-400' : ''}`}
                        >
                            <option value="">Choisir une categorie</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description" name="description" value={formData.description}
                            onChange={handleChange} rows={5}
                            className={`input-field resize-none ${erreurs.description ? 'border-red-400' : ''}`}
                        />
                        {erreurs.description && <p className="text-red-500 text-xs mt-1">{erreurs.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                            <input
                                type="number" id="prix" name="prix" value={formData.prix}
                                onChange={handleChange} min="0" step="0.01"
                                className={`input-field ${erreurs.prix ? 'border-red-400' : ''}`}
                            />
                        </div>
                        <div>
                            <label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                            <input
                                type="text" id="localisation" name="localisation" value={formData.localisation}
                                onChange={handleChange}
                                className={`input-field ${erreurs.localisation ? 'border-red-400' : ''}`}
                            />
                        </div>
                    </div>

                    {/* On affiche les images actuelles avec la possibilité d'en supprimer */}
                    {imagesExistantes.length > 0 && (
                        <div>
                            <p className="block text-sm font-medium text-gray-700 mb-2">Images actuelles</p>
                            <div className="flex gap-3 flex-wrap">
                                {imagesExistantes.map((img) => (
                                    <div key={img.id} className="relative">
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSupprimerImage(img.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                                            aria-label="Supprimer cette image"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                            Ajouter des images
                        </label>
                        <input
                            type="file" id="images" name="images" multiple accept="image/*"
                            onChange={(e) => setNouveauxFichiers(Array.from(e.target.files).slice(0, 5))}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                            Annuler
                        </button>
                        <button type="submit" disabled={submitLoading} className="btn-primary flex-1">
                            {submitLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifierAnnonce;
