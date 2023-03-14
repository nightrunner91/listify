<script lang="ts" setup>
import { 
  PhDownloadSimple as ImportIcon,
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
      <n-icon :component="ImportIcon" />
    </template>
  </n-button>
</template>
