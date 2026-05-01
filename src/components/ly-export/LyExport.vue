<script setup>
import { ref } from 'vue'
import {
  PhUploadSimple as ExportIcon,
  PhFileCode as JsonIcon,
  PhTable as CsvIcon,
  PhInfo as InfoIcon
} from 'phosphor-vue'
import {
  NButton,
  NIcon,
  NTooltip,
  NModal,
  NGrid,
  NGridItem,
  NCheckboxGroup,
  NCheckbox,
  NP,
  NText,
  NButtonGroup,
  NSpace
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
    required: false,
    default: 'minified',
    validator: value => ['inline', 'minified', 'hidden'].includes(value),
  },
})

defineExpose({showModal})
</script>

<template>
  <!-- begin::Export Trigger (Minified) -->
  <template v-if="variant === 'minified'">
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button
          quaternary
          size="small"
          @click="showModal = true"
        >
          <template #icon>
            <n-icon
              :component="ExportIcon"
              :size="18"
            />
          </template>
          <span v-if="gridStore.screenLargerThen('s')">
            {{ t('common.export') }}
          </span>
        </n-button>
      </template>
      {{ t('userProfile.exportCollection') }}
    </n-tooltip>
  </template>
  <!-- end::Export Trigger (Minified) -->

  <!-- begin::Export Trigger (Inline) -->
  <n-button
    v-else-if="variant === 'inline'"
    secondary
    :render-icon="renderIcon(ExportIcon)"
    @click="showModal = true"
  >
    {{ t('userProfile.exportCollection') }}
  </n-button>
  <!-- end::Export Trigger (Inline) -->

  <!-- begin::Export Modal -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="t('export.modalTitle')"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'"
  >
    <!-- begin::Category Selection -->
    <div class="mb-3">
      <n-text
        depth="3"
        class="section-title"
      >
        {{ t('export.sectionCategories') }}
      </n-text>
    </div>
    <n-checkbox-group
      v-model:value="recordsStore.selectedCategories"
      class="mb-6"
    >
      <n-grid
        item-responsive
        responsive="screen"
        :x-gap="12"
        :y-gap="8"
        :cols="2"
      >
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="games"
            :label="t('categories.games')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="tvshows"
            :label="t('categories.tvshows')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="films"
            :label="t('categories.films')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="anime"
            :label="t('categories.anime')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="manga"
            :label="t('categories.manga')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="books"
            :label="t('categories.books')"
          />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox
            value="music"
            :label="t('categories.music')"
          />
        </n-grid-item>
      </n-grid>
    </n-checkbox-group>
    <!-- end::Category Selection -->

    <!-- begin::Custom List Selection -->
    <template v-if="recordsStore.customLists.length > 0">
      <div class="mb-3">
        <n-text
          depth="3"
          class="section-title"
        >
          {{ t('export.sectionCustomLists') }}
        </n-text>
      </div>
      <n-checkbox-group
        v-model:value="recordsStore.selectedCustomLists"
        class=""
      >
        <n-grid
          item-responsive
          responsive="screen"
          :x-gap="12"
          :y-gap="8"
          :cols="1"
        >
          <n-grid-item
            v-for="list in recordsStore.customLists"
            :key="list.id"
            span="2 s:1"
          >
            <n-checkbox
              :value="list.id"
              :label="list.name"
            />
          </n-grid-item>
        </n-grid>
      </n-checkbox-group>
    </template>
    <!-- end::Custom List Selection -->

    <!-- begin::Modal Footer (Actions) -->
    <template #footer>
      <div class="mb-3">
        <n-text
          depth="3"
          class="section-title"
        >
          {{ t('export.sectionFormat') }}
        </n-text>
      </div>
      <n-button-group
        block
        class="w-100 mb-5"
      >
        <n-button
          primary
          class="w-50"
          @click="recordsStore.exportCollection('json')"
        >
          <template #icon>
            <n-icon :component="JsonIcon" />
          </template>
          JSON
        </n-button>
        <n-button
          primary
          class="w-50"
          @click="recordsStore.exportCollection('csv')"
        >
          <template #icon>
            <n-icon :component="CsvIcon" />
          </template>
          CSV
        </n-button>
      </n-button-group>
      <n-space
        align="start"
        :size="8"
        :wrap-item="false"
        class="fz-13"
      >
        <n-text depth="3">
          {{ t('export.footerInfo') }}
        </n-text>
      </n-space>
    </template>
    <!-- end::Modal Footer -->
  </n-modal>
  <!-- end::Export Modal -->
</template>
