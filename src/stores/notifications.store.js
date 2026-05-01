/**
 * @module useNotificationsStore
 * @description Manages the application's global notification queue.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', () => {
  /** @type {import('vue').Ref<Array>} */
  const notifications = ref([])

  /**
   * @function pushNotification
   * @description Adds a message to the notification queue and clears it shortly after
   * @param {Object} message - Notification object containing message and type
   */
  function pushNotification(message) {
    notifications.value.push(message)
    setTimeout(() => { notifications.value = [] }, 50)
  }

  return {
    notifications,
    pushNotification
  }
})
