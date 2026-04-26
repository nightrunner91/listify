<script setup>
import { NLayoutHeader, NSpace } from 'naive-ui'

import LyLogo from '@/components/ly-logo/LyLogo.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import LyGithub from '@/components/ly-github/LyGithub.vue'
import LyVersion from '@/components/ly-version/LyVersion.vue'
</script>

<template>
  <n-layout-header
    embedded
    style="height: 56px;"
    class="px-3"
    bordered>
    <n-space
      :wrap-item="false"
      align="center"
      class="w-100 h-100">
      <ly-logo />
      <ly-theme-switcher />
      <ly-github />
      <ly-version />
    </n-space>
  </n-layout-header>
</template>
