// On centralise ici toutes les requêtes SQL liées aux utilisateurs
import pool from '../config/db.js';

const UtilisateurModel = {
    // On recherche un utilisateur par son email, utile pour la connexion
    findByEmail: async (email) => {
        const [rows] = await pool.execute(
            'SELECT * FROM utilisateurs WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    },

    // On récupère le profil complet sans exposer le mot de passe
    // On calcule également la note moyenne et le nombre d'avis reçus
    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT
                u.id, u.nom, u.prenom, u.email, u.telephone,
                u.adresse, u.ville, u.code_postal, u.date_naissance, u.date_creation,
                ROUND(AVG(a.note), 1) AS note_moyenne,
                COUNT(a.id) AS nombre_avis
            FROM utilisateurs u
            LEFT JOIN avis a ON a.vendeur_id = u.id
            WHERE u.id = ?
            GROUP BY u.id`,
            [id]
        );
        return rows[0] || null;
    },

    // On crée un nouvel utilisateur avec le mot de passe déjà hashé en amont
    create: async ({ nom, prenom, email, mot_de_passe }) => {
        const [result] = await pool.execute(
            'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)',
            [nom, prenom, email, mot_de_passe]
        );
        return result.insertId;
    },

    // On met à jour toutes les informations du profil sauf le mot de passe
    update: async (id, { nom, prenom, email, telephone, adresse, ville, code_postal, date_naissance }) => {
        const [result] = await pool.execute(
            `UPDATE utilisateurs
            SET nom = ?, prenom = ?, email = ?, telephone = ?,
                adresse = ?, ville = ?, code_postal = ?, date_naissance = ?
            WHERE id = ?`,
            [nom, prenom, email, telephone || null, adresse || null, ville || null, code_postal || null, date_naissance || null, id]
        );
        return result.affectedRows > 0;
    },

    // On met à jour uniquement le mot de passe, déjà hashé avant cet appel
    updatePassword: async (id, mot_de_passe) => {
        const [result] = await pool.execute(
            'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?',
            [mot_de_passe, id]
        );
        return result.affectedRows > 0;
    },

    // On supprime le compte, les annonces et messages seront supprimés en cascade
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM utilisateurs WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },
};

export default UtilisateurModel;