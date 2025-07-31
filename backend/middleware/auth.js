import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET

// Middleware obligatorio: requiere token válido
export function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No Token sent' })
  }

  jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired Token' })
    }

    req.user = decodedUser
    next()
  })
}

// Middleware opcional: si hay token, lo verifica; si no, pasa igual
export function optionalAuth (req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return next() // sigue sin usuario
  }

  jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
    if (!err) {
      req.user = decodedUser
    }
    next() // sigue igual con o sin user
  })
}
