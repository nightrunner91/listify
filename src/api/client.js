import { useAuthStore } from '@/stores/auth.store'

let API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '')
if (API_BASE && !API_BASE.startsWith('http')) {
  API_BASE = `https://${API_BASE}`
}
// Remove trailing slash if present
if (API_BASE.endsWith('/')) {
  API_BASE = API_BASE.slice(0, -1)
}
// Ensure /api suffix exists
if (API_BASE && !API_BASE.endsWith('/api')) {
  API_BASE = `${API_BASE}/api`
}

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function handleResponse(response) {
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || response.statusText,
      data?.error || 'UNKNOWN_ERROR'
    )
  }

  return data
}

/**
 * Core API fetch wrapper that automatically handles:
 * - Injecting Authorization header
 * - Including cookies (for refresh token)
 * - Automatic token refresh on 401
 */
export async function apiClient(endpoint, options = {}) {
  const authStore = useAuthStore()

  const url = `${API_BASE}${endpoint}`
  const headers = {
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Important for refresh cookies
  }

  let response = await fetch(url, fetchOptions)

  // Handle 401 by attempting to refresh the token
  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      const refreshed = await authStore.refresh()
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${authStore.accessToken}`
        response = await fetch(url, {
          ...fetchOptions,
          headers
        })
      } else {
        // Refresh failed, user needs to log in again
        authStore.logoutLocally()
        throw new ApiError(401, 'Session expired. Please log in again.', 'UNAUTHORIZED')
      }
    } catch (error) {
      authStore.logoutLocally()
      throw new ApiError(401, 'Session expired. Please log in again.', 'UNAUTHORIZED')
    }
  }

  return handleResponse(response)
}

// Convenience methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, {
    ...options,
    method: 'GET'
  }),
  post: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint, data, options) => {
    const opts = {
      ...options,
      method: 'DELETE'
    }
    if (data) opts.body = JSON.stringify(data)
    return apiClient(endpoint, opts)
  }
}
