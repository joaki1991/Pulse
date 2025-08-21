import { Router } from 'express'
import {
  createPoll,
  getPublicPolls,
  getPollById,
  getUserPolls,
  updatePoll,
  deletePoll,
  searchPolls,
  getPollDemographics
} from '../controllers/pollController.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// 🔹 Rutas públicas/semi-públicas
router.get('/public', getPublicPolls) // Obtener encuestas públicas
router.get('/search', searchPolls) // Buscar encuestas públicas
router.get('/:id', optionalAuth, getPollById) // Obtener encuesta por ID (auth opcional)

// 🔹 Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, upload.single('image'), createPoll) // Crear nueva encuesta con imagen opcional
router.get('/user/my-polls', authenticateToken, getUserPolls) // Obtener encuestas del usuario
router.get('/:id/demographics', authenticateToken, getPollDemographics) // Obtener demografía de votantes
router.put('/:id', authenticateToken, upload.single('image'), updatePoll) // Actualizar encuesta con imagen opcional
router.delete('/:id', authenticateToken, deletePoll) // Eliminar encuesta

export default router
