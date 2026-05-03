<script setup>
import {
  h,
  ref,
  computed,
  watch
} from 'vue'
import {
  NListItem,
  NSpace,
  NInput,
  NDropdown,
  NButton,
  NIcon,
  NText,
  NRate,
  NCheckbox
} from 'naive-ui'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import { lyStorage } from '@/main'

const recordsStore = useRecordsStore()
const gridStore = useGridStore()
const route = useRoute()
const props = defineProps(['id', 'index'])
const tag = route.meta.tag
const showCheckbox = ref(false)

const record = computed(() => {
  return recordsStore.getRecord(props.id, tag) || {}
})

/**
 * @function renderDropdownIcon
 * @description Renders the icon for status dropdown options
 * @param {Object} option
 */
const renderDropdownIcon = (option) => {
  return h(option.icon, { size: 16 })
}

/**
 * @function getComparableString
 * @description Generates a JSON string of the record's main properties for comparison
 * @param {Object} r - Record object
 * @returns {string|null}
 */
const getComparableString = (r) => r && r.id ? JSON.stringify({
  title: r.title,
  score: r.score,
  label: r.label,
  liked: r.liked
}) : null

let updateTimeout = null
let lastSavedString = getComparableString(record.value)

// Watch for record changes to trigger auto-save
watch(record, (newVal) => {
  if (newVal && newVal.id) {
    const currentString = getComparableString(newVal)
    if (currentString === lastSavedString) return

    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      lastSavedString = currentString
      recordsStore.addRecord({
        record: { ...newVal },
        listType: tag 
      })
        .catch(err => {
          console.error('Failed to update record:', err)
          lastSavedString = null
        })
    }, 500)
  }
}, { deep: true })
</script>

<template>
  <n-list-item
    class="px-4 px-sm-5"
    :class="gridStore.screenLargerThen('l') ? '' : 'record-mobile'"
    @mouseover="showCheckbox = true"
    @mouseleave="showCheckbox = false"
  >
    <n-space
      :wrap-item="false"
      align="center"
      :wrap="!gridStore.screenLargerThen('l')"
      :size="gridStore.screenLargerThen('l') ? 'medium' : 'small'"
      class="py-2 py-m-0"
    >
      <!-- begin::Record Identity & Title -->
      <n-space
        :wrap-item="false"
        :wrap="false"
        align="center"
        size="small"
        class="w-100 w-l-50"
      >
        <n-space
          :wrap-item="false"
          align="center"
          justify="center"
          :size="0"
        >
          <n-checkbox
            v-show="showCheckbox || record.selected"
            v-model:checked="record.selected"
          />

          <n-text
            v-show="!showCheckbox && !record.selected"
            align="center"
            class="w-16 fz-12 lh-1"
            depth="3"
          >
            {{ index + 1 }}
          </n-text>
        </n-space>

        <n-input
          :id="`input-${record.id}`"
          v-model:value="record.title"
          type="text"
          :size="gridStore.screenLargerThen('l') ? 'medium' : 'small'"
          :placeholder="$t('records.titlePlaceholder')"
          class="w-100 w-l-75 record-input"
        />
      </n-space>
      <!-- end::Record Identity & Title -->

      <!-- begin::Record Attributes (Score, Liked, Status) -->
      <n-space
        :wrap-item="false"
        align="center"
        justify="center"
        size="small"
        class="w-100 w-l-50"
      >
        <n-rate
          v-model:value="record.score"
          clearable
          class="mr-0 ml-0 ml-l-10 mr-s-3 mr-l-7"
        />
          
        <n-button
          quaternary
          round
          circle
          type="error"
          size="small"
          class="ml-3 ml-s-6 ml-l-10"
          @click="record.liked = !record.liked"
        >
          <template #icon>
            <like-icon
              :weight="record.liked ? 'fill' : 'regular'"
              :class="{ 'opacity-4' : !record.liked }"
            />
          </template>
        </n-button>

        <n-dropdown
          size="small"
          trigger="click"
          placement="bottom-end"
          :options="recordsStore.labels[tag]"
          :render-icon="renderDropdownIcon"
          @select="key => record.label = key"
        >
          <n-button
            quaternary
            size="small"
            class="ml-auto"
          >
            <template #icon>
              <n-icon
                depth="2"
                :component="recordsStore.getLabelIcon(tag, record.label)"
              />
            </template>
            {{ recordsStore.getLabelName(tag, record.label) }}
          </n-button>
        </n-dropdown>
      </n-space>
      <!-- end::Record Attributes (Score, Liked, Status) -->
    </n-space>
  </n-list-item>
</template>

<style lang="scss">
.n-list {
  background-color: transparent;
}

.record-input {
  background-color: transparent !important;

  .n-input__border {
    border: none !important;
  }

  .n-input__input-el {
    font-weight: 500;
  }
}

.record-mobile {
  border-top: 1px solid var(--n-merged-color-hover) !important;
  border-radius: 0 !important;
}
</style>
