<script setup>
import { ref, onMounted, computed } from 'vue'
import { NTimeline, NTimelineItem, NCard, NSpace, NText, NEmpty, NSpin, NRate, NButton, NIcon } from 'naive-ui'
import { api } from '@/api/client'
import moment from 'moment'
import 'moment/locale/ru'
import 'moment/locale/ro'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import { darkThemeOverrides } from '@/theme.config.js'
import { useI18n } from 'vue-i18n'

const { t, te, locale } = useI18n()

const activities = ref([])
const loading = ref(true)

const fetchActivities = async () => {
  try {
    const data = await api.get('/activities')
    activities.value = data
  } catch (err) {
    console.error('Failed to fetch activities:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivities()
})

const getCategoryColor = (category) => {
  const colors = darkThemeOverrides.Categories
  return colors[`${category}Color`] || colors.customColor
}

const formatActivity = (activity) => {
  const { action, entityName, category, metadata } = activity
  const categoryLabel = category && te(`categories.${category}`) ? t(`categories.${category}`) : category

  switch (action) {
    case 'record_created':
      return {
        keypath: 'timeline.actions.record_created',
        entity: entityName,
        category: categoryLabel
      }
    case 'record_status_updated':
      const statusKey = `timeline.sentences.${metadata?.label}`
      const statusVerb = te(statusKey) ? t(statusKey) : metadata?.label
      return {
        keypath: 'timeline.actions.record_status_updated',
        status: statusVerb,
        entity: entityName
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
  // Read locale to trigger reactivity when language changes
  const currentLocale = locale.value
  moment.locale(currentLocale)
  
  return activities.value.map(activity => {
    return {
      ...activity,
      timeAgo: moment(activity.createdAt).fromNow(),
      formatted: formatActivity(activity)
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
        class="section-title"
      >
        {{ t('timeline.title') }}
      </n-text>
    </n-space>

    <n-card
      :bordered="true"
    >
      <div
        v-if="loading"
        class="flex justify-center py-8"
      >
        <n-spin
          size="large"
        />
      </div>

      <n-empty
        v-else-if="activities.length === 0"
        :description="t('timeline.empty')"
        class="py-8"
      />

      <n-timeline
        v-else
      >
        <n-timeline-item
          v-for="activity in formattedActivities"
          :key="activity.id"
          :type="activity.category === 'system' ? 'info' : 'default'"
          :color="getCategoryColor(activity.category)"
          :time="activity.timeAgo"
        >
          <template
            #default
          >
            <div
              class="activity-item"
            >
              <i18n-t
                :keypath="activity.formatted.keypath"
                tag="span"
                class="activity-text"
              >
                <template
                  #entity
                >
                  <span
                    v-if="activity.formatted.entity"
                    class="highlight"
                  >{{ activity.formatted.entity }}</span>
                </template>
                <template
                  #category
                >
                  <span
                    v-if="activity.formatted.category"
                  >{{ activity.formatted.category }}</span>
                </template>
                <template
                  #status
                >
                  <span
                    v-if="activity.formatted.status"
                  >{{ activity.formatted.status }}</span>
                </template>
                <template
                  #listName
                >
                  <span
                    v-if="activity.formatted.listName"
                    class="highlight"
                  >{{ activity.formatted.listName }}</span>
                </template>
                <template
                  #count
                >
                  <span
                    v-if="activity.formatted.count"
                  >{{ activity.formatted.count }}</span>
                </template>
                <template
                  #action
                >
                  <span
                    v-if="activity.formatted.action"
                  >{{ activity.formatted.action }}</span>
                </template>
              </i18n-t>
              
              <n-rate 
                v-if="activity.formatted.type === 'rate'" 
                readonly 
                size="small" 
                :value="activity.formatted.value"
                class="activity-widget"
              />
              
              <n-button
                v-if="activity.formatted.type === 'like'"
                quaternary
                round
                circle
                type="error"
                size="small"
                class="activity-widget liked-widget"
              >
                <template
                  #icon
                >
                  <like-icon
                    weight="fill"
                    size="16"
                  />
                </template>
              </n-button>
            </div>
          </template>
        </n-timeline-item>
      </n-timeline>
    </n-card>
  </n-space>
</template>

<style scoped>
:deep(.highlight) {
  color: var(--n-text-color);
  font-weight: 500;
}

.activity-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1;
  gap: 0.5rem;
  max-height: 24px;
}

.activity-text {
  margin-right: 4px;
}

.activity-widget {
  display: inline-flex;
  vertical-align: middle;
}

.liked-widget {
  pointer-events: none;
  cursor: default;
  margin-left: -4px; /* Adjust for circle button padding */
  max-width: 16px;
  max-height: 16px;
}

:deep(.n-timeline-item-content__time) {
  font-size: 12px;
  margin-top: 4px;
}
</style>
