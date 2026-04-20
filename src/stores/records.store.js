import {
  ref,
  shallowRef,
  computed,
} from 'vue'
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'
import { generateUniqueId } from '@/utils/random-number'
import { api } from '@/api/client'
import {
  PhPlay as InProgressIcon,
  PhHourglass as OnHoldIcon,
  PhBookmark as PlanIcon,
  PhChecks as CompletedIcon,
  PhProhibit as DroppedIcon,
  PhTelevision as WatchingIcon,
  PhEye as WatchingNowIcon,
  PhBookOpen as ReadingIcon,
  PhBook as ReadIcon,
  PhMusicNote as ListeningIcon,
  PhHeadphones as MusicIcon,
  PhTextAa as AlphabeticalIcon,
  PhStar as RatingIcon,
  PhHeart as FavouriteIcon,
  PhList as StatusIcon,
} from 'phosphor-vue'
import jsesc from 'jsesc'
import moment from 'moment'

const RECORDS_KEY = 'rec_'

export const useRecordsStore = defineStore('records', () => {

  /* =================== */
  /* ===== Sorting ===== */
  /* =================== */

  const sortOptions = shallowRef([
    {
      key: 'label',
      label: 'Status',
      icon: StatusIcon
    },
    {
      key: 'score',
      label: 'Rating',
      icon: RatingIcon
    },
    {
      key: 'liked',
      label: 'Favourite',
      icon: FavouriteIcon
    },
    {
      key: 'title',
      label: 'A → Z',
      icon: AlphabeticalIcon,
      default: true
    },
  ])

  const selectedSort = ref('label')

  // Search functionality
  const searchQuery = ref('')
  const isSearching = ref(false)

  // Display order for each category - maintains stable positions during editing
  const displayOrder = ref({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

  const getSortOption = (key) => {
    return computed(() => {
      return sortOptions.value.find(option => option.key === key)
    })
  }

  // Initialize display order for a category
  function initializeDisplayOrder(listType) {
    const list = records.value[listType] || []
    if (list.length === 0) {
      displayOrder.value[listType] = []
      return
    }
    
    // Apply current sort when initializing
    syncDisplayOrderWithSort(listType)
  }

  const labelPriority = {
    // 1. Ongoing
    'watching_ongoing': 1,
    'read_ongoing': 1,
    'playing_now': 1,
    'listening_now': 1,

    // 2. Currently
    'watching_now': 2,
    'read_now': 2,

    // 3. Plan to...
    'plan_to_watch': 3,
    'plan_to_read': 3,
    'plan_to_play': 3,
    'plan_to_listen': 3,

    // 4. On hold
    'on_hold': 4,

    // 5. Completed / Consumed
    'completed': 5,
    'watched_all': 5,
    'read': 5,
    'watched': 5,
    'listened_all': 5,

    // 6. Dropped
    'dropped': 6,
  }

  // Sync display order with current sort
  function syncDisplayOrderWithSort(listType) {
    const list = records.value[listType] || []
    const key = selectedSort.value

    const sortedIds = [...list].sort((a, b) => {
      if (key === 'label') {
        const orderA = labelPriority[a.label] ?? 999
        const orderB = labelPriority[b.label] ?? 999
        if (orderA !== orderB) return orderA - orderB
        return a.title.localeCompare(b.title)
      }

      if (key === 'liked' || key === 'score') {
        if (b[key] !== a[key]) return b[key] - a[key]
        return a.title.localeCompare(b.title)
      }

      if (key === 'title') {
        return a.title.localeCompare(b.title)
      }

      return 0
    }).map(record => record.id)

    displayOrder.value[listType] = sortedIds
  }

  // Add new record to display order (at the end)
  function addToDisplayOrder(recordId, listType) {
    if (!displayOrder.value[listType].includes(recordId)) {
      displayOrder.value[listType].push(recordId)
    }
  }

  // Remove record from display order
  function removeFromDisplayOrder(recordId, listType) {
    const index = displayOrder.value[listType].indexOf(recordId)
    if (index > -1) {
      displayOrder.value[listType].splice(index, 1)
    }
  }

  // Search functionality
  function setSearchQuery(query) {
    searchQuery.value = query
    const wasSearching = isSearching.value
    isSearching.value = query.length > 0
    
    // If exiting search mode, apply default sorting
    if (wasSearching && !isSearching.value) {
      selectedSort.value = 'label' // Default sort by status
    }
  }

  function clearSearch() {
    searchQuery.value = ''
    isSearching.value = false
    // Apply default sorting when clearing search
    selectedSort.value = 'label' // Default sort by status
  }

  function searchRecords(listType) {
    if (!isSearching.value || !searchQuery.value.trim()) {
      return records.value[listType] || []
    }

    const query = searchQuery.value.toLowerCase().trim()
    const list = records.value[listType] || []
    
    return list.filter(record => 
      record.title.toLowerCase().includes(query)
    )
  }

  /* ========================= */
  /* ======== Records ======== */
  /* ========================= */


  // Standard categories
  const records = ref({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

  // Custom lists
  const customLists = ref([])

  // Helper to generate default custom list name
  function getNextCustomListName() {
    const base = 'Custom List'
    let maxNum = 0
    customLists.value.forEach(list => {
      const match = list.name.match(/Custom List #(\d+)/)
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1]))
      }
    })
    return `${base} #${maxNum + 1}`
  }

  // Create a new custom list
  async function createCustomList() {
    const list = await api.post('/custom-lists')
    customLists.value.push(list)
    return list.id
  }

  // Add a record to a custom list
  async function addCustomRecord(listId, title) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    const record = await api.post(`/custom-lists/${listId}/records`, { title })
    list.records.push(record)
    list.updatedAt = new Date().toISOString()
  }

  // Rename a custom list
  async function renameCustomList(listId, newName) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    await api.patch(`/custom-lists/${listId}`, { name: newName })
    list.name = newName
    list.updatedAt = new Date().toISOString()
  }

  // Update custom list's updatedAt when a record is deleted/renamed
  function updateCustomListTimestamp(listId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    list.updatedAt = new Date().toISOString()
  }

  // Remove a record from a custom list
  async function removeCustomRecord(listId, recordId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    await api.delete(`/custom-lists/${listId}/records/${recordId}`)
    list.records = list.records.filter(r => r.id !== recordId)
    list.updatedAt = new Date().toISOString()
  }

  // Rename a record within a custom list
  async function renameCustomRecord(listId, recordId, newTitle) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    const record = list.records.find(r => r.id === recordId)
    if (!record) return
    await api.patch(`/custom-lists/${listId}/records/${recordId}`, { title: newTitle })
    record.title = newTitle
    list.updatedAt = new Date().toISOString()
  }

  // Delete an entire custom list
  async function deleteCustomList(listId) {
    await api.delete(`/custom-lists/${listId}`)
    const index = customLists.value.findIndex(l => l.id === listId)
    if (index > -1) {
      customLists.value.splice(index, 1)
    }
  }

  // Sorting for custom lists
  function sortCustomRecords(listId, sortKey = 'initial') {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return []
    if (sortKey === 'az') {
      return [...list.records].sort((a, b) => a.title.localeCompare(b.title))
    }
    // 'initial' sort by createdAt
    return [...list.records].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  // Get custom list by id
  function getCustomList(listId) {
    return customLists.value.find(l => l.id === listId)
  }

  // Get custom record by id
  function getCustomRecord(listId, recordId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return null
    return list.records.find(r => r.id === recordId)
  }

  const recordsLength = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list ? list.length : 0
    })
  }

  const allRecordsLength = () => {
    return computed(() => {
      const categories = Object.keys(records.value)
      let total = 0
      categories.forEach(category => {
        total += records.value[category].length
      })
      return total
    })
  }

  const someRecordsSelected = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.some((record) => record.selected)
    })
  }
  
  const allRecordsSelected = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.every((record) => record.selected)
    })
  }

  const selectedRecords = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record) => record.selected)
    })
  }

  const selectedRecordsLength = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record) => record.selected).length || 0
    })
  }

  function selectAllRecords(listType) {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = true)
  }
  
  function deselectAllRecords(listType) {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = false)
  }

  function checkRecordExist(item, listType) {
    return records.value[listType].some((i) => i.id === item.id)
  }

  function getRecord(id, listType) {
    const record = records.value[listType].find((i) => i.id === id)
    return record
  }

  async function addRecord({ record, listType }) {
    try {
      const income = record || {
        category: listType,
        title: '',
        score: 0,
        liked: false,
        label: getDefaultLabel(listType).key,
      }
      
      const isNewRecord = !checkRecordExist(income, listType)
      
      let savedRecord
      if (isNewRecord) {
        savedRecord = await api.post(`/records/${listType}`, income)
        // Ensure UI-only fields
        savedRecord.selected = false
        records.value[listType].push(savedRecord)
        addToDisplayOrder(savedRecord.id, listType)
      } else {
        const { id, category, userId, createdAt, updatedAt, selected, ...updates } = income
        savedRecord = await api.put(`/records/${income.id}`, updates)
        // Re-attach UI-only fields
        savedRecord.selected = income.selected
        const index = records.value[listType].findIndex((i) => i.id === income.id)
        records.value[listType].splice(index, 1, savedRecord)
      }
  
      return savedRecord
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async function restoreRecords() {
    try {
      const data = await api.get('/records')
      
      // Merge with default shape and add selected property
      const defaultCategories = ['games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music']
      const newRecords = {}
      defaultCategories.forEach(cat => {
        newRecords[cat] = (data[cat] || []).map(r => ({ ...r, selected: false }))
      })
      records.value = newRecords

      selectedSort.value = 'label'
      Object.keys(records.value).forEach(category => {
        if (records.value[category].length > 0) {
          initializeDisplayOrder(category)
        }
      })
      
      customLists.value = await api.get('/custom-lists')
    } catch (err) {
      console.error('Failed to restore records:', err)
    }
  }

  async function deleteSelectedRecords(listType) {
    const selected = selectedRecords(listType).value
    try {
      const ids = selected.map(r => r.id)
      if (ids.length > 0) {
        await api.delete('/records', { ids })
        for (let n = 0; n < selected.length; n++) {
          const index = records.value[listType].findIndex(record => record.id === selected[n].id)
          records.value[listType].splice(index, 1)
          removeFromDisplayOrder(selected[n].id, listType)
        }
      }
      return selected
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async function deleteAllRecords() {
    // Handled by the import route on the backend
    return Promise.resolve(true)
  }

  /* ======================== */
  /* ======== Labels ======== */
  /* ======================== */

  const labels = shallowRef({
    games: [
      { key: 'playing_now', label: 'Playing Now', icon: InProgressIcon, default: true },
      { key: 'plan_to_play', label: 'Plan to Play', icon: PlanIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'completed', label: 'Completed', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    tvshows: [
      { key: 'watching_ongoing', label: 'Watching Ongoing', icon: WatchingIcon, default: true },
      { key: 'watching_now', label: 'Watching Now', icon: WatchingNowIcon },
      { key: 'plan_to_watch', label: 'Plan to Watch', icon: PlanIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'watched_all', label: 'Watched All', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    films: [
      { key: 'plan_to_watch', label: 'Plan to Watch', icon: PlanIcon, default: true },
      { key: 'watched', label: 'Watched', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    anime: [
      { key: 'watching_ongoing', label: 'Watching Ongoing', icon: WatchingIcon, default: true },
      { key: 'watching_now', label: 'Watching Now', icon: WatchingNowIcon },
      { key: 'plan_to_watch', label: 'Plan to Watch', icon: PlanIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'watched_all', label: 'Watched All', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    manga: [
      { key: 'read_ongoing', label: 'Read Ongoing', icon: ReadingIcon, default: true },
      { key: 'read_now', label: 'Read Now', icon: ReadingIcon },
      { key: 'plan_to_read', label: 'Plan to Read', icon: PlanIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'read', label: 'Read', icon: ReadIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    books: [
      { key: 'read_now', label: 'Read Now', icon: ReadingIcon, default: true },
      { key: 'plan_to_read', label: 'Plan to Read', icon: PlanIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'read', label: 'Read', icon: ReadIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),

    music: [
      { key: 'listening_now', label: 'Listening Now', icon: ListeningIcon, default: true },
      { key: 'on_repeat', label: 'On Repeat', icon: MusicIcon },
      { key: 'plan_to_listen', label: 'Plan to Listen', icon: PlanIcon },
      { key: 'listened_all', label: 'Completed', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ].sort((a, b) => labelPriority[a.key] - labelPriority[b.key]),
  })

  function getDefaultLabel(listType) {
    return labels.value[listType].find((i) => i.default) || labels.value[listType][0]
  }  

  function getLabel(listType, key) {
    const targetItem = labels.value[listType].filter((i) => {return i.key === key })[0]
    return targetItem ? targetItem : getDefaultLabel(listType)
  }

  function getLabelName(listType, key) {
    return getLabel(listType, key).label
  }

  function getLabelIcon(listType, key) {
    return getLabel(listType, key).icon
  }


  /* =========================== */
  /* ===== Export & Import ===== */
  /* =========================== */

  const selectedCategories = ref([
    'games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music'
  ])

  const validCategories = Object.keys(records.value)

  const processingImport = ref(false)

  function exportCollection() {
    // Filter records based on selected categories
    const filteredRecords = Object.entries(records.value)
      .reduce((acc, [category, records]) => {
        if (selectedCategories.value.includes(category)) {
          acc[category] = records.map(({selected, ...rest}) => rest)
        }
        return acc
      }, {})

    // Add custom lists
    filteredRecords.customLists = customLists.value.map(list => ({
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      records: list.records.map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        createdAt: r.createdAt
      }))
    }))

    /**
     * Sanitize resulting object with jsesc
     * @see {@link https://github.com/mathiasbynens/jsesc}
     */ 
    const json = jsesc(filteredRecords, { json: true })

    // Create link, attach blob to it and progrmically click on it
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `listify-collection-${moment().format('DD-MM-YYYY-HH-mm')}.json`
    document.body.appendChild(a)
    a.click()

    // Remove generated link after
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importCollection(data) {
    processingImport.value = true
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const fileContents = reader.result
        const jsonObject = JSON.parse(fileContents)
        
        await validateJSON(jsonObject)
        
        await api.post('/import', jsonObject)
        await restoreRecords() // Reload everything from server
        processingImport.value = false
        useNotificationsStore().pushNotification({ message: 'Import successful!', type: 'success' })
      } catch (err) {
        console.error(err)
        processingImport.value = false
        // validateJSON already pushes an error notification
      }
    }
    reader.readAsText(data.file.file)
  }

  function validateJSON(obj) {
    const notificationsStore = useNotificationsStore()
    try {
      // Check that the object has at least the required categories
      const categories = Object.keys(obj)
      const errorMsg = 'Looks like your collection is corrupted.'

      const errors = []

      const missingCategories = validCategories.filter(vc => !categories.includes(vc))
      // customLists is optional
      const extraCategories = categories.filter(c => !validCategories.includes(c) && c !== 'customLists')

      if (missingCategories.length > 0) {
        errors.push({ type: 'missing_categories', details: missingCategories })
      }
      if (extraCategories.length > 0) {
        errors.push({ type: 'unexpected_categories', details: extraCategories })
      }

      // Validate each category payload and collect precise record errors
      for (const category of categories) {
        if (category === 'customLists') continue
        const records = obj[category]
        if (!validCategories.includes(category)) {
          errors.push({ type: 'unexpected_category', category })
          continue
        }
        if (!Array.isArray(records)) {
          errors.push({ type: 'invalid_category_payload', category, message: 'Category must be an array of records' })
          continue
        }
        for (let index = 0; index < records.length; index++) {
          const record = records[index]
          const recordErrors = getRecordValidationErrors(record, category)
          if (recordErrors.length > 0) {
            errors.push({ type: 'invalid_record', category, index, id: record && record.id, errors: recordErrors })
          }
        }
      }

      // Validate custom lists
      if (Array.isArray(obj.customLists)) {
        for (const list of obj.customLists) {
          if (typeof list.id !== 'string' || typeof list.name !== 'string') {
            errors.push({ type: 'invalid_custom_list', list })
            continue
          }
          if (!Array.isArray(list.records)) {
            errors.push({ type: 'invalid_custom_list_records', list })
            continue
          }
          for (const r of list.records) {
            if (typeof r.id !== 'string') errors.push({ type: 'invalid_custom_record', r, error: 'id' })
            if (typeof r.category !== 'string') errors.push({ type: 'invalid_custom_record', r, error: 'category' })
            if (typeof r.title !== 'string') errors.push({ type: 'invalid_custom_record', r, error: 'title' })
            if (typeof r.createdAt !== 'string') errors.push({ type: 'invalid_custom_record', r, error: 'createdAt' })
            // No score, liked, label fields required
          }
        }
      }

      if (errors.length > 0) {
        notificationsStore.pushNotification({
          message: errorMsg,
          type: 'error'
        })
        console.error('[ImportValidation] Detailed errors:', errors)
        throw new Error(errorMsg)
      }

      return Promise.resolve(true)
    } catch (error) {
      console.error(error)
      processingImport.value = false
      return Promise.resolve(false)
    }
  }

  function getRecordValidationErrors(record, category) {
    const errors = []
    const validLabels = (labels.value[category] || []).map(l => l.key)

    if (!record || typeof record !== 'object') {
      errors.push('Record is not an object')
      return errors
    }

    if (typeof record.id !== 'string') errors.push("'id' must be a string")
    if (typeof record.category !== 'string') {
      errors.push("'category' must be a string")
    } else {
      if (!validCategories.includes(record.category)) errors.push(`'category' must be one of: ${validCategories.join(', ')}`)
      if (record.category !== category) errors.push(`'category' value '${record.category}' does not match parent category '${category}'`)
    }
    if (!validLabels.includes(record.label)) errors.push(`'label' must be one of: ${(validLabels || []).join(', ')}`)
    if (typeof record.title !== 'string') errors.push("'title' must be a string")
    if (typeof record.score !== 'number') errors.push("'score' must be a number")
    if (typeof record.liked !== 'boolean') errors.push("'liked' must be a boolean")

    return errors
  }

  return {
    records,
    recordsLength,
    allRecordsLength,
    someRecordsSelected,
    allRecordsSelected,
    selectedRecords,
    selectedRecordsLength,
    selectAllRecords,
    deselectAllRecords,
    checkRecordExist,
    getRecord,
    addRecord,
    restoreRecords,
    deleteSelectedRecords,
    deleteAllRecords,

    labels,
    getDefaultLabel,
    getLabel,
    getLabelName,
    getLabelIcon,

    selectedCategories,
    processingImport,
    exportCollection,
    importCollection,

    sortOptions,
    selectedSort,
    getSortOption,
    displayOrder,
    initializeDisplayOrder,
    syncDisplayOrderWithSort,
    addToDisplayOrder,
    removeFromDisplayOrder,

    searchQuery,
    isSearching,
    setSearchQuery,
    clearSearch,
    searchRecords,

    // Custom lists API
    customLists,
    createCustomList,
    addCustomRecord,
    renameCustomList,
    renameCustomRecord,
    deleteCustomList,
    updateCustomListTimestamp,
    removeCustomRecord,
    sortCustomRecords,
    getCustomList,
    getCustomRecord,
  }
})
