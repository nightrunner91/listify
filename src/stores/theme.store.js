import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'
import { lyStorage } from '@/main'

const THEME_KEY = 'theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(null)

  const categoryColor = (tag) => (
    currentTheme.value
      ? darkThemeOverrides.Categories[`${tag}Color`]
      : lightThemeOverrides.Categories[`${tag}Color`]
  )

  function toggleTheme() {
    currentTheme.value = currentTheme.value ? null : darkTheme
    lyStorage.setStorage({
      key: THEME_KEY,
      data: currentTheme.value ? 'dark' : 'light',
    })
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

  function restoreTheme() {
    const savedTheme = lyStorage.getStorageSync(THEME_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
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
