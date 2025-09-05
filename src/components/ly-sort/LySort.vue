<script setup>
import { h } from 'vue'
import { useRoute } from 'vue-router'
import {
  NDropdown,
  NButton,
  NIcon,
} from 'naive-ui'
import { PhFunnel as SortIcon } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const recordsStore = useRecordsStore()

const renderDropdownIcon = (option) => {
  return h(option.icon, { size: 16 })
}

function handleSortChange(key) {
  recordsStore.selectedSort = key
  // Sync display order with new sort when user manually changes sorting
  recordsStore.syncDisplayOrderWithSort(route.meta.tag)
}
</script>

<template>
  <n-dropdown
    v-if="route.meta.tag !== 'start'"
    trigger="click"
    placement="bottom-end"
    :options="recordsStore.sortOptions"
    :render-icon="renderDropdownIcon"
    @select="handleSortChange">
    <n-button
      secondary
      class="ml-auto">
      <template #icon>
        <n-icon
          depth="2"
          :component="SortIcon" />
      </template>
      {{ recordsStore.getSortOption(recordsStore.selectedSort).value.label }}
    </n-button>
    </n-dropdown>
</template>
