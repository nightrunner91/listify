<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NGrid,
  NGridItem,
  NButton,
  NSpace,
} from 'naive-ui'
import {
  PhList as OpenIcon,
  PhCaretLeft as CloseIcon,
} from 'phosphor-vue'

import { useThemeStore } from '@/stores/theme'
import { useGridStore } from '@/stores/grid'
import { useMenuStore } from '@/stores/menu'
import LyImport from '@/components/ly-import/LyImport.vue'
import LyExport from '@/components/ly-export/LyExport.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'
import LyMenu from '@/components/ly-menu/LyMenu.vue'
import LyTitle from '@/components/ly-title/LyTitle.vue'

const themeStore = useThemeStore()
const gridStore = useGridStore()
const menuStore = useMenuStore()

onBeforeMount(() => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
})
</script>

<template>
  <app-provider>
    <n-layout position="absolute">
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
      <n-layout
        has-sider
        position="absolute"
        style="top: 56px;">
        <n-layout-sider
          bordered
          collapse-mode="width"
          position="absolute"
          :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
          :width="300"
          :collapsed="menuStore.collapsed"
          @collapse="menuStore.closeMenu"
          @expand="menuStore.openMenu"
          class="min-vh-100 py-6 top-0 left-0">
          <ly-menu />
        </n-layout-sider>
        <n-layout-content
          @click="menuStore.closeMenu"
          :class="{ 'opacity-5' : !menuStore.collapsed }"
          class="pl-2 pl-s-18">
          <n-grid
            item-responsive
            responsive="screen"
            :x-gap="12"
            :y-gap="8"
            :cols="6"
            class="py-2 py-l-10 pr-2">
            <n-grid-item
              span="6 l:4"
              offset="0 l:1">
              <ly-title />
              <router-view />
            </n-grid-item>
          </n-grid>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </app-provider>
</template>

<style lang="scss">
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
