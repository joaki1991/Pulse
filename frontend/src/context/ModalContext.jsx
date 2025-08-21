import { createContext, useContext, useState } from 'react'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)
  
  const openEditModal = (poll) => {
    setEditingPoll(poll)
    setShowEditModal(true)
  }
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingPoll(null)
  }

  return (
    <ModalContext.Provider
      value={{
        showCreateModal,
        openCreateModal,
        closeCreateModal,
        showEditModal,
        openEditModal,
        closeEditModal,
        editingPoll,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
