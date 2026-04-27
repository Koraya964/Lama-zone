// On gère ici la création, modification et suppression des avis sur les vendeurs
import AvisModel from '../models/avis.model.js';
import UtilisateurModel from '../models/utilisateur.model.js';

// On retourne tous les avis reçus par un vendeur donné
export const getAvisVendeur = async (req, res, next) => {
    try {
        const avis = await AvisModel.findByVendeur(req.params.vendeurId);
        res.json(avis);
    } catch (error) {
        next(error);
    }
};

// On crée ou met à jour un avis, un utilisateur ne peut en laisser qu'un par vendeur
export const createOrUpdateAvis = async (req, res, next) => {
    try {
        const { note, commentaire } = req.body;
        const auteur_id = req.utilisateur.id;
        const vendeur_id = parseInt(req.params.vendeurId);

        // On empêche un utilisateur de s'évaluer lui-même
        if (auteur_id === vendeur_id) {
            return res.status(400).json({ message: 'Vous ne pouvez pas laisser un avis sur votre propre profil.' });
        }

        // On vérifie que le vendeur existe bien
        const vendeur = await UtilisateurModel.findById(vendeur_id);
        if (!vendeur) {
            return res.status(404).json({ message: 'Vendeur introuvable.' });
        }

        // On met à jour l'avis existant ou on en crée un nouveau
        const avisExistant = await AvisModel.findByAuteurEtVendeur(auteur_id, vendeur_id);

        if (avisExistant) {
            await AvisModel.update(avisExistant.id, { note, commentaire });
            return res.json({ message: 'Avis mis à jour.' });
        }

        const id = await AvisModel.create({ note, commentaire, auteur_id, vendeur_id });
        res.status(201).json({ id, message: 'Avis publié.' });
    } catch (error) {
        next(error);
    }
};

// On supprime un avis, uniquement par son auteur
export const deleteAvis = async (req, res, next) => {
    try {
        const avis = await AvisModel.findByAuteurEtVendeur(req.utilisateur.id, req.params.vendeurId);

        if (!avis) {
            return res.status(404).json({ message: 'Avis introuvable.' });
        }

        await AvisModel.delete(avis.id);
        res.json({ message: 'Avis supprimé.' });
    } catch (error) {
        next(error);
    }
};