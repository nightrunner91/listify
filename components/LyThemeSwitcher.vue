<script lang="ts" setup>
import { PhSun } from 'phosphor-vue'
import { useThemeStore } from '@/composables/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="position-fixed top-4 right-4">
    <ly-button @click="themeStore.toggleTheme">
      <ph-sun />
      <span>{{ themeStore.currentTheme }}</span>
    </ly-button>
  </div>
</template>
