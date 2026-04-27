// On encapsule ici la logique de chargement et de filtrage des annonces pour la réutiliser
import { useState, useEffect, useCallback } from 'react';
import { annoncesService } from '../services/index.js';

const useAnnonces = (filtresInitiaux = {}) => {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState('');

    const charger = useCallback(async (filtres = {}) => {
        setLoading(true);
        setErreur('');
        try {
            // On enlève les paramètres vides avant l'envoi pour ne pas polluer la requête
            const params = Object.fromEntries(
                Object.entries(filtres).filter(([, v]) => v !== '' && v !== null && v !== undefined)
            );
            const { data } = await annoncesService.getAll(params);
            setAnnonces(data);
        } catch {
            setErreur('Impossible de charger les annonces.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        charger(filtresInitiaux);
    }, []);

    return { annonces, loading, erreur, charger };
};

export default useAnnonces;
