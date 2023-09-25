import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])

  function pushNotification(message) {
    notifications.value.push(message)
    setTimeout(() => { notifications.value = [] }, 50)
  }

  return {
    notifications,
    pushNotification
  }
})
