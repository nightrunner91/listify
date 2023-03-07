<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NLoadingBarProvider,
  NDialogProvider,
} from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import themeOverrides from '@/theme'

const themeStore = useThemeStore()
</script>

<template>
  <n-config-provider
    :theme="themeStore.currentTheme"
    :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <slot></slot>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
