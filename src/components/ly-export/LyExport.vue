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
  NSpace,
  NCheckboxGroup,
  NCheckbox,
} from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'

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
    :style="{ width: '320px' }"
    title="Select Categories"
    transform-origin="center"
    to="body">
    <n-checkbox-group v-model:value="recordsStore.selectedCategories">
      <n-space
        vertical
        size="small">
        <n-checkbox value="games" label="Games" />
        <n-checkbox value="tvshows" label="TV Shows" />
        <n-checkbox value="films" label="Films" />
        <n-checkbox value="anime" label="Anime" />
        <n-checkbox value="manga" label="Manga" />
        <n-checkbox value="books" label="Books" />
        <n-checkbox value="music" label="Music" />
      </n-space>
    </n-checkbox-group>
    <template #footer>
      <n-button
        block
        @click="recordsStore.exportCollection">
        Export Collection
      </n-button>
    </template>
  </n-modal>
</template>
