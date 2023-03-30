import { ref, shallowRef, type Component } from 'vue'
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
  const records = ref<LyRecords<LyRecord>>({
    games: [],
    tvshows: [],
    films: [],
    anime: [],
    manga: [],
    books: [],
    music: [],
  })

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

  const recordsLength = (list: string) => {
    const targetList = records.value[list]
    return targetList ? targetList.length : 0
  }

  function getDefaultLabel(list: string): LyLabel {
    return labels.value[list].filter((i: LyLabel) => { return i.default })[0]
  }

  function getLabel(list: string, key: string): LyLabel {
    const targetItem = labels.value[list].filter((i: LyLabel) => {return i.key === key })[0]
    return targetItem ? targetItem : getDefaultLabel(list)
  }

  function getLabelName(list: string, key: string): string {
    return getLabel(list, key).label
  }

  function getLabelIcon(list: string, key: string): Component {
    return getLabel(list, key).icon
  }

  function checkRecordExist(item: LyRecord, list: string): boolean {
    return records.value[list].some((i: object) => {
      return (i as LyRecord).id === item.id
    })
  }

  function getRecord(id: number, list: string): LyRecord {
    return records.value[list].filter((i: object) => {
      return (i as LyRecord).id === id
    })[0]
  }

  async function addRecord(list: string, { saveLocal }: AddRecordOptions): Promise<LyRecord> {
    try {
      const id = await generateUniqueId()
      const record: LyRecord = {
        id,
        category: list,
        title: '',
        score: 0,
        liked: false,
        label: getDefaultLabel(list).key,
      }
      records.value[list].push(record)
  
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

  return {
    records,
    labels,
    recordsLength,
    getLabel,
    getLabelName,
    getLabelIcon,
    checkRecordExist,
    getRecord,
    addRecord,
    restoreRecords,
  }
})
