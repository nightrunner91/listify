<script setup>
import { NInput } from 'naive-ui'
import { PhMagnifyingGlass as SearchIcon } from 'phosphor-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <n-input
    size="large"
    :placeholder="`Search in ${route.meta.title}...`"
    class="mb-4">
    <template #prefix>
      <search-icon weight="regular" size="16" class="opacity-5 mr-2" />
    </template>
  </n-input>
</template>
