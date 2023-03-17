<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NH1, NText } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { darkThemeOverrides, lightThemeOverrides } from '@/theme.config'

const route = useRoute()
const themeStore = useThemeStore()

const categoryColor = computed(() => (
  themeStore.currentTheme
    ? darkThemeOverrides.Categories[`${route.meta.tag}Color`]
    : lightThemeOverrides.Categories[`${route.meta.tag}Color`]
))

const barColor = ref('transparent')
const barWidth = ref('3px')
const barSize = '3px'
const barSpeed = 250

watch(
  [route, themeStore.currentTheme],
  async () => {
    barWidth.value = barSize
    await new Promise((resolve) => setTimeout(resolve, barSpeed * 1.5))
    barWidth.value = '72px'
    barColor.value = categoryColor.value
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <n-h1>
    <n-text>
      {{ route.meta.title }}
      <div
        :style="{
          backgroundColor: barColor,
          width: barWidth,
          height: barSize,
          borderRadius: barSize,
          transitionDuration: barSpeed + 'ms',
          transitionTimingFunction: 'cubic-bezier(0.0, 0, 0.2, 1)',
        }" />
    </n-text>
  </n-h1>
</template>
