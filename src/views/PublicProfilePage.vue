<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  NAvatar,
  NSpace,
  NText,
  NEmpty,
  NSpin,
  NTabs,
  NTabPane,
  NList,
  NTimeline,
  NTimelineItem,
  NCard,
  NRate,
  NButton,
  NIcon
} from 'naive-ui'
import { 
  PhHeart as LikeIcon,
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhSmileyWink as AnimeIcon,
  PhFilmStrip as FilmsIcon,
  PhImageSquare as MangaIcon,
  PhBooks as BooksIcon,
  PhMusicNotes as MusicIcon
} from 'phosphor-vue'
import moment from 'moment'
import 'moment/locale/ru'
import 'moment/locale/ro'
import LyRecord from '@/features/records/components/ly-record/LyRecord.vue'
import { darkThemeOverrides } from '@/theme.config.js'
import { useRecordsStore } from '@/stores/records.store'

const { t, te, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()

const profileData = ref(null)
const loading = ref(true)
const error = ref(null)

const VALID_CATEGORIES = ['games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music']

const categoryIcons = {
  games: GamesIcon,
  tvshows: TvShowsIcon,
  films: FilmsIcon,
  anime: AnimeIcon,
  manga: MangaIcon,
  books: BooksIcon,
  music: MusicIcon
}

const labelPriority = {
  // 1. Ongoing
  'watching_ongoing': 1,
  'read_ongoing': 1,
  'playing_now': 1,
  'listening_now': 1,

  // 2. Currently
  'watching_now': 2,
  'read_now': 2,

  // 3. Plan to...
  'plan_to_watch': 3,
  'plan_to_read': 3,
  'plan_to_play': 3,
  'plan_to_listen': 3,

  // 4. On hold
  'on_hold': 4,

  // 5. Completed / Consumed
  'completed': 5,
  'watched_all': 5,
  'read': 5,
  'watched': 5,
  'listened_all': 5,

  // 6. Dropped
  'dropped': 6,
}

/** @description Records sorted by status (label) and title */
const sortedRecords = computed(() => {
  if (!profileData.value?.records) return {}

  const sorted = {}
  for (const cat of VALID_CATEGORIES) {
    const list = profileData.value.records[cat] || []
    sorted[cat] = [...list].sort((a, b) => {
      const orderA = labelPriority[a.label] ?? 999
      const orderB = labelPriority[b.label] ?? 999
      if (orderA !== orderB) return orderA - orderB
      return (a.title || '').localeCompare(b.title || '')
    })
  }
  return sorted
})

/**
 * @function fetchPublicProfile
 * @description Fetches the public profile data from the API (no auth required)
 */
async function fetchPublicProfile() {
  loading.value = true
  error.value = null
  try {
    let apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '')
    if (apiBase && !apiBase.startsWith('http')) apiBase = `https://${apiBase}`
    if (apiBase.endsWith('/')) apiBase = apiBase.slice(0, -1)
    if (apiBase && !apiBase.endsWith('/api')) apiBase = `${apiBase}/api`

    const response = await fetch(`${apiBase}/public/user/${route.params.id}`)
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (response.status === 404) {
        error.value = data.error === 'PROFILE_PRIVATE' ? 'private' : 'notfound'
      } else {
        error.value = 'notfound'
      }
      return
    }
    profileData.value = await response.json()
  } catch (e) {
    console.error('Failed to fetch public profile:', e)
    error.value = 'notfound'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPublicProfile()
})

/** @description Avatar URL derived from user profile settings */
const avatarUrl = computed(() => {
  const user = profileData.value?.user
  if (!user) return ''
  const style = user.avatarStyle || 'adventurer-neutral'
  const seed = user.avatarSeed || 'default'
  const options = user.avatarOptions || {}
  const query = new URLSearchParams({
    seed,
    flip: (options.flip ?? false).toString(),
    rotate: (options.rotate ?? 0).toString(),
    scale: (options.scale ?? 100).toString(),
  })
  return `https://api.dicebear.com/9.x/${style}/svg?${query.toString()}`
})

/** @description Categories that have at least one record */
const nonEmptyCategories = computed(() => {
  if (!profileData.value?.records) return []
  return VALID_CATEGORIES.filter(cat => {
    const recs = sortedRecords.value[cat]
    return recs && recs.length > 0
  })
})

/**
 * @description Gets the color for a given activity category
 */
function getCategoryColor(category) {
  const colors = darkThemeOverrides.Categories
  return colors[`${category}Color`] || colors.customColor
}

/**
 * @description Formats a raw activity into i18n parameters
 */
function formatActivity(activity) {
  const { action, entityName, category, metadata } = activity
  const categoryLabel = category && te(`categories.${category}`) ? t(`categories.${category}`) : category

  switch (action) {
    case 'record_created':
      return { keypath: 'timeline.actions.record_created', entity: entityName, category: categoryLabel }
    case 'record_status_updated': {
      const statusKey = `timeline.sentences.${metadata?.label}`
      const statusVerb = te(statusKey) ? t(statusKey) : metadata?.label
      return { keypath: 'timeline.actions.record_status_updated', status: statusVerb, entity: entityName }
    }
    case 'record_score_updated':
      return { keypath: 'timeline.actions.record_score_updated', entity: entityName, type: 'rate', value: Number(metadata?.score) }
    case 'record_liked':
      return { keypath: 'timeline.actions.record_liked', entity: entityName, type: 'like' }
    case 'record_unliked':
      return { keypath: 'timeline.actions.record_unliked', entity: entityName }
    case 'record_deleted':
      return { keypath: 'timeline.actions.record_deleted', entity: entityName, category: categoryLabel }
    case 'custom_list_created':
      return { keypath: entityName ? 'timeline.actions.custom_list_created' : 'timeline.actions.custom_list_created_empty', entity: entityName }
    case 'custom_list_renamed':
      return { keypath: 'timeline.actions.custom_list_renamed', entity: entityName }
    case 'custom_list_deleted':
      return { keypath: 'timeline.actions.custom_list_deleted', entity: entityName }
    case 'collection_imported':
      return { keypath: 'timeline.actions.collection_imported', count: metadata?.count }
    default:
      return { keypath: 'timeline.actions.default_action', action }
  }
}

const formattedActivities = computed(() => {
  const currentLocale = locale.value
  moment.locale(currentLocale)
  return (profileData.value?.activities || []).map(activity => ({
    ...activity,
    timeAgo: moment(activity.createdAt).fromNow(),
    formatted: formatActivity(activity)
  }))
})
</script>

<template>
  <div class="min-vh-100">
    <!-- begin::Loading State -->
    <n-space
      v-if="loading"
      justify="center"
      class="py-16"
    >
      <n-spin size="large" />
    </n-space>
    <!-- end::Loading State -->

    <!-- begin::Error State -->
    <n-space
      v-else-if="error"
      justify="center"
      class="py-16"
    >
      <n-empty
        :description="error === 'private' ? t('publicProfile.profilePrivate') : t('publicProfile.profileNotFound')"
      />
    </n-space>
    <!-- end::Error State -->

    <!-- begin::Profile Content -->
    <template v-else-if="profileData">
      <!-- begin::Hero Section -->
      <n-space
        align="center"
        justify="center"
        class="pt-8 pb-12 px-6"
        :style="{ backgroundColor: profileData.user.backgroundColor }"
      >
        <n-space
          vertical
          align="center"
          :size="12"
          class="max-w-530"
        >
          <n-avatar
            round
            :size="72"
            :src="avatarUrl"
            class="shadow-level-3 border-3 public-profile__avatar-border"
          />
          <n-text class="fz-24 font-weight-600 text-white public-profile__username-shadow">
            {{ profileData.user.username || 'Listify User' }}
          </n-text>
        </n-space>
      </n-space>
      <!-- end::Hero Section -->

      <div class="mx-auto pt-6 pb-12 px-4 max-w-1024">
        <!-- begin::Category Tabs -->
        <n-tabs
          v-if="nonEmptyCategories.length > 0"
          type="segment"
          animated
          class="mb-8"
        >
          <n-tab-pane
            v-for="cat in nonEmptyCategories"
            :key="cat"
            :name="cat"
          >
            <template #tab>
              <n-space
                align="center"
                :size="6"
              >
                <n-icon
                  :component="categoryIcons[cat]"
                  size="18"
                />
                <span>{{ t(`categories.${cat}`) }}</span>
                <n-text
                  depth="3"
                  class="fz-12 font-weight-400"
                >
                  {{ sortedRecords[cat].length }}
                </n-text>
              </n-space>
            </template>

            <n-list class="mt-4">
                <ly-record
                v-for="(record, index) in sortedRecords[cat]"
                :key="record.id"
                :index="index"
                :record="record"
                :readonly="true"
              />
            </n-list>
          </n-tab-pane>
        </n-tabs>
        <!-- end::Category Tabs -->

        <!-- begin::Empty State -->
        <n-empty
          v-else
          :description="t('publicProfile.noActivity')"
          class="py-16"
        />
        <!-- end::Empty State -->

        <!-- begin::Activity Timeline -->
        <n-space
          v-if="formattedActivities.length > 0"
          vertical
          :size="12"
        >
          <n-text
            depth="3"
            class="fz-12 font-weight-600 letter-spacing-1"
          >
            {{ t('publicProfile.latestActivity') }}
          </n-text>
          <n-timeline class="pt-5">
            <n-timeline-item
              v-for="activity in formattedActivities"
              :key="activity.id"
              :color="getCategoryColor(activity.category)"
              :time="activity.timeAgo"
            >
              <template #default>
                <n-space
                  align="center"
                  :size="8"
                  class="line-height-1"
                >
                  <i18n-t
                    :keypath="activity.formatted.keypath"
                    tag="span"
                    class="mr-1"
                  >
                    <template #entity>
                      <span
                        v-if="activity.formatted.entity"
                        class="font-weight-500"
                      >{{ activity.formatted.entity }}</span>
                    </template>
                    <template #category>
                      <span v-if="activity.formatted.category">{{ activity.formatted.category }}</span>
                    </template>
                    <template #status>
                      <span v-if="activity.formatted.status">{{ activity.formatted.status }}</span>
                    </template>
                    <template #count>
                      <span v-if="activity.formatted.count">{{ activity.formatted.count }}</span>
                    </template>
                    <template #action>
                      <span v-if="activity.formatted.action">{{ activity.formatted.action }}</span>
                    </template>
                  </i18n-t>
                  <n-rate
                    v-if="activity.formatted.type === 'rate'"
                    readonly
                    size="small"
                    :value="activity.formatted.value"
                    class="d-inline-flex align-items-center"
                  />
                  <n-button
                    v-if="activity.formatted.type === 'like'"
                    quaternary
                    round
                    circle
                    type="error"
                    size="small"
                    class="no-events cursor-default ml-n1 max-w-16 max-h-16"
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
        </n-space>
        <!-- end::Activity Timeline -->
      </div>
    </template>
    <!-- end::Profile Content -->
  </div>
</template>

<style lang="scss" scoped>
.public-profile {
  &__avatar-border {
    border-color: rgba(255, 255, 255, 0.3) !important;
  }

  &__username-shadow {
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  }
}
</style>
