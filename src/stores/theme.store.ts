import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme, type GlobalTheme } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'
import { lyStorage } from '@/main'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<GlobalTheme | null>(null)

  const categoryColor = (tag: string) => (
    currentTheme.value
      ? darkThemeOverrides.Categories[`${tag}Color`]
      : lightThemeOverrides.Categories[`${tag}Color`]
  )

  function toggleTheme(): void {
    currentTheme.value = currentTheme.value ? null : darkTheme
    lyStorage.setStorage({
      key: 'savedTheme',
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

  function restoreTheme(): void {
    const savedTheme = lyStorage.getStorageSync('savedTheme')
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
