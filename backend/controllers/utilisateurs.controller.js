// On gère ici les actions liées au profil utilisateur
import argon2 from 'argon2';
import UtilisateurModel from '../models/utilisateur.model.js';

// On retourne le profil complet de l'utilisateur connecté avec sa note moyenne
export const getProfil = async (req, res, next) => {
    try {
        const utilisateur = await UtilisateurModel.findById(req.utilisateur.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
        res.json(utilisateur);
    } catch (error) {
        next(error);
    }
};

// On retourne le profil public d'un vendeur, accessible sans connexion
export const getProfilPublic = async (req, res, next) => {
    try {
        const utilisateur = await UtilisateurModel.findById(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
        // On exclut les informations sensibles du profil public
        const { email, adresse, date_naissance, ...profilPublic } = utilisateur;
        res.json(profilPublic);
    } catch (error) {
        next(error);
    }
};

// On met à jour toutes les informations du profil sauf le mot de passe
export const updateProfil = async (req, res, next) => {
    try {
        const { nom, prenom, email, telephone, adresse, ville, code_postal, date_naissance } = req.body;
        const utilisateurId = req.utilisateur.id;

        // On vérifie que le nouvel email n'appartient pas à un autre compte
        const existant = await UtilisateurModel.findByEmail(email);
        if (existant && existant.id !== utilisateurId) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé par un autre compte.' });
        }

        await UtilisateurModel.update(utilisateurId, {
            nom, prenom, email, telephone, adresse, ville, code_postal, date_naissance,
        });

        const utilisateurMAJ = await UtilisateurModel.findById(utilisateurId);
        res.json(utilisateurMAJ);
    } catch (error) {
        next(error);
    }
};

// On met à jour le mot de passe après vérification de l'ancien
export const updatePassword = async (req, res, next) => {
    try {
        const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

        // On a besoin du mot de passe hashé donc on fait une requête complète
        const utilisateur = await UtilisateurModel.findByEmail(req.utilisateur.email);

        // Avec argon2, verify prend le hash en premier et le mot de passe en second
        const valide = await argon2.verify(utilisateur.mot_de_passe, ancien_mot_de_passe);
        if (!valide) {
            return res.status(401).json({ message: "L'ancien mot de passe est incorrect." });
        }

        const nouveauHash = await argon2.hash(nouveau_mot_de_passe, { type: argon2.argon2id });
        await UtilisateurModel.updatePassword(req.utilisateur.id, nouveauHash);

        res.json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
        next(error);
    }
};

// On supprime le compte et toutes les données associées via les cascades SQL
export const deleteCompte = async (req, res, next) => {
    try {
        await UtilisateurModel.delete(req.utilisateur.id);
        res.json({ message: 'Compte supprimé avec succès.' });
    } catch (error) {
        next(error);
    }
};