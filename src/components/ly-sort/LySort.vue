<script setup>
import {
  h,
  ref,
  watch,
  nextTick
} from 'vue'
import { useRoute } from 'vue-router'
import {
  NDropdown,
  NButton,
  NIcon
} from 'naive-ui'
import { PhFunnel as SortIcon } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const recordsStore = useRecordsStore()

const routeLoading = ref(false)

/**
 * @function renderDropdownIcon
 * @description Renders the icon for sort dropdown options
 * @param {Object} option
 */
const renderDropdownIcon = (option) => {
  return h(option.icon, { size: 16 })
}

/**
 * @function handleSortChange
 * @description Updates the global sort key and synchronizes the record display order
 * @param {string} key - The selected sort key
 */
function handleSortChange(key) {
  recordsStore.selectedSort = key
  // Sync display order with new sort when user manually changes sorting
  recordsStore.syncDisplayOrderWithSort(route.meta.tag)
}

// Watch for route changes to reset local loading state (simulates transition)
watch(
  route,
  async () => {
    routeLoading.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 500))
    routeLoading.value = false
  },
  {
    flush: 'pre',
    deep: true
  }
)
</script>

<template>
  <!-- begin::Sort Dropdown -->
  <n-dropdown
    v-if="route.meta.tag !== 'start'"
    trigger="click"
    placement="bottom-end"
    :options="recordsStore.sortOptions"
    :render-icon="renderDropdownIcon"
    :disabled="recordsStore.isSearching || routeLoading || recordsStore.processingImport"
    @select="handleSortChange"
  >
    <n-button
      secondary
      class="ml-auto"
      :disabled="recordsStore.isSearching || routeLoading || recordsStore.processingImport"
    >
      <template #icon>
        <n-icon
          depth="2"
          :component="SortIcon"
        />
      </template>
      {{ recordsStore.getSortOption(recordsStore.selectedSort).value.label }}
    </n-button>
  </n-dropdown>
  <!-- end::Sort Dropdown -->
</template>
