import 'dotenv/config'
import express from 'express'
import cors from 'cors'


import testRouter from './routes/test.js'
import annoncesRouter from './routes/annonces.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT ?? 5000

// Middlewares globaux
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/test', testRouter)
app.use('/api/annonces', annoncesRouter)
app.use('/api/auth', authRouter)
// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' })
})

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
