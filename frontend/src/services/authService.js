import api from './api'

export const authService = {
  // Crear usuario anónimo
  createAnonymousUser: async () => {
    const response = await api.post('/users/anonymous')
    return response.data
  },

  // Registro de usuario
  register: async (userData) => {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  // Login de usuario
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  // Verificar usuario por IP
  checkUserByIP: async (ip) => {
    const response = await api.get(`/users/check-ip/${ip}`)
    return response.data
  },

  // Obtener información del usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Guardar datos de autenticación
  saveAuthData: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}
