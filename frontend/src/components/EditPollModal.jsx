import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Lock, Globe } from 'lucide-react'
import { pollService } from '../services/pollService'
import { useModal } from '../context/ModalContext'
import toast from 'react-hot-toast'

const EditPollModal = () => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showEditModal, closeEditModal, editingPoll } = useModal()

  // Inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (showEditModal && editingPoll) {
      setQuestion(editingPoll.question || '')
      setOptions(editingPoll.options || ['', ''])
      setIsPrivate(editingPoll.isPrivate || false)
    }
  }, [showEditModal, editingPoll])

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
      const pollData = {
        question: question.trim(),
        options: validOptions,
        isPrivate
      }
      
      await pollService.updatePoll(editingPoll._id, pollData)
      toast.success('¡Encuesta actualizada exitosamente!')
      handleClose()
      
      // Disparar evento personalizado para notificar que se actualizó una encuesta
      window.dispatchEvent(new CustomEvent('pollUpdated', { detail: { ...editingPoll, ...pollData } }))
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar la encuesta'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (options.length < 6) {
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
    closeEditModal()
  }

  if (!editingPoll) return null

  return (
    <AnimatePresence>
      {showEditModal && (
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
              <h2 className="text-2xl font-bold text-gray-900">Editar Encuesta</h2>
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
                  
                  {options.length < 6 && (
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

                {/* Warning about existing votes */}
                {editingPoll.totalVotes > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-amber-800">
                          Esta encuesta ya tiene votos
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          Ten en cuenta que cambiar las opciones puede afectar la consistencia de los resultados existentes ({editingPoll.totalVotes} votos).
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
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar Encuesta'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EditPollModal
