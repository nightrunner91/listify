<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NH1, NText } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'

const route = useRoute()
const themeStore = useThemeStore()

const barColor = computed(() => {
  if (themeStore.currentTheme) {
    return darkThemeOverrides.Categories[`${route.meta.tag}Color`]
  } else {
    return lightThemeOverrides.Categories[`${route.meta.tag}Color`]
  }
})
const barWidth = ref<string>('0%')
const barSpeed: number = 250

watch(route, () => {
  barWidth.value = '0%'
  setTimeout(() => {
    barWidth.value = '72px'
  }, barSpeed * 2)
}, { flush: 'pre', immediate: true, deep: true })
</script>

<template>
  <n-h1>
    <n-text style="display: inline-block;">
      {{ route.meta.title }}
      <div
        :style="{
          backgroundColor: barColor,
          width: barWidth,
          height: '3px',
          borderRadius: '3px',
          transitionDuration: barSpeed + 'ms',
          transitionTimingFunction: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        }" />
    </n-text>
  </n-h1>
</template>
