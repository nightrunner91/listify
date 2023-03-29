<script lang="ts" setup>
import { 
  PhUploadSimple as ExportIcon,
} from 'phosphor-vue'
import { NButton, NIcon, NTooltip } from 'naive-ui'
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        circle
        size="large"
        class="">
        <template #icon>
          <n-icon :component="ExportIcon" />
        </template>
      </n-button>
    </template>
    Export Collection
  </n-tooltip>
</template>
