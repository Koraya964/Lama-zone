// On centralise ici toutes les requêtes SQL liées aux annonces
import pool from '../config/db.js';

const AnnonceModel = {
    // On récupère toutes les annonces avec les informations de l'auteur et de la catégorie
    findAll: async ({ search, categorie_id, prix_min, prix_max, localisation, sort } = {}) => {
        let query = `
            SELECT 
                a.id, a.titre, a.description, a.prix, a.localisation, a.date_publication,
                u.id AS utilisateur_id, u.nom AS utilisateur_nom,
                c.id AS categorie_id, c.nom AS categorie_nom,
                (SELECT url FROM images WHERE annonce_id = a.id LIMIT 1) AS image_principale
            FROM annonces a
            JOIN utilisateurs u ON a.utilisateur_id = u.id
            JOIN categories c ON a.categorie_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // On ajoute les filtres dynamiquement selon les paramètres reçus
        if (search) {
            query += ' AND (a.titre LIKE ? OR a.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (categorie_id) {
            query += ' AND a.categorie_id = ?';
            params.push(categorie_id);
        }
        if (prix_min) {
            query += ' AND a.prix >= ?';
            params.push(prix_min);
        }
        if (prix_max) {
            query += ' AND a.prix <= ?';
            params.push(prix_max);
        }
        if (localisation) {
            query += ' AND a.localisation LIKE ?';
            params.push(`%${localisation}%`);
        }

        // On gère le tri, avec une valeur par défaut sur la date de publication
        const sortOptions = {
            'date_desc': 'a.date_publication DESC',
            'date_asc': 'a.date_publication ASC',
            'prix_asc': 'a.prix ASC',
            'prix_desc': 'a.prix DESC',
        };
        query += ` ORDER BY ${sortOptions[sort] || 'a.date_publication DESC'}`;

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    // On récupère une annonce par son identifiant avec toutes ses images
    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT 
                a.*, 
                u.id AS utilisateur_id, u.nom AS utilisateur_nom, u.email AS utilisateur_email,
                c.nom AS categorie_nom
            FROM annonces a
            JOIN utilisateurs u ON a.utilisateur_id = u.id
            JOIN categories c ON a.categorie_id = c.id
            WHERE a.id = ?`,
            [id]
        );

        if (rows.length === 0) return null;

        // On récupère également toutes les images associées à l'annonce
        const [images] = await pool.execute(
            'SELECT id, url FROM images WHERE annonce_id = ?',
            [id]
        );

        return { ...rows[0], images };
    },

    // On récupère toutes les annonces publiées par un utilisateur donné
    findByUtilisateur: async (utilisateur_id) => {
        const [rows] = await pool.execute(
            `SELECT 
                a.id, a.titre, a.prix, a.localisation, a.date_publication,
                c.nom AS categorie_nom,
                (SELECT url FROM images WHERE annonce_id = a.id LIMIT 1) AS image_principale
            FROM annonces a
            JOIN categories c ON a.categorie_id = c.id
            WHERE a.utilisateur_id = ?
            ORDER BY a.date_publication DESC`,
            [utilisateur_id]
        );
        return rows;
    },

    // On crée une nouvelle annonce et on retourne son identifiant généré
    create: async ({ titre, description, prix, localisation, utilisateur_id, categorie_id }) => {
        const [result] = await pool.execute(
            'INSERT INTO annonces (titre, description, prix, localisation, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?, ?, ?)',
            [titre, description, prix, localisation, utilisateur_id, categorie_id]
        );
        return result.insertId;
    },

    // On met à jour uniquement les champs fournis
    update: async (id, { titre, description, prix, localisation, categorie_id }) => {
        const [result] = await pool.execute(
            'UPDATE annonces SET titre = ?, description = ?, prix = ?, localisation = ?, categorie_id = ? WHERE id = ?',
            [titre, description, prix, localisation, categorie_id, id]
        );
        return result.affectedRows > 0;
    },

    // On supprime l'annonce ainsi que ses images en cascade grâce à la contrainte SQL
    delete: async (id) => {
        const [result] = await pool.execute('DELETE FROM annonces WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
};

export default AnnonceModel;
