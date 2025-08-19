import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { pollService } from '../services/pollService'
import PollCard from '../components/PollCard'
import toast from 'react-hot-toast'

const Explore = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, mostVoted
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadPolls()
  }, [sortBy])

  const loadPolls = async () => {
    try {
      setLoading(true)
      const data = await pollService.getPublicPolls(page, 20)
      
      // Sort polls based on selected criteria
      const sortedPolls = sortPolls(data, sortBy)
      setPolls(sortedPolls)
    } catch (error) {
      toast.error('Error al cargar las encuestas')
    } finally {
      setLoading(false)
    }
  }

  const sortPolls = (pollsArray, criteria) => {
    switch (criteria) {
      case 'oldest':
        return [...pollsArray].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'mostVoted':
        return [...pollsArray].sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
      case 'newest':
      default:
        return [...pollsArray].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      loadPolls()
      return
    }

    try {
      setLoading(true)
      const data = await pollService.searchPolls(searchTerm)
      const sortedPolls = sortPolls(data, sortBy)
      setPolls(sortedPolls)
    } catch (error) {
      toast.error('Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explorar Encuestas
          </h1>
          <p className="text-lg text-gray-600">
            Descubre opiniones y participa en las conversaciones que más te interesan
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar encuestas por tema, palabras clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </form>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <Filter className="text-gray-400" size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="mostVoted">Más votadas</option>
              </select>
              
              {sortBy === 'newest' || sortBy === 'oldest' ? (
                sortBy === 'newest' ? (
                  <SortDesc className="text-gray-400" size={20} />
                ) : (
                  <SortAsc className="text-gray-400" size={20} />
                )
              ) : (
                <SortDesc className="text-gray-400" size={20} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : polls.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas las encuestas'}
                </h2>
                <span className="text-gray-600">
                  {polls.length} encuesta{polls.length !== 1 ? 's' : ''} encontrada{polls.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll, index) => (
                  <motion.div
                    key={poll._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <PollCard poll={poll} />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {polls.length >= 20 && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => {
                      setPage(prev => prev + 1)
                      loadPolls()
                    }}
                    className="btn-primary px-8 py-3"
                  >
                    Cargar más encuestas
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron encuestas
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta con diferentes palabras clave o revisa la ortografía.'
                  : 'Aún no hay encuestas públicas disponibles.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    loadPolls()
                  }}
                  className="btn-secondary"
                >
                  Ver todas las encuestas
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Explore
