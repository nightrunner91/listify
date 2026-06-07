<script setup>
import { useExternalSearch } from '@/composables/useExternalSearch'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import {
  NAutoComplete,
  NButton,
  NCheckbox,
  NDivider,
  NDropdown,
  NGi,
  NGrid,
  NIcon,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NListItem,
  NRate,
  NSpace,
  NTag,
  NText
} from 'naive-ui'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import {
  computed,
  h,
  ref,
  watch,
  onBeforeUnmount
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

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
  const categoryPlaceholder = `records.searchPlaceholder.${tag}`
  return isSearchEnabled(tag) ? t(categoryPlaceholder) : t('records.titlePlaceholder')
})

const record = computed(() => {
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
  liked: r.liked,
  season: r.season,
  episode: r.episode,
}) : null

/**
 * @description Whether to show episode tracking fields (only for tvshows and anime)
 */
const showEpisodeTracking = computed(() => tag === 'tvshows' || tag === 'anime')

/**
 * @description Formatted episode display for readonly mode (e.g., S03E06, S03, E06)
 */
const episodeDisplay = computed(() => {
  if (!props.readonly || !showEpisodeTracking.value) return null
  const season = record.value.season
  const episode = record.value.episode
  if (!season || !episode) return null
  return `S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`
})

/**
 * @description Local state for title input to prevent UI lag during typing
 */
const localTitle = ref(record.value.title || '')

/**
 * @description Sync local title from store when record changes externally
 */
watch(
  () => record.value.title,
  (newVal) => {
    if (localTitle.value !== newVal) {
      localTitle.value = newVal || ''
    }
  },
  { immediate: true }
)

/**
 * @description Local state for season/episode inputs to prevent UI lag during typing
 */
const localSeason = ref(null)
const localEpisode = ref(null)
const isEditingSeason = ref(false)
const isEditingEpisode = ref(false)

/**
 * @description Sync local state from store when not actively editing
 */
watch(
  () => record.value.season,
  (newVal) => {
    if (!isEditingSeason.value) {
      localSeason.value = newVal
    }
  },
  { immediate: true }
)

watch(
  () => record.value.episode,
  (newVal) => {
    if (!isEditingEpisode.value) {
      localEpisode.value = newVal
    }
  },
  { immediate: true }
)

/**
 * @description AbortController for cancelling pending API requests
 */
let saveAbortController = null
let updateTimeout = null
let lastSavedString = getComparableString(record.value)
let pendingSaveString = null

// PERF: Replaced deep:true watch with a shallow watcher that only compares serialized
// property values. Deep watching 500+ record objects creates hundreds of recursive watchers
// that fire on every reactive tick, causing severe scroll lag. This shallow comparison
// detects the same changes with a fraction of the overhead.
// Note: Title changes are handled via @blur/@select to avoid logging on every keystroke.
// FIX: Track pendingSaveString to prevent race conditions where API responses overwrite
// user input. When the watcher fires with the same state as a pending save, we skip
// scheduling a new API call. lastSavedString is only updated after save completes.
// FIX: Excludes season/episode changes from this watcher - they are handled separately
// via debounced local state to prevent input lag.
// FIX: Excludes title changes - title is handled via localTitle watcher with blur/select.
watch(
  () => getComparableString(record.value),
  (currentString) => {
    if (props.readonly) return
    if (!record.value || !record.value.id) return
    if (currentString === lastSavedString) return
    if (currentString === pendingSaveString) return

    const oldRecord = JSON.parse(lastSavedString || '{}')
    const newRecord = JSON.parse(currentString || '{}')
    const titleOnlyChanged = (
      oldRecord.title !== newRecord.title &&
      oldRecord.score === newRecord.score &&
      oldRecord.label === newRecord.label &&
      oldRecord.liked === newRecord.liked &&
      oldRecord.season === newRecord.season &&
      oldRecord.episode === newRecord.episode
    )
    if (titleOnlyChanged) return

    // Skip if only season/episode changed (handled by debounced local state)
    const seasonEpisodeOnlyChanged = (
      oldRecord.title === newRecord.title &&
      oldRecord.score === newRecord.score &&
      oldRecord.label === newRecord.label &&
      oldRecord.liked === newRecord.liked &&
      (oldRecord.season !== newRecord.season || oldRecord.episode !== newRecord.episode)
    )
    if (seasonEpisodeOnlyChanged) return

    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      pendingSaveString = currentString
      recordsStore.addRecord({
        record: { ...record.value },
        listType: tag
      })
        .then(() => {
          pendingSaveString = null
          lastSavedString = currentString
        })
        .catch(err => {
          console.error('Failed to update record:', err)
          pendingSaveString = null
          lastSavedString = null
        })
    }, 500)
  }
)

/**
 * @function handleSeasonEpisodeChange
 * @description Debounced API save for season/episode changes with abort cancellation
 * @param {'season' | 'episode'} field
 * @param {number|null} value
 */
const handleSeasonEpisodeChange = (field, value) => {
  if (props.readonly || !record.value || !record.value.id) return

  // Update local state immediately for responsive UI
  if (field === 'season') {
    localSeason.value = value
  } else {
    localEpisode.value = value
  }

  // Update the store record immediately (for UI consistency)
  record.value[field] = value

  // Cancel any pending save
  if (saveAbortController) {
    saveAbortController.abort()
  }

  // Clear existing timeout
  clearTimeout(updateTimeout)

  // Set new debounce timeout
  updateTimeout = setTimeout(async () => {
    const controller = new AbortController()
    saveAbortController = controller

    const currentString = getComparableString(record.value)
    pendingSaveString = currentString

    try {
      await recordsStore.addRecord({
        record: { ...record.value },
        listType: tag
      })
      
      if (!controller.signal.aborted) {
        lastSavedString = currentString
        pendingSaveString = null
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error(`Failed to update ${field}:`, err)
        pendingSaveString = null
        lastSavedString = null
      }
    }
  }, 1500)
}

/**
 * @function handleSeasonFocus
 * @description Marks season field as being edited
 */
const handleSeasonFocus = () => {
  isEditingSeason.value = true
}

/**
 * @function handleSeasonBlur
 * @description Marks season field as no longer editing and triggers immediate save
 */
const handleSeasonBlur = () => {
  isEditingSeason.value = false
  saveRecord()
}

/**
 * @function handleEpisodeFocus
 * @description Marks episode field as being edited
 */
const handleEpisodeFocus = () => {
  isEditingEpisode.value = true
}

/**
 * @function handleEpisodeBlur
 * @description Marks episode field as no longer editing and triggers immediate save
 */
const handleEpisodeBlur = () => {
  isEditingEpisode.value = false
  saveRecord()
}

/**
 * @function handleSearch
 * @description Triggers external search when input changes
 * @param {string} value 
 */
const handleSearch = (value) => {
  localTitle.value = value
  if (isSearchEnabled(tag)) {
    triggerSearch(value, tag)
  }
}

/**
 * @function handleSelect
 * @description Handles selection from autocomplete dropdown
 * @param {string} value 
 */
const handleSelect = (value) => {
  localTitle.value = value
  record.value.title = value
  saveRecord()
}

/**
 * @function handleBlur
 * @description Saves record when user leaves the input field
 */
const handleBlur = () => {
  record.value.title = localTitle.value
  saveRecord()
}

/**
 * @function saveRecord
 * @description Saves the current record state
 */
const saveRecord = () => {
  if (!record.value || !record.value.id) return
  if (props.readonly) return

  const currentString = getComparableString(record.value)
  if (currentString === lastSavedString) return

  // Cancel any pending save
  if (saveAbortController) {
    saveAbortController.abort()
  }

  clearTimeout(updateTimeout)
  pendingSaveString = currentString
  recordsStore.addRecord({
    record: { ...record.value },
    listType: tag
  })
    .then(() => {
      pendingSaveString = null
      lastSavedString = currentString
    })
    .catch(err => {
      console.error('Failed to update record:', err)
      pendingSaveString = null
      lastSavedString = null
    })
}

/**
 * @function handleEpisodeUpdate
 * @description Fixes initial increment bug on empty episode input and auto-increments season
 * @param {number|null} val
 */
const handleEpisodeUpdate = (val) => {
  const isInitialFromEmpty = (record.value.episode === null || record.value.episode === undefined) && val === 0
  const isInitialFromZero = record.value.episode === 0 && val === 1

  const newValue = isInitialFromEmpty ? 1 : val
  record.value.episode = newValue
  if ((isInitialFromEmpty || isInitialFromZero) && !record.value.season) {
    record.value.season = 1
    localSeason.value = 1
  }

  handleSeasonEpisodeChange('episode', newValue)
}

/**
 * @function handleSeasonUpdate
 * @description Handles season input changes
 * @param {number|null} val
 */
const handleSeasonUpdate = (val) => {
  record.value.season = val
  handleSeasonEpisodeChange('season', val)
}

/**
 * @function handlePaste
 * @description Prevents pasting invalid non-positive integers
 * @param {ClipboardEvent} event
 */
const handlePaste = (event) => {
  const pasteData = (event.clipboardData || window.clipboardData).getData('text')
  if (!/^[1-9]\d*$/.test(pasteData)) {
    event.preventDefault()
  }
}

/**
 * @description Cleanup abort controller on unmount
 */
onBeforeUnmount(() => {
  if (saveAbortController) {
    saveAbortController.abort()
  }
  clearTimeout(updateTimeout)
})
</script>

<template>
  <n-list-item
    class="px-4 px-sm-5"
    :class="[
      gridStore.screenLargerThen('xl') ? '' : 'rounded-0',
      props.readonly ? '' : ''
    ]"
    @mouseover="!props.readonly && (showCheckbox = true)"
    @mouseleave="!props.readonly && (showCheckbox = false)"
  >
    <n-grid
      :cols="12"
      item-responsive
      responsive="screen"
      :x-gap="gridStore.screenLargerThen('xl') ? 12 : 0"
      :y-gap="gridStore.screenLargerThen('xl') ? 0 : 8"
      class="py-2 py-m-0 align-items-center"
    >
      <n-gi span="12 xl:7">
        <!-- begin::Record Identity & Title -->
        <n-space
          :wrap-item="false"
          :wrap="false"
          align="center"
          size="small"
          class="w-100"
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
            v-model:value="localTitle"
            :options="isSearchEnabled(tag) ? suggestions : []"
            :loading="isSearchEnabled(tag) && isLoading"
            :size="gridStore.screenLargerThen('xl') ? 'medium' : 'small'"
            :placeholder="searchPlaceholder"
            :auto-select="false"
            class="record-input episode-title"
            @input="handleSearch"
            @select="handleSelect"
            @blur="handleBlur"
          />

          <!-- Season / Episode inputs (editable, tvshows & anime only) -->
          <n-input-group
            v-if="!props.readonly && showEpisodeTracking"
            class="episode-tracker ml-2 w-auto"
          >
            <n-input-group-label
              :size="gridStore.screenLargerThen('xl') ? 'small' : 'tiny'"
              class="w-32 fz-12 font-weight-500"
            >
              S
            </n-input-group-label>
            <n-input-number
              v-model:value="localSeason"
              :min="0"
              :max="9999"
              :show-button="false"
              :size="gridStore.screenLargerThen('xl') ? 'small' : 'tiny'"
              placeholder="0"
              class="episode-input w-32 px-0"
              @paste="handlePaste"
              @focus="handleSeasonFocus"
              @blur="handleSeasonBlur"
              @update:value="handleSeasonUpdate"
            />
            <n-divider vertical class="episode-separator" />
            <n-input-group-label
              :size="gridStore.screenLargerThen('xl') ? 'small' : 'tiny'"
              class="w-32 fz-12 font-weight-500"
            >
              E
            </n-input-group-label>
            <n-input-number
              v-model:value="localEpisode"
              :min="0"
              :max="99999"
              :size="gridStore.screenLargerThen('xl') ? 'small' : 'tiny'"
              placeholder="0"
              class="episode-input w-64"
              button-placement="both"
              @update:value="handleEpisodeUpdate"
              @paste="handlePaste"
              @focus="handleEpisodeFocus"
              @blur="handleEpisodeBlur"
            />
          </n-input-group>

          <!-- Readonly static title -->
          <n-text
            v-else-if="props.readonly"
            class="font-weight-500 px-2"
            :depth="record.title ? 1 : 3"
          >
            {{ record.title || '—' }}
          </n-text>

          <!-- Readonly episode display (tvshows & anime only) -->
          <n-text
            v-if="episodeDisplay"
            class="ml-auto fz-12"
            depth="3"
          >
            {{ episodeDisplay }}
          </n-text>
        </n-space>
        <!-- end::Record Identity & Title -->
      </n-gi>

      <n-gi span="12 xl:5">
        <!-- begin::Record Attributes (Score, Liked, Status) -->
        <n-space
          :wrap-item="false"
          :wrap="false"
          align="center"
          justify="center"
          size="small"
          class="w-100"
        >
          <!-- Editable Rate -->
          <n-rate
            v-if="!props.readonly"
            v-model:value="record.score"
            clearable
            class="mr-0 ml-0 ml-xl-10 mr-s-3 mr-xl-2"
          />
          <!-- Readonly Rate -->
          <n-rate
            v-else
            :value="record.score"
            readonly
            size="small"
            class="mr-0 ml-0 ml-xl-10 mr-s-3 mr-xl-2"
          />
          
          <!-- Like button (editable) -->
          <n-button
            v-if="!props.readonly"
            quaternary
            round
            circle
            type="error"
            size="small"
            class="ml-3 ml-s-6 ml-xl-12"
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
            v-else
            quaternary
            round
            circle
            type="error"
            size="small"
            class="ml-3 ml-s-6 ml-xl-12 no-events cursor-default"
          >
            <template #icon>
              <like-icon
                :weight="record.liked ? 'fill' : 'regular'"
                :class="{ 'opacity-4' : !record.liked }"
              />
            </template>
          </n-button>

          <n-space
            :wrap="false"
            :wrap-item="false"
            justify="end"
            align="center"
            class="min-w-180 ml-auto"
          >
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
        </n-space>
        <!-- end::Record Attributes (Score, Liked, Status) -->
      </n-gi>
    </n-grid>
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

// Episode tracking group
.episode-title {
  flex: 1 1 0;
  min-width: 0;

  .n-input,
  .n-input__border {
    background-color: transparent !important;
    border: none !important;
  }

  .n-input__input-el {
    font-weight: 500;
  }
}

.episode-tracker {
  flex-shrink: 0;
  align-items: stretch !important;

  .n-input-group-label,
  .n-input__input-el {
    min-height: 28px !important;
    line-height: 28px !important;
  }
}

.episode-separator {
  height: 28px !important;
  width: 1px;
  margin: 0 !important;
}

.episode-input {
  .n-input-wrapper,
  .n-input__input-el,
  .n-input-group-label {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    
  }

  .n-input-wrapper {
    padding-left: var(--n-padding-left);
    padding-right: var(--n-padding-left);
  }

  /* Hide the minus button in button-placement="both" */
  .n-input__prefix {
    display: none !important;
  }
}
</style>
