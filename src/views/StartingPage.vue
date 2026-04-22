<script setup>
import { NSpace } from "naive-ui"
import LyCategories from '@/components/ly-categories/LyCategories.vue'
import LyCustomLists from '@/components/ly-custom-lists/LyCustomLists.vue'
</script>

<template>
  <n-space
    vertical
    size="large"
    class="pb-5">
    <ly-categories />
    <ly-custom-lists />
  </n-space>
</template>
