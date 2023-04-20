<script setup lang="ts">
import { nextTick } from 'vue'
import { NButton } from 'naive-ui'
import { 
  PhPlus as PlusIcon,
} from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { renderIcon } from '@/utils/render-icon'

const route = useRoute()
const recordsStore = useRecordsStore()

async function handleNewRecord() {
  recordsStore
    .addRecord({
      listType: route.meta.tag as string,
      saveLocal: true,
    })
    .then(record => { focusInput(record) })
}

/* eslint-disable-next-line no-undef */
async function focusInput(record: LyRecord) {
  await nextTick()
  document.querySelector<HTMLInputElement>(`#input-${record.id} input`)?.focus()
}
</script>

<template>
  <n-button
    secondary
    :render-icon="renderIcon(PlusIcon)"
    @click="handleNewRecord">
    Add New {{ route.meta.thing }}
  </n-button>
</template>
