<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NH1, NText, NBadge } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const themeStore = useThemeStore()
const recordsStore = useRecordsStore()

const barColor = ref('transparent')
const barWidth = ref('3px')
const barSize = '3px'
const barSpeed = 250

watch(
  [route, themeStore],
  async () => {
    barWidth.value = barSize
    await new Promise((resolve) => setTimeout(resolve, barSpeed * 1.5))
    barWidth.value = '70px'
    barColor.value = themeStore.categoryColor(route.meta.tag as string)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <n-h1>
    <n-text>
      {{ route.meta.title }}
      <n-badge
        v-if="route.meta.tag !== 'start'"
        :value="recordsStore.recordsLength(route.meta.tag as string).value"
        :show-zero="true"
        class="z-0" />
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
