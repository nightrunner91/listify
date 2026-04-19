import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(null)

  const categoryColor = (tag) => (
    currentTheme.value
      ? darkThemeOverrides.Categories[`${tag}Color`]
      : lightThemeOverrides.Categories[`${tag}Color`]
  )

  async function toggleTheme() {
    currentTheme.value = currentTheme.value ? null : darkTheme
    const themeString = currentTheme.value ? 'dark' : 'light'
    
    // Save to local storage as fallback
    localStorage.setItem('theme', themeString)

    // Save to API if authenticated
    const authStore = useAuthStore()
    if (authStore.user) {
      try {
        await api.put('/settings', { theme: themeString })
      } catch (e) {
        // ignore errors
      }
    }
    
    applyBodyClassname()
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
    let savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // If authenticated, try to fetch from API
    const authStore = useAuthStore()
    if (authStore.user) {
      try {
        const settings = await api.get('/settings')
        if (settings.theme !== 'system') {
          savedTheme = settings.theme
          localStorage.setItem('theme', savedTheme)
        }
      } catch (e) {
        // use local fallback
      }
    }

    if (savedTheme === 'dark') {
      currentTheme.value = darkTheme
    } else if (savedTheme === 'light') {
      currentTheme.value = null
    } else if (prefersDark) {
      currentTheme.value = darkTheme
    } else {
      currentTheme.value = null
    }

    applyBodyClassname()
  }

  return {
    currentTheme,
    categoryColor,
    toggleTheme,
    restoreTheme,
  }
})
