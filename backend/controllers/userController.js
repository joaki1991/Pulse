import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'
import { generateConsistentAnonymousName } from '../utils/nameGenerator.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js'

const SALT_ROUNDS = 10

// 🔹 1. Crear usuario anónimo basado en IP
export const createAnonymousUser = async (req, res) => {
  try {
    const ip = req.realIP || req.ip || req.connection.remoteAddress
    if (!ip) return res.status(400).json({ error: 'IP not found' })

    // Buscar usuario existente por IP usando un campo interno
    const existingUser = await User.findOne({ anonymousId: ip })
    if (existingUser) {
      const token = generateToken(existingUser)
      return res.status(200).json({ user: existingUser, token })
    }

    // Generar nombre aleatorio consistente basado en la IP
    const anonymousName = generateConsistentAnonymousName(ip)

    const newUser = new User({
      name: anonymousName,
      anonymousId: ip, // Campo interno para identificar por IP
      isAnonymous: true
    })
    await newUser.save()

    const token = generateToken(newUser)
    res.status(201).json({ user: newUser, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 2. Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, location, avatar } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ $or: [{ name }, { email }] })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isAnonymous: false,
      age,
      location,
      avatar
    })

    await user.save()
    const token = generateToken(user)
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 3. Login de usuario
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })

    const token = generateToken(user)
    res.status(200).json({ user, token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 4. Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 5. Obtener usuario por ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 6. Filtrar usuario por nombre o email
export const filterUser = async (req, res) => {
  try {
    const { query } = req.query
    if (!query) return res.status(400).json({ error: 'Query required' })

    const users = await User.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    })

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 7. Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS)
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })
    if (!updatedUser) return res.status(404).json({ error: 'User not found' })

    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 8. Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'User not found' })
    res.status(200).json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 9. Actualizar avatar de usuario
export const updateUserAvatar = async (req, res) => {
  try {
    const { id } = req.params
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' })
    }

    // Obtener el usuario actual
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Si el usuario ya tenía un avatar, eliminar el anterior de Cloudinary
    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId)
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError)
      }
    }

    // Subir nueva imagen a Cloudinary
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, `avatars/${id}`)
      
      // Actualizar usuario con nueva imagen
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          avatar: uploadResult.secure_url,
          avatarPublicId: uploadResult.public_id
        },
        { new: true }
      )

      res.status(200).json(updatedUser)
    } catch (uploadError) {
      return res.status(400).json({ error: 'Error al subir la imagen: ' + uploadError.message })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 10. Verificar si un usuario ya está registrado con una IP
export const checkUserByIP = async (req, res) => {
  try {
    const { ip } = req.params
    if (!ip) return res.status(400).json({ error: 'IP is required' })

    const existingUser = await User.findOne({ anonymousId: ip, isAnonymous: true })
    const exists = !!existingUser

    res.status(200).json({ exists, user: existingUser || null })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
