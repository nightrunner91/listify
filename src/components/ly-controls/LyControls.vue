<script setup lang="ts">
import { watch, computed } from 'vue'
import {
  NDrawer,
  NGrid,
  NGridItem,
  NSpace,
  NButton,
  NPopconfirm,
  NText,
} from 'naive-ui'
import { 
  PhTrashSimple as DeleteIcon,
  PhCheckSquare as SelectAllIcon,
  PhXSquare as DeselectAllIcon
} from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'

const recordsStore = useRecordsStore()
const route = useRoute()

const recordsPlural = computed(() => {
  return recordsStore.selectedRecordsLength(route.meta.tag as string).value > 1
})

function handleSelection(): void {
  if (recordsStore.allRecordsSelected(route.meta.tag as string).value) {
    recordsStore.deselectAllRecords(route.meta.tag as string)
  } else {
    recordsStore.selectAllRecords(route.meta.tag as string)
  }
}

watch(route, () => {
  recordsStore.deselectAllRecords(route.meta.tag as string)
}, { immediate: true, deep: true })
</script>

<template>
  <n-drawer
    :show-mask="false"
    :show="recordsStore.someRecordsSelected(route.meta.tag as string).value"
    :height="56"
    placement="bottom">
    <n-space
      align="center"
      class="w-100 h-100 px-4 px-sm-5"
      :wrap-item="false">
      <n-grid
        item-responsive
        responsive="screen"
        :x-gap="12"
        :y-gap="8"
        :cols="6"
        class="pr-4">
        <n-grid-item
          span="6 s:4 l:4"
          offset="0 s:1 l:1">
          <n-space
            align="center"
            :wrap-item="false">
            <n-button
              size="small"
              class="mr-auto"
              :render-icon="
                recordsStore.allRecordsSelected(route.meta.tag as string).value
                ? renderIcon(DeselectAllIcon)
                : renderIcon(SelectAllIcon)"
              @click="handleSelection">
              <n-text v-if="recordsStore.allRecordsSelected(route.meta.tag as string).value">
                Deselect All
              </n-text>
              <n-text v-else>
                Select All
              </n-text>
            </n-button>
            <n-popconfirm @positive-click="recordsStore.deleteSelectedRecords(route.meta.tag as string)">
              <template #trigger>
                <n-button
                  type="error"
                  size="small"
                  :render-icon="renderIcon(DeleteIcon)">
                  Delete
                </n-button>
              </template>
              <n-text>You sure want to delete</n-text>
              <n-text
                strong
                type="error"
                class="mx-1">
                {{ recordsStore.selectedRecordsLength(route.meta.tag as string) }}
              </n-text>
              <n-text>record<n-text v-if="recordsPlural">s</n-text>?</n-text>
            </n-popconfirm>
          </n-space>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-drawer>
</template>
