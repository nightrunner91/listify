import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  api, ApiError 
} from '@/api/client'

const STORAGE_KEY_ACCESS_TOKEN = 'listify_access_token'
const STORAGE_KEY_REFRESH_TOKEN = 'listify_refresh_token'
const STORAGE_KEY_USER = 'listify_user'

function loadFromStorage() {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN)
    const user = localStorage.getItem(STORAGE_KEY_USER)
    const hasAccess = !!accessToken
    const hasRefresh = !!refreshToken
    console.log('[Auth] Loaded from storage:', { hasAccess, hasRefresh, hasUser: !!user })
    return {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      user: user ? JSON.parse(user) : null,
    }
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null 
    }
  }
}

function saveToStorage(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, accessToken)
  else localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN)
  if (refreshToken) localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, refreshToken)
  else localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN)
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
  const refreshToken = ref(stored.refreshToken)
  const isInitialized = ref(false)

  // Prevents concurrent refresh attempts
  let refreshPromise = null

  function setUser(u, token, refreshTok) {
    user.value = u
    accessToken.value = token
    if (refreshTok) refreshToken.value = refreshTok
    saveToStorage(token, refreshTok || refreshToken.value, u)
    console.log('[Auth] User set:', { userId: u?.id, hasToken: !!token, hasRefresh: !!refreshToken.value })
  }

  function logoutLocally() {
    console.log('[Auth] Logging out locally')
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    saveToStorage(null, null, null)
    refreshPromise = null
  }

  async function login(email, password) {
    const data = await api.post('/auth/login', {
      email,
      password 
    })
    setUser(data.user, data.accessToken, data.refreshToken)
    return data
  }

  async function register(email, password) {
    const data = await api.post('/auth/register', {
      email,
      password 
    })
    setUser(data.user, data.accessToken, data.refreshToken)
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
      saveToStorage(accessToken.value, refreshToken.value, userData)
      return true
    } catch (error) {
      if (isAuthError(error)) {
        // The apiClient interceptor already tried to refresh.
        // If we're here, the refresh also failed — session is truly invalid.
        console.log('[Auth] fetchMe failed after refresh attempt, logging out')
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

    console.log('[Auth] Starting token refresh, hasRefreshToken:', !!refreshToken.value)

    refreshPromise = (async () => {
      try {
        // Send refresh token in body as fallback for cross-origin scenarios
        const data = await api.post('/auth/refresh', {
          refreshToken: refreshToken.value,
        })
        accessToken.value = data.accessToken
        // Always update stored refresh token (rotation)
        if (data.refreshToken) {
          refreshToken.value = data.refreshToken
        }
        saveToStorage(data.accessToken, refreshToken.value, user.value)
        console.log('[Auth] Refresh successful')
        return true
      } catch (error) {
        console.log('[Auth] Refresh failed:', error.message || error)
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
      saveToStorage(accessToken.value, refreshToken.value, updated)
      return true
    } catch (e) {
      console.error('Failed to update profile:', e)
      return false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
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
