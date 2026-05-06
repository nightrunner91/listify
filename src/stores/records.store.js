/**
 * @module useRecordsStore
 * @description This is the core store of the application. It manages all records
 * (games, films, etc.), custom lists, sorting, searching, and collection export/import.
 */

import {
  ref,
  shallowRef,
  computed
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
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhSmileyWink as AnimeIcon,
  PhFilmStrip as FilmsIcon,
  PhImageSquare as MangaIcon,
  PhBooks as BooksIcon,
  PhMusicNotes as MusicCategoryIcon
} from 'phosphor-vue'
import jsesc from 'jsesc'
import moment from 'moment'
import Papa from 'papaparse'
import i18n from '@/i18n'

const RECORDS_KEY = 'rec_'

export const CATEGORIES = ['games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music']

export const CATEGORY_ICONS = {
  games: GamesIcon,
  tvshows: TvShowsIcon,
  films: FilmsIcon,
  anime: AnimeIcon,
  manga: MangaIcon,
  books: BooksIcon,
  music: MusicCategoryIcon
}

export const LABEL_PRIORITY = {
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

export const sortRecords = (recordsList, sortKey = 'label') => {
  return [...recordsList].sort((a, b) => {
    if (sortKey === 'label') {
      const orderA = LABEL_PRIORITY[a.label] ?? 999
      const orderB = LABEL_PRIORITY[b.label] ?? 999
      if (orderA !== orderB) return orderA - orderB
      return (a.title || '').localeCompare(b.title || '')
    }

    if (sortKey === 'liked' || sortKey === 'score') {
      if (b[sortKey] !== a[sortKey]) return (b[sortKey] || 0) - (a[sortKey] || 0)
      return (a.title || '').localeCompare(b.title || '')
    }

    if (sortKey === 'title') {
      return (a.title || '').localeCompare(b.title || '')
    }

    return 0
  })
}

export const useRecordsStore = defineStore('records', () => {

  /**
   * @section Sorting
   * @description Configuration and state for record sorting
   */

  /**
   * @constant sortOptions [computable]
   * @type {import('vue').ComputedRef<Array>}
   * @description Available sorting methods for record lists
   */
  const sortOptions = computed(() => [
    {
      key: 'label',
      label: i18n.global.t('store.sorting.status'),
      icon: StatusIcon
    },
    {
      key: 'score',
      label: i18n.global.t('store.sorting.rating'),
      icon: RatingIcon
    },
    {
      key: 'liked',
      label: i18n.global.t('store.sorting.favourite'),
      icon: FavouriteIcon
    },
    {
      key: 'title',
      label: i18n.global.t('store.sorting.az'),
      icon: AlphabeticalIcon,
      default: true
    },
  ])

  /** @type {import('vue').Ref<string>} */
  const selectedSort = ref('label')

  /**
   * @section Searching
   * @description State and methods for record filtering
   */

  /** @type {import('vue').Ref<string>} */
  const searchQuery = ref('')
  /** @type {import('vue').Ref<boolean>} */
  const isSearching = ref(false)

  /**
   * @constant displayOrder [mutable]
   * @type {import('vue').Ref<Object>}
   * @description Maintains stable record positions for each category during editing
   */
  const displayOrder = ref({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

  /**
   * @function getSortOption
   * @description Retrieves a specific sort option configuration by its key
   * @param {string} key - The sort option key
   * @returns {import('vue').ComputedRef<Object|undefined>}
   */
  const getSortOption = (key) => {
    return computed(() => {
      return sortOptions.value.find(option => option.key === key)
    })
  }

  /**
   * @function initializeDisplayOrder
   * @description Initializes the stable display order for a specific category
   * @param {string} listType - Category tag
   */
  function initializeDisplayOrder(listType) {
    const list = records.value[listType] || []
    if (list.length === 0) {
      displayOrder.value[listType] = []
      return
    }

    // Apply current sort when initializing
    syncDisplayOrderWithSort(listType)
  }

  /**
   * @function syncDisplayOrderWithSort
   * @description Synchronizes the stable display order with the currently selected sorting method
   * @param {string} listType - Category tag
   */
  function syncDisplayOrderWithSort(listType) {
    const list = records.value[listType] || []
    const key = selectedSort.value

    const sortedRecordsList = sortRecords(list, key)
    displayOrder.value[listType] = sortedRecordsList.map(record => record.id)
  }

  /**
   * @function addToDisplayOrder
   * @description Adds a record ID to the stable display order
   * @param {string} recordId
   * @param {string} listType
   */
  function addToDisplayOrder(recordId, listType) {
    if (!displayOrder.value[listType].includes(recordId)) {
      displayOrder.value[listType].push(recordId)
    }
  }

  /**
   * @function removeFromDisplayOrder
   * @description Removes a record ID from the stable display order
   * @param {string} recordId
   * @param {string} listType
   */
  function removeFromDisplayOrder(recordId, listType) {
    const index = displayOrder.value[listType].indexOf(recordId)
    if (index > -1) {
      displayOrder.value[listType].splice(index, 1)
    }
  }

  /**
   * @function setSearchQuery
   * @description Updates the current search query and toggles search mode
   * @param {string} query
   */
  function setSearchQuery(query) {
    searchQuery.value = query
    const wasSearching = isSearching.value
    isSearching.value = query.length > 0

    // If exiting search mode, apply default sorting
    if (wasSearching && !isSearching.value) {
      selectedSort.value = 'label' // Default sort by status
    }
  }

  /**
   * @function clearSearch
   * @description Clears the current search query and resets sorting
   */
  function clearSearch() {
    searchQuery.value = ''
    isSearching.value = false
    // Apply default sorting when clearing search
    selectedSort.value = 'label' // Default sort by status
  }

  /**
   * @function searchRecords
   * @description Filters records based on the current search query
   * @param {string} listType - Category tag
   * @returns {Array} Filtered list of records
   */
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

  /**
   * @section Records
   * @description Core record data and custom list management
   */

  /** @type {import('vue').Ref<Object>} */
  const records = ref({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

  /** @type {import('vue').Ref<Array>} */
  const customLists = ref([])

  /**
   * @function getNextCustomListName
   * @description Generates a default name for a new custom list
   * @returns {string}
   */
  function getNextCustomListName() {
    const base = 'Custom List'
    let maxNum = 0
    customLists.value.forEach(list => {
      const match = list.name.match(/Custom List #(\d+)/)
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1]))
      }
    })
    return `${i18n.global.t('store.customListName')} #${maxNum + 1}`
  }

  /**
   * @function createCustomList
   * @async
   * @description Creates a new empty custom list on the server
   * @returns {Promise<string>} The ID of the created list
   */
  async function createCustomList() {
    const list = await api.post('/custom-lists')
    customLists.value.push(list)
    selectedCustomLists.value.push(list.id)
    return list.id
  }

  /**
   * @function addCustomRecord
   * @async
   * @description Adds a new record to a specific custom list
   * @param {string} listId
   * @param {string} title
   */
  async function addCustomRecord(listId, title) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    const record = await api.post(`/custom-lists/${listId}/records`, { title })
    list.records.push(record)
    list.updatedAt = new Date().toISOString()
  }

  /**
   * @function renameCustomList
   * @async
   * @description Renames an existing custom list
   * @param {string} listId
   * @param {string} newName
   */
  async function renameCustomList(listId, newName) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    await api.patch(`/custom-lists/${listId}`, { name: newName })
    list.name = newName
    list.updatedAt = new Date().toISOString()
  }

  /**
   * @function updateCustomListTimestamp
   * @description Updates the updatedAt timestamp of a custom list
   * @param {string} listId
   */
  function updateCustomListTimestamp(listId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    list.updatedAt = new Date().toISOString()
  }

  /**
   * @function removeCustomRecord
   * @async
   * @description Removes a record from a specific custom list
   * @param {string} listId
   * @param {string} recordId
   */
  async function removeCustomRecord(listId, recordId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    await api.delete(`/custom-lists/${listId}/records/${recordId}`)
    list.records = list.records.filter(r => r.id !== recordId)
    list.updatedAt = new Date().toISOString()
  }

  /**
   * @function renameCustomRecord
   * @async
   * @description Renames a record within a custom list
   * @param {string} listId
   * @param {string} recordId
   * @param {string} newTitle
   */
  async function renameCustomRecord(listId, recordId, newTitle) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return
    const record = list.records.find(r => r.id === recordId)
    if (!record) return
    await api.patch(`/custom-lists/${listId}/records/${recordId}`, { title: newTitle })
    record.title = newTitle
    list.updatedAt = new Date().toISOString()
  }

  /**
   * @function deleteCustomList
   * @async
   * @description Deletes an entire custom list and removes it from state
   * @param {string} listId
   */
  async function deleteCustomList(listId) {
    await api.delete(`/custom-lists/${listId}`)
    const index = customLists.value.findIndex(l => l.id === listId)
    if (index > -1) {
      customLists.value.splice(index, 1)
      const selectedIndex = selectedCustomLists.value.indexOf(listId)
      if (selectedIndex > -1) {
        selectedCustomLists.value.splice(selectedIndex, 1)
      }
    }
  }

  /**
   * @function sortCustomRecords
   * @description Returns a sorted copy of records from a custom list
   * @param {string} listId
   * @param {string} [sortKey='initial'] - 'az' or 'initial'
   * @returns {Array}
   */
  function sortCustomRecords(listId, sortKey = 'initial') {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return []
    if (sortKey === 'az') {
      return [...list.records].sort((a, b) => a.title.localeCompare(b.title))
    }
    // 'initial' sort by createdAt
    return [...list.records].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  /**
   * @function getCustomList
   * @description Retrieves a custom list by its ID
   * @param {string} listId
   * @returns {Object|undefined}
   */
  function getCustomList(listId) {
    return customLists.value.find(l => l.id === listId)
  }

  /**
   * @function getCustomRecord
   * @description Retrieves a record from a specific custom list
   * @param {string} listId
   * @param {string} recordId
   * @returns {Object|null}
   */
  function getCustomRecord(listId, recordId) {
    const list = customLists.value.find(l => l.id === listId)
    if (!list) return null
    return list.records.find(r => r.id === recordId)
  }

  /**
   * @function recordsLength
   * @description Computed property returning the length of a specific category
   * @param {string} listType
   * @returns {import('vue').ComputedRef<number>}
   */
  const recordsLength = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list ? list.length : 0
    })
  }

  /**
   * @function allRecordsLength
   * @description Computed property returning the total length across all standard categories
   * @returns {import('vue').ComputedRef<number>}
   */
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

  /**
   * @function someRecordsSelected
   * @description Checks if at least one record is selected in a category
   * @param {string} listType
   * @returns {import('vue').ComputedRef<boolean>}
   */
  const someRecordsSelected = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.some((record) => record.selected)
    })
  }

  /**
   * @function allRecordsSelected
   * @description Checks if all records are selected in a category
   * @param {string} listType
   * @returns {import('vue').ComputedRef<boolean>}
   */
  const allRecordsSelected = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.every((record) => record.selected)
    })
  }

  /**
   * @function selectedRecords
   * @description Retrieves selected records for a category
   * @param {string} listType
   * @returns {import('vue').ComputedRef<Array>}
   */
  const selectedRecords = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record) => record.selected)
    })
  }

  /**
   * @function selectedRecordsLength
   * @description Retrieves the number of selected records for a category
   * @param {string} listType
   * @returns {import('vue').ComputedRef<number>}
   */
  const selectedRecordsLength = (listType) => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record) => record.selected).length || 0
    })
  }

  /**
   * @function selectAllRecords
   * @description Selects all records in a category
   * @param {string} listType
   */
  function selectAllRecords(listType) {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = true)
  }

  /**
   * @function deselectAllRecords
   * @description Deselects all records in a category
   * @param {string} listType
   */
  function deselectAllRecords(listType) {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = false)
  }

  /**
   * @function checkRecordExist
   * @description Checks if a record exists in a specific category by ID
   * @param {Object} item
   * @param {string} listType
   * @returns {boolean}
   */
  function checkRecordExist(item, listType) {
    return records.value[listType].some((i) => i.id === item.id)
  }

  /**
   * @function getRecord
   * @description Retrieves a record from a specific category by ID
   * @param {string} id
   * @param {string} listType
   * @returns {Object|undefined}
   */
  function getRecord(id, listType) {
    const record = records.value[listType].find((i) => i.id === id)
    return record
  }

  /**
   * @function addRecord
   * @async
   * @description Creates or updates a record in a standard category
   * @param {Object} params
   * @param {Object} params.record - Record data
   * @param {string} params.listType - Category tag
   * @returns {Promise<Object>} The saved record
   */
  async function addRecord({
    record, listType
  }) {
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
        const {
          id, category, userId, createdAt, updatedAt, selected, ...updates
        } = income
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

  /**
   * @function restoreRecords
   * @async
   * @description Fetches and restores all records and custom lists from the API
   */
  async function restoreRecords() {
    try {
      const data = await api.get('/records')

      // Merge with default shape and add selected property
      const newRecords = {}
      CATEGORIES.forEach(cat => {
        newRecords[cat] = (data[cat] || []).map(r => ({
          ...r,
          selected: false
        }))
      })
      records.value = newRecords

      selectedSort.value = 'label'
      Object.keys(records.value).forEach(category => {
        if (records.value[category].length > 0) {
          initializeDisplayOrder(category)
        }
      })

      customLists.value = await api.get('/custom-lists')
      selectedCustomLists.value = customLists.value.map(l => l.id)
    } catch (err) {
      console.error('Failed to restore records:', err)
    }
  }

  /**
   * @function deleteSelectedRecords
   * @async
   * @description Deletes all records currently selected in a category
   * @param {string} listType
   * @returns {Promise<Array>} The deleted records
   */
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

  /**
   * @function deleteAllRecords
   * @async
   * @description Placeholder for deleting all records (typically handled by backend during import)
   */
  async function deleteAllRecords() {
    // Handled by the import route on the backend
    return Promise.resolve(true)
  }

  /**
   * @function deleteRecordById
   * @async
   * @description Deletes a single record by its ID
   * @param {string} id
   * @param {string} listType
   */
  async function deleteRecordById(id, listType) {
    try {
      await api.delete(`/records/${id}`)
      const index = records.value[listType].findIndex(r => r.id === id)
      if (index > -1) {
        records.value[listType].splice(index, 1)
        removeFromDisplayOrder(id, listType)
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  /**
   * @section Labels
   * @description Configuration for record status labels per category
   */

  /** 
   * @constant labels [computable]
   * @type {import('vue').ComputedRef<Object>} 
   */
  const labels = computed(() => ({
    games: [
      {
        key: 'playing_now',
        label: i18n.global.t('store.labels.playing_now'),
        icon: InProgressIcon,
        default: true
      },
      {
        key: 'plan_to_play',
        label: i18n.global.t('store.labels.plan_to_play'),
        icon: PlanIcon
      },
      {
        key: 'on_hold',
        label: i18n.global.t('store.labels.on_hold'),
        icon: OnHoldIcon
      },
      {
        key: 'completed',
        label: i18n.global.t('store.labels.completed'),
        icon: CompletedIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    tvshows: [
      {
        key: 'watching_ongoing',
        label: i18n.global.t('store.labels.watching_ongoing'),
        icon: WatchingIcon,
        default: true
      },
      {
        key: 'watching_now',
        label: i18n.global.t('store.labels.watching_now'),
        icon: WatchingNowIcon
      },
      {
        key: 'plan_to_watch',
        label: i18n.global.t('store.labels.plan_to_watch'),
        icon: PlanIcon
      },
      {
        key: 'on_hold',
        label: i18n.global.t('store.labels.on_hold'),
        icon: OnHoldIcon
      },
      {
        key: 'watched_all',
        label: i18n.global.t('store.labels.watched_all'),
        icon: CompletedIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    films: [
      {
        key: 'plan_to_watch',
        label: i18n.global.t('store.labels.plan_to_watch'),
        icon: PlanIcon,
        default: true
      },
      {
        key: 'watched',
        label: i18n.global.t('store.labels.watched'),
        icon: CompletedIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    anime: [
      {
        key: 'watching_ongoing',
        label: i18n.global.t('store.labels.watching_ongoing'),
        icon: WatchingIcon,
        default: true
      },
      {
        key: 'watching_now',
        label: i18n.global.t('store.labels.watching_now'),
        icon: WatchingNowIcon
      },
      {
        key: 'plan_to_watch',
        label: i18n.global.t('store.labels.plan_to_watch'),
        icon: PlanIcon
      },
      {
        key: 'on_hold',
        label: i18n.global.t('store.labels.on_hold'),
        icon: OnHoldIcon
      },
      {
        key: 'watched_all',
        label: i18n.global.t('store.labels.watched_all'),
        icon: CompletedIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    manga: [
      {
        key: 'read_ongoing',
        label: i18n.global.t('store.labels.read_ongoing'),
        icon: ReadingIcon,
        default: true
      },
      {
        key: 'read_now',
        label: i18n.global.t('store.labels.read_now'),
        icon: ReadingIcon
      },
      {
        key: 'plan_to_read',
        label: i18n.global.t('store.labels.plan_to_read'),
        icon: PlanIcon
      },
      {
        key: 'on_hold',
        label: i18n.global.t('store.labels.on_hold'),
        icon: OnHoldIcon
      },
      {
        key: 'read',
        label: i18n.global.t('store.labels.read'),
        icon: ReadIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    books: [
      {
        key: 'read_now',
        label: i18n.global.t('store.labels.read_now'),
        icon: ReadingIcon,
        default: true
      },
      {
        key: 'plan_to_read',
        label: i18n.global.t('store.labels.plan_to_read'),
        icon: PlanIcon
      },
      {
        key: 'on_hold',
        label: i18n.global.t('store.labels.on_hold'),
        icon: OnHoldIcon
      },
      {
        key: 'read',
        label: i18n.global.t('store.labels.read'),
        icon: ReadIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),

    music: [
      {
        key: 'listening_now',
        label: i18n.global.t('store.labels.listening_now'),
        icon: ListeningIcon,
        default: true
      },
      {
        key: 'on_repeat',
        label: i18n.global.t('store.labels.on_repeat'),
        icon: MusicIcon
      },
      {
        key: 'plan_to_listen',
        label: i18n.global.t('store.labels.plan_to_listen'),
        icon: PlanIcon
      },
      {
        key: 'listened_all',
        label: i18n.global.t('store.labels.listened_all'),
        icon: CompletedIcon
      },
      {
        key: 'dropped',
        label: i18n.global.t('store.labels.dropped'),
        icon: DroppedIcon
      },
    ].sort((a, b) => LABEL_PRIORITY[a.key] - LABEL_PRIORITY[b.key]),
  }))

  /**
   * @function getDefaultLabel
   * @description Retrieves the default status label for a category
   * @param {string} listType
   * @returns {Object}
   */
  function getDefaultLabel(listType) {
    return labels.value[listType].find((i) => i.default) || labels.value[listType][0]
  }

  /**
   * @function getLabel
   * @description Retrieves a status label configuration by key
   * @param {string} listType
   * @param {string} key
   * @returns {Object}
   */
  function getLabel(listType, key) {
    const targetItem = labels.value[listType].filter((i) => { return i.key === key })[0]
    return targetItem ? targetItem : getDefaultLabel(listType)
  }

  /**
   * @function getLabelName
   * @description Returns the translated name of a status label
   * @param {string} listType
   * @param {string} key
   * @returns {string}
   */
  function getLabelName(listType, key) {
    return i18n.global.t(`store.labels.${key}`)
  }

  /**
   * @function getLabelIcon
   * @description Returns the icon component for a status label
   * @param {string} listType
   * @param {string} key
   * @returns {Object}
   */
  function getLabelIcon(listType, key) {
    return getLabel(listType, key).icon
  }

  /**
   * @section Export & Import
   * @description Configuration and methods for collection data portability
   */

  /** @type {import('vue').Ref<Array>} */
  const selectedCategories = ref([
    'games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music'
  ])

  /** @type {import('vue').Ref<Array>} */
  const selectedCustomLists = ref([])

  /** @type {Array<string>} */
  const validCategories = Object.keys(records.value)

  /** @type {import('vue').Ref<boolean>} */
  const processingImport = ref(false)

  /**
   * @function exportCollection
   * @description Generates and downloads a JSON or CSV export of the current collection
   * @param {string} [format='json'] - 'json' or 'csv'
   */
  function exportCollection(format = 'json') {
    // Filter records based on selected categories
    const filteredRecords = Object.entries(records.value)
      .reduce((acc, [category, records]) => {
        if (selectedCategories.value.includes(category)) {
          acc[category] = records.map(({
            selected, ...rest
          }) => rest)
        }
        return acc
      }, {})

    // Add custom lists
    const filteredCustomLists = customLists.value.filter(list => selectedCustomLists.value.includes(list.id))
    filteredRecords.customLists = filteredCustomLists.map(list => ({
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

    let content
    let mimeType
    let extension

    if (format === 'csv') {
      const csvRows = []

      // Standard categories
      Object.entries(filteredRecords).forEach(([category, items]) => {
        if (category === 'customLists') return
        items.forEach(item => {
          csvRows.push({
            Type: category,
            Title: item.title,
            Score: item.score,
            Status: item.label,
            Liked: item.liked,
            CreatedAt: item.createdAt
          })
        })
      })

      // Custom lists
      filteredRecords.customLists.forEach(list => {
        list.records.forEach(item => {
          csvRows.push({
            Type: `List: ${list.name} #${list.id}`,
            Title: item.title,
            Score: '',
            Status: '',
            Liked: '',
            CreatedAt: item.createdAt
          })
        })
      })

      content = Papa.unparse(csvRows)
      mimeType = 'text/csv'
      extension = 'csv'
    } else {
      /**
       * Sanitize resulting object with jsesc
       * @see {@link https://github.com/mathiasbynens/jsesc}
       */
      content = jsesc(filteredRecords, { json: true })
      mimeType = 'application/json'
      extension = 'json'
    }

    // Create link, attach blob to it and programmatically click on it
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `listify-collection-${moment().format('DD-MM-YYYY-HH-mm')}.${extension}`
    document.body.appendChild(a)
    a.click()

    // Remove generated link after
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * @function importCollection
   * @async
   * @description Parses and uploads a collection file (JSON or CSV) to the server
   * @param {Object} data - Upload event data containing the file
   */
  async function importCollection(data) {
    processingImport.value = true
    const file = data.file.file
    const isCSV = file.name.endsWith('.csv')

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const fileContents = reader.result
        let importData

        if (isCSV) {
          importData = await parseCSVToCollection(fileContents)
        } else {
          importData = JSON.parse(fileContents)
        }

        const isValid = await validateJSON(importData)
        if (!isValid) {
          processingImport.value = false
          return
        }

        await api.post('/import', importData)
        await restoreRecords() // Reload everything from server
        processingImport.value = false
        useNotificationsStore().pushNotification({
          message: i18n.global.t('store.notifications.importSuccess'),
          type: 'success'
        })
      } catch (err) {
        console.error(err)
        processingImport.value = false
        useNotificationsStore().pushNotification({
          message: isCSV ? i18n.global.t('store.notifications.importErrorCSV') : i18n.global.t('store.notifications.importErrorJSON'),
          type: 'error'
        })
      }
    }
    reader.readAsText(file)
  }

  /**
   * @function parseCSVToCollection
   * @async
   * @description Converts raw CSV text into a collection object
   * @param {string} csvText
   * @returns {Promise<Object>}
   */
  async function parseCSVToCollection(csvText) {
    const { data } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })
    const collection = {
      games: [],
      tvshows: [],
      films: [],
      anime: [],
      manga: [],
      books: [],
      music: [],
      customLists: []
    }

    for (const row of data) {
      const type = row.Type || ''
      const title = row.Title || ''
      if (!title) continue

      if (type.startsWith('List: ')) {
        // Group by the exact 'Type' string to avoid merging lists with duplicate names
        let list = collection.customLists.find(l => l._csvType === type)
        if (!list) {
          // Strip the #id suffix if present for the actual list name
          const listName = type.replace('List: ', '').split(' #')[0]
          list = {
            id: await generateUniqueId(),
            name: listName,
            _csvType: type, // Internal key for grouping
            records: [],
            createdAt: row.CreatedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          collection.customLists.push(list)
        }
        list.records.push({
          id: await generateUniqueId(),
          title: title,
          createdAt: row.CreatedAt || new Date().toISOString()
        })
      } else if (validCategories.includes(type)) {
        collection[type].push({
          id: await generateUniqueId(),
          category: type,
          title: title,
          score: parseInt(row.Score) || 0,
          label: row.Status || getDefaultLabel(type).key,
          liked: row.Liked === 'true' || row.Liked === true,
          createdAt: row.CreatedAt || new Date().toISOString()
        })
      }
    }

    return collection
  }

  /**
   * @function validateJSON
   * @description Validates the structure and content of an imported collection object
   * @param {Object} obj - The object to validate
   * @returns {Promise<boolean>}
   */
  function validateJSON(obj) {
    const notificationsStore = useNotificationsStore()
    try {
      const categories = Object.keys(obj)
      const errorMsg = 'Looks like your collection is corrupted.'

      const errors = []

      // customLists is optional
      const extraCategories = categories.filter(c => !validCategories.includes(c) && c !== 'customLists')

      if (extraCategories.length > 0) {
        errors.push({
          type: 'unexpected_categories',
          details: extraCategories
        })
      }

      // Validate each category payload and collect precise record errors
      for (const category of categories) {
        if (category === 'customLists') continue
        const records = obj[category]
        if (!validCategories.includes(category)) {
          errors.push({
            type: 'unexpected_category',
            category
          })
          continue
        }
        if (!Array.isArray(records)) {
          errors.push({
            type: 'invalid_category_payload',
            category,
            message: 'Category must be an array of records'
          })
          continue
        }
        for (let index = 0; index < records.length; index++) {
          const record = records[index]
          const recordErrors = getRecordValidationErrors(record, category)
          if (recordErrors.length > 0) {
            errors.push({
              type: 'invalid_record',
              category,
              index,
              id: record && record.id,
              errors: recordErrors
            })
          }
        }
      }

      // Validate custom lists
      if (Array.isArray(obj.customLists)) {
        for (const list of obj.customLists) {
          if (typeof list.id !== 'string' || typeof list.name !== 'string') {
            errors.push({
              type: 'invalid_custom_list',
              list
            })
            continue
          }
          if (!Array.isArray(list.records)) {
            errors.push({
              type: 'invalid_custom_list_records',
              list
            })
            continue
          }
          for (const r of list.records) {
            if (typeof r.id !== 'string') errors.push({
              type: 'invalid_custom_record',
              r,
              error: 'id'
            })
            if (typeof r.title !== 'string') errors.push({
              type: 'invalid_custom_record',
              r,
              error: 'title'
            })
            if (typeof r.createdAt !== 'string') errors.push({
              type: 'invalid_custom_record',
              r,
              error: 'createdAt'
            })
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
      return Promise.resolve(false)
    }
  }

  /**
   * @function getRecordValidationErrors
   * @description Performs detailed validation on a single record object
   * @param {Object} record
   * @param {string} category
   * @returns {Array<string>} List of validation error messages
   */
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
    deleteRecordById,

    labels,
    getDefaultLabel,
    getLabel,
    getLabelName,
    getLabelIcon,

    selectedCategories,
    selectedCustomLists,
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

    // Expose constants for template convenience if needed
    CATEGORIES,
    CATEGORY_ICONS,
    LABEL_PRIORITY,
    sortRecords
  }
})
