<script setup lang="ts">
import {
  NDrawer,
  NGrid,
  NGridItem,
  NSpace,
  NButton,
  NText,
} from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'

const recordsStore = useRecordsStore()
const route = useRoute()

function handleSelection(): void {
  if (recordsStore.allRecordsSelected(route.meta.tag as string).value) {
    recordsStore.deselectAll(route.meta.tag as string)
  } else {
    recordsStore.selectAll(route.meta.tag as string)
  }
}
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
              @click="handleSelection">
              <n-text v-if="recordsStore.allRecordsSelected(route.meta.tag as string).value">Deselect All</n-text>
              <n-text v-else>Select All</n-text>
            </n-button>
          </n-space>
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-drawer>
</template>
