<script lang="ts" setup>
import { 
  PhSun as LightIcon,
  PhMoon as DarkIcon,
} from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme.store'
import { NButton, NIcon } from 'naive-ui'
const themeStore = useThemeStore()
</script>

<template>
  <n-button
    quaternary
    circle
    size="large"
    @click="themeStore.toggleTheme"
    class="ml-2">
    <template #icon>
      <n-icon :component="themeStore.currentTheme ? LightIcon : DarkIcon" />
    </template>
  </n-button>
</template>
