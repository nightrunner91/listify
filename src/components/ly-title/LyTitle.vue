<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NH1, NBadge, NInput } from 'naive-ui'
import { useThemeStore } from '@/stores/theme.store'
import { useRecordsStore } from '@/stores/records.store'

const { t } = useI18n()
const route = useRoute()
const themeStore = useThemeStore()
const recordsStore = useRecordsStore()

const isCustomList = computed(() => route.meta.isCustom)
const customListId = computed(() => route.params.id || null)
const customList = computed(() => customListId.value ? recordsStore.getCustomList(customListId.value) : null)

const listName = ref('')
let renameTimeout = null
let lastSavedName = ''

const barColor = ref('transparent')
const barWidth = ref('3px')
const barSize = '3px'
const barSpeed = 250

const getTranslatedTitle = computed(() => {
  if (route.meta.tag && t(`categories.${route.meta.tag}`)) {
    const translation = t(`categories.${route.meta.tag}`)
    if (!translation.startsWith('categories.')) {
      return translation
    }
  }
  return route.meta.title
})

watch(
  [route, themeStore],
  async () => {
    barWidth.value = barSize
    await new Promise((resolve) => setTimeout(resolve, barSpeed * 1.5))
    barWidth.value = '70px'
    barColor.value = themeStore.categoryColor(route.meta.tag)
    if (isCustomList.value && customList.value) {
      listName.value = customList.value.name
      lastSavedName = customList.value.name
      document.title = `${customList.value.name} - Listify`
    } else {
      document.title = `${getTranslatedTitle.value} - Listify`
    }
  },
  {
    immediate: true,
    deep: true 
  }
)

// Sync listName if the store updates the name externally (e.g. initial data load)
watch(() => customList.value?.name, (name) => {
  if (name && name !== listName.value) {
    listName.value = name
    lastSavedName = name
    document.title = `${name} - Listify`
  }
})

// Debounced rename on user input
watch(listName, (newVal) => {
  if (!isCustomList.value || !customListId.value) return
  if (newVal === lastSavedName) return
  clearTimeout(renameTimeout)
  renameTimeout = setTimeout(() => {
    const trimmed = newVal.trim()
    if (!trimmed) return
    lastSavedName = newVal
    document.title = `${trimmed} - Listify`
    recordsStore.renameCustomList(customListId.value, trimmed)
  }, 500)
})

watch(getTranslatedTitle, (newTitle) => {
  if (!isCustomList.value && newTitle) {
    document.title = `${newTitle} - Listify`
  }
}, { immediate: true })
</script>

<template>
  <n-h1
    class="position-relative mb-0 h-80"
  >
    <template
      v-if="isCustomList"
    >
      <n-input
        v-model:value="listName"
        type="text"
        maxlength="50"
        :placeholder="t('customLists.createList')"
        class="title-input"
      />
    </template>

    <template
      v-else
    >
      {{ getTranslatedTitle }}
    </template>

    <n-badge
      v-if="route.meta.tag !== 'start' && route.meta.tag !== 'about' && !isCustomList"
      :value="recordsStore.recordsLength(route.meta.tag).value"
      :show-zero="true"
      class="ml-4 z-0"
    />

    <div
      class="position-absolute bottom-0 left-0"
      :style="{
        backgroundColor: barColor,
        width: barWidth,
        height: barSize,
        borderRadius: barSize,
        transitionDuration: barSpeed + 'ms',
        transitionTimingFunction: 'cubic-bezier(0.0, 0, 0.2, 1)',
      }"
    />
  </n-h1>
</template>


<style lang="scss" scoped>
.title-input {
  background-color: transparent !important;
  height: 80px;
  width: auto;
  display: inline-flex;

  :deep(.n-input__border),
  :deep(.n-input__state-border) {
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.n-input__input-el) {
    font-size: 3rem;
    height: 100%;
    font-weight: inherit;
    line-height: 1.6;
    color: inherit;
    padding-left: 0;
    padding-bottom: 4px;

    &:hover, &:focus {
      opacity: 0.85;
    }
  }

  :deep(.n-input-wrapper) {
    padding-left: 0;
  }
}
</style>
