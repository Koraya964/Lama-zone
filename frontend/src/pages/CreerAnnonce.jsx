// On gère ici le formulaire de création d'une nouvelle annonce avec upload d'images
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { annoncesService, categoriesService } from '../services/index.js';

const CreerAnnonce = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        titre: '', description: '', prix: '', localisation: '', categorie_id: '',
    });
    const [fichiers, setFichiers] = useState([]);
    const [erreurs, setErreurs] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        categoriesService.getAll()
            .then((res) => setCategories(res.data))
            .catch((err) => console.error('Erreur chargement categories :', err.message));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (erreurs[e.target.name]) setErreurs({ ...erreurs, [e.target.name]: '' });
    };

    const handleFichiers = (e) => {
        const fichiersList = Array.from(e.target.files);
        // On limite a 5 images par annonce
        setFichiers(fichiersList.slice(0, 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreurs({});

        // On construit le FormData pour envoyer le formulaire avec les images
        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => data.append(key, val));
        fichiers.forEach((file) => data.append('images', file));

        try {
            const { data: annonce } = await annoncesService.create(data);
            navigate(`/annonces/${annonce.id}`);
        } catch (err) {
            if (err.response?.data?.errors) {
                const errMap = {};
                err.response.data.errors.forEach((e) => { errMap[e.path] = e.msg; });
                setErreurs(errMap);
            } else {
                setErreurs({ global: err.response?.data?.message || 'Une erreur est survenue.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Deposer une annonce</h1>

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
                            onChange={handleChange} className={`input-field ${erreurs.titre ? 'border-red-400' : ''}`}
                        />
                        {erreurs.titre && <p className="text-red-500 text-xs mt-1">{erreurs.titre}</p>}
                    </div>

                    <div>
                        <label htmlFor="categorie_id" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                        <select
                            id="categorie_id" name="categorie_id" value={formData.categorie_id}
                            onChange={handleChange} className={`input-field ${erreurs.categorie_id ? 'border-red-400' : ''}`}
                        >
                            <option value="">Choisir une categorie</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nom}</option>
                            ))}
                        </select>
                        {erreurs.categorie_id && <p className="text-red-500 text-xs mt-1">{erreurs.categorie_id}</p>}
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
                            {erreurs.prix && <p className="text-red-500 text-xs mt-1">{erreurs.prix}</p>}
                        </div>
                        <div>
                            <label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                            <input
                                type="text" id="localisation" name="localisation" value={formData.localisation}
                                onChange={handleChange}
                                className={`input-field ${erreurs.localisation ? 'border-red-400' : ''}`}
                            />
                            {erreurs.localisation && <p className="text-red-500 text-xs mt-1">{erreurs.localisation}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                            Images (5 maximum, 5 Mo par image)
                        </label>
                        <input
                            type="file" id="images" name="images" multiple accept="image/*"
                            onChange={handleFichiers}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                        />
                        {fichiers.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">{fichiers.length} fichier(s) selectionne(s)</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Publication...' : 'Publier l\'annonce'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreerAnnonce;
