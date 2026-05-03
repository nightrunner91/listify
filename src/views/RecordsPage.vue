<script setup>
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  computed
} from 'vue'
import {
  NSpace,
  NList,
  NSpin,
  NEmpty,
  NText,
  NDivider
} from 'naive-ui'
import {
  DynamicScroller,
  DynamicScrollerItem
} from 'vue-virtual-scroller'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import {
  useRoute,
  onBeforeRouteLeave
} from 'vue-router'
import LySearch from '@/features/records/components/ly-search/LySearch.vue'
import LyRecord from '@/features/records/components/ly-record/LyRecord.vue'
import LyAddRecord from '@/features/records/components/ly-add-record/LyAddRecord.vue'
import LyImport from '@/features/records/components/ly-import/LyImport.vue'
import { useI18n } from 'vue-i18n'

// Variable declarations
const { t } = useI18n()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
let observer = null

// Reactive state
const routeLoading = ref(true)
const scrollerKey = ref(0)
const bottomButtonRef = ref(null)
const isBottomButtonVisible = ref(false)

// Computed properties
const sortedRecords = computed(() => {
  const tag = route.meta.tag
  const searchQuery = recordsStore.searchQuery

  // If searching, return filtered results
  if (recordsStore.isSearching) {
    return recordsStore.searchRecords(tag)
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

const hasEmptyRecord = computed(() => {
  const list = recordsStore.records[route.meta.tag] || []
  return list.some(r => !r.title || !r.title.trim())
})

// Watchers
watch(() => recordsStore.isSearching, (isSearching) => {
  if (!isSearching) {
    // Reinitialize display order with current sort when exiting search
    recordsStore.syncDisplayOrderWithSort(route.meta.tag)
    scrollerKey.value++ // Force scroller to re-render
  }
})

watch(() => recordsStore.searchQuery, () => {
  if (recordsStore.isSearching) {
    scrollerKey.value++ // Force scroller to re-render when search query changes
  }
})

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
  {
    flush: 'pre',
    immediate: true,
    deep: true 
  }
)

watch(bottomButtonRef, (el) => {
  if (el) {
    setupObserver()
  } else {
    isBottomButtonVisible.value = false
    if (observer) observer.disconnect()
  }
})

// Functions
/**
 * @function setDefaultSortLabel
 * @description Sets the default sorting method to 'label' (status) and initializes the display order
 */
function setDefaultSortLabel() {
  recordsStore.selectedSort = 'label'
  // Initialize display order for the current category
  recordsStore.initializeDisplayOrder(route.meta.tag)
  scrollerKey.value++ // Force scroller to re-render
}

function setupObserver() {
  if (observer) observer.disconnect()
  
  observer = new IntersectionObserver(
    ([entry]) => {
      isBottomButtonVisible.value = entry.isIntersecting
    },
    { 
      threshold: 0,
      // Add a small rootMargin to ensure the intersection is triggered 
      // even if the element is at the very edge of the scroll container
      rootMargin: '0px 0px 8px 0px'
    }
  )

  if (bottomButtonRef.value) {
    observer.observe(bottomButtonRef.value)
  }
}

// Lifecycle hooks
onMounted(async () => {
  setDefaultSortLabel()

  const list = recordsStore.records[route.meta.tag] || []
  const emptyRecord = list.find(r => !r.title || !r.title.trim())
  if (emptyRecord) {
    try {
      await recordsStore.deleteRecordById(emptyRecord.id, route.meta.tag)
    } catch {
      // Silently ignore — do not block
    }
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

onBeforeRouteLeave(async () => {
  const list = recordsStore.records[route.meta.tag] || []
  const emptyRecord = list.find(r => !r.title || !r.title.trim())
  if (emptyRecord) {
    try {
      await recordsStore.deleteRecordById(emptyRecord.id, route.meta.tag)
    } catch {
      // Silently ignore — do not block navigation
    }
  }
})
</script>


<template>
  <n-space
    vertical
    size="large"
  >
    <!-- begin::Loading State -->
    <template v-if="routeLoading || recordsStore.processingImport">
      <n-space
        class="w-100 h-250"
        justify="center"
        align="center"
      >
        <n-spin size="small" />
      </n-space>
    </template>
    <!-- end::Loading State -->

    <template v-else>
      <n-space vertical>
        <!-- begin::Empty State -->
        <template v-if="recordsStore.recordsLength(route.meta.tag).value == 0">
          <n-empty
            size="large"
            :description="t('records.emptyDescription')"
            class="p-10"
          >
            <template #extra>
              <n-space
                :size="gridStore.screenLargerThen('m') ? 'large' : 'medium'"
                class="mt-6"
                :wrap-item="false"
                :vertical="!gridStore.screenLargerThen('m')"
                align="center"
              >
                <ly-add-record
                  variant="inline"
                  :disabled="hasEmptyRecord"
                  @scroll-bottom="gridStore.handleScrollBottom"
                />
                <n-text depth="3">
                  {{ t('records.or') }}
                </n-text>
                <ly-import />
              </n-space>
            </template>
          </n-empty>
        </template>
        <!-- end::Empty State -->

        <!-- begin::List View -->
        <template v-else>
          <!-- begin::Search Area -->
          <ly-search />
          <!-- end::Search Area -->
          
          <template v-if="recordsStore.isSearching && sortedRecords.length === 0">
            <n-empty
              size="large"
              :description="t('records.searchEmptyDescription')"
              class="p-10"
            />
          </template>
          
          <template v-else>
            <!-- begin::Records List -->
            <n-list
              hoverable
              :show-divider="!gridStore.screenLargerThen('m')"
            >
              <dynamic-scroller
                :key="scrollerKey"
                :items="sortedRecords"
                key-field="id"
                :min-item-size="58"
                watch-data
              >
                <template #default="{ item, index, active }">
                  <dynamic-scroller-item
                    :key="item.id"
                    :item="item"
                    :active="active"
                    :data-index="index"
                  >
                    <ly-record
                      :id="item.id"
                      :index="index"
                    />
                  </dynamic-scroller-item>
                </template>
              </dynamic-scroller>
            </n-list>
            <!-- end::Records List -->

            <!-- begin::Action Buttons -->
            <!-- Inline bottom button below last record -->
            <div
              v-if="!recordsStore.isSearching"
              ref="bottomButtonRef"
              class="pb-6 pl-10"
            >
              <n-divider class="mt-2 mb-4" />
              <ly-add-record
                variant="bottom"
                :disabled="hasEmptyRecord"
                @scroll-bottom="gridStore.handleScrollBottom"
              />
            </div>

            <!-- Floating button: only visible when bottom button is off-screen -->
            <transition name="fade-up-down">
              <ly-add-record 
                v-if="!recordsStore.isSearching && !isBottomButtonVisible"
                variant="floating"
                :disabled="hasEmptyRecord"
                @scroll-bottom="gridStore.handleScrollBottom"
              />
            </transition>
            <!-- end::Action Buttons -->
          </template>
        </template>
        <!-- end::List View -->
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
