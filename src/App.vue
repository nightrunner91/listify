<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
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
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'
import LyMenu from '@/components/ly-menu/LyMenu.vue'

const themeStore = useThemeStore()
const gridStore = useGridStore()

const collapsed = ref(true)

onBeforeMount(() => {
  themeStore.restoreTheme()
  gridStore.watchWindowSizes()
})
</script>

<template>
  <app-provider>
    <n-layout position="absolute">
      <n-layout-header
        style="height: 56px;"
        class="px-3"
        bordered>
        <n-space
          justify="space-between"
          align="center"
          class="w-100 h-100">
          <n-button
            quaternary
            circle
            size="large"
            @click="collapsed = !collapsed"
            class="">
            <template #icon>
              <open-icon v-if="collapsed" weight="bold" />
              <close-icon v-else weight="bold" />
            </template>
          </n-button>
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
          :collapsed-width="gridStore.screenLargerThen('s') ? 62 : 0"
          :width="320"
          :collapsed="collapsed"
          @collapse="collapsed = true"
          @expand="collapsed = false"
          class="min-vh-100 py-6 top-0 left-0">
          <ly-menu :collapsed="collapsed" />
        </n-layout-sider>
        <n-layout-content class="pl-2 pl-s-18">
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
              <router-view />
            </n-grid-item>
          </n-grid>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </app-provider>
</template>
