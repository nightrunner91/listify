<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { NLayout } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { useGridStore } from '@/stores/grid.store'
import AppProvider from './AppProvider.vue'
import LyHeader from '@/components/ly-header/LyHeader.vue'
import LySider from '@/components/ly-sider/LySider.vue'
import LyContent from '@/components/ly-content/LyContent.vue'

const themeStore = useThemeStore()
const gridStore = useGridStore()

onBeforeMount(() => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
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
      </n-layout>
    </n-layout>
  </app-provider>
</template>
