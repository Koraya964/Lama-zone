import { Router } from 'express'

const router = Router()

// GET /api/test — vérification du serveur
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Le serveur Express fonctionne correctement',
    timestamp: new Date().toISOString(),
  })
})

export default router
