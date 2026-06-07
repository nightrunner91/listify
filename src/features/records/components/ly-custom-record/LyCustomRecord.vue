<script setup>
import {
  ref,
  computed,
  watch,
  onBeforeUnmount
} from 'vue'
import {
  NListItem,
  NSpace,
  NInput,
  NButton,
  NIcon,
  NText
} from 'naive-ui'
import { PhX as DeleteIcon } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'

const props = defineProps({
  id: {
    type: String,
    required: true 
  },
  listId: {
    type: String,
    required: true 
  },
  index: {
    type: Number,
    required: true 
  },
})

const recordsStore = useRecordsStore()
const gridStore = useGridStore()

const record = computed(() => recordsStore.getCustomRecord(props.listId, props.id) || {})

// Local state for input to prevent UI lag during typing
const localTitle = ref(record.value.title || '')

// Sync local state from store when record changes externally
watch(
  () => record.value.title,
  (newVal) => {
    if (localTitle.value !== newVal) {
      localTitle.value = newVal || ''
    }
  },
  { immediate: true }
)

let saveTimeout = null
let lastSavedTitle = localTitle.value || ''

// Debounced API save - fires in background without blocking UI
watch(localTitle, (newTitle) => {
  if (!record.value || !record.value.id) return
  if (newTitle === lastSavedTitle) return

  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const titleToSave = newTitle
    lastSavedTitle = titleToSave
    recordsStore.renameCustomRecord(props.listId, record.value.id, titleToSave)
      .catch(err => {
        console.error('Failed to rename custom record:', err)
      })
  }, 800)
})

/**
 * @function handleDelete
 * @description Removes the custom record from the list
 */
function handleDelete() {
  recordsStore.removeCustomRecord(props.listId, props.id)
}

onBeforeUnmount(() => {
  clearTimeout(saveTimeout)
})
</script>

<template>
  <n-list-item
    class="px-4 px-sm-5"
    :style="gridStore.screenLargerThen('l') ? '' : 'border-radius: 0;'"
  >
    <n-space
      :wrap-item="false"
      :wrap="false"
      align="center"
      size="small"
      class=""
    >
      <!-- begin::Identity -->
      <n-text
        align="center"
        class="w-16 fz-12 lh-1 flex-shrink-0"
        depth="3"
      >
        {{ index + 1 }}
      </n-text>
      <!-- end::Identity -->

      <!-- begin::Record Title -->
      <n-input
        :id="`input-${record.id}`"
        v-model:value="localTitle"
        type="text"
        :size="gridStore.screenLargerThen('l') ? 'medium' : 'small'"
        :placeholder="$t('records.titlePlaceholder')"
        class="record-input"
      />
      <!-- end::Record Title -->

      <!-- begin::Actions -->
      <n-button
        quaternary
        round
        circle
        type="error"
        size="small"
        class="flex-shrink-0"
        @click="handleDelete"
      >
        <template #icon>
          <n-icon><DeleteIcon /></n-icon>
        </template>
      </n-button>
      <!-- end::Actions -->
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
