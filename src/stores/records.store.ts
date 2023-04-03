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

  const recordsLength = (listType: string) => {
    const targetList = records.value[listType]
    return targetList ? targetList.length : 0
  }

  const someRecordsSelected = (listType: string): ComputedRef<boolean> => {
    return computed(() => {
      return records.value[listType]?.some(
        (record: LyRecord) => record.selected
      )
    })
  }

  const allRecordsSelected = (listType: string): ComputedRef<boolean> => {
    return computed(() => {
      return records.value[listType]?.every(
        (record: LyRecord) => record.selected
      )
    })
  }

  function selectAllRecords(listType: string): LyRecord[] {
    const list = records.value[listType]
    list?.forEach((record) => {
      record.selected = true
    })
    return list?.filter((record) => record.selected)
  }
  
  function deselectAllRecords(listType: string): LyRecord[] {
    const list = records.value[listType]
    list?.forEach((record) => {
      record.selected = false
    })
    return list?.filter((record) => !record.selected)
  }

  function checkRecordExist(item: LyRecord, listType: string): boolean {
    return records.value[listType].some((i: LyRecord) => i.id === item.id)
  }

  function getRecord(id: number, listType: string): LyRecord {
    const record = records.value[listType].find((i: LyRecord) => i.id === id)
    if (!record) {
      throw new Error(`Record not found with ID ${id} in listType ${listType}`)
    }
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
  

  return {
    records,
    recordsLength,
    someRecordsSelected,
    allRecordsSelected,
    selectAllRecords,
    deselectAllRecords,
    checkRecordExist,
    getRecord,
    addRecord,
    restoreRecords,

    labels,
    getDefaultLabel,
    getLabel,
    getLabelName,
    getLabelIcon,
  }
})
