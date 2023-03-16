import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<LyRecords<LyRecord>>({
    games: [
      {
        id: 43465235347,
        title: 'Genshin Impact',
        score: 5,
        liked: true,
        label: 'currently_playing',
      },
      {
        id: 845475685467,
        title: 'Minecraft',
        score: 4,
        liked: true,
        label: 'currently_playing',
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

  const labels: LyLabels<LyLabel> = {
    games: [
      {
        key: 'currently_playing',
        label: 'Currently Playing',
      },
      {
        key: 'continuously_playing',
        label: 'Continuously Playing',
      },
      {
        key: 'on_hold',
        label: 'On Hold',
      },
      {
        key: 'plan_to_play',
        label: 'Plan to Play',
      },
      {
        key: 'completed',
        label: 'Completed',
      },
      {
        key: 'dropped',
        label: 'Dropped',
      },
    ]
  }

  function getLabelName(list: string, key: string): string {
    return labels[list].filter((i: LyLabel) => {
      return i.key === key
    })[0].label
  }

  function getRecord(id: number, list: string): LyRecord {
    return records.value[list].filter((i: object) => {
      return (i as LyRecord).id === id
    })[0]
  }

  function checkRecordExist(item: LyRecord, list: string): boolean {
    return records.value[list].some((i: object) => {
      return (i as LyRecord).id === item.id
    })
  }

  function addRecord(item: LyRecord, list: string): void {
    if (!checkRecordExist(item, list)) {
      records.value[list].push(item)
    }
  }

  return {
    records,
    record,
    labels,
    getLabelName,
    getRecord,
    addRecord,
  }
})
