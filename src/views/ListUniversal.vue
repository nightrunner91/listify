<script setup lang="ts">
import { NSpace, NList } from 'naive-ui'
import { useRecordsStore } from '@/stores/records.store'
import { useRoute } from 'vue-router'
import LyRecord from '@/components/ly-record/LyRecord.vue'
import LyAddRecord from '@/components/ly-add-record/LyAddRecord.vue'

const recordsStore = useRecordsStore()
const route = useRoute()
</script>

<template>
  <n-space
    vertical
    size="large">
    <n-list
      hoverable
      :show-divider="false">
      <ly-record
        v-for="(record, index) in recordsStore.records[route.meta.tag as string]"
        :key="record.id"
        :id="record.id"
        :index="index" />
    </n-list>
    <ly-add-record />
  </n-space>
</template>
