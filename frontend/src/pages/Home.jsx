import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { pollService } from '../services/pollService'
import PollCard from '../components/PollCard'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import toast from 'react-hot-toast'

const Home = () => {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typedText, setTypedText] = useState('')
  const { isAnonymous } = useAuth()
  const { openCreateModal } = useModal()
  
  const fullText = "Descubre opiniones, crea encuestas y conecta con la comunidad"

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

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

  const loadPolls = async () => {
    try {
      setLoading(true)
      const data = await pollService.getPublicPolls()
      setPolls(data)
    } catch {
      toast.error('Error al cargar las encuestas')
    } finally {
      setLoading(false)
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
      setPolls(data)
    } catch {
      toast.error('Error en la búsqueda')
    } finally {
      setLoading(false)
    }
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/20"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Buscar
                </button>
              </div>
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Encuestas Populares
            </h2>
            <p className="text-xl text-gray-600">
              Participa en las conversaciones más interesantes
            </p>
          </div>

          {loading ? (
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
                No se encontraron encuestas
              </h3>
              <p className="text-gray-600 mb-6">
                Sé el primero en crear una encuesta
              </p>
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="mr-2" size={20} />
                Crear Primera Encuesta
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
            <button className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Registrarse Gratis
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
