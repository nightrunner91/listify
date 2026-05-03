<script setup>
import {
  NLayoutHeader,
  NSpace
} from 'naive-ui'
import LyLogo from '@/components/base/ly-logo/LyLogo.vue'
import LyThemeSwitcher from '@/components/base/ly-theme-switcher/LyThemeSwitcher.vue'
import LyLanguageSwitcher from '@/components/base/ly-language-switcher/LyLanguageSwitcher.vue'
import LyHeaderProfile from '@/components/layout/ly-header/LyHeaderProfile.vue'
</script>

<template>
  <n-layout-header
    embedded
    class="w-100 d-flex justify-content-between align-items-center h-56 px-0"
    bordered
  >
    <n-space
      :wrap-item="false"
      align="center"
      justify="space-between"
      class="w-100 h-100 pr-4 pl-1"
    >
      <ly-logo />
      <n-space
        :wrap-item="false"
        align="center"
      >
        <ly-theme-switcher />
        <ly-language-switcher />
        <ly-header-profile />
      </n-space>
    </n-space>
  </n-layout-header>
</template>
