<script setup>
import { ref, onMounted, computed } from 'vue'
import { NTimeline, NTimelineItem, NCard, NSpace, NText, NEmpty, NSpin, NRate, NButton, NIcon } from 'naive-ui'
import { api } from '@/api/client'
import moment from 'moment'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import { darkThemeOverrides } from '@/theme.config.js'

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

const categoryLabels = {
  games: 'Games',
  tvshows: 'TV Shows',
  films: 'Films',
  anime: 'Anime',
  manga: 'Manga',
  books: 'Books',
  music: 'Music'
}

const getLabelName = (category, label) => {
  // Simplified mapping for activity sentences
  const mapping = {
    games: {
      playing_now: 'Started playing',
      completed: 'Completed',
      dropped: 'Dropped',
      on_hold: 'Put on hold',
      plan_to_play: 'Added to Plan to Play',
    },
    tvshows: {
      watching_now: 'Started watching',
      watched_all: 'Watched all of',
      dropped: 'Dropped',
      on_hold: 'Put on hold',
      plan_to_watch: 'Added to Plan to Watch',
      watching_ongoing: 'Started watching ongoing',
    },
    anime: {
      watching_now: 'Started watching',
      watched_all: 'Watched all of',
      dropped: 'Dropped',
      on_hold: 'Put on hold',
      plan_to_watch: 'Added to Plan to Watch',
      watching_ongoing: 'Started watching ongoing',
    },
    films: {
      watched: 'Watched',
      dropped: 'Dropped',
      plan_to_watch: 'Added to Plan to Watch',
    },
    manga: {
      read_now: 'Started reading',
      read: 'Read',
      dropped: 'Dropped',
      on_hold: 'Put on hold',
      plan_to_read: 'Added to Plan to Read',
      read_ongoing: 'Started reading ongoing',
    },
    books: {
      read_now: 'Started reading',
      read: 'Read',
      dropped: 'Dropped',
      on_hold: 'Put on hold',
      plan_to_read: 'Added to Plan to Read',
    },
    music: {
      listening_now: 'Started listening',
      listened_all: 'Listened all of',
      dropped: 'Dropped',
      on_repeat: 'Listening on repeat',
      plan_to_listen: 'Added to Plan to Listen',
    }
  }

  return mapping[category]?.[label] || label
}

const formatActivity = (activity) => {
  const { action, entityName, category, metadata } = activity
  const categoryLabel = categoryLabels[category] || category

  switch (action) {
    case 'record_created':
      return {
        prefix: 'Added',
        entity: entityName,
        suffix: `to ${categoryLabel}`
      }
    case 'record_status_updated':
      const statusVerb = getLabelName(category, metadata.label)
      return {
        prefix: statusVerb,
        entity: entityName
      }
    case 'record_score_updated':
      return {
        prefix: 'Rated',
        entity: entityName,
        type: 'rate',
        value: Number(metadata.score)
      }
    case 'record_liked':
      return {
        prefix: 'Liked',
        entity: entityName,
        type: 'like'
      }
    case 'record_unliked':
      return {
        prefix: 'Unliked',
        entity: entityName
      }
    case 'record_deleted':
      return {
        prefix: 'Deleted',
        entity: entityName,
        suffix: `from ${categoryLabel}`
      }
    case 'custom_list_created':
      return {
        prefix: entityName ? 'Created a new list' : 'Created a new custom list',
        entity: entityName
      }
    case 'custom_list_renamed':
      return {
        prefix: 'Renamed custom list as',
        entity: entityName
      }
    case 'custom_list_deleted':
      return {
        prefix: 'Deleted list',
        entity: entityName
      }
    case 'custom_list_record_added':
      return {
        prefix: 'Added',
        entity: entityName,
        suffix: `to ${metadata.listName}`
      }
    case 'custom_list_record_deleted':
      return {
        prefix: 'Removed',
        entity: entityName,
        suffix: `from ${metadata.listName}`
      }
    case 'collection_imported':
      return {
        prefix: 'Imported a collection with',
        entity: `${metadata.count} items`
      }
    default:
      return {
        prefix: action
      }
  }
}

// Convert markdown-like bolding to HTML - No longer used but kept for compatibility if needed elsewhere
// const renderSentence = (sentence) => {
//   return sentence.replace(/\*\*(.*?)\*\*/g, '<b class="highlight">$1</b>')
// }
</script>

<template>
  <n-space vertical :size="16">
    <n-space justify="space-between" align="center">
      <n-text depth="3" class="section-title">RECENT ACTIVITY</n-text>
    </n-space>

    <n-card :bordered="true">
      <div v-if="loading" class="flex justify-center py-8">
        <n-spin size="large" />
      </div>

      <n-empty v-else-if="activities.length === 0" description="No recent activity yet" class="py-8" />

      <n-timeline v-else>
        <n-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :type="activity.category === 'system' ? 'info' : 'default'"
          :color="getCategoryColor(activity.category)"
          :time="moment(activity.createdAt).fromNow()"
        >
          <template #default>
            <div class="activity-item">
              <span class="activity-text">
                {{ formatActivity(activity).prefix }}
                <span class="highlight" v-if="formatActivity(activity).entity"> {{ formatActivity(activity).entity }}</span>
                <span v-if="formatActivity(activity).suffix" class="ml-1"> {{ formatActivity(activity).suffix }}</span>
              </span>
              
              <n-rate 
                v-if="formatActivity(activity).type === 'rate'" 
                readonly 
                size="small" 
                :value="formatActivity(activity).value"
                class="activity-widget"
              />
              
              <n-button
                v-if="formatActivity(activity).type === 'like'"
                quaternary
                round
                circle
                type="error"
                size="small"
                class="activity-widget liked-widget"
              >
                <template #icon>
                  <like-icon weight="fill" size="16" />
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
