import { ref } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme, type GlobalTheme } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
  /* ========================= */
  /* ===== Website Theme ===== */
  /* ========================= */

  const currentTheme = ref<GlobalTheme | null>(null)

  function toggleTheme() {
    currentTheme.value = currentTheme.value ? null : darkTheme
  }

  function restoreTheme() {
    // currentTheme.value = storedTheme == 'light' || !storedTheme ? null : darkTheme
  }

  return {
    currentTheme,
    toggleTheme,
    restoreTheme,
  }
})
