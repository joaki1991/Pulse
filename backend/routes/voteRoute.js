import { Router } from 'express'
import {
  createVote,
  updateVote,
  deleteVote,
  getUserVoteInPoll,
  getPollVotes,
  getPollResults,
  getUserVotes
} from '../controllers/voteController.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = Router()

// 🔹 Rutas públicas/semi-públicas
router.get('/results/:pollId', optionalAuth, getPollResults) // Obtener resultados de encuesta

// 🔹 Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, createVote) // Votar en encuesta
router.put('/', authenticateToken, updateVote) // Cambiar voto
router.delete('/poll/:pollId', authenticateToken, deleteVote) // Eliminar voto
router.get('/user/my-votes', authenticateToken, getUserVotes) // Obtener votos del usuario
router.get('/user/:pollId', authenticateToken, getUserVoteInPoll) // Obtener voto específico del usuario
router.get('/poll/:pollId', authenticateToken, getPollVotes) // Obtener todos los votos de una encuesta (solo creador)

export default router
