<script setup>
import { ref } from 'vue'
import { PhUploadSimple as ExportIcon } from 'phosphor-vue'
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
    title="Select Categories"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'">
    <div style="margin-bottom: 12px;">
      <span style="font-weight: 500; font-size: 14px;">Categories</span>
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
      <div style="margin-bottom: 12px; margin-top: -12px;">
        <span style="font-weight: 500; font-size: 14px;">Custom Lists</span>
      </div>
      <n-checkbox-group
        v-model:value="recordsStore.selectedCustomLists"
        class="mb-6">
        <n-grid
          item-responsive
          responsive="screen"
          :x-gap="12"
          :y-gap="8"
          :cols="2">
          <n-grid-item span="2 s:1" v-for="list in recordsStore.customLists" :key="list.id">
            <n-checkbox :value="list.id" :label="list.name" />
          </n-grid-item>
        </n-grid>
      </n-checkbox-group>
    </template>
    <n-p
      depth="3"
      style="font-size: 14px;">
      Export your collection as a JSON file for backup, migration, or portability. Your data is safely stored on the server, but a local copy never hurts.
    </n-p>
    <template #footer>
      <n-button
        block
        @click="recordsStore.exportCollection">
        Export Collection
      </n-button>
    </template>
  </n-modal>
</template>
