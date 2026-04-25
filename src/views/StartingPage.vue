<script setup>
import { NGrid, NGridItem, NSpace, NText } from "naive-ui"
import LyCategories from '@/components/ly-categories/LyCategories.vue'
import LyCustomLists from '@/components/ly-custom-lists/LyCustomLists.vue'
import LyActivityTimeline from '@/components/ly-activity-timeline/LyActivityTimeline.vue'
</script>

<template>
  <div class="pb-10">
    <n-grid :x-gap="24" :y-gap="40" cols="24" item-responsive responsive="screen">
      <n-grid-item span="24">
        <n-space vertical :size="16">
          <n-text depth="3" class="section-title">CATEGORIES</n-text>
          <ly-categories />
        </n-space>
      </n-grid-item>
      
      <n-grid-item span="24">
         <ly-custom-lists />
      </n-grid-item>

      <n-grid-item span="24">
         <ly-activity-timeline />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
</style>
