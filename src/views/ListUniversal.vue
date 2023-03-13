<script setup lang="ts">
import { useRoute } from 'vue-router'
import { NH1, NH2, NH3, NH4, NH5, NH6 } from 'naive-ui'

const route = useRoute()
</script>

<template>
  <n-h1>{{ route.meta.title }}</n-h1>
  <n-h2>{{ route.meta.title }}</n-h2>
  <n-h3>{{ route.meta.title }}</n-h3>
  <n-h4>{{ route.meta.title }}</n-h4>
  <n-h5>{{ route.meta.title }}</n-h5>
  <n-h6>{{ route.meta.title }}</n-h6>
</template>
