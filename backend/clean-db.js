import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Configurar dotenv
dotenv.config({ path: './backend/.env' })
dotenv.config()

async function cleanDatabase () {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Eliminar la colección de usuarios para limpiar los índices
    await mongoose.connection.db.dropCollection('users')
    console.log('🗑️ Colección de usuarios eliminada')

    await mongoose.connection.close()
    console.log('✅ Base de datos limpiada y conexión cerrada')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

cleanDatabase()
