import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, Calendar, BarChart3, TrendingUp, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts'
import { pollService } from '../services/pollService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PollDemographics = ({ pollId, isCreator }) => {
  const [demographics, setDemographics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { user } = useAuth()

  useEffect(() => {
    if (isCreator && pollId) {
      loadDemographics()
    }
  }, [pollId, isCreator])

  const loadDemographics = async () => {
    try {
      setLoading(true)
      const data = await pollService.getPollDemographics(pollId)
      setDemographics(data)
    } catch (error) {
      console.error('Error loading demographics:', error)
      toast.error('Error al cargar información demográfica')
    } finally {
      setLoading(false)
    }
  }

  if (!isCreator) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!demographics || demographics.totalVotes === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Información de Votantes
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aún no hay votos para analizar</p>
          <p className="text-sm">Los datos demográficos aparecerán cuando los usuarios voten</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

  // Preparar datos para gráficos
  const ageData = Object.entries(demographics.ageDistribution).map(([age, count]) => ({
    name: age,
    value: count,
    percentage: ((count / demographics.totalVotes) * 100).toFixed(1)
  }))

  const locationData = Object.entries(demographics.locationDistribution).map(([location, count]) => ({
    name: location,
    value: count,
    percentage: ((count / demographics.totalVotes) * 100).toFixed(1)
  }))

  const userTypeData = [
    {
      name: 'Registrados',
      value: demographics.userTypes.registered,
      percentage: ((demographics.userTypes.registered / demographics.totalVotes) * 100).toFixed(1)
    },
    {
      name: 'Anónimos',
      value: demographics.userTypes.anonymous,
      percentage: ((demographics.userTypes.anonymous / demographics.totalVotes) * 100).toFixed(1)
    }
  ]

  // Preparar datos del timeline para el gráfico de línea
  const timelineData = demographics.timeline.reduce((acc, vote) => {
    const date = new Date(vote.date).toLocaleDateString()
    const existing = acc.find(item => item.date === date)
    
    if (existing) {
      existing.total += 1
      existing[vote.userType] = (existing[vote.userType] || 0) + 1
    } else {
      acc.push({
        date,
        total: 1,
        [vote.userType]: 1
      })
    }
    return acc
  }, [])

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'demographics', label: 'Demografía', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h3 className="text-xl font-bold flex items-center">
          <BarChart3 className="mr-2" size={24} />
          Análisis de Votantes
        </h3>
        <p className="text-blue-100 mt-1">
          Información demográfica de {demographics.totalVotes} votantes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="mr-2" size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total de Votos</p>
                    <p className="text-2xl font-bold text-blue-900">{demographics.totalVotes}</p>
                  </div>
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Usuarios Registrados</p>
                    <p className="text-2xl font-bold text-green-900">
                      {demographics.userTypes.registered}
                    </p>
                  </div>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Usuarios Anónimos</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {demographics.userTypes.anonymous}
                    </p>
                  </div>
                  <Users className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            {/* Gráfico de tipos de usuario */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Usuarios</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="space-y-6">
            {/* Distribución por edad */}
            {ageData.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Distribución por Edad
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} votos`, 'Cantidad']} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Distribución por ubicación */}
            {locationData.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Distribución por Ubicación
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} votos`, 'Cantidad']} />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {ageData.length === 0 && locationData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay datos demográficos disponibles</p>
                <p className="text-sm">Los usuarios registrados deben proporcionar edad y ubicación</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                Timeline de Votos
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total de votos" />
                    <Line type="monotone" dataKey="registered" stroke="#10B981" name="Registrados" />
                    <Line type="monotone" dataKey="anonymous" stroke="#F59E0B" name="Anónimos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lista detallada */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {demographics.timeline.slice(-10).reverse().map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        vote.userType === 'registered' ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      <span className="text-sm text-gray-700">
                        {vote.userType === 'registered' ? 'Usuario registrado' : 'Usuario anónimo'} votó por "{vote.option}"
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(vote.date).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PollDemographics
