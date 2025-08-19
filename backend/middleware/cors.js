import cors from 'cors'

// Lista de orígenes aceptados
const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'https://pulsesurveys.netlify.app'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true) // Permitir solicitudes sin origen (como las de Postman o cURL)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
