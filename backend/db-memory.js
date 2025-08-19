import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod = null

export const connectToMemoryDB = async () => {
  try {
    console.log('🚀 Iniciando base de datos en memoria...')
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()

    await mongoose.connect(uri)
    console.log('✅ Conectado a MongoDB en memoria')
    console.log('📍 URI:', uri)
    return uri
  } catch (error) {
    console.error('❌ Error iniciando base de datos en memoria:', error)
    throw error
  }
}

export const disconnectMemoryDB = async () => {
  try {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()

    if (mongod) {
      await mongod.stop()
    }
    console.log('🛑 Base de datos en memoria cerrada')
  } catch (error) {
    console.error('❌ Error cerrando base de datos:', error)
  }
}
