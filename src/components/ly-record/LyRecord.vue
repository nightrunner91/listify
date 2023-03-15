<script setup lang="ts">
import {
  NListItem,
  NSpace,
  NInput,
} from 'naive-ui'
import { useRecordsStore } from '@/stores/records'

const recordsStore = useRecordsStore()
</script>

<template>
  <n-list-item>
    <n-space>
      <n-input
        v-model:value="recordsStore.record.title"
        type="text"
        placeholder="" />
    </n-space>
  </n-list-item>
</template>
