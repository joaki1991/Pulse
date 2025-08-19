import { motion } from 'framer-motion'
import { Clock, User, BarChart3, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PollCard = ({ poll }) => {
  const navigate = useNavigate()

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTopOption = () => {
    if (!poll.voteCounts || poll.voteCounts.length === 0) return null
    
    return poll.voteCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    )
  }

  const topOption = getTopOption()

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="card-hover cursor-pointer"
      onClick={() => navigate(`/poll/${poll._id}`)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {poll.creator?.avatar ? (
              <img
                src={poll.creator.avatar}
                alt={poll.creator.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="text-primary-600" size={20} />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {poll.creator?.name || 'Usuario Anónimo'}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                {formatDate(poll.createdAt)}
              </div>
            </div>
          </div>
          {poll.isPrivate && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              Privada
            </span>
          )}
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
          {poll.question}
        </h3>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <BarChart3 size={16} className="mr-1" />
              <span>{poll.totalVotes || 0} votos</span>
            </div>
            <div className="flex items-center">
              <Eye size={16} className="mr-1" />
              <span>{poll.options?.length || 0} opciones</span>
            </div>
          </div>
        </div>

        {/* Top Option Preview */}
        {topOption && poll.totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">Opción líder:</span>
              <span className="text-primary-600 font-semibold">
                {((topOption.count / poll.totalVotes) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(topOption.count / poll.totalVotes) * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              "{topOption._id}"
            </p>
          </div>
        )}

        {/* Action */}
        <div className="pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary py-2"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/poll/${poll._id}`)
            }}
          >
            Ver Encuesta
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default PollCard
