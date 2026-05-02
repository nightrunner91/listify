<script setup>
import {
  nextTick,
  toRefs,
  computed
} from 'vue'
import {
  NSpace,
  NButton,
  NTooltip
} from 'naive-ui'
import {PhPlus as PlusIcon,} from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { renderIcon } from '@/utils/render-icon'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const recordsStore = useRecordsStore()

const emit = defineEmits(['scrollBottom'])

const props = defineProps({
  variant: {
    type: String,
    required: true,
    default: 'inline',
    validator: value =>
      ['inline', 'floating', 'bottom'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const { variant } = toRefs(props)

/** @type {import('vue').ComputedRef<string>} */
const addLabel = computed(() => {
  const tag = route.meta.tag
  let thingKey = 'item'
  
  if (tag === 'games') thingKey = 'game'
  else if (tag === 'tvshows') thingKey = 'tvshow'
  else if (tag === 'films') thingKey = 'film'
  else if (tag === 'anime') thingKey = 'anime'
  else if (tag === 'manga') thingKey = 'manga'
  else if (tag === 'books') thingKey = 'book'
  else if (tag === 'music') thingKey = 'music'
  
  return t('addRecord.button', { thing: t(`things.${thingKey}`) })
})

/**
 * @function handleNewRecord
 * @async
 * @description Creates a new record in the current list and triggers focus/scroll side effects
 */
async function handleNewRecord() {
  // Detect if current route is a custom list
  const customList = recordsStore.customLists.find(list => list.id === route.params.id)
  if (customList) {
    // Add to custom list
    recordsStore.addCustomRecord(customList.id, '')
      .then(() => {
      // Focus last input (new record)
        const lastRecord = customList.records[customList.records.length - 1]
        if (lastRecord) {
          focusInput(lastRecord)
        }
        if (props.variant === 'floating' || props.variant === 'bottom') {
          emit('scrollBottom')
        }
      })
  } else {
    // Add to prepared list
    recordsStore
      .addRecord({
        listType: route.meta.tag,
        saveLocal: true,
      })
      .then(record => { 
        focusInput(record)
        emit('scrollBottom')
      })
  }
}

/**
 * @function focusInput
 * @async
 * @description Programmatically focuses the title input of a specific record
 * @param {Object} record - The record object to focus
 */
async function focusInput(record) {
  await nextTick()
  document.querySelector(`#input-${record.id} input`).focus()
}
</script>

<template>
  <!-- begin::Inline Variant -->
  <n-button
    v-if="variant == 'inline'"
    secondary
    :render-icon="renderIcon(PlusIcon)"
    @click="handleNewRecord"
  >
    {{ addLabel }}
  </n-button>
  <!-- end::Inline Variant -->

  <!-- begin::Bottom Variant (List End) -->
  <n-button
    v-else-if="variant == 'bottom'"
    size="small"
    :disabled="disabled"
    :render-icon="renderIcon(PlusIcon)"
    @click="handleNewRecord"
  >
    {{ addLabel }}
  </n-button>
  <!-- end::Bottom Variant -->

  <!-- begin::Floating Variant -->
  <n-space
    v-else-if="variant == 'floating'"
    vertical
    align="center"
    justify="center"
    class="position-fixed right-5 bottom-5 right-s-10 bottom-s-10"
  >
    <n-tooltip
      placement="left"
      trigger="hover"
    >
      <template #trigger>
        <n-button
          strong
          circle
          type="primary"
          size="large"
          :disabled="disabled"
          :render-icon="renderIcon(PlusIcon)"
          @click="handleNewRecord"
        />
      </template>
      {{ addLabel }}
    </n-tooltip>
  </n-space>
  <!-- end::Floating Variant -->
</template>
