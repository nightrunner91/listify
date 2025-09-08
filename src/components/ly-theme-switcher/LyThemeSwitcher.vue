<script setup>
import { 
  PhSun as LightIcon,
  PhMoon as DarkIcon,
} from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme.store'
import { NButton, NIcon } from 'naive-ui'
import { useGridStore } from '@/stores/grid.store'

const themeStore = useThemeStore()
const gridStore = useGridStore()
</script>

<template>
  <n-button
    quaternary
    size="small"
    @click="themeStore.toggleTheme"
    class="">
    <template #icon>
      <n-icon :component="themeStore.currentTheme ? LightIcon : DarkIcon" :size="18" />
    </template>
    <span v-if="gridStore.screenLargerThen('s')">{{ themeStore.currentTheme ? 'Light' : 'Dark' }}</span>
  </n-button>
</template>
