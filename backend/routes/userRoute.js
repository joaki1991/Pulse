import { Router } from 'express'
import {
  createAnonymousUser,
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  filterUser,
  updateUser,
  deleteUser,
  checkUserByIP
} from '../controllers/UserController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 🔹 Rutas públicas (sin autenticación)
router.post('/anonymous', createAnonymousUser) // Crear usuario anónimo por IP
router.post('/register', registerUser) // Registro de usuario
router.post('/login', loginUser) // Login de usuario
router.get('/check-ip/:ip', checkUserByIP) // Verificar si existe usuario por IP

// 🔹 Rutas protegidas (requieren autenticación)
router.get('/', authenticateToken, getAllUsers) // Obtener todos los usuarios
router.get('/search', authenticateToken, filterUser) // Filtrar usuarios por nombre/email
router.get('/:id', authenticateToken, getUser) // Obtener usuario por ID
router.put('/:id', authenticateToken, updateUser) // Actualizar usuario
router.delete('/:id', authenticateToken, deleteUser) // Eliminar usuario

export default router
