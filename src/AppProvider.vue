<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NLoadingBarProvider,
  NDialogProvider,
  NGlobalStyle,
} from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { darkThemeOverrides, lightThemeOverrides, breakpoints } from '@/theme.config'

const themeStore = useThemeStore()
</script>

<template>
  <n-config-provider
    :theme="themeStore.currentTheme"
    :theme-overrides="themeStore.currentTheme ? darkThemeOverrides : lightThemeOverrides"
    :breakpoints="breakpoints">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <slot></slot>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
    <n-global-style />
  </n-config-provider>
</template>
