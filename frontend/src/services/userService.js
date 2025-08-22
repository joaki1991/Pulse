import api from './api'

class UserService {
  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  async getAllUsers() {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }

  async filterUsers(query) {
    try {
      const response = await api.get(`/users/filter?query=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Error filtering users:', error)
      throw error
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  async updateUserAvatar(id, avatarFile) {
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      
      const response = await api.put(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating user avatar:', error)
      throw error
    }
  }

  async checkUserByIP(ip) {
    try {
      const response = await api.get(`/users/check/${ip}`)
      return response.data
    } catch (error) {
      console.error('Error checking user by IP:', error)
      throw error
    }
  }
}

export const userService = new UserService()
