<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NGrid,
  NGridItem,
} from 'naive-ui'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'
</script>

<template>
  <app-provider>
    <n-layout>
      <n-layout-header>
        <nav>
          <RouterLink to="/">Home</RouterLink>
          |
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </n-layout-header>
      <n-layout-content>
        <n-grid
          :x-gap="12"
          :y-gap="8"
          :cols="4">
          <n-grid-item
            :span="2"
            :offset="1">
            <router-view />
          </n-grid-item>
        </n-grid>
      </n-layout-content>
      <n-layout-footer>
        Footer
      </n-layout-footer>
      <ly-theme-switcher />
    </n-layout>
  </app-provider>
</template>
