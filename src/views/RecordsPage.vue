<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { NSpace, NList, NSpin, NEmpty, NText } from 'naive-ui'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'
import LyRecord from '@/components/ly-record/LyRecord.vue'
import LyAddRecord from '@/components/ly-add-record/LyAddRecord.vue'
import LyImport from '@/components/ly-import/LyImport.vue'

const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const isLoading = ref<boolean>(true)
const records = ref<{}>()

const recordsEmpty = computed(() => {
  return records.value ? Object.keys(records.value).length === 0 : false
})

watch(
  route,
  async () => {
    isLoading.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 600))
    records.value = recordsStore.records[route.meta.tag as string] ?? []
    isLoading.value = false
  },
  { flush: 'pre', immediate: true, deep: true }
)
</script>

<template>
  <n-space
    vertical
    size="large">

    <template v-if="isLoading">
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

        <template v-if="recordsEmpty">
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
                <ly-add-record />
                <n-text align="center" depth="3" style="font-size: 14px;">or</n-text>
                <ly-import variant="full" />
              </n-space>
            </template>
          </n-empty>
        </template>

        <template v-else>
          <n-list
            hoverable
            :show-divider="!gridStore.screenLargerThen('m')"
            class="mb-4">
            <ly-record
              v-for="(record, index) in records as LyRecord"
              :key="record.id"
              :id="record.id"
              :index="index" />
          </n-list>
          <ly-add-record />
        </template>

      </n-space>
    </template>

  </n-space>
</template>
