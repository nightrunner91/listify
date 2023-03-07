<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
</script>

<template>
  <LyThemeSwitcher />
  <div class="container">
    <RouterView />
    <nav>
      <RouterLink to="/">Home</RouterLink>
      |
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </div>
</template>
