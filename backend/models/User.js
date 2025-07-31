import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // En caso de ser invitado, se usará la IP como nombre
    unique: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: false,
    unique: true, // debe ser único en la colección
    match: [/^\S+@\S+\.\S+$/, 'Invalid Mail'] // regex para validar formato email
  },
  password: {
    type: String,
    required: false, // no es obligatorio para usuarios en modo invitado identificados con ip
    minlength: [6, 'Password must be at least 6 characters']
  },
  isAnonymous: {
    type: Boolean,
    required: true,
    default: true
  },
  age: {
    type: Number,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  avatar: {
    type: String, // URL de la imagen en Cloudinary
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
