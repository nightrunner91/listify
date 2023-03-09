import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme, type GlobalTheme } from 'naive-ui'
import { useStorage } from 'vue3-storage'

const themeStorage = useStorage('th_')

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<GlobalTheme | null>(null)
  const prefersDark = ref<Boolean>(window.matchMedia('(prefers-color-scheme: dark)').matches)
  const storedTheme = ref<string | undefined>(themeStorage.getStorageSync('savedTheme'))

  function toggleTheme(): void {
    currentTheme.value = currentTheme.value ? null : darkTheme
    themeStorage.setStorage({
      key: 'savedTheme',
      data: currentTheme.value ? 'dark' : 'light',
    })
  }

  function restoreTheme(): void {
    if (prefersDark.value) {
      currentTheme.value = darkTheme
    } else {
      currentTheme.value = storedTheme.value == 'light' || !storedTheme.value ? null : darkTheme
    }
  }

  return {
    currentTheme,
    prefersDark,
    storedTheme,
    toggleTheme,
    restoreTheme,
  }
})
