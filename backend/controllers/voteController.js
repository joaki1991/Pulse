import Vote from '../models/Vote.js'
import Poll from '../models/Poll.js'

// 🔹 1. Votar en una encuesta
export const createVote = async (req, res) => {
  try {
    const { pollId, selectedOption } = req.body

    if (!pollId || !selectedOption) {
      return res.status(400).json({
        error: 'Poll ID and selected option are required'
      })
    }

    // Verificar que la encuesta existe
    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que la opción seleccionada existe
    if (!poll.options.includes(selectedOption)) {
      return res.status(400).json({ error: 'Invalid option selected' })
    }

    // Verificar si el usuario ya votó en esta encuesta
    const existingVote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    })

    if (existingVote) {
      return res.status(409).json({ error: 'User has already voted in this poll' })
    }

    // Crear el voto
    const vote = new Vote({
      poll: pollId,
      user: req.user.id,
      selectedOption
    })

    await vote.save()
    await vote.populate('user', 'name avatar')
    await vote.populate('poll', 'question')

    res.status(201).json(vote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 2. Cambiar voto en una encuesta
export const updateVote = async (req, res) => {
  try {
    const { pollId, selectedOption } = req.body

    if (!pollId || !selectedOption) {
      return res.status(400).json({
        error: 'Poll ID and selected option are required'
      })
    }

    // Verificar que la encuesta existe
    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que la opción seleccionada existe
    if (!poll.options.includes(selectedOption)) {
      return res.status(400).json({ error: 'Invalid option selected' })
    }

    // Buscar el voto existente
    const existingVote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    })

    if (!existingVote) {
      return res.status(404).json({ error: 'No vote found for this user in this poll' })
    }

    // Actualizar el voto
    existingVote.selectedOption = selectedOption
    existingVote.votedAt = new Date()
    await existingVote.save()

    await existingVote.populate('user', 'name avatar')
    await existingVote.populate('poll', 'question')

    res.status(200).json(existingVote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 3. Eliminar voto de una encuesta
export const deleteVote = async (req, res) => {
  try {
    const { pollId } = req.params

    if (!pollId) {
      return res.status(400).json({ error: 'Poll ID is required' })
    }

    // Buscar y eliminar el voto
    const deletedVote = await Vote.findOneAndDelete({
      poll: pollId,
      user: req.user.id
    })

    if (!deletedVote) {
      return res.status(404).json({ error: 'No vote found for this user in this poll' })
    }

    res.status(200).json({ message: 'Vote deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 4. Obtener voto de un usuario en una encuesta específica
export const getUserVoteInPoll = async (req, res) => {
  try {
    const { pollId } = req.params

    if (!pollId) {
      return res.status(400).json({ error: 'Poll ID is required' })
    }

    const vote = await Vote.findOne({
      poll: pollId,
      user: req.user.id
    })
      .populate('user', 'name avatar')
      .populate('poll', 'question')

    if (!vote) {
      return res.status(404).json({ error: 'No vote found for this user in this poll' })
    }

    res.status(200).json(vote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 5. Obtener todos los votos de una encuesta (solo para el creador)
export const getPollVotes = async (req, res) => {
  try {
    const { pollId } = req.params

    // Verificar que la encuesta existe
    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar que el usuario es el creador de la encuesta
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Only the poll creator can view detailed votes'
      })
    }

    const votes = await Vote.find({ poll: pollId })
      .populate('user', 'name avatar isAnonymous')
      .sort({ votedAt: -1 })

    res.status(200).json(votes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 6. Obtener resultados resumidos de una encuesta (público)
export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params

    // Verificar que la encuesta existe
    const poll = await Poll.findById(pollId)
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' })
    }

    // Verificar si es privada
    if (poll.isPrivate && (!req.user || poll.creator.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'This poll is private' })
    }

    // Obtener conteo de votos por opción
    const voteCounts = await Vote.aggregate([
      { $match: { poll: poll._id } },
      { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
    ])

    const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

    // Formatear resultados con porcentajes
    const results = poll.options.map(option => {
      const voteCount = voteCounts.find(vote => vote._id === option)?.count || 0
      return {
        option,
        votes: voteCount,
        percentage: totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0
      }
    })

    res.status(200).json({
      pollId: poll._id,
      question: poll.question,
      totalVotes,
      results
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🔹 7. Obtener todos los votos de un usuario
export const getUserVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id })
      .populate('poll', 'question creator')
      .sort({ votedAt: -1 })

    res.status(200).json(votes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
