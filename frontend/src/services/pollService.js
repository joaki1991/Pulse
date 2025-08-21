import api from './api'

export const pollService = {
  // Obtener encuestas públicas
  getPublicPolls: async (page = 1, limit = 10) => {
    const response = await api.get(`/polls/public?page=${page}&limit=${limit}`)
    return response.data
  },

  // Buscar encuestas
  searchPolls: async (query) => {
    const response = await api.get(`/polls/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Obtener encuesta por ID
  getPollById: async (id) => {
    const response = await api.get(`/polls/${id}`)
    return response.data
  },

  // Crear nueva encuesta
  createPoll: async (pollData) => {
    const config = {}
    
    // Si es FormData (con imagen), configurar el Content-Type apropiado
    if (pollData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    const response = await api.post('/polls', pollData, config)
    return response.data
  },

  // Obtener encuestas del usuario
  getUserPolls: async () => {
    const response = await api.get('/polls/user/my-polls')
    return response.data
  },

  // Actualizar encuesta
  updatePoll: async (id, pollData) => {
    const config = {}
    
    // Si es FormData (con imagen), configurar el Content-Type apropiado
    if (pollData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    const response = await api.put(`/polls/${id}`, pollData, config)
    return response.data
  },

  // Eliminar encuesta
  deletePoll: async (id) => {
    const response = await api.delete(`/polls/${id}`)
    return response.data
  },

  // Obtener información demográfica de los votantes
  getPollDemographics: async (id) => {
    const response = await api.get(`/polls/${id}/demographics`)
    return response.data
  }
}
