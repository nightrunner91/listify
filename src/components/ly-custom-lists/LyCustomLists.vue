<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NSpace, NText, NButton, NIcon, NEmpty, NList, NListItem, NThing, NCard } from 'naive-ui'
import { PhArrowRight, PhPlus } from 'phosphor-vue'
import { useRecordsStore } from '@/stores/records.store'
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const recordsStore = useRecordsStore()

const customLists = computed(() => recordsStore.customLists)

async function handleCreateList() {
  try {
    const listId = await recordsStore.createCustomList()
    router.push({
      name: 'CustomList',
      params: { id: listId } 
    })
  } catch (error) {
    console.error('Failed to create custom list:', error)
  }
}

function handleListClick(listId) {
  router.push({
    name: 'CustomList',
    params: { id: listId } 
  })
}

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  return moment(dateString).fromNow()
}
</script>

<template>
  <n-space
    vertical
    :size="16"
  >
    <n-space
      justify="space-between"
      align="center"
    >
      <n-text
        depth="3"
        class="fz-12 font-weight-600 letter-spacing-1"
      >
        {{ t('customLists.title') }}
      </n-text>
      <n-button
        v-if="customLists.length > 0"
        tertiary
        circle
        class="fz-18"
        @click="handleCreateList"
      >
        <template
          #icon
        >
          <n-icon>
            <ph-plus
              weight="bold"
            />
          </n-icon>
        </template>
      </n-button>
    </n-space>

    <n-card
      :bordered="true"
      content-class="p-0"
    >
      <!-- Empty State -->
      <n-empty 
        v-if="customLists.length === 0" 
        :description="t('customLists.emptyDescription')"
        class="py-6"
      >
        <template
          #extra
        >
          <n-button
            primary
            @click="handleCreateList"
          >
            {{ t('customLists.createList') }}
          </n-button>
        </template>
      </n-empty>

      <!-- List -->
      <n-list
        v-else
        hoverable
        clickable
        class="bg-transparent"
      >
        <n-list-item
          v-for="list in customLists"
          :key="list.id"
          class="hover-bg-action"
          @click="handleListClick(list.id)"
        >
          <n-thing
            :title="list.name"
          >
            <template
              #description
            >
              <n-space
                :size="8"
                align="center"
              >
                <n-text
                  depth="3"
                >
                  {{ list.records?.length || 0 }} {{ t('customLists.items') }}
                </n-text>
                <n-text
                  v-if="list.updatedAt || list.createdAt"
                  depth="3"
                >
                  &bull;
                </n-text>
                <n-text
                  v-if="list.updatedAt || list.createdAt"
                  depth="3"
                >
                  {{ t('customLists.updated', { time: formatRelativeTime(list.updatedAt || list.createdAt) }) }}
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
/* Keep internal NaiveUI overrides if they can't be utility-first */
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
  }
}
</style>
