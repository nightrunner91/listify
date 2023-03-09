<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import {
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NGrid,
  NGridItem,
  NSpace,
} from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'
import LyMenu from '@/components/ly-menu/LyMenu.vue'

const themeStore = useThemeStore()
const collapsed = ref(true)

onBeforeMount(() => {
  themeStore.restoreTheme()
})
</script>

<template>
  <app-provider>
    <ly-theme-switcher />
    <n-space vertical>
      <n-layout
        has-sider
        class="min-vh-100">
        <n-layout-sider
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="320"
          :collapsed="collapsed"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false"
          class="min-vh-100">
          <ly-menu :collapsed="collapsed" />
        </n-layout-sider>
        <n-layout>
          <n-layout-content class="px-4">
            <n-grid
              item-responsive
              responsive="screen"
              :x-gap="12"
              :y-gap="8"
              :cols="6">
              <n-grid-item
                span="6 l:4"
                offset="0 l:1">
                <router-view />
              </n-grid-item>
            </n-grid>
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-space>
  </app-provider>
</template>
