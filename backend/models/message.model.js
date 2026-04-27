// On centralise ici les requêtes liées aux messages entre utilisateurs
import pool from '../config/db.js';

const MessageModel = {
    // On récupère la liste des conversations d'un utilisateur, regroupées par annonce
    findConversations: async (utilisateur_id) => {
        const [rows] = await pool.execute(
            `SELECT 
                m.annonce_id,
                a.titre AS annonce_titre,
                CASE 
                    WHEN m.expediteur_id = ? THEN m.destinataire_id
                    ELSE m.expediteur_id
                END AS interlocuteur_id,
                CASE 
                    WHEN m.expediteur_id = ? THEN ud.nom
                    ELSE ue.nom
                END AS interlocuteur_nom,
                m.contenu AS dernier_message,
                m.date_envoi
            FROM messages m
            JOIN annonces a ON m.annonce_id = a.id
            JOIN utilisateurs ue ON m.expediteur_id = ue.id
            JOIN utilisateurs ud ON m.destinataire_id = ud.id
            WHERE m.expediteur_id = ? OR m.destinataire_id = ?
            GROUP BY m.annonce_id, interlocuteur_id
            ORDER BY m.date_envoi DESC`,
            [utilisateur_id, utilisateur_id, utilisateur_id, utilisateur_id]
        );
        return rows;
    },

    // On récupère tous les messages d'une conversation entre deux utilisateurs sur une annonce
    findByConversation: async (annonce_id, utilisateur_a, utilisateur_b) => {
        const [rows] = await pool.execute(
            `SELECT 
                m.id, m.contenu, m.date_envoi,
                u.id AS expediteur_id, u.nom AS expediteur_nom
            FROM messages m
            JOIN utilisateurs u ON m.expediteur_id = u.id
            WHERE m.annonce_id = ?
            AND (
                (m.expediteur_id = ? AND m.destinataire_id = ?)
                OR
                (m.expediteur_id = ? AND m.destinataire_id = ?)
            )
            ORDER BY m.date_envoi ASC`,
            [annonce_id, utilisateur_a, utilisateur_b, utilisateur_b, utilisateur_a]
        );
        return rows;
    },

    // On enregistre le message en base après vérification des droits
    create: async ({ contenu, expediteur_id, destinataire_id, annonce_id }) => {
        const [result] = await pool.execute(
            'INSERT INTO messages (contenu, expediteur_id, destinataire_id, annonce_id) VALUES (?, ?, ?, ?)',
            [contenu, expediteur_id, destinataire_id, annonce_id]
        );
        return result.insertId;
    },
};

export default MessageModel;
