import cors from 'cors'

// Lista de orígenes aceptados
const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'https://pulsesurveys.netlify.app'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      // Permitir orígenes específicos
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // Permitir solicitudes sin origen (como las de Postman o cURL)
      if (!origin) {
        return callback(null, true)
      }

      // En producción, permitir temporalmente cualquier origen .netlify.app
      if (origin && origin.includes('.netlify.app')) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
  })
