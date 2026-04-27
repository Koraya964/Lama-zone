// Les catégories sont publiques, on n'a pas besoin d'être connecté pour les lire
import { Router } from 'express';
import { getCategories } from '../controllers/categories.controller.js';

const router = Router();

router.get('/', getCategories);

export default router;
