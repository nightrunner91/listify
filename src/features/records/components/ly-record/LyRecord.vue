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
  NAutoComplete,
  NDropdown,
  NButton,
  NIcon,
  NText,
  NRate,
  NCheckbox,
  NTag
} from 'naive-ui'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'
import { useExternalSearch } from '@/composables/useExternalSearch'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import { lyStorage } from '@/main'

const { t } = useI18n()
const recordsStore = useRecordsStore()
const gridStore = useGridStore()
const {
  suggestions, isLoading, search: triggerSearch, isSearchEnabled 
} = useExternalSearch()
const route = useRoute()
const props = defineProps(['id', 'index', 'readonly', 'record'])
const tag = props.readonly ? props.record?.category : route.meta.tag
const showCheckbox = ref(false)

/**
 * @description Configuration for external search for the current category
 */
const searchConfig = computed(() => isSearchEnabled(tag) ? {
  enabled: true,
  placeholder: searchPlaceholder.value 
} : {
  enabled: false,
  placeholder: t('records.titlePlaceholder') 
})

/**
 * @description Dynamic placeholder based on whether search is enabled for the category
 */
const searchPlaceholder = computed(() => {
  const config = isSearchEnabled(tag)
  // We use a mapping or just fallback to generic titlePlaceholder
  const categoryPlaceholder = `records.searchPlaceholder.${tag}`
  return isSearchEnabled(tag) ? t(categoryPlaceholder) : t('records.titlePlaceholder')
})

const record = computed(() => {
  // In readonly mode, use the passed-in record prop directly (no store)
  if (props.readonly) return props.record || {}
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

// Watch for record changes to trigger auto-save (only in edit mode)
watch(record, (newVal) => {
  // Skip in readonly mode
  if (props.readonly) return
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

/**
 * @function handleSearch
 * @description Triggers external search when input changes
 * @param {string} value 
 */
const handleSearch = (value) => {
  if (isSearchEnabled(tag)) {
    triggerSearch(value, tag)
  }
}
</script>

<template>
  <n-list-item
    class="px-4 px-sm-5"
    :class="[
      gridStore.screenLargerThen('l') ? '' : 'record-mobile',
      props.readonly ? 'record--readonly' : ''
    ]"
    @mouseover="!props.readonly && (showCheckbox = true)"
    @mouseleave="!props.readonly && (showCheckbox = false)"
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
        <!-- Index number (readonly) or checkbox (editable) -->
        <n-space
          v-if="!props.readonly"
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

        <!-- Readonly index -->
        <n-text
          v-else
          align="center"
          class="w-16 fz-12 lh-1"
          depth="3"
        >
          {{ index + 1 }}
        </n-text>

        <!-- Editable autocomplete title -->
        <n-auto-complete
          v-if="!props.readonly"
          :id="`input-${record.id}`"
          v-model:value="record.title"
          :options="isSearchEnabled(tag) ? suggestions : []"
          :loading="isSearchEnabled(tag) && isLoading"
          :size="gridStore.screenLargerThen('l') ? 'medium' : 'small'"
          :placeholder="searchPlaceholder"
          :auto-select="false"
          class="w-100 w-l-75 record-input"
          @input="handleSearch"
        />
        <!-- Readonly static title -->
        <n-text
          v-else
          class="w-100 record-readonly-title"
          :depth="record.title ? 1 : 3"
        >
          {{ record.title || '—' }}
        </n-text>
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
        <!-- Editable Rate -->
        <n-rate
          v-if="!props.readonly"
          v-model:value="record.score"
          clearable
          class="mr-0 ml-0 ml-l-10 mr-s-3 mr-l-7"
        />
        <!-- Readonly Rate -->
        <n-rate
          v-else-if="record.score > 0"
          :value="record.score"
          readonly
          size="small"
          class="mr-0 ml-0 ml-l-10 mr-s-3 mr-l-7"
        />
          
        <!-- Like button (editable) -->
        <n-button
          v-if="!props.readonly"
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
        <!-- Like icon (readonly, only shown if liked) -->
        <n-button
          v-else-if="record.liked"
          quaternary
          round
          circle
          type="error"
          size="small"
          class="ml-3 ml-s-6 ml-l-10 no-events cursor-default"
        >
          <template #icon>
            <like-icon weight="fill" />
          </template>
        </n-button>

        <!-- Label dropdown (editable) -->
        <n-dropdown
          v-if="!props.readonly"
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
        <!-- Label tag (readonly) -->
        <n-tag
          v-else-if="record.label"
          size="small"
          :bordered="false"
          class="ml-auto"
        >
          <template #icon>
            <n-icon
              depth="2"
              :component="recordsStore.getLabelIcon(tag, record.label)"
            />
          </template>
          {{ recordsStore.getLabelName(tag, record.label) }}
        </n-tag>
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

  .n-input,
  .n-input__border {
    background-color: transparent !important;
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

.record-readonly-title {
  font-weight: 500;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
