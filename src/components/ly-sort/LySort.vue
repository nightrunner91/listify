<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { NSpace } from 'naive-ui'

const route = useRoute()
</script>

<template>
  <n-space v-if="route.meta.tag !== 'start'">
    
  </n-space>
</template>
