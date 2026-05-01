<script setup>
import { onBeforeMount, ref } from 'vue'
import { NLayout } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import AppProvider from './AppProvider.vue'
import LyHeader from '@/components/ly-header/LyHeader.vue'
import LySider from '@/components/ly-sider/LySider.vue'
import LyContent from '@/components/ly-content/LyContent.vue'
import LyControls from '@/components/ly-controls/LyControls.vue'
import LyNotifications from '@/components/ly-notifications/LyNotifications.vue'

import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const themeStore = useThemeStore()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const authStore = useAuthStore()
const route = useRoute()

const isReady = ref(false)

onBeforeMount(async () => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
  
  if (authStore.user) {
    await recordsStore.restoreRecords()
  }
  isReady.value = true
})
</script>

<template>
  <app-provider
    v-if="isReady"
  >
    <n-layout
      v-if="route.meta.requiresAuth !== false"
      position="absolute"
    >
      <ly-header />
      <n-layout
        has-sider
        position="absolute"
        style="top: 56px;"
      >
        <ly-sider />
        <ly-content />
        <ly-controls />
      </n-layout>
    </n-layout>
    
    <router-view
      v-else
    />

    <ly-notifications />
  </app-provider>
</template>
