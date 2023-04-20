<script lang="ts" setup>
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
    title="Select Categories"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'">
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
    <n-p
      depth="3"
      style="font-size: 14px;">
      Listify relies on browser memory which makes it an unreliable form of storage. To prevent sudden data loss, it's recommended to export your collection from time to time.
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
