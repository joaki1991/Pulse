import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, TrendingUp, Users, BarChart3, X, Loader2 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { useNavigate } from 'react-router-dom'
import { pollService } from '../services/pollService'
import PollCard from '../components/PollCard'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import toast from 'react-hot-toast'

const Home = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { isAnonymous } = useAuth()
  const { openCreateModal } = useModal()
  const navigate = useNavigate()
  
  // Ref para hacer scroll a la sección de encuestas
  const pollsSectionRef = useRef(null)
  
  const fullText = "Descubre opiniones, crea encuestas y conecta con la comunidad"

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setIsSearching(false)
        await loadPolls()
        return
      }

      try {
        setSearchLoading(true)
        setIsSearching(true)
        const data = await pollService.searchPolls(term)
        setPolls(data)
        
        // Hacer scroll a la sección de resultados después de que se complete la búsqueda
        setTimeout(() => {
          scrollToPollsSection()
        }, 300)
      } catch (error) {
        console.error('Search error:', error)
        toast.error('Error en la búsqueda')
      } finally {
        setSearchLoading(false)
      }
    }, 500),
    []
  )

  // Debounce utility function
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Función para hacer scroll suave a la sección de encuestas
  const scrollToPollsSection = () => {
    if (pollsSectionRef.current) {
      pollsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Efecto de escritura para el subtítulo
  useEffect(() => {
    if (!heroInView) return
    
    let currentIndex = 0
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, 50) // Velocidad de escritura (ms por letra)

    return () => clearInterval(typeInterval)
  }, [heroInView, fullText])

  useEffect(() => {
    loadPolls()
    
    // Escuchar cuando se crea una nueva encuesta
    const handlePollCreated = (event) => {
      const newPoll = event.detail
      setPolls(prev => [newPoll, ...prev])
    }
    
    window.addEventListener('pollCreated', handlePollCreated)
    
    return () => {
      window.removeEventListener('pollCreated', handlePollCreated)
    }
  }, [])

  // Effect for search term changes (debounced search)
  useEffect(() => {
    if (searchTerm !== '') {
      debouncedSearch(searchTerm)
    } else if (isSearching) {
      // If search term is cleared, reload all polls
      setIsSearching(false)
      loadPolls()
    }
  }, [searchTerm, debouncedSearch, isSearching])

  const loadPolls = async () => {
    try {
      setLoading(true)
      const data = await pollService.getPublicPolls()
      setPolls(data)
    } catch (error) {
      console.error('Load polls error:', error)
      toast.error('Error al cargar las encuestas')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      clearSearch()
      return
    }
    
    // Si ya hay un término de búsqueda, hacer scroll inmediatamente
    // La búsqueda se maneja automáticamente por el debounced effect
    if (isSearching && polls.length > 0) {
      scrollToPollsSection()
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setIsSearching(false)
    loadPolls()
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  const handleRegisterClick = () => {
    navigate('/auth')
  }

  const stats = [
    { icon: BarChart3, label: 'Encuestas Activas', value: polls.length, color: 'text-blue-600' },
    { icon: Users, label: 'Participantes', value: polls.reduce((acc, poll) => acc + poll.totalVotes, 0), color: 'text-green-600' },
    { icon: TrendingUp, label: 'Tendencias', value: '↗ 24%', color: 'text-purple-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section ref={heroRef} className="gradient-bg text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Pulse<span className="text-accent-500">.</span>
            </h1>
            <div className="text-xl md:text-2xl mb-8 opacity-90 h-8">
              {typedText}
              <span className="animate-pulse">|</span>
            </div>
            
            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar encuestas..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-12 pr-20 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/20 transition-all"
                />
                
                {/* Loading indicator or clear button */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {searchLoading ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : searchTerm ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                  
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {searchLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
              
              {/* Search status */}
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center text-white/80"
                >
                  Buscando "{searchTerm}"... {polls.length} resultado{polls.length !== 1 ? 's' : ''} encontrado{polls.length !== 1 ? 's' : ''}
                </motion.div>
              )}
            </motion.form>

            {/* Create Poll Button */}
            <motion.button
              onClick={openCreateModal}
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="inline mr-2" size={20} />
              Crear Encuesta
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white rounded-xl p-8 shadow-lg text-center"
              >
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Polls Section */}
      <section ref={pollsSectionRef} className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isSearching ? `Resultados para "${searchTerm}"` : 'Encuestas Populares'}
            </h2>
            <p className="text-xl text-gray-600">
              {isSearching 
                ? `${polls.length} encuesta${polls.length !== 1 ? 's' : ''} encontrada${polls.length !== 1 ? 's' : ''}`
                : 'Participa en las conversaciones más interesantes'
              }
            </p>
          </div>

          {loading || searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : polls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                {isSearching 
                  ? `No se encontraron encuestas para "${searchTerm}"`
                  : 'No se encontraron encuestas'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {isSearching 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Sé el primero en crear una encuesta'
                }
              </p>
              {isSearching ? (
                <button
                  onClick={clearSearch}
                  className="btn-secondary mr-4"
                >
                  Ver todas las encuestas
                </button>
              ) : null}
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="mr-2" size={20} />
                {isSearching ? 'Crear Nueva Encuesta' : 'Crear Primera Encuesta'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section for Anonymous Users */}
      {isAnonymous() && (
        <section className="py-16 px-4 bg-gray-900 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Quieres más funciones?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Regístrate para crear encuestas con imágenes y acceder a estadísticas avanzadas.
            </p>
            <motion.button 
              onClick={handleRegisterClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Registrarse Gratis
            </motion.button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
