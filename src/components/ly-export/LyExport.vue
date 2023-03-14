<script lang="ts" setup>
import { 
  PhUploadSimple as ExportIcon,
} from 'phosphor-vue'
import { NButton, NIcon } from 'naive-ui'
</script>

<template>
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
