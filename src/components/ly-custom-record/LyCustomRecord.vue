<script setup>
import { ref, computed, watch } from 'vue'
import { NListItem, NSpace, NInput, NButton, NIcon, NText } from 'naive-ui'
import { PhX as DeleteIcon } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'

const props = defineProps({
  id: { type: String, required: true },
  listId: { type: String, required: true },
  index: { type: Number, required: true },
})

const recordsStore = useRecordsStore()
const gridStore = useGridStore()

const record = computed(() => recordsStore.getCustomRecord(props.listId, props.id) || {})

// Debounced rename — only fires when title actually changes
const getComparableTitle = (r) => (r && r.id ? r.title : null)
let renameTimeout = null
let lastSavedTitle = getComparableTitle(record.value)

watch(record, (newVal) => {
  if (!newVal || !newVal.id) return
  const currentTitle = getComparableTitle(newVal)
  if (currentTitle === lastSavedTitle) return

  clearTimeout(renameTimeout)
  renameTimeout = setTimeout(() => {
    lastSavedTitle = currentTitle
    recordsStore.renameCustomRecord(props.listId, newVal.id, newVal.title)
      .catch(err => {
        console.error('Failed to rename custom record:', err)
        lastSavedTitle = null
      })
  }, 500)
}, { deep: true })

function handleDelete() {
  recordsStore.removeCustomRecord(props.listId, props.id)
}
</script>

<template>
  <n-list-item
    class="px-4 px-sm-5"
    :style="gridStore.screenLargerThen('l') ? '' : 'border-radius: 0;'">
    <n-space
      :wrap-item="false"
      :wrap="false"
      align="center"
      size="small"
      class="">

      <n-text
        align="center"
        style="width: 16px; font-size: 12px; line-height: 1; flex-shrink: 0;"
        depth="3">
        {{ index + 1 }}
      </n-text>

      <n-input
        :id="`input-${record.id}`"
        v-model:value="record.title"
        type="text"
        :size="gridStore.screenLargerThen('l') ? 'medium' : 'small'"
        :placeholder="$t('records.titlePlaceholder')"
        class="record-input" />

      <n-button
        quaternary
        round
        circle
        type="error"
        size="small"
        style="flex-shrink: 0;"
        @click="handleDelete">
        <template #icon>
          <n-icon><DeleteIcon /></n-icon>
        </template>
      </n-button>

    </n-space>
  </n-list-item>
</template>

<style lang="scss" scoped>
.record-input {
  background-color: transparent !important;

  :deep(.n-input__border) {
    border: none !important;
  }

  :deep(.n-input__input-el) {
    font-weight: 500;
  }
}
</style>
