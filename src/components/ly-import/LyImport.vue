<script setup>
import {
  ref,
  toRefs
} from 'vue'
import {
  PhDownloadSimple as ImportIcon,
  PhArchiveBox as UploadIcon,
  PhInfo as InfoIcon
} from 'phosphor-vue'
import {
  NButton,
  NIcon,
  NTooltip,
  NModal,
  NUpload,
  NUploadDragger,
  NP,
  NSpace,
  NText
} from 'naive-ui'
import { renderIcon } from '@/utils/render-icon'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()

const showModal = ref(false)

const props = defineProps({
  variant: {
    type: String,
    required: true,
    default: 'inline',
    validator: value =>
      ['inline', 'minified', 'hidden'].includes(value),
  },
})

const { variant } = toRefs(props)

defineExpose({showModal})
</script>

<template>
  <n-button
    v-if="variant === 'inline'"
    secondary
    :render-icon="renderIcon(ImportIcon)"
    @click="showModal = true"
  >
    {{ t('userProfile.importCollection') }}
  </n-button>

  <template v-else-if="variant === 'minified'">
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button
          quaternary
          size="small"
          @click="showModal = true"
        >
          <template #icon>
            <n-icon
              :component="ImportIcon"
              :size="18"
            />
          </template>
          <span v-if="gridStore.screenLargerThen('s')">
            {{ t('common.import') }}
          </span>
        </n-button>
      </template>
      {{ t('userProfile.importCollection') }}
    </n-tooltip>
  </template>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="t('import.modalTitle')"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'"
  >
    <n-upload
      id="import-collection"
      directory-dnd
      accept=".json,.csv"
      :max="1"
      :show-file-list="false"
      :default-upload="true"
      @before-upload="recordsStore.importCollection"
      @change="showModal = false"
    >
      <n-upload-dragger>
        <div class="mb-3">
          <n-icon
            :component="UploadIcon"
            size="48"
            :depth="4"
          />
        </div>
        <n-p>
          {{ t('import.draggerText') }}
        </n-p>
        <n-space
          align="start"
          :size="8"
          :wrap-item="false"
          class="fz-14"
        >
          <n-text depth="3">
            {{ t('import.draggerInfo') }}
          </n-text>
        </n-space>
      </n-upload-dragger>
    </n-upload>
  </n-modal>
</template>
