// On centralise ici les requêtes liées aux images des annonces
import pool from '../config/db.js';

const ImageModel = {
    // On insère une image en base après l'upload réussi sur le disque
    create: async ({ url, annonce_id }) => {
        const [result] = await pool.execute(
            'INSERT INTO images (url, annonce_id) VALUES (?, ?)',
            [url, annonce_id]
        );
        return result.insertId;
    },

    // On supprime une image spécifique par son identifiant
    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM images WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // On supprime toutes les images d'une annonce, utilisé avant la suppression de l'annonce
    deleteByAnnonce: async (annonce_id) => {
        await pool.execute('DELETE FROM images WHERE annonce_id = ?', [annonce_id]);
    },

    // On vérifie que l'image appartient bien à une annonce donnée avant toute modification
    findById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM images WHERE id = ?', [id]);
        return rows[0] || null;
    },
};

export default ImageModel;
