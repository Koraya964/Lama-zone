// On gère ici l'inscription et la connexion des utilisateurs
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import UtilisateurModel from '../models/utilisateur.model.js';

export const register = async (req, res, next) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        // On vérifie que l'email n'est pas déjà utilisé avant de créer le compte
        const existant = await UtilisateurModel.findByEmail(email);
        if (existant) {
            return res.status(409).json({ message: 'Cet email est déjà associé à un compte.' });
        }

        // On utilise argon2id qui combine les protections d'argon2i et argon2d
        const motDePasseHashe = await argon2.hash(mot_de_passe, {
            type: argon2.argon2id,
        });

        const id = await UtilisateurModel.create({ nom, prenom, email, mot_de_passe: motDePasseHashe });

        // On retourne directement un token pour connecter l'utilisateur après inscription
        const token = jwt.sign({ id, nom, prenom, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(201).json({ token, utilisateur: { id, nom, prenom, email } });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, mot_de_passe } = req.body;

        // On renvoie le même message que si le mot de passe est faux pour ne pas confirmer l'existence du compte
        const utilisateur = await UtilisateurModel.findByEmail(email);
        if (!utilisateur) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Avec argon2, verify prend le hash en premier et le mot de passe en second
        const motDePasseValide = await argon2.verify(utilisateur.mot_de_passe, mot_de_passe);
        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const { id, nom, prenom } = utilisateur;
        const token = jwt.sign({ id, nom, prenom, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.json({ token, utilisateur: { id, nom, prenom, email } });
    } catch (error) {
        next(error);
    }
};