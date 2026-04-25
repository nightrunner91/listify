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
} from 'naive-ui'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'

const gridStore = useGridStore()
const recordsStore = useRecordsStore()

const showModal = ref(false)
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        size="small"
        @click="showModal = true">
        <template #icon>
          <n-icon :component="ExportIcon" :size="18" />
        </template>
        <span v-if="gridStore.screenLargerThen('s')">Export</span>
      </n-button>
    </template>
    Export Collection
  </n-tooltip>

  <n-modal
    v-model:show="showModal"
    preset="card"
    title="Export Collection"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'">
    <div class="mb-3">
      <n-text depth="3" class="section-title">CATEGORIES</n-text>
    </div>
    <n-checkbox-group
      v-model:value="recordsStore.selectedCategories"
      class="mb-6">
      <n-grid
        item-responsive
        responsive="screen"
        :x-gap="12"
        :y-gap="8"
        :cols="2">
        <n-grid-item span="2 s:1">
          <n-checkbox value="games" label="Games" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="tvshows" label="TV Shows" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="films" label="Films" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="anime" label="Anime" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="manga" label="Manga" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="books" label="Books" />
        </n-grid-item>
        <n-grid-item span="2 s:1">
          <n-checkbox value="music" label="Music" />
        </n-grid-item>
      </n-grid>
    </n-checkbox-group>

    <template v-if="recordsStore.customLists.length > 0">
      <div class="mb-3">
        <n-text depth="3" class="section-title">CUSTOM LISTS</n-text>
      </div>
      <n-checkbox-group
        v-model:value="recordsStore.selectedCustomLists"
        class="">
        <n-grid
          item-responsive
          responsive="screen"
          :x-gap="12"
          :y-gap="8"
          :cols="1">
          <n-grid-item span="2 s:1" v-for="list in recordsStore.customLists" :key="list.id">
            <n-checkbox :value="list.id" :label="list.name" />
          </n-grid-item>
        </n-grid>
      </n-checkbox-group>
    </template>
    <template #footer>
      <div class="mb-3">
        <n-text depth="3" class="section-title">FORMAT</n-text>
      </div>
      <n-button-group block class="w-100 mb-5">
        <n-button
          primary
          class="w-50"
          @click="recordsStore.exportCollection('json')">
          <template #icon>
            <n-icon :component="JsonIcon" />
          </template>
          JSON
        </n-button>
        <n-button
          primary
          class="w-50"
          @click="recordsStore.exportCollection('csv')">
          <template #icon>
            <n-icon :component="CsvIcon" />
          </template>
          CSV
        </n-button>
      </n-button-group>
      <n-p
        depth="3"
        style="font-size: 13px; display: flex; align-items: flex-start; gap: 8px;">
        <n-icon :component="InfoIcon" :size="16" style="margin-top: 2px" />
        <span>Export your collection for backup, migration, or portability. Your data is safely stored on the server, but a local copy never hurts.</span>
      </n-p>
    </template>
  </n-modal>
</template>
