<script setup>
import {
  onBeforeMount,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { NLayout } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import AppProvider from './AppProvider.vue'
import LyHeader from '@/components/layout/ly-header/LyHeader.vue'
import LySider from '@/components/layout/ly-sider/LySider.vue'
import LyContent from '@/components/layout/ly-content/LyContent.vue'
import LyControls from '@/components/layout/ly-controls/LyControls.vue'
import LyNotifications from '@/components/layout/ly-notifications/LyNotifications.vue'

import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const themeStore = useThemeStore()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const authStore = useAuthStore()
const route = useRoute()
const {
  t, locale 
} = useI18n()

const isReady = ref(false)

onBeforeMount(async () => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
  
  if (authStore.user) {
    await recordsStore.restoreRecords()
  }
  isReady.value = true
})

// Global Title Management
watch(
  [() => route.path, locale],
  () => {
    let title = 'Listify'
    if (route.meta.title) {
      const translatedTitle = t(route.meta.title)
      if (route.meta.tag !== 'start') {
        title = `${translatedTitle} - Listify`
      } else {
        title = translatedTitle
      }
    }
    document.title = title
  },
  { immediate: true }
)
</script>

<template>
  <app-provider v-if="isReady">
    <!-- begin::Authenticated Layout -->
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
    <!-- end::Authenticated Layout -->
    
    <!-- begin::Public Layout -->
    <router-view v-else />
    <!-- end::Public Layout -->

    <ly-notifications />
  </app-provider>
</template>
