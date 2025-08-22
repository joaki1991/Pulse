import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider } from './context/ModalContext'
import Navbar from './components/Navbar'
import CreatePollModal from './components/CreatePollModal'
import EditPollModal from './components/EditPollModal'
import Home from './pages/Home'
import PollDetail from './pages/PollDetail'
import Auth from './pages/Auth'
import Explore from './pages/Explore'
import MyPolls from './pages/MyPolls'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
            
            <Navbar />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/poll/:id" element={<PollDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/my-polls" element={<MyPolls />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>

            {/* Modales globales */}
            <CreatePollModal />
            <EditPollModal />
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  )
}

export default App
