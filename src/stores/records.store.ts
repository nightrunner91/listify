import { ref, shallowRef, computed, type ComputedRef, type Component } from 'vue'
import { defineStore } from 'pinia'
import { generateUniqueId } from '@/utils/random-number'
import { lyStorage } from '@/main'
import {
  PhPlay as InProgressIcon,
  PhHourglass as OnHoldIcon,
  PhBookmark as PlanIcon,
  PhChecks as CompletedIcon,
  PhProhibit as DroppedIcon,
} from 'phosphor-vue'
import jsesc from 'jsesc'
import moment from 'moment'

const RECORDS_KEY = 'rec_'

export const useRecordsStore = defineStore('records', () => {

  /* ========================= */
  /* ======== Records ======== */
  /* ========================= */

  const records = ref<LyRecords<LyRecord>>({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

  const recordsLength = (listType: string): ComputedRef<number> => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list ? list.length : 0
    })
  }

  const allRecordsLength = (): ComputedRef<number> => {
    return computed(() => {
      const categories = Object.keys(records.value)
      let total = 0
      categories.forEach(category => {
        total += records.value[category].length
      })
      return total
    })
  }

  const someRecordsSelected = (listType: string): ComputedRef<boolean> => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.some((record: LyRecord) => record.selected)
    })
  }
  
  const allRecordsSelected = (listType: string): ComputedRef<boolean> => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.every((record: LyRecord) => record.selected)
    })
  }

  const selectedRecords = (listType: string): ComputedRef<LyRecord[]> => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record: LyRecord) => record.selected)
    })
  }

  const selectedRecordsLength = (listType: string): ComputedRef<number> => {
    return computed(() => {
      const { [listType]: list = [] } = records.value
      return list?.filter((record: LyRecord) => record.selected).length || 0
    })
  }

  function selectAllRecords(listType: string): LyRecord[] {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = true)
  }
  
  function deselectAllRecords(listType: string): LyRecord[] {
    const { [listType]: list = [] } = records.value
    return list?.filter((record) => record.selected = false)
  }

  function checkRecordExist(item: LyRecord, listType: string): boolean {
    return records.value[listType].some((i: LyRecord) => i.id === item.id)
  }

  function getRecord(id: number, listType: string): LyRecord {
    const record = records.value[listType].find((i: LyRecord) => i.id === id)
    return record as LyRecord
  }

  async function addRecord(listType: string, { saveLocal }: AddRecordOptions): Promise<LyRecord> {
    try {
      const id = await generateUniqueId()
      const record: LyRecord = {
        id,
        category: listType,
        title: '',
        score: 0,
        liked: false,
        label: getDefaultLabel(listType).key,
        selected: false,
      }
      records.value[listType].push(record)
  
      if (saveLocal) {
        try {
          await lyStorage.setStorage({ key: `${RECORDS_KEY}${id}`, data: record })
        } catch (err: any) {
          console.error(err.errMsg)
        }
      }
  
      return record
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  function restoreRecords(): void {
    const recKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key: string | null = localStorage.key(i)
      if (key && key.includes(RECORDS_KEY)) {
        recKeys.push(key)
      }
    }
    for (let i = 0; i < recKeys.length; i++) {
      const key: string = recKeys[i]
      const value: LyRecord = JSON.parse(localStorage.getItem(key) as string).value
      records.value[value.category].push(value)
    }
  }

  async function deleteSelectedRecords(listType: string): Promise<LyRecord[]> {
    const selected = selectedRecords(listType).value
    try {
      for (let n = 0; n < selected.length; n++) {
        const i = records.value[listType].findIndex(record => record.id === selected[n].id)
        records.value[listType].splice(i, 1)
        try {
          await lyStorage.removeStorage({
            namespace: 'ly_',
            key: `${RECORDS_KEY}${selected[n].id}`
          })
        } catch (err: any) {
          console.error(err.errMsg)
        }
      }
      return selected
    } catch (err) {
      console.error(err)
      throw err
    }
  }


  /* ======================== */
  /* ======== Labels ======== */
  /* ======================== */

  const labels = shallowRef<LyLabels<LyLabel>>({
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

  function getDefaultLabel(listType: string): LyLabel {
    return labels.value[listType].find((i: LyLabel) => i.default) || labels.value[listType][0]
  }  

  function getLabel(listType: string, key: string): LyLabel {
    const targetItem = labels.value[listType].filter((i: LyLabel) => {return i.key === key })[0]
    return targetItem ? targetItem : getDefaultLabel(listType)
  }

  function getLabelName(listType: string, key: string): string {
    return getLabel(listType, key).label
  }

  function getLabelIcon(listType: string, key: string): Component {
    return getLabel(listType, key).icon
  }


  /* =========================== */
  /* ===== Export & Import ===== */
  /* =========================== */

  const selectedCategories = ref([
    'games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music'
  ])

  function exportCollection(): void {
    // Filter records based on selected categories
    const filteredRecords = Object.entries(records.value)
      .reduce((acc, [category, records]) => {
        if (selectedCategories.value.includes(category)) {
          // Remove 'selected' property from each record
          /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
          acc[category] = records.map(({selected, ...rest}) => rest as LyRecord)
        }
        return acc
      }, {} as Record<string, LyRecord[]>)

    /**
     * Sanitize resulting object with jsesc
     * @see {@link https://github.com/mathiasbynens/jsesc}
     */ 
    const json = jsesc(filteredRecords, { json: true })

    // Create link and attach blob to it
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `listify-collection-${moment().format('DD-MM-YYYY')}.json`
    document.body.appendChild(a)
    a.click()

    // Remove link after
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

    labels,
    getDefaultLabel,
    getLabel,
    getLabelName,
    getLabelIcon,

    selectedCategories,
    exportCollection,
  }
})
