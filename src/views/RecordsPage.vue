<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { NSpace, NList, NSpin, NEmpty, NText } from 'naive-ui'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'
import LySearch from '@/components/ly-search/LySearch.vue'
import LyRecord from '@/components/ly-record/LyRecord.vue'
import LyAddRecord from '@/components/ly-add-record/LyAddRecord.vue'
import LyImport from '@/components/ly-import/LyImport.vue'

const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const routeLoading = ref(true)

const sortedRecords = computed(() => {
  // If searching, return filtered results
  if (recordsStore.isSearching) {
    return recordsStore.searchRecords(route.meta.tag)
  }
  
  // Otherwise, return sorted records as before
  const list = recordsStore.records[route.meta.tag] || []
  const displayOrder = recordsStore.displayOrder[route.meta.tag] || []
  
  // If display order is empty, initialize it
  if (displayOrder.length === 0 && list.length > 0) {
    recordsStore.initializeDisplayOrder(route.meta.tag)
    return list
  }
  
  // Return records in display order (O(n) using index map)
  const indexById = new Map(list.map(r => [r.id, r]))
  return displayOrder
    .map(id => indexById.get(id))
    .filter(record => record !== undefined)
})

// Watch for search state changes to reinitialize display order when exiting search
watch(() => recordsStore.isSearching, (isSearching) => {
  if (!isSearching) {
    // Reinitialize display order with current sort when exiting search
    recordsStore.syncDisplayOrderWithSort(route.meta.tag)
  }
})

function setDefaultSortLabel() {
  recordsStore.selectedSort = 'label'
  // Initialize display order for the current category
  recordsStore.initializeDisplayOrder(route.meta.tag)
}

watch(
  route,
  async () => {
    routeLoading.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 500))
    routeLoading.value = false

    // Clear search when changing routes
    recordsStore.clearSearch()
    setDefaultSortLabel()
  },
  { flush: 'pre', immediate: true, deep: true }
)

onMounted(() => setDefaultSortLabel)

// Handle scroll to bottom when adding new record
function handleScrollBottom() {
  nextTick(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    })
  })
}
</script>

<template>
  <n-space
    vertical
    size="large">

    <template v-if="routeLoading || recordsStore.processingImport">
      <n-space
        class="w-100"
        justify="center"
        align="center"
        style="height: 250px;">
        <n-spin size="small" />
      </n-space>
    </template>

    <template v-else>
      <n-space vertical>

        <template v-if="recordsStore.recordsLength(route.meta.tag).value == 0">
          <n-empty
            size="large"
            description="Looks like your list is empty."
            class="p-10">
            <template #extra>
              <n-space
                :size="gridStore.screenLargerThen('m') ? 'large' : 'medium'"
                class="mt-6"
                :wrap-item="false"
                :vertical="!gridStore.screenLargerThen('m')"
                align="center">
                <ly-add-record variant="inline" />
                <n-text align="center" depth="3" style="font-size: 14px;">or</n-text>
                <ly-import variant="inline" />
              </n-space>
            </template>
          </n-empty>
        </template>

        <template v-else>
          <ly-search />
          
          <template v-if="recordsStore.isSearching && sortedRecords.length === 0">
            <n-empty
              size="large"
              description="No records found matching your search."
              class="p-10">
            </n-empty>
          </template>
          
          <template v-else>
            <n-list hoverable :show-divider="!gridStore.screenLargerThen('m')" class="">
              <dynamic-scroller
                :items="sortedRecords"
                key-field="id"
                :min-item-size="58"
                watch-data>
                <template #default="{ item, index, active }">
                  <dynamic-scroller-item :item="item" :active="active" :data-index="index" :key="item.id">
                    <ly-record :id="item.id" :index="index" />
                  </dynamic-scroller-item>
                </template>
              </dynamic-scroller>
            </n-list>
            <transition
              name="fade-up-down"
              mode="out-in">
              <ly-add-record 
                v-if="!recordsStore.isSearching"
                variant="floating"
                @scroll-bottom="handleScrollBottom" />
            </transition>
          </template>
        </template>

      </n-space>
    </template>

  </n-space>
</template>

<style lang="scss" scoped>
.fade-up-down-enter-active,
.fade-up-down-leave-active {
  transition: all 0.3s ease;
}

.fade-up-down-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
