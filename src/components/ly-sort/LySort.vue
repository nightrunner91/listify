<script setup>
import { h, ref, watch, nextTick } from 'vue'
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

const routeLoading = ref(false)

const renderDropdownIcon = (option) => {
  return h(option.icon, { size: 16 })
}

function handleSortChange(key) {
  recordsStore.selectedSort = key
  // Sync display order with new sort when user manually changes sorting
  recordsStore.syncDisplayOrderWithSort(route.meta.tag)
}

watch(
  route,
  async () => {
    routeLoading.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 500))
    routeLoading.value = false
  },
  { flush: 'pre', deep: true }
)
</script>

<template>
  <n-dropdown
    v-if="route.meta.tag !== 'start'"
    trigger="click"
    placement="bottom-end"
    :options="recordsStore.sortOptions"
    :render-icon="renderDropdownIcon"
    :disabled="recordsStore.isSearching || routeLoading || recordsStore.processingImport"
    @select="handleSortChange">
    <n-button
      secondary
      class="ml-auto"
      :disabled="recordsStore.isSearching || routeLoading || recordsStore.processingImport">
      <template #icon>
        <n-icon
          depth="2"
          :component="SortIcon" />
      </template>
      {{ recordsStore.getSortOption(recordsStore.selectedSort).value.label }}
    </n-button>
    </n-dropdown>
</template>
