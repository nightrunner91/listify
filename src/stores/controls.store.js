import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useControlsStore = defineStore('controls', () => {
  const collapsed = ref(true)

  function toggleControls() {
    collapsed.value = !collapsed.value
  }

  function openControls() {
    collapsed.value = false
  }

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
