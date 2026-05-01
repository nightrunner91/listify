<script setup>
import { NLayoutFooter, NSpace } from 'naive-ui'
import LyGithub from '@/components/ly-github/LyGithub.vue'
import LyVersion from '@/components/ly-version/LyVersion.vue'
</script>

<template>
  <n-layout-footer
    class="app-footer mt-10 px-4"
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
.app-footer {
  height: 56px;
  border: solid 1px var(--n-border-color);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom: none;
}
</style>
