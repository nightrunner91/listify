<script setup lang="ts">
import {
  NLayoutHeader,
  NButton,
  NSpace,
} from 'naive-ui'
import {
  PhList as OpenIcon,
  PhCaretLeft as CloseIcon,
} from 'phosphor-vue'
import { useMenuStore } from '@/stores/menu.store'

import LyImport from '@/components/ly-import/LyImport.vue'
import LyExport from '@/components/ly-export/LyExport.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'

const menuStore = useMenuStore()
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
      <n-button
        quaternary
        circle
        size="large"
        @click="menuStore.toggleMenu"
        class="mr-auto">
        <template #icon>
          <open-icon v-if="menuStore.collapsed" weight="bold" />
          <close-icon v-else weight="bold" />
        </template>
      </n-button>
      <ly-import />
      <ly-export />
      <ly-theme-switcher />
    </n-space>
  </n-layout-header>
</template>
