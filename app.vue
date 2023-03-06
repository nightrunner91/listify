<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useThemeStore } from '@/composables/theme'

const themeStore = useThemeStore()

onBeforeMount(() => {
  themeStore.setUserPreferableTheme()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@import '@/assets/styles/nightvue.scss';
</style>
