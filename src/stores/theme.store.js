/**
 * @module useThemeStore
 * @description This store manages the application's theme state, supporting light, dark, and system modes.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme } from 'naive-ui'
import {
  darkThemeOverrides,
  lightThemeOverrides
} from '@/theme.config'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'

export const useThemeStore = defineStore('theme', () => {
  /** @description Media query to watch for system color scheme changes */
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  /** @type {import('vue').Ref<Object|null>} */
  const currentTheme = ref(null)
  
  /** 
   * @type {import('vue').Ref<string>} 
   * @description Current theme mode: 'light', 'dark', or 'system'
   */
  const themeMode = ref('system')

  /**
   * @function categoryColor
   * @description Returns the themed color for a specific category tag
   * @param {string} tag - Category tag
   * @returns {string} Hex color
   */
  const categoryColor = (tag) => (
    currentTheme.value
      ? darkThemeOverrides.Categories[`${tag}Color`]
      : lightThemeOverrides.Categories[`${tag}Color`]
  )

  /**
   * @function applyThemeMode
   * @description Internal logic to apply a theme mode and update the body class
   * @param {string} mode - 'light', 'dark', or 'system'
   * @param {boolean} [save=true] - Whether to trigger side effects
   */
  function applyThemeMode(mode, save = true) {
    themeMode.value = mode

    if (mode === 'dark') {
      currentTheme.value = darkTheme
    } else if (mode === 'light') {
      currentTheme.value = null
    } else if (mode === 'system') {
      // Default to dark if prefers-color-scheme is not available or matches dark, or default to dark as fallback
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        currentTheme.value = null
      } else {
        currentTheme.value = darkTheme
      }
    }

    applyBodyClassname()
  }

  /**
   * @function setTheme
   * @async
   * @description Public method to change the theme mode, persisting it to localStorage and the API
   * @param {string} mode - 'light', 'dark', or 'system'
   */
  async function setTheme(mode) {
    applyThemeMode(mode)

    // Save to local storage as fallback
    localStorage.setItem('theme', mode)

    // Save to API if authenticated
    const authStore = useAuthStore()
    if (authStore.user) {
      try {
        await api.put('/settings', { theme: mode })
      } catch (e) {
        // ignore errors
      }
    }
  }

  /**
   * @function applyBodyClassname
   * @description Adds or removes the 'dark' class from the body element
   */
  function applyBodyClassname() {
    const body = document.querySelector('body')
    if (currentTheme.value) {
      body?.classList.add('dark')
    } else {
      body?.classList.remove('dark')
    }
  }

  /**
   * @function restoreTheme
   * @async
   * @description Restores the saved theme mode from API or localStorage on app startup
   */
  async function restoreTheme() {
    let savedTheme = localStorage.getItem('theme') || 'system'

    // If authenticated, try to fetch from API
    const authStore = useAuthStore()
    if (authStore.user) {
      try {
        const settings = await api.get('/settings')
        if (settings.theme) {
          savedTheme = settings.theme
          localStorage.setItem('theme', savedTheme)
        }
      } catch (e) {
        // use local fallback
      }
    }

    applyThemeMode(savedTheme, false)
  }

  // Side effects (Watchers / Event listeners)
  mediaQuery.addEventListener('change', () => {
    if (themeMode.value === 'system') {
      applyThemeMode('system', false)
    }
  })

  return {
    currentTheme,
    themeMode,
    categoryColor,
    setTheme,
    restoreTheme,
  }
})
