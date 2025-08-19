import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Clock, BarChart3, Check, Edit, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { pollService } from '../services/pollService'
import { voteService } from '../services/voteService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PollDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState(null)

  useEffect(() => {
    loadPoll()
  }, [id])

  const loadPoll = async () => {
    try {
      setLoading(true)
      const data = await pollService.getPollById(id)
      setPoll(data)
      setUserVote(data.userVote)
      setHasVoted(!!data.userVote)
      if (data.userVote) {
        setSelectedOption(data.userVote)
      }
    } catch (error) {
      toast.error('Error al cargar la encuesta')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Selecciona una opción')
      return
    }

    try {
      setVoting(true)
      
      if (hasVoted) {
        await voteService.updateVote(id, selectedOption)
        toast.success('Voto actualizado')
      } else {
        await voteService.createVote(id, selectedOption)
        toast.success('¡Voto registrado!')
      }
      
      // Recargar datos
      await loadPoll()
    } catch (error) {
      const message = error.response?.data?.error || 'Error al votar'
      toast.error(message)
    } finally {
      setVoting(false)
    }
  }

  const handleDeleteVote = async () => {
    try {
      await voteService.deleteVote(id)
      toast.success('Voto eliminado')
      await loadPoll()
      setSelectedOption('')
    } catch (error) {
      toast.error('Error al eliminar el voto')
    }
  }

  const isCreator = user && poll && poll.creator._id === user._id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Encuesta no encontrada</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const chartData = poll.voteCounts?.map(vote => ({
    name: vote._id,
    value: vote.count,
    percentage: poll.totalVotes > 0 ? ((vote.count / poll.totalVotes) * 100).toFixed(1) : 0
  })) || []

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver al inicio
          </button>

          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {poll.creator?.avatar ? (
                  <img
                    src={poll.creator.avatar}
                    alt={poll.creator.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="text-primary-600" size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {poll.creator?.name || 'Usuario Anónimo'}
                  </h3>
                  <div className="flex items-center text-gray-500">
                    <Clock size={16} className="mr-1" />
                    <span className="text-sm">{formatDate(poll.createdAt)}</span>
                  </div>
                </div>
              </div>

              {isCreator && (
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {poll.question}
            </h1>

            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <BarChart3 size={18} className="mr-2" />
                <span>{poll.totalVotes} votos</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                <span>{poll.options.length} opciones</span>
              </div>
              {poll.isPrivate && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  Privada
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voting Section */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {hasVoted ? 'Tu voto' : 'Votar'}
            </h2>

            <div className="space-y-3 mb-6">
              {poll.options.map((option, index) => (
                <motion.label
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedOption === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="pollOption"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-gray-900 font-medium">
                      {option}
                    </span>
                    {hasVoted && userVote === option && (
                      <Check className="ml-auto text-green-600" size={20} />
                    )}
                  </div>
                </motion.label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleVote}
                disabled={voting || !selectedOption}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {voting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {hasVoted ? 'Actualizando...' : 'Votando...'}
                  </div>
                ) : hasVoted ? (
                  'Cambiar voto'
                ) : (
                  'Votar'
                )}
              </button>

              {hasVoted && (
                <button
                  onClick={handleDeleteVote}
                  className="btn-secondary"
                >
                  Quitar voto
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resultados</h2>

            {poll.totalVotes > 0 ? (
              <div className="space-y-6">
                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`${value} votos`, 'Votos']}
                      />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Results */}
                <div className="space-y-3">
                  {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{item.value} votos</span>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aún no hay votos en esta encuesta</p>
                <p className="text-sm">¡Sé el primero en votar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PollDetail
