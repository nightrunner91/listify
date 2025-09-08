<script setup>
import { computed } from 'vue'
import { NText } from 'naive-ui'

// Vite injects import.meta.env.PACKAGE_VERSION if defined via define; we can fallback
// However, we will read from the package.json at build-time using import assertion
// Supported by Vite: https://vitejs.dev/guide/assets.html#importing-json
import pkg from '../../../package.json'

const version = computed(() => pkg.version)
</script>

<template>
  <n-text depth="3">v{{ version }}</n-text>
</template>


