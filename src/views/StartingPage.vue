<script setup>
import { NGrid, NGridItem, NSpace, NText } from "naive-ui"
import LyCategories from '@/components/ly-categories/LyCategories.vue'
import LyCustomLists from '@/components/ly-custom-lists/LyCustomLists.vue'
</script>

<template>
  <div class="dashboard-container">
    <n-grid :x-gap="24" :y-gap="32" :cols="1">
      <n-grid-item>
        <n-space vertical :size="16">
          <n-text depth="3" class="section-title">CATEGORIES</n-text>
          <ly-categories />
        </n-space>
      </n-grid-item>
      
      <n-grid-item>
         <ly-custom-lists />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding-bottom: 2rem;
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
