import { ref, shallowRef, type Component } from 'vue'
import { defineStore } from 'pinia'
import { getRandomInt } from '@/utils/random-number'
import {
  PhPlay as InProgressIcon,
  PhHourglass as OnHoldIcon,
  PhBookmark as PlanIcon,
  PhChecks as CompletedIcon,
  PhProhibit as DroppedIcon,
} from 'phosphor-vue'

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

  const record = ref<LyRecord>({
    id: undefined,
    title: '',
    score: 0,
    liked: false,
    label: '',
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

  function getLabel(list: string, key: string): LyLabel {
    const targetList = labels.value[list]
    const targetItem = targetList.filter((i: LyLabel) => {return i.key === key })[0]
    const defaultItem = targetList.filter((i: LyLabel) => { return i.default })[0]

    return targetItem ? targetItem : defaultItem
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

  function addRecord(list: string): void {
    records.value[list].push({
      id: getRandomInt(),
      title: '',
      score: 0,
      liked: false,
      label: '',
    })
  }

  return {
    records,
    record,
    labels,
    recordsLength,
    getLabel,
    getLabelName,
    getLabelIcon,
    checkRecordExist,
    getRecord,
    addRecord,
  }
})
