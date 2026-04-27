// On regroupe ici toutes les règles de validation des données entrantes
import { body, validationResult } from 'express-validator';

// On applique ce middleware après les règles de validation pour centraliser la vérification
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};

// Règles pour l'inscription d'un nouvel utilisateur
export const registerRules = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est requis.')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est requis.')
        .isEmail().withMessage('L\'email n\'est pas valide.')
        .normalizeEmail(),
    body('mot_de_passe')
        .notEmpty().withMessage('Le mot de passe est requis.')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
];

// Règles pour la connexion
export const loginRules = [
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('mot_de_passe').notEmpty(),
];

// Règles pour la création et la modification d'une annonce
export const annonceRules = [
    body('titre')
        .trim()
        .notEmpty().withMessage('Le titre est requis.')
        .isLength({ min: 5, max: 255 }).withMessage('Le titre doit contenir entre 5 et 255 caractères.'),
    body('description')
        .trim()
        .notEmpty().withMessage('La description est requise.')
        .isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères.'),
    body('prix')
        .notEmpty().withMessage('Le prix est requis.')
        .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
    body('localisation')
        .trim()
        .notEmpty().withMessage('La localisation est requise.'),
    body('categorie_id')
        .notEmpty().withMessage('La catégorie est requise.')
        .isInt({ min: 1 }).withMessage('La catégorie n\'est pas valide.'),
];

// Règles pour l'envoi d'un message
export const messageRules = [
    body('contenu')
        .trim()
        .notEmpty().withMessage('Le message ne peut pas être vide.')
        .isLength({ min: 5, max: 2000 }).withMessage('Le message doit contenir entre 5 et 2000 caractères.'),
    body('annonce_id')
        .notEmpty()
        .isInt({ min: 1 }).withMessage('L\'identifiant de l\'annonce n\'est pas valide.'),
];
