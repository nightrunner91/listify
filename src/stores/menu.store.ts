import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  const collapsed = ref<boolean>(true)

  function toggleMenu() {
    collapsed.value = !collapsed.value
  }

  function openMenu() {
    collapsed.value = false
  }

  function closeMenu() {
    collapsed.value = true
  }

  return {
    collapsed,
    toggleMenu,
    openMenu,
    closeMenu,
  }
})
