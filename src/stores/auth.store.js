/**
 * @module useAuthStore
 * @description This store manages user authentication state, including login, logout, and profile updates.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  /** @type {import('vue').Ref<Object|null>} */
  const user = ref(null)
  /** @type {import('vue').Ref<string|null>} */
  const accessToken = ref(null)

  /**
   * @function setUser
   * @description Sets the current user and access token
   * @param {Object} u - User object
   * @param {string} token - JWT access token
   */
  function setUser(u, token) {
    user.value = u
    accessToken.value = token
  }

  /**
   * @function logoutLocally
   * @description Clears user state from the store without calling the API
   */
  function logoutLocally() {
    user.value = null
    accessToken.value = null
  }

  /**
   * @function login
   * @async
   * @description Authenticates a user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} API response data
   */
  async function login(email, password) {
    const data = await api.post('/auth/login', {
      email,
      password
    })
    setUser(data.user, data.accessToken)
    return data
  }

  /**
   * @function register
   * @async
   * @description Registers a new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} API response data
   */
  async function register(email, password) {
    const data = await api.post('/auth/register', {
      email,
      password
    })
    setUser(data.user, data.accessToken)
    return data
  }

  /**
   * @function logout
   * @async
   * @description Logs out the current user and clears local state
   */
  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore errors on logout
    } finally {
      logoutLocally()
    }
  }

  /**
   * @function fetchMe
   * @async
   * @description Fetches current user data from the API
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
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

  /**
   * @function refresh
   * @async
   * @description Refreshes the access token
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
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

  /**
   * @function updateProfile
   * @async
   * @description Updates the user's profile information
   * @param {Object} profileData - New profile data
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async function updateProfile(profileData) {
    try {
      const updated = await api.patch('/users/profile', profileData)
      user.value = updated
      return true
    } catch (e) {
      console.error('Failed to update profile:', e)
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
    refresh,
    updateProfile
  }
})
