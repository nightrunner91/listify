<script setup>
import { ref, onMounted, computed } from 'vue'
import { NTimeline, NTimelineItem, NCard, NSpace, NText, NEmpty, NSpin } from 'naive-ui'
import { api } from '@/api/client'
import moment from 'moment'
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

  switch (action) {
    case 'record_created':
      return `Added **${entityName}** to ${category}`
    case 'record_status_updated':
      const statusVerb = getLabelName(category, metadata.label)
      return `${statusVerb} **${entityName}**`
    case 'record_score_updated':
      return `Rated **${entityName}** ${metadata.score}/5`
    case 'record_liked':
      return `Added **${entityName}** to favorites`
    case 'record_unliked':
      return `Removed **${entityName}** from favorites`
    case 'record_deleted':
      return `Deleted **${entityName}** from ${category}`
    case 'custom_list_created':
      return `Created a new list **${entityName}**`
    case 'custom_list_deleted':
      return `Deleted list **${entityName}**`
    case 'custom_list_record_added':
      return `Added **${entityName}** to **${metadata.listName}**`
    case 'custom_list_record_deleted':
      return `Removed **${entityName}** from **${metadata.listName}**`
    case 'collection_imported':
      return `Imported a collection with **${metadata.count}** items`
    default:
      return action
  }
}

// Convert markdown-like bolding to HTML
const renderSentence = (sentence) => {
  return sentence.replace(/\*\*(.*?)\*\*/g, '<b class="highlight">$1</b>')
}
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
            <div v-html="renderSentence(formatActivity(activity))"></div>
          </template>
        </n-timeline-item>
      </n-timeline>
    </n-card>
  </n-space>
</template>

<style scoped>
:deep(.highlight) {
  color: var(--n-text-color);
  font-weight: 600;
}

:deep(.n-timeline-item-content__time) {
  font-size: 12px;
  margin-top: 4px;
}
</style>
