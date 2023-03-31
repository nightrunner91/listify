<script setup lang="ts">
import { NDrawer, NGrid, NGridItem, NSpace } from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'

const recordsStore = useRecordsStore()
</script>

<template>
  <n-drawer
    :show-mask="false"
    v-model:show="recordsStore.someRecordSelected"
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
            Stoner is a 1965 novel by the American writer John Williams.
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-drawer>
</template>
