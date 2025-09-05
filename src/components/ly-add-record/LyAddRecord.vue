<script setup>
import { nextTick, toRefs } from 'vue'
import { NSpace, NButton } from 'naive-ui'
import { 
  PhPlus as PlusIcon,
} from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { renderIcon } from '@/utils/render-icon'

const route = useRoute()
const recordsStore = useRecordsStore()

const emit = defineEmits(['scrollBottom'])

async function handleNewRecord() {
  recordsStore
    .addRecord({
      listType: route.meta.tag,
      saveLocal: true,
    })
    .then(record => { 
      focusInput(record)
      // Emit scroll event for floating button
      if (props.variant === 'floating') {
        emit('scrollBottom')
      }
    })
}

/* eslint-disable-next-line no-undef */
async function focusInput(record) {
  await nextTick()
  document.querySelector(`#input-${record.id} input`).focus()
}

const props = defineProps({
  variant: {
    type: String,
    required: true,
    default: 'inline',
    validator: value =>
      ['inline', 'floating'].includes(value),
  },
})

const { variant } = toRefs(props)
</script>

<template>
  <n-button
    v-if="variant == 'inline'"
    secondary
    :render-icon="renderIcon(PlusIcon)"
    @click="handleNewRecord">
    Add New {{ route.meta.thing }}
  </n-button>

  <n-space
    v-else-if="variant == 'floating'"
    vertical
    align="center"
    justify="center"
    class="position-fixed right-5 bottom-5 right-s-10 bottom-s-10">
    <n-button
      strong
      circle
      type="primary"
      size="large"
      :render-icon="renderIcon(PlusIcon)"
      @click="handleNewRecord" />
  </n-space>
</template>
