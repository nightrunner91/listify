<script setup lang="ts">
import {
  NListItem,
  NSpace,
  NInput,
  NDropdown,
} from 'naive-ui'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records'

const route = useRoute()
const recordsStore = useRecordsStore()
</script>

<template>
  <n-list-item>
    <n-space>
      <n-input
        v-model:value="recordsStore.record.title"
        type="text"
        :placeholder="''" />
      <n-dropdown
        trigger="hover"
        :options="options"
        @select="handleSelect">
        <n-button>Hover!</n-button>
      </n-dropdown>
    </n-space>
  </n-list-item>
</template>
