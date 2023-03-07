<script lang="ts" setup>
import { PhSun } from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme'
import { NButton, NIcon } from 'naive-ui'
const themeStore = useThemeStore()
</script>

<template>
  <div class="position-fixed top-4 right-4">
    <n-button
      circle
      @click="themeStore.toggleTheme">
      <template #icon>
        <n-icon :component="PhSun" />
      </template>
    </n-button>
  </div>
</template>
