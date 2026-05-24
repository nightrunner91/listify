<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  computed
} from 'vue'
import {
  NTimeline,
  NTimelineItem,
  NCard,
  NSpace,
  NText,
  NEmpty,
  NSpin,
  NRate,
  NButton
} from 'naive-ui'
import { api } from '@/api/client'
import moment from 'moment'
import 'moment/locale/ru'
import 'moment/locale/ro'
import {
  PhHeart as LikeIcon, PhTrash as DeleteIcon, PhArrowCounterClockwise as RestoreIcon 
} from 'phosphor-vue'
import { darkThemeOverrides } from '@/theme.config.js'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  editMode: {
    type: Boolean,
    default: true
  }
})

const {
  t, te, locale
} = useI18n()

const activities = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const cursor = ref(null)
const deletedIds = ref(new Set())

const deletedCount = computed(() => deletedIds.value.size)

const fetchDeletedIds = async () => {
  try {
    const deletedResponse = await api.get('/activities/deleted')
    if (deletedResponse.activities && deletedResponse.activities.length > 0) {
      deletedResponse.activities.forEach(a => deletedIds.value.add(a.id))
    }
  } catch (err) {
    console.error('Failed to fetch deleted activity IDs:', err)
  }
}

const fetchActivities = async (append = false) => {
  try {
    const params = new URLSearchParams()
    params.set('limit', '20')
    if (cursor.value && append) {
      params.set('cursor', cursor.value)
    }

    const response = await api.get(`/activities?${params.toString()}`)
    const {
      activities: newActivities, hasMore: more, nextCursor 
    } = response

    if (append) {
      activities.value = [...activities.value, ...newActivities]
    } else {
      activities.value = newActivities
    }

    hasMore.value = more
    cursor.value = nextCursor
  } catch (err) {
    console.error('Failed to fetch activities:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  await fetchActivities(true)
}

const handleDelete = async (activityId) => {
  try {
    await api.delete(`/activities/${activityId}`)
    deletedIds.value.add(activityId)
  } catch (err) {
    console.error('Failed to delete activity:', err)
  }
}

const handleRestore = async (activityId) => {
  try {
    await api.post(`/activities/${activityId}/restore`)
    deletedIds.value.delete(activityId)
  } catch (err) {
    console.error('Failed to restore activity:', err)
  }
}

const purgeDeletedActivities = async () => {
  if (deletedIds.value.size === 0) return
  try {
    await api.post('/activities/purge')
    deletedIds.value.clear()
  } catch (err) {
    console.error('Failed to purge deleted activities:', err)
  }
}

onMounted(async () => {
  await Promise.all([fetchActivities(), fetchDeletedIds()])
})

onUnmounted(() => {
  if (props.editMode && deletedIds.value.size > 0) {
    purgeDeletedActivities()
  }
})

const getCategoryColor = (category) => {
  const colors = darkThemeOverrides.Categories
  return colors[`${category}Color`] || colors.customColor
}

const formatActivity = (activity) => {
  const {
    action, entityName, category, metadata
  } = activity
  const categoryLabel = category && te(`categories.${category}`) ? t(`categories.${category}`) : category

  switch (action) {
    case 'record_created':
      return {
        keypath: 'timeline.actions.record_created',
        entity: entityName,
        category: categoryLabel
      }
    case 'record_status_updated': {
      const statusKey = `timeline.sentences.${metadata?.label}`
      const statusVerb = te(statusKey) ? t(statusKey) : metadata?.label
      return {
        keypath: 'timeline.actions.record_status_updated',
        status: statusVerb,
        entity: entityName
      }
    }
    case 'record_score_updated':
      return {
        keypath: 'timeline.actions.record_score_updated',
        entity: entityName,
        type: 'rate',
        value: Number(metadata?.score)
      }
    case 'record_liked':
      return {
        keypath: 'timeline.actions.record_liked',
        entity: entityName,
        type: 'like'
      }
    case 'record_unliked':
      return {
        keypath: 'timeline.actions.record_unliked',
        entity: entityName
      }
    case 'record_episode_incremented':
      return {
        keypath: 'timeline.actions.record_episode_incremented',
        entity: entityName,
        season: metadata?.season !== undefined ? String(metadata.season).padStart(2, '0') : '00',
        episode: metadata?.episode !== undefined ? String(metadata.episode).padStart(2, '0') : '00'
      }
    case 'record_deleted':
      return {
        keypath: 'timeline.actions.record_deleted',
        entity: entityName,
        category: categoryLabel
      }
    case 'custom_list_created':
      return {
        keypath: entityName ? 'timeline.actions.custom_list_created' : 'timeline.actions.custom_list_created_empty',
        entity: entityName
      }
    case 'custom_list_renamed':
      return {
        keypath: 'timeline.actions.custom_list_renamed',
        entity: entityName
      }
    case 'custom_list_deleted':
      return {
        keypath: 'timeline.actions.custom_list_deleted',
        entity: entityName
      }
    case 'custom_list_record_added':
      return {
        keypath: 'timeline.actions.custom_list_record_added',
        entity: entityName,
        listName: metadata?.listName
      }
    case 'custom_list_record_deleted':
      return {
        keypath: 'timeline.actions.custom_list_record_deleted',
        entity: entityName,
        listName: metadata?.listName
      }
    case 'collection_imported':
      return {
        keypath: 'timeline.actions.collection_imported',
        count: metadata?.count
      }
    default:
      return {
        keypath: 'timeline.actions.default_action',
        action: action
      }
  }
}

const formattedActivities = computed(() => {
  const currentLocale = locale.value
  moment.locale(currentLocale)

  return activities.value.map(activity => {
    const isDeleted = deletedIds.value.has(activity.id)
    return {
      ...activity,
      timeAgo: moment(activity.createdAt).fromNow(),
      formatted: formatActivity(activity),
      isDeleted
    }
  })
})
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
        {{ t('timeline.title') }}
      </n-text>
    </n-space>

    <n-card :bordered="true">
      <n-space
        v-if="loading"
        justify="center"
        class="py-8"
      >
        <n-spin size="large" />
      </n-space>

      <n-empty
        v-else-if="activities.length === 0"
        :description="t('timeline.empty')"
        class="py-8"
      />

      <div v-else>
        <n-timeline>
          <n-timeline-item
            v-for="activity in formattedActivities"
            :key="activity.id"
            :type="activity.category === 'system' ? 'info' : 'default'"
            :color="getCategoryColor(activity.category)"
            :time="activity.timeAgo"
            class="activity-line"
          >
            <template #default>
              <n-space
                vertical
                :wrap-item="false"
                :size="4"
                class="mb-2"
                style="margin-top: -.1em"
              >
                <n-space
                  align="center"
                  :wrap-item="false"
                  :size="8"
                >
                  <i18n-t
                    :keypath="activity.formatted.keypath"
                    tag="span"
                    :class="{ 'opacity-5': activity.isDeleted }"
                    class="mr-1"
                  >
                    <template #entity>
                      <span
                        v-if="activity.formatted.entity"
                        class="font-weight-500"
                      >{{ activity.formatted.entity }}</span>
                    </template>
                    <template #season>
                      <span>{{ activity.formatted.season }}</span>
                    </template>
                    <template #episode>
                      <span>{{ activity.formatted.episode }}</span>
                    </template>
                    <template #category>
                      <span v-if="activity.formatted.category">{{ activity.formatted.category }}</span>
                    </template>
                    <template #status>
                      <span v-if="activity.formatted.status">{{ activity.formatted.status }}</span>
                    </template>
                    <template #listName>
                      <span
                        v-if="activity.formatted.listName"
                        class="font-weight-500"
                      >{{ activity.formatted.listName }}</span>
                    </template>
                    <template #count>
                      <span v-if="activity.formatted.count">{{ activity.formatted.count }}</span>
                    </template>
                    <template #action>
                      <span v-if="activity.formatted.action">{{ activity.formatted.action }}</span>
                    </template>
                  </i18n-t>
                  <n-button
                    v-if="editMode"
                    quaternary
                    circle
                    size="tiny"
                    :type="activity.isDeleted ? 'warning' : 'error'"
                    class="flex-shrink-0"
                    @click="activity.isDeleted ? handleRestore(activity.id) : handleDelete(activity.id)"
                  >
                    <template #icon>
                      <restore-icon
                        v-if="activity.isDeleted"
                        size="18"
                      />
                      <delete-icon
                        v-else
                        size="18"
                      />
                    </template>
                  </n-button>
                </n-space>
                <n-rate
                  v-if="activity.formatted.type === 'rate'"
                  readonly
                  size="small"
                  :value="activity.formatted.value"
                  :class="{ 'opacity-5': activity.isDeleted }"
                  class="d-inline-flex align-items-center"
                />
                <n-button
                  v-if="activity.formatted.type === 'like'"
                  quaternary
                  round
                  circle
                  type="error"
                  size="small"
                  :class="{ 'opacity-5': activity.isDeleted }"
                  class="no-events cursor-default max-w-16 max-h-16"
                >
                  <template #icon>
                    <like-icon
                      weight="fill"
                      size="16"
                    />
                  </template>
                </n-button>
              </n-space>
            </template>
          </n-timeline-item>
        </n-timeline>

        <n-space
          v-if="hasMore"
          justify="center"
          class="pt-4"
        >
          <n-button
            :loading="loadingMore"
            size="small"
            @click="loadMore"
          >
            {{ t('timeline.loadMore') }}
          </n-button>
        </n-space>
      </div>
    </n-card>
  </n-space>
</template>

<style lang="scss" scoped>
.n-timeline-item-content__time {
  font-size: 12px;
  margin-top: 4px;
}
</style>
