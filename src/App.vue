<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NLayout } from 'naive-ui'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import AppProvider from './AppProvider.vue'
</script>

<template>
  <app-provider>
    <n-layout>
      <div class="container">
        <router-view />
        <nav>
          <RouterLink to="/">Home</RouterLink>
          |
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
      <ly-theme-switcher />
    </n-layout>
  </app-provider>
</template>
