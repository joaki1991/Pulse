import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Settings, BarChart3, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isAnonymous } = useAuth()
  const { openCreateModal } = useModal()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold text-gradient">Pulse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link
              to="/explore"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Explorar
            </Link>
            {!isAnonymous() && (
              <Link
                to="/my-polls"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Mis Encuestas
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAnonymous() ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Usuario Anónimo</span>
                <Link
                  to="/auth"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="text-primary-600" size={16} />
                    </div>
                  )}
                  <span className="text-gray-900 font-medium">{user?.name}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="mr-3" size={16} />
                        Perfil
                      </Link>
                      <Link
                        to="/my-polls"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="mr-3" size={16} />
                        Mis Encuestas
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="mr-3" size={16} />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Create Poll Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center btn-primary text-sm"
            >
              <Plus className="mr-1" size={16} />
              Crear
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-4">
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/explore"
                  className="block text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explorar
                </Link>
                {!isAnonymous() && (
                  <Link
                    to="/my-polls"
                    className="block text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Encuestas
                  </Link>
                )}

                <hr className="border-gray-200" />

                {isAnonymous() ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Usuario Anónimo</p>
                    <Link
                      to="/auth"
                      className="block btn-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="text-primary-600" size={20} />
                        </div>
                      )}
                      <span className="text-gray-900 font-medium">{user?.name}</span>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="mr-3" size={16} />
                      Perfil
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="mr-3" size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    openCreateModal()
                    setIsMenuOpen(false)
                  }}
                  className="block btn-primary text-center w-full"
                >
                  <Plus className="inline mr-1" size={16} />
                  Crear Encuesta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar
