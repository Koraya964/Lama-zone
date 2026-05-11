// On centralise ici les requêtes liées aux refresh tokens
import pool from '../config/db.js';
import crypto from 'crypto';

const RefreshTokenModel = {
    // On génère un token aléatoire sécurisé de 64 octets
    generer: () => crypto.randomBytes(64).toString('hex'),

    // On crée un refresh token en base avec une expiration à 7 jours
    create: async (utilisateur_id, token) => {
        const dateExpiration = new Date();
        dateExpiration.setDate(dateExpiration.getDate() + 7);

        await pool.execute(
            'INSERT INTO refresh_tokens (token, utilisateur_id, date_expiration) VALUES (?, ?, ?)',
            [token, utilisateur_id, dateExpiration]
        );
    },

    // On recherche un refresh token valide et non expiré
    findValide: async (token) => {
        const [rows] = await pool.execute(
            `SELECT rt.*, u.id AS uid, u.nom, u.prenom, u.email
            FROM refresh_tokens rt
            JOIN utilisateurs u ON rt.utilisateur_id = u.id
            WHERE rt.token = ?
            AND rt.date_expiration > NOW()`,
            [token]
        );
        return rows[0] || null;
    },

    // On supprime un refresh token spécifique lors du logout
    delete: async (token) => {
        await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    },

    // On supprime tous les refresh tokens d'un utilisateur — utile pour déconnecter toutes les sessions
    deleteAllForUser: async (utilisateur_id) => {
        await pool.execute(
            'DELETE FROM refresh_tokens WHERE utilisateur_id = ?',
            [utilisateur_id]
        );
    },

    // On nettoie les tokens expirés — à appeler périodiquement pour ne pas encombrer la table
    purgerExpires: async () => {
        const [result] = await pool.execute(
            'DELETE FROM refresh_tokens WHERE date_expiration < NOW()'
        );
        return result.affectedRows;
    },
};

export default RefreshTokenModel;