<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import {
  NLayout,
  NLayoutContent,
  NGrid,
  NGridItem,
} from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'

const themeStore = useThemeStore()

onBeforeMount(() => {
  themeStore.restoreTheme()
})
</script>

<template>
  <app-provider>
    <n-layout class="min-vh-100">
      <n-layout-content class="px-4">
        <n-grid
          item-responsive
          responsive="screen"
          :x-gap="12"
          :y-gap="8"
          :cols="6">
          <n-grid-item
            span="6 l:4"
            offset="0 l:1">
            <router-view />
          </n-grid-item>
        </n-grid>
      </n-layout-content>
      <ly-theme-switcher />
    </n-layout>
  </app-provider>
</template>
