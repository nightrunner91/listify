<script setup>
import { ref, toRefs } from 'vue'
import {
  PhDownloadSimple as ImportIcon,
  PhArchiveBox as UploadIcon
} from 'phosphor-vue'
import {
  NButton,
  NIcon,
  NTooltip,
  NModal,
  NUpload,
  NUploadDragger,
  NP,
} from 'naive-ui'
import { renderIcon } from '@/utils/render-icon'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'

const gridStore = useGridStore()
const recordsStore = useRecordsStore()

const showModal = ref(false)

const props = defineProps({
  variant: {
    type: String,
    required: true,
    default: 'inline',
    validator: value =>
      ['inline', 'minified'].includes(value),
  },
})

const { variant } = toRefs(props)
</script>

<template>
  <n-button
    secondary
    v-if="variant === 'inline'"
    :render-icon="renderIcon(ImportIcon)"
    @click="showModal = true">
    Import Collection
  </n-button>

  <n-tooltip
    v-else-if="variant === 'minified'"
    trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        size="small"
        @click="showModal = true">
        <template #icon>
          <n-icon :component="ImportIcon" />
        </template>
        Import
      </n-button>
    </template>
    Import Collection
  </n-tooltip>

  <n-modal
    v-model:show="showModal"
    preset="card"
    title="Import Collection"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'">

    <n-upload
      id="import-collection"
      directory-dnd
      accept=".json"
      :max="1"
      :show-file-list="false"
      :default-upload="true"
      @before-upload="recordsStore.importCollection"
      @change="showModal = false">
      <n-upload-dragger>
        <div style="margin-bottom: 12px">
          <n-icon
            :component="UploadIcon"
            size="48"
            :depth="4" />
        </div>
        <n-p>
          Click or drag your collection here
        </n-p>
        <n-p
          depth="3"
          style="font-size: 14px;">
          Attention! The imported collection will completely replace the current one, so please be careful!
        </n-p>
      </n-upload-dragger>
    </n-upload>
  </n-modal>
</template>
