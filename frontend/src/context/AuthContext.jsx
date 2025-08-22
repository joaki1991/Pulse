import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario en localStorage al cargar
    const savedUser = authService.getCurrentUser()
    if (savedUser) {
      setUser(savedUser)
    } else {
      // Si no hay usuario, crear uno anónimo automáticamente
      createAnonymousUser()
    }
    setLoading(false)
  }, [])

  const createAnonymousUser = async () => {
    try {
      const { user, token } = await authService.createAnonymousUser()
      authService.saveAuthData(user, token)
      setUser(user)
      return user
    } catch (error) {
      console.error('Error creating anonymous user:', error)
      toast.error('Error al crear usuario anónimo')
    }
  }

  const register = async (userData) => {
    try {
      const { user, token } = await authService.register(userData)
      authService.saveAuthData(user, token)
      setUser(user)
      toast.success('¡Registro exitoso!')
      return user
    } catch (error) {
      const message = error.response?.data?.error || 'Error en el registro'
      toast.error(message)
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      const { user, token } = await authService.login(credentials)
      authService.saveAuthData(user, token)
      setUser(user)
      toast.success('¡Bienvenido de vuelta!')
      return user
    } catch (error) {
      const message = error.response?.data?.error || 'Error en el login'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    // Crear nuevo usuario anónimo después del logout
    createAnonymousUser()
    toast.success('Sesión cerrada')
  }

  const isAuthenticated = () => {
    return authService.isAuthenticated()
  }

  const isAnonymous = () => {
    return user?.isAnonymous === true
  }

  const value = {
    user,
    setUser,
    loading,
    register,
    login,
    logout,
    createAnonymousUser,
    isAuthenticated,
    isAnonymous
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
