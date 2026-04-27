// On vérifie ici que le token JWT est présent et valide avant d'accéder aux routes protégées
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // On attend un header du format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // On attache les données de l'utilisateur à la requête pour les controllers suivants
        req.utilisateur = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};
