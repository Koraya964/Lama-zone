// On définit ici les routes publiques d'authentification
import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { registerRules, loginRules, validate } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// Ces deux routes lisent le cookie refresh_token — pas besoin d'être authentifié via JWT
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;