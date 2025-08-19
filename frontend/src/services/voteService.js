import api from './api'

export const voteService = {
  // Votar en una encuesta
  createVote: async (pollId, selectedOption) => {
    const response = await api.post('/votes', { pollId, selectedOption })
    return response.data
  },

  // Cambiar voto
  updateVote: async (pollId, selectedOption) => {
    const response = await api.put('/votes', { pollId, selectedOption })
    return response.data
  },

  // Eliminar voto
  deleteVote: async (pollId) => {
    const response = await api.delete(`/votes/poll/${pollId}`)
    return response.data
  },

  // Obtener voto del usuario en una encuesta
  getUserVoteInPoll: async (pollId) => {
    const response = await api.get(`/votes/user/${pollId}`)
    return response.data
  },

  // Obtener resultados de una encuesta
  getPollResults: async (pollId) => {
    const response = await api.get(`/votes/results/${pollId}`)
    return response.data
  },

  // Obtener votos del usuario
  getUserVotes: async () => {
    const response = await api.get('/votes/user/my-votes')
    return response.data
  },

  // Obtener todos los votos de una encuesta (solo creador)
  getPollVotes: async (pollId) => {
    const response = await api.get(`/votes/poll/${pollId}`)
    return response.data
  }
}
