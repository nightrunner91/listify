<script lang="ts" setup>
import { h } from 'vue'
import { useRoute } from 'vue-router'
import {
  NDropdown,
  NButton,
  NSpace,
  NText
} from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const recordsStore = useRecordsStore()

const renderDropdownIcon = (option: any) => {
  return h(option.icon, { size: 16 })
}

function handleSelect(): void {
  console.log('g7676o')
}
</script>

<template>
  <n-space
    v-if="route.meta.tag !== 'start'"
    align="center"
    size="small">
    <n-text>Sort by:</n-text>
    <n-dropdown
      trigger="click"
      placement="bottom-end"
      :options="(recordsStore.sortOptions as any)"
      :render-icon="renderDropdownIcon"
      @select="handleSelect">
      <n-button
        tertiary
        class="ml-auto">
        ggfg
      </n-button>
    </n-dropdown>
  </n-space>
  
</template>
