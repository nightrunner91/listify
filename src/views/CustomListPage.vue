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
import LyCustomRecord from '@/features/records/components/ly-custom-record/LyCustomRecord.vue'
import LyAddRecord from '@/features/records/components/ly-add-record/LyAddRecord.vue'
import LyImport from '@/features/records/components/ly-import/LyImport.vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const routeLoading = ref(true)
const scrollerKey = ref(0)
const customListId = computed(() => route.params.id)
const customList = computed(() => recordsStore.getCustomList(customListId.value))
const sortedRecords = computed(() => {
  if (!customList.value) return []
  const records = recordsStore.sortCustomRecords(customListId.value, 'initial')
  if (!recordsStore.isSearching || !recordsStore.searchQuery.trim()) return records
  const query = recordsStore.searchQuery.toLowerCase().trim()
  return records.filter(r => r.title.toLowerCase().includes(query))
})

// Detect if there's already an empty record (title blank or whitespace)
const hasEmptyRecord = computed(() => {
  if (!customList.value) return false
  return customList.value.records.some(r => !r.title || !r.title.trim())
})

// Watch for search state changes to reinitialize display order when exiting search
watch(() => recordsStore.isSearching, (isSearching) => {
  if (!isSearching) {
    // Reinitialize display order with current sort when exiting search
    recordsStore.syncDisplayOrderWithSort(route.meta.tag)
    scrollerKey.value++ // Force scroller to re-render
  }
})

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

onMounted(() => setDefaultSortLabel)

// ── IntersectionObserver to show/hide floating button ────────────────────────

const bottomButtonRef = ref(null)
const isBottomButtonVisible = ref(false)
let observer = null

/**
 * @function setupObserver
 * @description Initializes an IntersectionObserver to detect if the bottom "Add" button is in view
 */
function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    ([entry]) => {
      isBottomButtonVisible.value = entry.isIntersecting
    },
    { threshold: 0 }
  )
  if (bottomButtonRef.value) {
    observer.observe(bottomButtonRef.value)
  }
}

watch(bottomButtonRef, (el) => {
  if (el) setupObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

// ── Cleanup dangling empty record on route leave ──────────────────────────────

onBeforeRouteLeave(async () => {
  if (!customList.value) return
  const emptyRecord = customList.value.records.find(r => !r.title || !r.title.trim())
  if (emptyRecord) {
    try {
      await recordsStore.removeCustomRecord(customListId.value, emptyRecord.id)
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
        <template v-if="!customList || customList.records.length === 0">
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
                <n-text depth="3">or</n-text>
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
                    <ly-custom-record
                      :id="item.id"
                      :list-id="customListId"
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
            <transition
              name="fade-up-down"
              mode="out-in"
            >
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
