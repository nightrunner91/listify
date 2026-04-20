import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)

  function setUser(u, token) {
    user.value = u
    accessToken.value = token
  }

  function logoutLocally() {
    user.value = null
    accessToken.value = null
  }

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    setUser(data.user, data.accessToken)
    return data
  }

  async function register(email, password) {
    const data = await api.post('/auth/register', { email, password })
    setUser(data.user, data.accessToken)
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore errors on logout
    } finally {
      logoutLocally()
    }
  }

  async function fetchMe() {
    try {
      // The API client will automatically try to refresh the token if it's expired
      // But if we don't have a token at all, we should still try to hit /me to let the
      // API client attempt a refresh using the HttpOnly cookie.
      const userData = await api.get('/auth/me')
      user.value = userData
      return true
    } catch (e) {
      logoutLocally()
      return false
    }
  }

  async function refresh() {
    try {
      const data = await api.post('/auth/refresh', {})
      accessToken.value = data.accessToken
      return true
    } catch (e) {
      logoutLocally()
      return false
    }
  }

  return {
    user,
    accessToken,
    login,
    register,
    logout,
    logoutLocally,
    fetchMe,
    refresh
  }
})
