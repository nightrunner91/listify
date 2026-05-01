/**
 * @module useControlsStore
 * @description Manages the state of the right-side controls drawer.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useControlsStore = defineStore('controls', () => {
  /** @type {import('vue').Ref<boolean>} */
  const collapsed = ref(true)

  /**
   * @function toggleControls
   * @description Toggles the visibility of the controls drawer
   */
  function toggleControls() {
    collapsed.value = !collapsed.value
  }

  /**
   * @function openControls
   * @description Opens the controls drawer
   */
  function openControls() {
    collapsed.value = false
  }

  /**
   * @function closeControls
   * @description Closes the controls drawer
   */
  function closeControls() {
    collapsed.value = true
  }

  return {
    collapsed,
    toggleControls,
    openControls,
    closeControls,
  }
})
