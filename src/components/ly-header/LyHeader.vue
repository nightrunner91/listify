<script setup>
import { NLayoutHeader, NSpace } from 'naive-ui'

import LyLogo from '@/components/ly-logo/LyLogo.vue'
import LyImport from '@/components/ly-import/LyImport.vue'
import LyExport from '@/components/ly-export/LyExport.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
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
      <ly-import variant="minified" />
      <ly-export />
      <ly-theme-switcher />
    </n-space>
  </n-layout-header>
</template>
