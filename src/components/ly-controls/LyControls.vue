<script setup>
import {
  watch,
  computed
} from 'vue'
import {
  NDrawer,
  NGrid,
  NGridItem,
  NSpace,
  NButton,
  NPopconfirm,
  NText
} from 'naive-ui'
import {
  PhTrashSimple as DeleteIcon,
  PhChecks as SelectAllIcon,
  PhXSquare as DeselectAllIcon
} from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const route = useRoute()

const selectedCount = computed(() =>
  recordsStore.selectedRecordsLength(route.meta.tag).value
)

/**
 * @function handleSelection
 * @description Toggles between selecting all records and deselecting all records for the current list
 */
function handleSelection() {
  if (recordsStore.allRecordsSelected(route.meta.tag).value) {
    recordsStore.deselectAllRecords(route.meta.tag)
  } else {
    recordsStore.selectAllRecords(route.meta.tag)
  }
}

watch(
  route,
  () => {
    recordsStore.deselectAllRecords(route.meta.tag)
  },
  {
    immediate: true,
    deep: true 
  }
)
</script>

<template>
  <n-drawer
    :show-mask="false"
    :show="recordsStore.someRecordsSelected(route.meta.tag).value"
    :height="56"
    placement="bottom"
  >
    <n-space
      align="center"
      class="w-100 h-100 pl-4 pl-s-18"
      :wrap-item="false"
    >
      <n-grid
        item-responsive
        responsive="screen"
        :x-gap="12"
        :y-gap="8"
        :cols="6"
      >
        <n-grid-item
          span="6 s:4 l:4"
          offset="0 s:1 l:1"
        >
          <!-- begin::Selection Controls -->
          <n-space
            align="center"
            :wrap-item="false"
          >
            <!-- begin::Toggle All -->
            <n-button
              secondary
              size="small"
              class="mr-auto"
              :render-icon="
                recordsStore.allRecordsSelected(route.meta.tag).value
                  ? renderIcon(DeselectAllIcon)
                  : renderIcon(SelectAllIcon)
              "
              @click="handleSelection"
            >
              <n-text v-if="recordsStore.allRecordsSelected(route.meta.tag).value">
                {{ t('common.deselectAll') }}
              </n-text>
              <n-text v-else>
                {{ t('common.selectAll') }}
              </n-text>
            </n-button>
            <!-- end::Toggle All -->

            <!-- begin::Bulk Actions -->
            <n-popconfirm @positive-click="recordsStore.deleteSelectedRecords(route.meta.tag)">
              <template #trigger>
                <n-button
                  type="error"
                  size="small"
                  :render-icon="renderIcon(DeleteIcon)"
                >
                  {{ t('common.delete') }}
                </n-button>
              </template>
              <n-text>
                {{
                  t('controls.deleteConfirm', {
                    count: selectedCount,
                    record: t('controls.record', selectedCount),
                  })
                }}
              </n-text>
            </n-popconfirm>
            <!-- end::Bulk Actions -->
          </n-space>
          <!-- end::Selection Controls -->
        </n-grid-item>
      </n-grid>
    </n-space>
  </n-drawer>
</template>

<style>
.n-drawer.n-drawer--native-scrollbar .n-drawer-content-wrapper {
  overflow-x: hidden !important;
}
</style>
