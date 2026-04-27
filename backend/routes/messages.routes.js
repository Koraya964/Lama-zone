// On définit ici les routes de messagerie, toutes protégées
import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messages.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { messageRules, validate } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/conversations', authMiddleware, getConversations);
router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, messageRules, validate, sendMessage);

export default router;
