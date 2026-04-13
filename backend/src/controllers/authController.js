import 'dotenv/config'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { nom, email, password } = req.body

        if (!nom || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires (nom, email, password)' })
        }

        const [existing] = await pool.query('SELECT id FROM utilisateurs WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé' })
        }

        const hashedPassword = await argon2.hash(password)

        const [result] = await pool.query(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)',
            [nom, email, hashedPassword]
        )

        res.status(201).json({ message: 'Compte créé avec succès', id: result.insertId })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' })
        }

        const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email])
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
        }

        const user = rows[0]

        const validPassword = await argon2.verify(user.mot_de_passe, password)
        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, nom: user.nom },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            user: { id: user.id, nom: user.nom, email: user.email },
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

// GET /api/auth/me
export const me = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nom, email, date_creation FROM utilisateurs WHERE id = ?',
            [req.user.id]
        )
        if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable' })
        res.json(rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}