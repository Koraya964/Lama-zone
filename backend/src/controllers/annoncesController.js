import pool from '../config/db.js'

// GET /api/annonces
export const getAnnonces = async (req, res) => {
  try {
    const { q, categorie, prix_min, prix_max, localisation } = req.query

    let query = `
      SELECT a.*, u.nom AS auteur_nom, c.nom AS categorie_nom
      FROM annonces a
      JOIN utilisateurs u ON a.utilisateur_id = u.id
      LEFT JOIN categories c ON a.categorie_id = c.id
      WHERE 1=1
    `
    const params = []

    if (q) {
      query += ' AND (a.titre LIKE ? OR a.description LIKE ?)'
      params.push(`%${q}%`, `%${q}%`)
    }
    if (categorie) {
      query += ' AND a.categorie_id = ?'
      params.push(categorie)
    }
    if (prix_min) {
      query += ' AND a.prix >= ?'
      params.push(prix_min)
    }
    if (prix_max) {
      query += ' AND a.prix <= ?'
      params.push(prix_max)
    }
    if (localisation) {
      query += ' AND a.localisation LIKE ?'
      params.push(`%${localisation}%`)
    }

    query += ' ORDER BY a.date_publication DESC'

    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// GET /api/annonces/:id
export const getAnnonceById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.nom AS auteur_nom, u.email AS auteur_email, c.nom AS categorie_nom
       FROM annonces a
       JOIN utilisateurs u ON a.utilisateur_id = u.id
       LEFT JOIN categories c ON a.categorie_id = c.id
       WHERE a.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Annonce introuvable' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// POST /api/annonces
export const createAnnonce = async (req, res) => {
  try {
    const { titre, description, prix, categorie_id, localisation } = req.body

    if (!titre || !description || !prix) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (titre, description, prix)' })
    }

    const [result] = await pool.query(
      `INSERT INTO annonces (titre, description, prix, categorie_id, localisation, utilisateur_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titre, description, prix, categorie_id ?? null, localisation ?? null, req.user.id]
    )

    res.status(201).json({ message: 'Annonce créée', id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// PUT /api/annonces/:id
export const updateAnnonce = async (req, res) => {
  try {
    const { titre, description, prix, categorie_id, localisation } = req.body

    const [rows] = await pool.query('SELECT * FROM annonces WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Annonce introuvable' })
    if (rows[0].utilisateur_id !== req.user.id) return res.status(403).json({ message: 'Non autorisé' })

    await pool.query(
      `UPDATE annonces SET titre=?, description=?, prix=?, categorie_id=?, localisation=? WHERE id=?`,
      [titre, description, prix, categorie_id ?? null, localisation ?? null, req.params.id]
    )

    res.json({ message: 'Annonce mise à jour' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// DELETE /api/annonces/:id
export const deleteAnnonce = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM annonces WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Annonce introuvable' })
    if (rows[0].utilisateur_id !== req.user.id) return res.status(403).json({ message: 'Non autorisé' })

    await pool.query('DELETE FROM annonces WHERE id = ?', [req.params.id])
    res.json({ message: 'Annonce supprimée' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
