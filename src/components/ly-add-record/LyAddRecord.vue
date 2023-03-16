<script setup lang="ts">
import { NButton } from 'naive-ui'
import { 
  PhPlus as PlusIcon,
} from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records'
import { renderIcon } from '@/utils/render-icon'

const route = useRoute()
const recordsStore = useRecordsStore()
</script>

<template>
  <n-button
    size="small"
    :render-icon="renderIcon(PlusIcon)"
    @click="recordsStore.addRecord(recordsStore.record, route.meta.tag as string)">
    Add New {{ route.meta.thing }}
  </n-button>
</template>
