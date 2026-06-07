import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  api, ApiError 
} from '@/api/client'

const STORAGE_KEY_ACCESS_TOKEN = 'listify_access_token'
const STORAGE_KEY_USER = 'listify_user'

function loadFromStorage() {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN)
    const user = localStorage.getItem(STORAGE_KEY_USER)
    return {
      accessToken: accessToken || null,
      user: user ? JSON.parse(user) : null,
    }
  } catch {
    return {
      accessToken: null,
      user: null 
    }
  }
}

function saveToStorage(accessToken, user) {
  if (accessToken) localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, accessToken)
  else localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN)
  if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY_USER)
}

function isAuthError(error) {
  return error instanceof ApiError && error.status === 401
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadFromStorage()
  const user = ref(stored.user)
  const accessToken = ref(stored.accessToken)
  const isInitialized = ref(false)

  // Prevents concurrent refresh attempts
  let refreshPromise = null

  function setUser(u, token) {
    user.value = u
    accessToken.value = token
    saveToStorage(token, u)
  }

  function logoutLocally() {
    user.value = null
    accessToken.value = null
    saveToStorage(null, null)
    refreshPromise = null
  }

  async function login(email, password) {
    const data = await api.post('/auth/login', {
      email,
      password 
    })
    setUser(data.user, data.accessToken)
    return data
  }

  async function register(email, password) {
    const data = await api.post('/auth/register', {
      email,
      password 
    })
    setUser(data.user, data.accessToken)
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors on logout
    } finally {
      logoutLocally()
    }
  }

  async function fetchMe() {
    try {
      const userData = await api.get('/auth/me')
      user.value = userData
      saveToStorage(accessToken.value, userData)
      return true
    } catch (error) {
      // Only logout on actual auth failures, not transient errors
      if (isAuthError(error)) {
        logoutLocally()
        return false
      }
      // For network errors or server errors, keep the user logged in
      // The user data from localStorage is still valid
      return false
    } finally {
      isInitialized.value = true
    }
  }

  async function refresh() {
    // If a refresh is already in progress, return that promise
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const data = await api.post('/auth/refresh', {})
        accessToken.value = data.accessToken
        saveToStorage(data.accessToken, user.value)
        return true
      } catch (error) {
        // Only logout on actual auth failures, not transient errors
        if (isAuthError(error)) {
          logoutLocally()
        }
        return false
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  async function updateProfile(profileData) {
    try {
      const updated = await api.patch('/users/profile', profileData)
      user.value = updated
      saveToStorage(accessToken.value, updated)
      return true
    } catch (e) {
      console.error('Failed to update profile:', e)
      return false
    }
  }

  return {
    user,
    accessToken,
    isInitialized,
    login,
    register,
    logout,
    logoutLocally,
    fetchMe,
    refresh,
    updateProfile,
  }
})
