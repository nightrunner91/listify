import {
  ref,
  shallowRef,
  computed,
} from 'vue'
import { defineStore } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'
import { generateUniqueId } from '@/utils/random-number'
import { lyStorage } from '@/main'
import {
  PhPlay as InProgressIcon,
  PhHourglass as OnHoldIcon,
  PhBookmark as PlanIcon,
  PhChecks as CompletedIcon,
  PhProhibit as DroppedIcon,

  PhTextAa as AlphabeticalIcon,
  PhStar as RatingIcon,
  PhHeart as FavouriteIcon,
  PhList as StatusIcon,
} from 'phosphor-vue'
import jsesc from 'jsesc'
import moment from 'moment'

const RECORDS_KEY = 'rec_'

export const useRecordsStore = defineStore('records', () => {

  /* ========================= */
  /* ======== Records ======== */
  /* ========================= */

  const records = ref({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

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

  async function addRecord({ record, listType, saveLocal }) {
    try {
      const income = record || {
        id: await generateUniqueId(),
        category: listType,
        title: '',
        score: 0,
        liked: false,
        label: getDefaultLabel(listType).key,
        selected: false,
      }
      
      const isNewRecord = !checkRecordExist(income, listType)
      
      if (isNewRecord) {
        records.value[listType].push(income)
        addToDisplayOrder(income.id, listType)
      } else {
        const index = records.value[listType].findIndex((i) => i.id === income.id)
        records.value[listType].splice(index, 1, income)
      }
  
      if (saveLocal) {
        try {
          await lyStorage.setStorage({ key: `${RECORDS_KEY}${income.id}`, data: income })
        } catch (err) {
          console.error(err.errMsg)
        }
      }
  
      return income
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  function restoreRecords() {
    const recKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(RECORDS_KEY)) {
        recKeys.push(key)
      }
    }
    for (let i = 0; i < recKeys.length; i++) {
      const key = recKeys[i]
      const value = JSON.parse(localStorage.getItem(key)).value
      records.value[value.category].push(value)
    }
    
    // Initialize display order for all categories after restoring records
    // Set default sort to 'label' and initialize display order
    selectedSort.value = 'label'
    Object.keys(records.value).forEach(category => {
      if (records.value[category].length > 0) {
        initializeDisplayOrder(category)
      }
    })
  }

  async function deleteSelectedRecords(listType) {
    const selected = selectedRecords(listType).value
    try {
      for (let n = 0; n < selected.length; n++) {
        // Remove from localStorage
        lyStorage.removeStorage({
          namespace: 'ly_',
          key: `${RECORDS_KEY}${selected[n].id}`
        })
        // Remove from Pinia
        const index = records.value[listType].findIndex(record => record.id === selected[n].id)
        records.value[listType].splice(index, 1)
        // Remove from display order
        removeFromDisplayOrder(selected[n].id, listType)
      }
      return selected
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async function deleteAllRecords() {
    try {
      // Remove from localStorage
      Object.keys(records.value).forEach(key => {
        for (let i = 0; i < records.value[key].length; i++) {
          lyStorage.removeStorage({
            namespace: 'ly_',
            key: `${RECORDS_KEY}${records.value[key][i].id}`
          })
        }
      })
      // Remove from Pinia
      Object.keys(records.value).forEach(key => {
        records.value[key] = []
        displayOrder.value[key] = []
      })
      
      return Promise.resolve(true)
    } catch (err) {
      console.error(err)
      throw err
    }
  }


  /* ======================== */
  /* ======== Labels ======== */
  /* ======================== */

  const labels = shallowRef({
    games: [
      { key: 'playing_now', label: 'Playing Now', icon: InProgressIcon, default: true },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'plan_to_play', label: 'Plan to Play', icon: PlanIcon },
      { key: 'completed', label: 'Completed', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
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
          // Remove 'selected' property from each record
          /* eslint-disable-next-line no-unused-vars */
          acc[category] = records.map(({selected, ...rest}) => rest)
        }
        return acc
      }, {})

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
    a.download = `listify-collection-${moment().format('DD-MM-YYYY')}.json`
    document.body.appendChild(a)
    a.click()

    // Remove generated link after
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function importCollection(data) {
    // Change loading state
    processingImport.value = true

    // Create reader instance
    const reader = new FileReader()
  
    reader.onload = () => {
      const fileContents = reader.result
      const jsonObject = JSON.parse(fileContents)
      
      validateJSON(jsonObject)
        .then(result => {
          if (result) {
            deleteAllRecords().then(() => {
              // Process the records
              Object.keys(jsonObject).forEach(key => {
                for (let i = 0; i < jsonObject[key].length; i++) {
                  addRecord({
                    record: jsonObject[key][i],
                    listType: key,
                    saveLocal: true
                  })
                }
              })

              // Change loading state
              processingImport.value = false
            })
          }
        })
    }
  
    reader.readAsText(data.file.file)
  }

  function validateJSON(obj) {
    const notificationsStore = useNotificationsStore()
    try {
      // Check that the object has exactly the required categories
      const categories = Object.keys(obj)
      const errorMsg = 'Looks like your collection is corrupted.'

      if (
        categories.length !== validCategories.length
        || !categories.every(c => validCategories.includes(c))) {
        notificationsStore.pushNotification({
          message: errorMsg,
          type: 'error'
        })
        throw new Error(errorMsg)
      }

      // Check that each category has records in the correct format
      for (const category of categories) {
        const records = obj[category]
        if (!Array.isArray(records) || records.some(r => !isValidRecord(r, category))) {
          notificationsStore.pushNotification({
            message: errorMsg,
            type: 'error'
          })
          throw new Error(errorMsg)
        }
      }

      return Promise.resolve(true)
    } catch (error) {
      console.error(error)
      processingImport.value = false
      return Promise.resolve(false)
    }
  }

  function isValidRecord(record, category) {
    const validLabels = labels.value[category].map(l => l.key)

    return typeof record.id === 'string'
      && typeof record.category === 'string'
      && validLabels.includes(record.label)
      && validCategories.includes(record.category)
      && typeof record.title === 'string'
      && typeof record.score === 'number'
      && typeof record.liked === 'boolean'
  }

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

  // Sync display order with current sort
  function syncDisplayOrderWithSort(listType) {
    const list = records.value[listType] || []
    const key = selectedSort.value
    
    const labelPriority = {
      'playing_now': 1,
      'plan_to_play': 2,
      'on_hold': 3,
      'completed': 4,
      'dropped': 5
    }

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
  }
})
