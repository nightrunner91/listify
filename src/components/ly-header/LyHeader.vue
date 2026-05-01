<script setup>
import { NLayoutHeader, NSpace, NDivider } from 'naive-ui'

import LyLogo from '@/components/ly-logo/LyLogo.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import LyLogout from '@/components/ly-logout/LyLogout.vue'
import LyLanguageSwitcher from '@/components/ly-language-switcher/LyLanguageSwitcher.vue'
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
      <ly-language-switcher />
      <n-divider vertical />
      <ly-logout />
    </n-space>
  </n-layout-header>
</template>
