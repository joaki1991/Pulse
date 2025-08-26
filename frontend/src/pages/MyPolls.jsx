import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, BarChart3, Eye, EyeOff, Edit, Trash2, Calendar } from 'lucide-react'
import { pollService } from '../services/pollService'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyPolls = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAnonymous } = useAuth()
  const { openCreateModal, openEditModal } = useModal()
  const navigate = useNavigate()

  useEffect(() => {
    loadPolls()
    
    // Escuchar cuando se crea una nueva encuesta
    const handlePollCreated = (event) => {
      const newPoll = event.detail
      setPolls(prev => [newPoll, ...prev])
    }
    
    // Escuchar cuando se actualiza una encuesta
    const handlePollUpdated = (event) => {
      const updatedPoll = event.detail
      setPolls(prev => prev.map(poll => 
        poll._id === updatedPoll._id ? { ...poll, ...updatedPoll } : poll
      ))
    }
    
    window.addEventListener('pollCreated', handlePollCreated)
    window.addEventListener('pollUpdated', handlePollUpdated)
    
    return () => {
      window.removeEventListener('pollCreated', handlePollCreated)
      window.removeEventListener('pollUpdated', handlePollUpdated)
    }
  }, [])

  const loadPolls = async () => {
    try {
      setLoading(true)
      const data = await pollService.getUserPolls()
      setPolls(data)
    } catch {
      toast.error('Error al cargar tus encuestas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePoll = async (pollId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta encuesta? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await pollService.deletePoll(pollId)
      setPolls(prev => prev.filter(poll => poll._id !== pollId))
      toast.success('Encuesta eliminada')
    } catch {
      toast.error('Error al eliminar la encuesta')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isAnonymous() ? 'Mis Encuestas (Sesión Actual)' : 'Mis Encuestas'}
            </h1>
            <p className="text-gray-600">
              {isAnonymous() 
                ? 'Encuestas creadas en esta sesión' 
                : 'Gestiona y analiza tus encuestas creadas'
              }
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 btn-primary flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Nueva Encuesta
          </motion.button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <BarChart3 className="text-primary-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {polls.length}
            </h3>
            <p className="text-gray-600">Encuestas Creadas</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {polls.reduce((acc, poll) => acc + (poll.totalVotes || 0), 0)}
            </h3>
            <p className="text-gray-600">Total de Votos</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {polls.filter(poll => new Date(poll.createdAt) > Date.now() - 7*24*60*60*1000).length}
            </h3>
            <p className="text-gray-600">Esta Semana</p>
          </div>
        </motion.div>

        {/* Polls List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : polls.length > 0 ? (
            <div className="space-y-6">
              {polls.map((poll, index) => (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {poll.question}
                        </h3>
                        {poll.isPrivate ? (
                          <EyeOff className="text-orange-500 flex-shrink-0" size={18} />
                        ) : (
                          <Eye className="text-green-500 flex-shrink-0" size={18} />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <BarChart3 className="mr-1" size={16} />
                          <span>{poll.totalVotes || 0} votos</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1" size={16} />
                          <span>{formatDate(poll.createdAt)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          poll.isPrivate 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {poll.isPrivate ? 'Privada' : 'Pública'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => navigate(`/poll/${poll._id}`)}
                        className="btn-secondary flex items-center text-sm"
                      >
                        <Eye className="mr-1" size={16} />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => openEditModal(poll)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar encuesta"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePoll(poll._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar encuesta"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {poll.voteCounts && poll.voteCounts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {poll.voteCounts.slice(0, 3).map((option, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {option._id}
                              </span>
                              <span className="text-sm text-gray-600">
                                {poll.totalVotes > 0 ? Math.round((option.count / poll.totalVotes) * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: poll.totalVotes > 0 ? `${(option.count / poll.totalVotes) * 100}%` : '0%'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aún no has creado encuestas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera encuesta y comienza a recopilar opiniones
              </p>
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="mr-2" size={20} />
                Crear Mi Primera Encuesta
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default MyPolls
