<script lang="ts" setup>
import { ref } from 'vue'
import {
  PhUploadSimple as ExportIcon,
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
  NA,
} from 'naive-ui'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'

const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const showModal = ref<boolean>(false)
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        circle
        size="large"
        @click="showModal = true">
        <template #icon>
          <n-icon :component="ExportIcon" />
        </template>
      </n-button>
    </template>
    Export Collection
  </n-tooltip>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    title="Select Categories"
    size="huge"
    transform-origin="center"
    to="body">
    <n-checkbox-group v-model:value="recordsStore.selectedCategories">
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
    <n-p
      depth="3"
      style="font-size: 14px;">
      Since browser memory isn't a very reliable form of storage, Listify provides import and export of your collection in <n-a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON" target="_blank">JSON</n-a> format. We recommend exporting your collection from time to time to avoid losing it suddenly.
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
