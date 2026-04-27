<script setup>
import { ref, watch, computed } from 'vue'
import { NInput } from 'naive-ui'
import { PhMagnifyingGlass as SearchIcon, PhX as ClearIcon } from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const recordsStore = useRecordsStore()

const searchInput = ref('')
let searchTimeout = null

const searchPlaceholder = computed(() => {
  let name = ''
  if (route.meta.isCustom && route.params.id) {
    const list = recordsStore.getCustomList(route.params.id)
    name = list?.name ?? t('customLists.title')
  } else {
    name = t(`categories.${route.meta.tag}`)
  }
  return t('search.placeholder', { name })
})

// Debounced search function
const performSearch = (query) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    recordsStore.setSearchQuery(query)
  }, 300) // 300ms debounce
}

// Watch for input changes
watch(searchInput, (newValue) => {
  performSearch(newValue)
})

// Clear search function
const clearSearch = () => {
  searchInput.value = ''
  recordsStore.clearSearch()
}
</script>


<template>
  <n-input
    v-model:value="searchInput"
    size="large"
    :placeholder="searchPlaceholder"
    class="ly-search mb-4">
    <template #prefix>
      <search-icon weight="bold" size="16" class="opacity-5 mr-2" style="margin-bottom: 0.1rem;"/>
    </template>
    <template #suffix v-if="searchInput">
      <clear-icon 
        weight="bold" 
        size="16" 
        class="opacity-5 cursor-pointer hover:opacity-7 transition-opacity"
        @click="clearSearch"
        style="margin-bottom: 0.1rem;"/>
    </template>
  </n-input>
</template>

<style lang="scss">
.ly-search {
  .n-input__placeholder {
    padding-top: 0.1rem !important;
  }
}
</style>
