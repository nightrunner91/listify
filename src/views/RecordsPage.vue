<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { NSpace, NList, NSpin, NEmpty, NText } from 'naive-ui'
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
let sortedRecords = ref([])

function sortRecords(key) {
  const list = recordsStore.records[route.meta.tag]
  
  const labelPriority = {
    'playing_now': 1,
    'plan_to_play': 2,
    'on_hold': 3,
    'completed': 4,
    'dropped': 5
  }

  return [...list].sort((a, b) => {
    if (key === 'label') {
      const orderA = labelPriority[a.label] ?? 999
      const orderB = labelPriority[b.label] ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.title.localeCompare(b.title)
    }

    if (key === 'liked' || key === 'score') {
      if (b[key] !== a[key]) return b[key] - a[key]
      return a.title.localeCompare(b.title)
    }

    if (key === 'title') {
      return a.title.localeCompare(b.title)
    }

    return 0
  })
}

function setDefaultSortLabel() {
  recordsStore.selectedSort = 'label'
  sortedRecords.value = sortRecords(recordsStore.selectedSort)
}

watch(
  route,
  async () => {
    routeLoading.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 500))
    routeLoading.value = false

    setDefaultSortLabel()
  },
  { flush: 'pre', immediate: true, deep: true }
)

watch(() => recordsStore.selectedSort, (key) => {
  sortedRecords.value = sortRecords(key)
})

onMounted(() => setDefaultSortLabel)
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
          <n-list
            hoverable
            :show-divider="!gridStore.screenLargerThen('m')"
            class="">
            <ly-record
              v-for="(record, index) in sortedRecords"
              :key="record.id"
              :id="record.id"
              :index="index" />
          </n-list>
          <ly-add-record variant="floating" />
        </template>

      </n-space>
    </template>

  </n-space>
</template>
