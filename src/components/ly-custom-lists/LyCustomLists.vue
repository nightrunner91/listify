<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NSpace, NText, NButton, NIcon, NEmpty, NList, NListItem, NThing, NCard } from 'naive-ui'
import { PhArrowRight, PhPlus } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'
import moment from 'moment'

const router = useRouter()
const recordsStore = useRecordsStore()

const customLists = computed(() => recordsStore.customLists)

async function handleCreateList() {
  try {
    const listId = await recordsStore.createCustomList()
    router.push({ name: 'CustomList', params: { id: listId } })
  } catch (error) {
    console.error('Failed to create custom list:', error)
  }
}

function handleListClick(listId) {
  router.push({ name: 'CustomList', params: { id: listId } })
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  return moment(dateString).fromNow()
}
</script>

<template>
  <n-space vertical :size="16" style="margin-top: 40px">
    <n-space justify="space-between" align="center">
      <n-text tag="h2" style="font-size: 24px; font-weight: 500; margin: 0; letter-spacing: -0.5px">Custom Lists</n-text>
      <n-button v-if="customLists.length > 0" secondary circle @click="handleCreateList">
        <template #icon>
          <n-icon><ph-plus weight="regular" /></n-icon>
        </template>
      </n-button>
    </n-space>

    <!-- Empty State -->
    <n-card
      v-if="customLists.length === 0"
      :bordered="false"
      style="border-radius: 12px; background-color: var(--n-color-embedded); padding: 24px 0"
    >
      <n-empty description="You haven't created any custom lists yet.">
        <template #extra>
          <n-button type="primary" @click="handleCreateList">
            Create new list
          </n-button>
        </template>
      </n-empty>
    </n-card>

    <!-- List -->
    <n-list v-else hoverable clickable bordered>
      <n-list-item v-for="list in customLists" :key="list.id" @click="handleListClick(list.id)">
        <n-thing :title="list.name">
          <template #description>
            <n-space :size="8" align="center">
              <n-text depth="3">{{ list.records?.length || 0 }} items</n-text>
              <n-text v-if="list.updatedAt || list.createdAt" depth="3">&bull;</n-text>
              <n-text v-if="list.updatedAt || list.createdAt" depth="3">
                Updated {{ formatRelativeTime(list.updatedAt || list.createdAt) }}
              </n-text>
            </n-space>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
  </n-space>
</template>

