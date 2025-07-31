import express from 'express'
import { corsMiddleware } from './middleware/cors.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'

// Importar rutas
import userRoutes from './routes/userRoute.js'
import pollRoutes from './routes/pollRoute.js'
import voteRoutes from './routes/voteRoute.js'

dotenv.config()

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()

app.disable('x-powered-by') // Deshabilitar encabezado x-powered-by
app.use(corsMiddleware())
app.use(express.json())

// Middleware para obtener IP real
app.use((req, res, next) => {
  // Usar una propiedad personalizada para la IP real
  req.realIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
              req.connection.remoteAddress ||
              req.socket.remoteAddress ||
              req.ip
  next()
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Servidor en puerto ${PORT}: http://localhost:${PORT}`)
)

// Rutas
app.get('/', (req, res) => res.send('API Pulse funcionando ✅'))
app.use('/api/users', userRoutes)
app.use('/api/polls', pollRoutes)
app.use('/api/votes', voteRoutes)

/** Para probar la subida de imágenes a Cloudinary
cloudinary.uploader.upload('abuelos.jpg')
  .then(result => {
    console.log('📸 Imagen subida:', result.secure_url);
  })
  .catch(err => {
    console.error('❌ Error al subir imagen:', err);
  });
*/
