// On centralise ici les requêtes liées aux catégories
import pool from '../config/db.js';

const CategorieModel = {
    // On récupère toutes les catégories disponibles pour les formulaires et les filtres
    findAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY nom ASC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0] || null;
    },
};

export default CategorieModel;
