import { ref, shallowRef, type Component } from 'vue'
import { defineStore } from 'pinia'
import {
  PhPlay as InProgressIcon,
  PhHourglass as OnHoldIcon,
  PhBookmark as PlanIcon,
  PhChecks as CompletedIcon,
  PhProhibit as DroppedIcon,
} from 'phosphor-vue'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<LyRecords<LyRecord>>({
    games: [
      {
        id: 43465235347,
        title: 'Genshin Impact',
        score: 5,
        liked: true,
        label: 'playing_now',
      },
      {
        id: 845475685467,
        title: 'Minecraft',
        score: 4,
        liked: true,
        label: 'playing_now',
      },
      {
        id: 645547585734,
        title: 'Battlefield 4',
        score: 4,
        liked: true,
        label: 'completed',
      },
      {
        id: 434436542454,
        title: 'Assassin\'s Creed 4: Black Flag',
        score: 3,
        liked: false,
        label: 'dropped',
      },
    ],
    tvshows: [],
    films: [],
    books: [],
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
      { key: 'playing_now', label: 'Playing Now', icon: InProgressIcon },
      { key: 'on_hold', label: 'On Hold', icon: OnHoldIcon },
      { key: 'plan_to_play', label: 'Plan to Play', icon: PlanIcon },
      { key: 'completed', label: 'Completed', icon: CompletedIcon },
      { key: 'dropped', label: 'Dropped', icon: DroppedIcon },
    ],
    tvshows: [],
    films: [],
    anime: [],
  })

  const recordsLength = (category: string) => {
    const target = records.value[category]
    return target ? target.length : 0
  }

  function getLabel(list: string, key: string): LyLabel {
    return labels.value[list].filter((i: LyLabel) => {
      return i.key === key
    })[0]
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

  function addRecord(item: LyRecord, list: string): void {
    if (!checkRecordExist(item, list)) {
      // records.value[list].push(item)
    }
  }

  return {
    records,
    record,
    labels,
    recordsLength,
    getLabel,
    getLabelName,
    getLabelIcon,
    getRecord,
    addRecord,
  }
})
