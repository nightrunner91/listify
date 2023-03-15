import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<LyRecords<LyRecord>>({
    games: [],
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

  const labels = {
    games: [
      { label: 'currently_playing', value: 'Currently Playing' }
    ]
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
    addRecord,
  }
})
