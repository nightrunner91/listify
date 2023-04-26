<script lang="ts" setup>
/**
 * @module LyNotifications
 * @description Component watches Pinia notifications store and fires message via NaiveUI message plugin
 * @see {@link https://vuejs.org/api/reactivity-advanced.html#toraw}
 * @see {@link https://www.naiveui.com/en-US/os-theme/components/message}
 */

import { computed, watch, toRaw } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useMessage } from 'naive-ui'

const notificationsStore = useNotificationsStore()
const message = useMessage()

const piniaMessages = computed(() => {
  return notificationsStore.notifications
})

watch(piniaMessages, newValue => {
  const slot = toRaw(newValue)
  if (slot.length > 0) {
    // @ts-ignore
    message[slot[0].type](slot[0].message)
  }
}, { deep: true })
</script>

<template>
  <div></div>
</template>
