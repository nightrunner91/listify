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
  <n-space vertical :size="16">
    <n-space justify="space-between" align="center">
      <n-text depth="3" class="section-title">CUSTOM LISTS</n-text>
      <n-button v-if="customLists.length > 0" tertiary circle @click="handleCreateList" style="font-size: 18px;">
        <template #icon>
          <n-icon><ph-plus weight="bold" /></n-icon>
        </template>
      </n-button>
    </n-space>

    <n-card :bordered="true" content-style="padding: 0;">
      <!-- Empty State -->
      <n-empty 
        v-if="customLists.length === 0" 
        description="You haven't created any custom lists yet."
        style="padding: 24px 0"
      >
        <template #extra>
          <n-button primary @click="handleCreateList">
            Create new list
          </n-button>
        </template>
      </n-empty>

      <!-- List -->
      <n-list v-else hoverable clickable style="background: transparent;">
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
    </n-card>
  </n-space>
</template>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.n-list {
  .n-list-item {
    &:not(:first-child):not(:last-child) {
      border-radius: 0 !important;
    }

    &:first-child {
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }

    &:last-child {
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
    }

    &:hover {
      background-color: var(--n-action-color) !important;
    }
  }
}
</style>
