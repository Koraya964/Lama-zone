// On centralise ici les requêtes liées aux avis laissés sur les vendeurs
import pool from '../config/db.js';

const AvisModel = {
    // On récupère tous les avis reçus par un vendeur avec le nom de l'auteur
    findByVendeur: async (vendeur_id) => {
        const [rows] = await pool.execute(
            `SELECT
                a.id, a.note, a.commentaire, a.date_creation,
                u.id AS auteur_id, u.nom AS auteur_nom, u.prenom AS auteur_prenom
            FROM avis a
            JOIN utilisateurs u ON a.auteur_id = u.id
            WHERE a.vendeur_id = ?
            ORDER BY a.date_creation DESC`,
            [vendeur_id]
        );
        return rows;
    },

    // On vérifie si l'utilisateur a déjà laissé un avis sur ce vendeur
    findByAuteurEtVendeur: async (auteur_id, vendeur_id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM avis WHERE auteur_id = ? AND vendeur_id = ?',
            [auteur_id, vendeur_id]
        );
        return rows[0] || null;
    },

    // On crée un nouvel avis après vérification qu'il n'en existe pas déjà un
    create: async ({ note, commentaire, auteur_id, vendeur_id }) => {
        const [result] = await pool.execute(
            'INSERT INTO avis (note, commentaire, auteur_id, vendeur_id) VALUES (?, ?, ?, ?)',
            [note, commentaire || null, auteur_id, vendeur_id]
        );
        return result.insertId;
    },

    // On met à jour un avis existant de l'utilisateur
    update: async (id, { note, commentaire }) => {
        const [result] = await pool.execute(
            'UPDATE avis SET note = ?, commentaire = ? WHERE id = ?',
            [note, commentaire || null, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM avis WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
};

export default AvisModel;