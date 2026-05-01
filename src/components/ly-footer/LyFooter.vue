<script setup>
import {
  NLayoutFooter,
  NSpace
} from 'naive-ui'
import LyGithub from '@/components/ly-github/LyGithub.vue'
import LyVersion from '@/components/ly-version/LyVersion.vue'
</script>

<template>
  <n-layout-footer
    class="mt-10 px-4 h-56 rounded-t-base border-bottom-0 border-top-1 border-left-1 border-right-1 mt-auto"
    :style="{ borderColor: 'var(--n-border-color)' }"
  >
    <n-space
      :wrap-item="false"
      align="center"
      justify="space-between"
      class="h-100 w-100"
    >
      <ly-version />
      <ly-github />
    </n-space>
  </n-layout-footer>
</template>

<style scoped>
</style>
