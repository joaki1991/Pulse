import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Image, Lock, Globe, Upload, AlertCircle } from 'lucide-react'
import { pollService } from '../services/pollService'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import toast from 'react-hot-toast'

const CreatePollModal = () => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAnonymous } = useAuth()
  const { showCreateModal, closeCreateModal } = useModal()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB')
        return
      }

      setSelectedImage(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validOptions = options.filter(option => option.trim())
    
    if (!question.trim()) {
      toast.error('La pregunta es obligatoria')
      return
    }
    
    if (validOptions.length < 2) {
      toast.error('Debes agregar al menos 2 opciones')
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('question', question.trim())
      formData.append('options', JSON.stringify(validOptions))
      formData.append('isPrivate', isPrivate.toString())
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }
      
      const newPoll = await pollService.createPoll(formData)
      toast.success('¡Encuesta creada exitosamente!')
      handleReset()
      closeCreateModal()
      
      // Disparar evento personalizado para notificar que se creó una encuesta
      window.dispatchEvent(new CustomEvent('pollCreated', { detail: newPoll }))
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear la encuesta'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuestion('')
    setOptions(['', ''])
    setIsPrivate(false)
    setSelectedImage(null)
    setImagePreview(null)
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleClose = () => {
    handleReset()
    closeCreateModal()
  }

  return (
    <AnimatePresence>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Encuesta</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pregunta *
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="¿Cuál es tu pregunta?"
                    className="input-field h-24 resize-none"
                    maxLength={200}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {question.length}/200 caracteres
                  </p>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opciones *
                  </label>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Opción ${index + 1}`}
                            className="input-field"
                            maxLength={100}
                          />
                        </div>
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {options.length < 10 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-3 flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Plus size={18} className="mr-1" />
                      Agregar opción
                    </button>
                  )}
                </div>

                {/* Image Upload - Solo para usuarios registrados */}
                {!isAnonymous() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen (Opcional)
                    </label>
                    
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            Haz clic para subir una imagen
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP hasta 5MB
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Configuración de Privacidad
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      className={`w-full p-4 border-2 rounded-xl transition-all ${
                        !isPrivate
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe className="text-green-600 mr-3" size={20} />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Pública</p>
                          <p className="text-sm text-gray-600">
                            Visible para todos los usuarios
                          </p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      className={`w-full p-4 border-2 rounded-xl transition-all ${
                        isPrivate
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Lock className="text-orange-600 mr-3" size={20} />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Privada</p>
                          <p className="text-sm text-gray-600">
                            Solo visible para ti
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Anonymous User Notice */}
                {isAnonymous() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Limitaciones de usuario anónimo
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Como usuario anónimo, no puedes subir imágenes a tus encuestas. 
                          Regístrate para acceder a todas las funcionalidades.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 pb-8 flex justify-end space-x-3 flex-shrink-0 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary min-h-[44px]"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary min-h-[44px]"
                disabled={loading || !question.trim() || options.filter(o => o.trim()).length < 2}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando...
                  </div>
                ) : (
                  'Crear Encuesta'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreatePollModal
