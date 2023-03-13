<script setup lang="ts">
import { useRoute } from 'vue-router'
import { NH1 } from 'naive-ui'

const route = useRoute()
</script>

<template>
  <n-h1>{{ route.meta.title }}</n-h1>
</template>
