// On définit ici les routes du profil utilisateur et des avis
import { Router } from 'express';
import {
    getProfil,
    getProfilPublic,
    updateProfil,
    updatePassword,
    deleteCompte,
} from '../controllers/utilisateurs.controller.js';
import {
    getAvisVendeur,
    createOrUpdateAvis,
    deleteAvis,
} from '../controllers/avis.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Route publique pour consulter le profil d'un vendeur depuis une annonce
router.get('/:id/public', getProfilPublic);
router.get('/:vendeurId/avis', getAvisVendeur);

// Routes protégées pour la gestion du propre compte
router.get('/profil', authMiddleware, getProfil);
router.put('/profil', authMiddleware, updateProfil);
router.put('/profil/password', authMiddleware, updatePassword);
router.delete('/profil', authMiddleware, deleteCompte);

// Routes protégées pour les avis
router.post('/:vendeurId/avis', authMiddleware, createOrUpdateAvis);
router.delete('/:vendeurId/avis', authMiddleware, deleteAvis);

export default router;