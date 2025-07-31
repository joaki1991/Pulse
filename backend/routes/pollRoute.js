import { Router } from 'express'
import {
  createPoll,
  getPublicPolls,
  getPollById,
  getUserPolls,
  updatePoll,
  deletePoll,
  searchPolls
} from '../controllers/pollController.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = Router()

// 🔹 Rutas públicas/semi-públicas
router.get('/public', getPublicPolls) // Obtener encuestas públicas
router.get('/search', searchPolls) // Buscar encuestas públicas
router.get('/:id', optionalAuth, getPollById) // Obtener encuesta por ID (auth opcional)

// 🔹 Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, createPoll) // Crear nueva encuesta
router.get('/user/my-polls', authenticateToken, getUserPolls) // Obtener encuestas del usuario
router.put('/:id', authenticateToken, updatePoll) // Actualizar encuesta
router.delete('/:id', authenticateToken, deletePoll) // Eliminar encuesta

export default router
