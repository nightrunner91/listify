<script lang="ts" setup>
import { ref } from 'vue'
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
  type UploadFileInfo,
} from 'naive-ui'
import { renderIcon } from '@/utils/render-icon'
import { useGridStore } from '@/stores/grid.store'
// import { useRecordsStore } from '@/stores/records.store'

const gridStore = useGridStore()
// const recordsStore = useRecordsStore()

const showModal = ref<boolean>(false)

async function beforeUpload (data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) {
  const reader = new FileReader()

  reader.onload = () => {
    const fileContents = reader.result as string
    const jsonObject = JSON.parse(fileContents)

    console.log(jsonObject)
  }

  reader.readAsText(data.file.file as Blob)
}

defineProps(['variant'])
</script>

<template>
  <n-button
    secondary
    v-if="variant == 'full'"
    :render-icon="renderIcon(ImportIcon)"
    @click="showModal = true">
    Import Collection
  </n-button>

  <n-tooltip
    v-else
    trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        circle
        size="large"
        @click="showModal = true">
        <template #icon>
          <n-icon :component="ImportIcon" />
        </template>
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
      @before-upload="beforeUpload">
      <n-upload-dragger>
        <div style="margin-bottom: 12px">
          <n-icon
            :component="UploadIcon"
            size="48"
            :depth="4" />
        </div>
        <n-p>
          Click or drag a file to this area
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
