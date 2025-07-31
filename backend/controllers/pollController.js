import Poll from '../models/Poll.js'
import Vote from '../models/Vote.js'

// 🔹 1. Crear nueva encuesta
export const createPoll = async (req, res) => {
  try {
    const { question, options, isPrivate } = req.body

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: 'Question and at least 2 options are required'
      })
    }

    const poll = new Poll({
      question,
      options,
      creator: req.user.id,
      isPrivate: isPrivate || false
    })

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

    // Verificar si es privada y el usuario no es el creador
    if (poll.isPrivate && (!req.user || poll.creator._id.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'This poll is private' })
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
    const { question, options, isPrivate } = req.body

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

    const polls = await Poll.find({
      isPrivate: false,
      question: new RegExp(q, 'i')
    })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })

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
