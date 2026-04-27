// On définit ici les routes publiques d'authentification
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { registerRules, loginRules, validate } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

export default router;
