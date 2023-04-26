import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationMessage[]>([])

  function pushNotification(message: NotificationMessage) {
    notifications.value.push(message)
    setTimeout(() => { notifications.value = [] }, 50)
  }

  return {
    notifications,
    pushNotification
  }
})
