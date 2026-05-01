import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(null)
  const themeMode = ref('system') // 'light', 'dark', 'system'

  const categoryColor = (tag) => (
    currentTheme.value
      ? darkThemeOverrides.Categories[`${tag}Color`]
      : lightThemeOverrides.Categories[`${tag}Color`]
  )

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  mediaQuery.addEventListener('change', () => {
    if (themeMode.value === 'system') {
      applyThemeMode('system', false)
    }
  })

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

  function applyBodyClassname() {
    const body = document.querySelector('body')
    if (currentTheme.value) {
      body?.classList.add('dark')
    } else {
      body?.classList.remove('dark')
    }
  }

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

  return {
    currentTheme,
    themeMode,
    categoryColor,
    setTheme,
    restoreTheme,
  }
})
