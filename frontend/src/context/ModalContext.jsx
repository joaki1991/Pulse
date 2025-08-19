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

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)

  return (
    <ModalContext.Provider
      value={{
        showCreateModal,
        openCreateModal,
        closeCreateModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
