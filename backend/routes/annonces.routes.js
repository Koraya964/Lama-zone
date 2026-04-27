// On définit ici les routes des annonces, certaines sont publiques et d'autres protégées
import { Router } from 'express';
import {
    getAnnonces,
    getAnnonceById,
    getMesAnnonces,
    createAnnonce,
    updateAnnonce,
    deleteAnnonce,
    deleteImage,
} from '../controllers/annonces.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { annonceRules, validate } from '../middlewares/validation.middleware.js';

const router = Router();

// Routes publiques accessibles sans connexion
router.get('/', getAnnonces);
router.get('/:id', getAnnonceById);

// Routes protégées, nécessitent un token valide
router.get('/utilisateur/mes-annonces', authMiddleware, getMesAnnonces);
router.post('/', authMiddleware, upload.array('images', 5), annonceRules, validate, createAnnonce);
router.put('/:id', authMiddleware, upload.array('images', 5), annonceRules, validate, updateAnnonce);
router.delete('/:id', authMiddleware, deleteAnnonce);
router.delete('/:id/images/:imageId', authMiddleware, deleteImage);

export default router;
