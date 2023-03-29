<script lang="ts" setup>
import { 
  PhDownloadSimple as ImportIcon,
} from 'phosphor-vue'
import { NButton, NIcon, NTooltip } from 'naive-ui'
import { renderIcon } from '@/utils/render-icon'
defineProps(['variant'])
</script>

<template>
  <n-button
    secondary
    v-if="variant == 'full'"
    :render-icon="renderIcon(ImportIcon)">
    Import Collection
  </n-button>

  <n-tooltip
    v-else
    trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        circle
        size="large">
        <template #icon>
          <n-icon :component="ImportIcon" />
        </template>
      </n-button>
    </template>
    Import Collection
  </n-tooltip>
</template>
