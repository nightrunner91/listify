<script setup>
import {
  NButton,
  NIcon,
  NTooltip
} from 'naive-ui'
import { PhGithubLogo as GithubIcon } from 'phosphor-vue'
import { useGridStore } from '@/stores/grid.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gridStore = useGridStore()

function openGithub() {
  window.open('https://github.com/nightrunner91/listify/', '_blank')
}
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        size="small"
        @click="openGithub"
      >
        <template #icon>
          <n-icon
            :component="GithubIcon"
            :size="18"
          />
        </template>
        <span v-if="gridStore.screenLargerThen('s')">GitHub</span>
      </n-button>
    </template>
    {{ t('github.openRepo') }}
  </n-tooltip>
</template>
