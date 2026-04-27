// On gère ici toute la logique métier liée aux annonces
import AnnonceModel from '../models/annonce.model.js';
import ImageModel from '../models/image.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On liste les annonces en tenant compte des filtres passés en query string
export const getAnnonces = async (req, res, next) => {
    try {
        const { search, categorie_id, prix_min, prix_max, localisation, sort } = req.query;
        const annonces = await AnnonceModel.findAll({ search, categorie_id, prix_min, prix_max, localisation, sort });
        res.json(annonces);
    } catch (error) {
        next(error);
    }
};

// On retourne le détail d'une annonce avec ses images et les infos du vendeur
export const getAnnonceById = async (req, res, next) => {
    try {
        const annonce = await AnnonceModel.findById(req.params.id);
        if (!annonce) {
            return res.status(404).json({ message: 'Annonce introuvable.' });
        }
        res.json(annonce);
    } catch (error) {
        next(error);
    }
};

// On retourne uniquement les annonces de l'utilisateur connecté
export const getMesAnnonces = async (req, res, next) => {
    try {
        const annonces = await AnnonceModel.findByUtilisateur(req.utilisateur.id);
        res.json(annonces);
    } catch (error) {
        next(error);
    }
};

// On crée l'annonce puis on enregistre les images uploadées si elles existent
export const createAnnonce = async (req, res, next) => {
    try {
        const { titre, description, prix, localisation, categorie_id } = req.body;
        const utilisateur_id = req.utilisateur.id;

        const annonceId = await AnnonceModel.create({
            titre, description, prix, localisation, utilisateur_id, categorie_id,
        });

        // On enregistre chaque fichier uploadé et on stocke son URL en base
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = `/uploads/${file.filename}`;
                await ImageModel.create({ url, annonce_id: annonceId });
            }
        }

        const annonce = await AnnonceModel.findById(annonceId);
        res.status(201).json(annonce);
    } catch (error) {
        next(error);
    }
};

// On vérifie que l'utilisateur connecté est bien l'auteur avant toute modification
export const updateAnnonce = async (req, res, next) => {
    try {
        const annonce = await AnnonceModel.findById(req.params.id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce introuvable.' });
        }

        if (annonce.utilisateur_id !== req.utilisateur.id) {
            return res.status(403).json({ message: 'Vous ne pouvez pas modifier cette annonce.' });
        }

        const { titre, description, prix, localisation, categorie_id } = req.body;
        await AnnonceModel.update(req.params.id, { titre, description, prix, localisation, categorie_id });

        // On ajoute les nouvelles images si des fichiers ont été envoyés
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = `/uploads/${file.filename}`;
                await ImageModel.create({ url, annonce_id: req.params.id });
            }
        }

        const annonceMAJ = await AnnonceModel.findById(req.params.id);
        res.json(annonceMAJ);
    } catch (error) {
        next(error);
    }
};

// On supprime l'annonce ainsi que ses fichiers physiques sur le serveur
export const deleteAnnonce = async (req, res, next) => {
    try {
        const annonce = await AnnonceModel.findById(req.params.id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce introuvable.' });
        }

        if (annonce.utilisateur_id !== req.utilisateur.id) {
            return res.status(403).json({ message: 'Vous ne pouvez pas supprimer cette annonce.' });
        }

        // On supprime les fichiers images du disque avant de supprimer les entrées en base
        if (annonce.images && annonce.images.length > 0) {
            for (const image of annonce.images) {
                const filePath = path.join(__dirname, '..', image.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await AnnonceModel.delete(req.params.id);
        res.json({ message: 'Annonce supprimée avec succès.' });
    } catch (error) {
        next(error);
    }
};

// On supprime une image spécifique d'une annonce, en vérifiant les droits au préalable
export const deleteImage = async (req, res, next) => {
    try {
        const image = await ImageModel.findById(req.params.imageId);

        if (!image) {
            return res.status(404).json({ message: 'Image introuvable.' });
        }

        // On vérifie que l'annonce appartient bien à l'utilisateur connecté
        const annonce = await AnnonceModel.findById(image.annonce_id);
        if (annonce.utilisateur_id !== req.utilisateur.id) {
            return res.status(403).json({ message: 'Action non autorisée.' });
        }

        const filePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await ImageModel.delete(req.params.imageId);
        res.json({ message: 'Image supprimée.' });
    } catch (error) {
        next(error);
    }
};
