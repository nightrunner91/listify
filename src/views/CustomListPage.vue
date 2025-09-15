<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NSpace, NList, NEmpty, NText } from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const recordsStore = useRecordsStore()
const customListId = computed(() => route.params.id)
const customList = computed(() => recordsStore.getCustomList(customListId.value))
const sortedRecords = computed(() => {
  if (!customList.value) return []
  // Default sort: initial (createdAt)
  return recordsStore.sortCustomRecords(customListId.value, 'initial')
})
</script>

<template>
  <n-space vertical size="large">
    <template v-if="!customList">
      <n-empty description="Custom list not found." />
    </template>
    <template v-else>
      <n-text depth="3" style="font-size: 1.5rem; font-weight: bold;">{{ customList.name }}</n-text>
      <n-list hoverable>
        <template v-if="sortedRecords.length === 0">
          <n-empty description="No items in this custom list." />
        </template>
        <template v-else>
          <n-list-item v-for="item in sortedRecords" :key="item.id">
            <n-text>{{ item.title }}</n-text>
          </n-list-item>
        </template>
      </n-list>
    </template>
  </n-space>
</template>

<style scoped>
</style>
