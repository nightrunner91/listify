<script setup>
import { onBeforeMount } from 'vue'
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

const themeStore = useThemeStore()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()

onBeforeMount(() => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
  recordsStore.restoreRecords()
})
</script>

<template>
  <app-provider>
    <n-layout position="absolute">
      <ly-header />
      <n-layout
        has-sider
        position="absolute"
        style="top: 56px;">
        <ly-sider />
        <ly-content />
        <ly-controls />
      </n-layout>
    </n-layout>
    <ly-notifications />
  </app-provider>
</template>
