<script setup>
import {
  NGrid,
  NGridItem,
  NSpace,
  NText
} from 'naive-ui'
import LyCategories from '@/components/ly-categories/LyCategories.vue'
import LyCustomLists from '@/components/ly-custom-lists/LyCustomLists.vue'
import LyActivityTimeline from '@/components/ly-activity-timeline/LyActivityTimeline.vue'
</script>

<template>
  <div class="pb-10">
    <n-grid
      :x-gap="24"
      :y-gap="40"
      cols="24"
      item-responsive
      responsive="screen"
    >
      <!-- begin::Categories Section -->
      <n-grid-item span="24">
        <ly-categories />
      </n-grid-item>
      <!-- end::Categories Section -->
      
      <!-- begin::Custom Lists Section -->
      <n-grid-item span="24">
        <ly-custom-lists />
      </n-grid-item>
      <!-- end::Custom Lists Section -->

      <!-- begin::Activity Timeline -->
      <n-grid-item span="24">
        <ly-activity-timeline />
      </n-grid-item>
      <!-- end::Activity Timeline -->
    </n-grid>
  </div>
</template>
