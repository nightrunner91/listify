import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>('light')

  function toggleTheme() {
    currentTheme.value = currentTheme.value == 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  function setTheme(theme: 'light' | 'dark') {
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  function setUserPreferableTheme() {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
    if (darkThemeMq.matches) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    setUserPreferableTheme,
  }
})
