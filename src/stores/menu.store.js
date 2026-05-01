/**
 * @module useMenuStore
 * @description Manages the state of the left-side navigation menu.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  /** @type {import('vue').Ref<boolean>} */
  const collapsed = ref(true)

  /**
   * @function toggleMenu
   * @description Toggles the visibility of the navigation menu
   */
  function toggleMenu() {
    collapsed.value = !collapsed.value
  }

  /**
   * @function openMenu
   * @description Opens the navigation menu
   */
  function openMenu() {
    collapsed.value = false
  }

  /**
   * @function closeMenu
   * @description Closes the navigation menu
   */
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
