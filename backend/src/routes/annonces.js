import { Router } from 'express'
import authMiddleware from '../middleware/auth.js'
import {
  getAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
} from '../controllers/annoncesController.js'

const router = Router()

// Routes publiques
router.get('/', getAnnonces)
router.get('/:id', getAnnonceById)

// Routes protégées (token requis)
router.post('/', authMiddleware, createAnnonce)//authMiddleware
router.put('/:id', authMiddleware, updateAnnonce)
router.delete('/:id', authMiddleware, deleteAnnonce)

export default router
