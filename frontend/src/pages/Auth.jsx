import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    location: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        })
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? parseInt(formData.age) : undefined,
          location: formData.location || undefined
        })
      }
      navigate('/')
    } catch (error) {
      // Error already handled in context
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      age: '',
      location: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                onClick={toggleMode}
                className="ml-1 font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name field for registration */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="name" className="sr-only">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-12 input-field"
                      placeholder="Nombre completo"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 input-field"
                    placeholder="Correo electrónico"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 input-field"
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Additional fields for registration */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-4"
                >
                  {/* Age field */}
                  <div>
                    <label htmlFor="age" className="sr-only">
                      Edad
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="13"
                        max="120"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="pl-12 input-field"
                        placeholder="Edad (opcional)"
                      />
                    </div>
                  </div>

                  {/* Location field */}
                  <div>
                    <label htmlFor="location" className="sr-only">
                      Ubicación
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="pl-12 input-field"
                        placeholder="Ubicación (opcional)"
                      />
                    </div>
                  </div>

                  {/* Terms notice */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                    Podrás crear encuestas con imágenes y acceder a estadísticas detalladas.
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </div>
                ) : (
                  <>
                    {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  </>
                )}
              </motion.button>
            </div>

            {/* Back to home */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
              >
                ← Volver al inicio
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Auth
