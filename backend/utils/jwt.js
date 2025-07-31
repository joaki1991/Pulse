import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET

export const generateToken = (user) => {
  // Creo un payload con info mínima para identificar usuario y devolver la edad y avatar
  if (!user || !user._id) {
    throw new Error('User object is required to generate token')
  }

  const payload = {
    id: user._id,
    username: user.name, // Cambio username por name que es lo que usamos
    userAge: user.age || null,
    userAvatar: user.avatar || null,
    userIsAnonymous: user.isAnonymous,
    userLocation: user.location || null
  }

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' }) // token válido 7 días
}
