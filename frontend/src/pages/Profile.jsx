import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    avatar: ''
  })

  useEffect(() => {
    if (user && !user.isAnonymous) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        location: user.location || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedUser = await userService.updateUser(user._id, formData)
      setUser(updatedUser)
      setIsEditing(false)
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      age: user.age || '',
      location: user.location || '',
      avatar: user.avatar || ''
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const updatedUser = await userService.updateUserAvatar(user._id, file)
      setUser(updatedUser)
      setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }))
      toast.success('Avatar actualizado correctamente')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir el avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Cargando...</div>
      </div>
    )
  }

  if (user.isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Perfil no disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Necesitas registrarte para acceder a tu perfil y personalizar tu información.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/auth'}
              className="btn-primary"
            >
              Registrarse ahora
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Editar Perfil
              </motion.button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={triggerFileInput}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors disabled:bg-gray-400"
                  >
                    {uploadingAvatar ? (
                      <Upload className="animate-spin" size={20} />
                    ) : (
                      <Camera size={20} />
                    )}
                  </motion.button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Haz click en el ícono para cambiar tu avatar<br />
                  (Máximo 5MB, formatos: JPG, PNG, GIF)
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="13"
                  max="120"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ciudad, País"
                  className="input-field"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">Usuario registrado</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-gray-700 text-sm font-medium mb-1">Email</h3>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                {user.age && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="text-gray-700 text-sm font-medium mb-1">Edad</h3>
                    <p className="text-gray-900">{user.age} años</p>
                  </div>
                )}

                {user.location && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="text-gray-700 text-sm font-medium mb-1">Ubicación</h3>
                    <p className="text-gray-900">{user.location}</p>
                  </div>
                )}

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-gray-700 text-sm font-medium mb-1">Miembro desde</h3>
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
