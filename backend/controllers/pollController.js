import Poll from '../models/Poll.js'
import Vote from '../models/Vote.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js'

// 🔹 1. Crear nueva encuesta
export const createPoll = async (req, res) => {
  try {
    let { question, options, isPrivate } = req.body

    // Si viene como FormData, las opciones pueden ser un string JSON
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options)
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid options format'
        })
      }
    }

    // Convertir isPrivate a boolean si viene como string
    if (typeof isPrivate === 'string') {
      isPrivate = isPrivate === 'true'
    }

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: 'Question and at least 2 options are required'
      })
    }

    const pollData = {
      question,
      options,
      creator: req.user.id,
      isPrivate: isPrivate || false
    }

    // Si hay una imagen, subirla a Cloudinary
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname)
        pollData.image = uploadResult.secure_url
        pollData.imagePublicId = uploadResult.public_id
      } catch (uploadError) {
        return res.status(400).json({ error: 'Error al subir la imagen: ' + uploadError.message })
      }
    }

    const poll = new Poll(pollData)
    await poll.save()
    await poll.populate('creator', 'name avatar')

    res.status(201).json(poll)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 2. Obtener todas las encuestas públicas
export const getPublicPolls = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const polls = await Poll.find({ isPrivate: false })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Agregar conteo de votos a cada encuesta
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const voteCounts = await Vote.aggregate([
          { $match: { poll: poll._id } },
          { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
        ])

        const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

        return {
          ...poll.toObject(),
          voteCounts,
          totalVotes
        }
      })
    )

    res.status(200).json(pollsWithVotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 3. Obtener encuesta por ID con resultados
export const getPollById = async (req, res) => {
  try {
    const { id } = req.params

    const poll = await Poll.findById(id)
      .populate('creator', 'name avatar')

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }
    // Obtener resultados de votos
    const voteCounts = await Vote.aggregate([
      { $match: { poll: poll._id } },
      { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
    ])

    const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

    // Verificar si el usuario actual ya votó
    let userVote = null
    if (req.user) {
      userVote = await Vote.findOne({ poll: poll._id, user: req.user.id })
    }

    res.status(200).json({
      ...poll.toObject(),
      voteCounts,
      totalVotes,
      userVote: userVote?.selectedOption || null
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 4. Obtener encuestas del usuario autenticado
export const getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user.id })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })

    // Agregar conteo de votos a cada encuesta
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const voteCounts = await Vote.aggregate([
          { $match: { poll: poll._id } },
          { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
        ])

        const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

        return {
          ...poll.toObject(),
          voteCounts,
          totalVotes
        }
      })
    )

    res.status(200).json(pollsWithVotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 5. Actualizar encuesta (solo el creador)
export const updatePoll = async (req, res) => {
  try {
    const { id } = req.params
    let { question, options, isPrivate } = req.body

    // Si viene como FormData, las opciones pueden ser un string JSON
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options)
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid options format'
        })
      }
    }

    // Convertir isPrivate a boolean si viene como string
    if (typeof isPrivate === 'string') {
      isPrivate = isPrivate === 'true'
    }

    const poll = await Poll.findById(id)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que sea el creador
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can update this poll' })
    }

    // Verificar que no tenga votos antes de permitir edición
    const hasVotes = await Vote.findOne({ poll: id })
    if (hasVotes) {
      return res.status(400).json({
        error: 'Cannot update poll that already has votes'
      })
    }

    const updates = {}
    if (question) updates.question = question
    if (options && Array.isArray(options) && options.length >= 2) {
      updates.options = options
    }
    if (typeof isPrivate === 'boolean') updates.isPrivate = isPrivate

    // Manejar actualización de imagen
    if (req.file) {
      try {
        // Si ya tenía una imagen, eliminar la anterior de Cloudinary
        if (poll.imagePublicId) {
          await deleteFromCloudinary(poll.imagePublicId)
        }

        // Subir nueva imagen
        const imageUrl = await uploadToCloudinary(req.file.buffer, `polls/${id}`)
        updates.image = imageUrl.secure_url
        updates.imagePublicId = imageUrl.public_id
      } catch (imageError) {
        return res.status(400).json({ error: 'Error uploading image: ' + imageError.message })
      }
    }

    const updatedPoll = await Poll.findByIdAndUpdate(id, updates, { new: true })
      .populate('creator', 'name avatar')

    res.status(200).json(updatedPoll)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 6. Eliminar encuesta (solo el creador)
export const deletePoll = async (req, res) => {
  try {
    const { id } = req.params

    const poll = await Poll.findById(id)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que sea el creador
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can delete this poll' })
    }

    // Eliminar imagen de Cloudinary si existe
    if (poll.imagePublicId) {
      try {
        await deleteFromCloudinary(poll.imagePublicId)
      } catch (imageError) {
        console.error('Error deleting image from Cloudinary:', imageError)
        // Continuar con la eliminación de la encuesta aunque falle la imagen
      }
    }

    // Eliminar todos los votos asociados
    await Vote.deleteMany({ poll: id })

    // Eliminar la encuesta
    await Poll.findByIdAndDelete(id)

    res.status(200).json({ message: 'Poll and associated votes deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 7. Buscar encuestas por palabra clave
export const searchPolls = async (req, res) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    // Buscar tanto en la pregunta como en las opciones
    const polls = await Poll.find({
      isPrivate: false,
      $or: [
        { question: new RegExp(q, 'i') },
        { options: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50) // Limitar resultados para mejor performance

    // Agregar conteo de votos
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const voteCounts = await Vote.aggregate([
          { $match: { poll: poll._id } },
          { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
        ])

        const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

        return {
          ...poll.toObject(),
          voteCounts,
          totalVotes
        }
      })
    )

    res.status(200).json(pollsWithVotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 8. Obtener información demográfica de los votantes (solo para creadores de la encuesta)
export const getPollDemographics = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que la encuesta existe
    const poll = await Poll.findById(id).populate('creator')
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que el usuario es el creador de la encuesta
    if (poll.creator._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. Only poll creator can view demographics.' })
    }

    // Obtener todos los votos con información del usuario
    const votes = await Vote.find({ poll: id })
      .populate('user', 'name age location isAnonymous anonymousId')

    // Procesar datos demográficos
    const demographics = {
      totalVotes: votes.length,
      ageDistribution: {},
      locationDistribution: {},
      userTypes: {
        registered: 0,
        anonymous: 0
      },
      votesByOption: {},
      timeline: []
    }

    votes.forEach(vote => {
      const user = vote.user

      // Contar tipos de usuario
      if (user.isAnonymous) {
        demographics.userTypes.anonymous++
      } else {
        demographics.userTypes.registered++
      }

      // Distribución por edad (solo usuarios registrados)
      if (!user.isAnonymous && user.age) {
        const ageGroup = getAgeGroup(user.age)
        demographics.ageDistribution[ageGroup] = (demographics.ageDistribution[ageGroup] || 0) + 1
      }

      // Distribución por ubicación (solo usuarios registrados)
      if (!user.isAnonymous && user.location) {
        demographics.locationDistribution[user.location] = (demographics.locationDistribution[user.location] || 0) + 1
      }

      // Votos por opción
      demographics.votesByOption[vote.selectedOption] = (demographics.votesByOption[vote.selectedOption] || 0) + 1

      // Timeline de votos
      demographics.timeline.push({
        date: vote.votedAt,
        option: vote.selectedOption,
        userType: user.isAnonymous ? 'anonymous' : 'registered'
      })
    })

    // Ordenar timeline por fecha
    demographics.timeline.sort((a, b) => new Date(a.date) - new Date(b.date))

    res.status(200).json(demographics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Función auxiliar para agrupar edades
const getAgeGroup = (age) => {
  if (age < 18) return '< 18'
  if (age < 25) return '18-24'
  if (age < 35) return '25-34'
  if (age < 45) return '35-44'
  if (age < 55) return '45-54'
  if (age < 65) return '55-64'
  return '65+'
}
