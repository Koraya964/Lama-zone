// Point d'entrée du serveur Express
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On précise le chemin absolu pour que le .env soit trouvé peu importe d'où le serveur est lancé
dotenv.config({ path: path.resolve(__dirname, '.env') });

import annoncesRoutes from './routes/annonces.routes.js';
import authRoutes from './routes/auth.routes.js';
import utilisateursRoutes from './routes/utilisateurs.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
const PORT = process.env.PORT;

// On autorise les requêtes venant du frontend
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// On expose le dossier uploads pour servir les images statiquement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Définition des routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/annonces', annoncesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/messages', messagesRoutes);

// Route de test pour vérifier que le serveur répond
app.get('/api/test', (req, res) => {
    res.json({ message: 'Le serveur fonctionne correctement.' });
});

// Middleware de gestion des erreurs, il doit rester en dernier
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;