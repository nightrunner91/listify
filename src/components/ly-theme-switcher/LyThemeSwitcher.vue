<script lang="ts" setup>
import { PhSun, PhMoon } from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme'
import { NButton, NIcon } from 'naive-ui'
const themeStore = useThemeStore()
</script>

<template>
  <n-button
    circle
    @click="themeStore.toggleTheme"
    class="position-fixed top-6 right-6">
    <template #icon>
      <n-icon :component="themeStore.currentTheme ? PhSun : PhMoon" />
    </template>
  </n-button>
</template>
