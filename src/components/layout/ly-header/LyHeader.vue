<script setup>
import {
  NLayoutHeader,
  NSpace
} from 'naive-ui'
import LyLogo from '@/components/base/ly-logo/LyLogo.vue'
import LyThemeSwitcher from '@/components/base/ly-theme-switcher/LyThemeSwitcher.vue'
import LyLanguageSwitcher from '@/components/base/ly-language-switcher/LyLanguageSwitcher.vue'
</script>

<template>
  <n-layout-header
    embedded
    class="w-100 d-flex justify-content-between align-items-center h-56 px-3"
    bordered
  >
    <n-space
      :wrap-item="false"
      align="center"
      class="w-100 h-100"
    >
      <ly-logo />
      <ly-theme-switcher />
      <ly-language-switcher />
    </n-space>
  </n-layout-header>
</template>
