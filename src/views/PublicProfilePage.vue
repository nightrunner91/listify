<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted
} from 'vue'
import {
  useRoute, useRouter 
} from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  NAvatar,
  NSpace,
  NText,
  NEmpty,
  NSpin,
  NCard,
  NTabs,
  NTabPane,
  NList,
  NLayoutHeader,
  useThemeVars
} from 'naive-ui'
import LyRecord from '@/features/records/components/ly-record/LyRecord.vue'
import LyGithub from '@/components/base/ly-github/LyGithub.vue'
import LyVersion from '@/components/base/ly-version/LyVersion.vue'
import LyScroller from '@/components/base/ly-scroller/LyScroller.vue'
import LyActivityTimeline from '@/features/start/components/ly-activity-timeline/LyActivityTimeline.vue'
import { darkThemeOverrides } from '@/theme.config.js'
import {
  CATEGORIES, CATEGORY_ICONS, sortRecords
} from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'

const {
  t, locale
} = useI18n()
const route = useRoute()
const router = useRouter()
const gridStore = useGridStore()
const themeVars = useThemeVars()

const logoColor = darkThemeOverrides.Categories.startColor

const profileData = ref(null)
const loading = ref(true)
const error = ref(null)

/** @description Records sorted by status (label) and title */
const sortedRecords = computed(() => {
  if (!profileData.value?.records) return {}

  const sorted = {}
  for (const cat of CATEGORIES) {
    const list = profileData.value.records[cat] || []
    sorted[cat] = sortRecords(list, 'label')
  }
  return sorted
})

/** @description Dynamic text color for header to maintain contrast */
const headerTextColor = computed(() => {
  const bg = profileData.value?.user?.backgroundColor
  if (!bg) return '#ffffff'
  
  const hex = bg.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
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

    const response = await fetch(`${apiBase}/public/user/${route.params.identifier}`)
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

function handleScroll() {
  gridStore.scrollPosition = window.scrollY
}

onMounted(() => {
  fetchPublicProfile()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// Refetch if the identifier changes (e.g. navigating between profiles)
watch(
  () => route.params.identifier,
  () => {
    fetchPublicProfile()
  }
)

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const tabsRef = ref(null)

/**
 * @function handleTabChange
 * @description Smart scroll logic to align the viewport with the top of the tab container if the user scrolls past it.
 */
function handleTabChange() {
  if (tabsRef.value) {
    const tabsEl = tabsRef.value.$el
    if (tabsEl) {
      const rect = tabsEl.getBoundingClientRect()
      if (rect.top < 0) {
        window.scrollTo({
          top: window.scrollY + rect.top,
          behavior: 'smooth'
        })
      }
    }
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' 
  })
}

function scrollToBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth' 
  })
}

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
  return CATEGORIES.filter(cat => {
    const recs = sortedRecords.value[cat]
    return recs && recs.length > 0
  })
})

// Update page title
watch(
  [() => profileData.value?.user?.username, locale],
  ([username]) => {
    if (profileData.value?.user) {
      const name = username || t('publicProfile.defaultUsername') || 'Listify User'
      document.title = `${name} - Listify`
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-vh-100 d-flex flex-column">
    <!-- begin::Branding Navbar -->
    <n-layout-header
      bordered
      class="public-profile__navbar w-100 d-flex justify-content-center align-items-center h-56"
      @click="router.push('/')"
    >
      <div class="d-flex fz-20 font-weight-500 no-select">
        <span :style="{ color: logoColor }">Li</span>
        <n-text depth="2">
          stify
        </n-text>
      </div>
    </n-layout-header>
    <!-- end::Branding Navbar -->

    <!-- begin::Loading State -->
    <n-space
      v-if="loading"
      justify="center"
      :wrap-item="false"
      class="public-content"
    >
      <n-spin size="large" class="mt-16" />
    </n-space>
    <!-- end::Loading State -->

    <!-- begin::Error State -->
    <n-space
      v-else-if="error"
      :wrap-item="false"
      justify="center"
      class="public-content"
    >
      <n-empty
        :description="error === 'private' ? t('publicProfile.profilePrivate') : t('publicProfile.profileNotFound')"
        class="mt-16"
      />
    </n-space>
    <!-- end::Error State -->

    <!-- begin::Profile Content -->
    <template v-else-if="profileData">
      <!-- begin::Hero Section -->
      <n-space
        :wrap-item="false"
        align="center"
        justify="center"
        class="py-6 py-l-8 px-6"
        :style="{ backgroundColor: profileData.user.backgroundColor }"
      >
        <n-space
          :wrap-item="false"
          vertical
          align="center"
          size="small"
        >
          <n-avatar
            round
            :size="72"
            :src="avatarUrl"
          />
          <n-text
            class="fz-24 font-weight-600"
            :style="{ color: headerTextColor }"
          >
            {{ profileData.user.username || 'Listify User' }}
          </n-text>
        </n-space>
      </n-space>
      <!-- end::Hero Section -->

      <div class="mx-auto pt-2 pb-12 w-100 max-w-1024">
        <!-- begin::Category Tabs -->
        <n-tabs
          v-if="nonEmptyCategories.length > 0"
          ref="tabsRef"
          type="segment"
          animated
          class="mb-8 public-profile__tabs"
          @update:value="handleTabChange"
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
                :wrap-item="false"
                :wrap="false"
                class="py-1 px-4"
              >
                <n-icon
                  :component="CATEGORY_ICONS[cat]"
                  size="18"
                />
                <span class="lh-1">{{ t(`categories.${cat}`) }}</span>
                <n-text
                  depth="3"
                  class="fz-12 font-weight-400 lh-1"
                >
                  {{ sortedRecords[cat].length }}
                </n-text>
              </n-space>
            </template>

            <n-list class="mt-4 px-2">
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
          class="mt-16"
        />
        <!-- end::Empty State -->
      </div>

      
      <!-- begin::Activity Timeline -->
      <n-card class="py-8 py-md-16 rounded-none">
        <n-space
          vertical
          :size="12"
          :wrap-item="false"
          class="max-w-1024 mx-auto"
        >
          <ly-activity-timeline :edit-mode="false" />
        </n-space>
      </n-card>
      <!-- end::Activity Timeline -->
    </template>
    <!-- end::Profile Content -->

    <ly-scroller
      @scrollTop="scrollToTop"
      @scrollBottom="scrollToBottom"
    />

    <n-layout-footer class="mt-auto px-4">
      <div class="mx-auto py-4 max-w-1024">
        <n-space
          :wrap-item="false"
          align="center"
          justify="space-between"
          class="h-100 w-100"
        >
          <ly-version />
          <ly-github />
        </n-space>
      </div>
    </n-layout-footer>
  </div>
</template>

<style lang="scss" scoped>
.public-content {
  min-height: calc(100vh - 56px - 60px);
}

.public-profile {
  &__navbar {
    cursor: pointer;
    transition: opacity 0.2s ease, background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(128, 128, 128, 0.1);
    }
  }

  &__tabs {
    :deep(.n-tabs-nav) {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: color-mix(in srgb, v-bind('themeVars.bodyColor') 80%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding-top: 8px;
      margin-top: -8px;
      margin-bottom: 8px;
      padding-left: 8px;
      padding-right: 8px;

      // begin::Mobile Scroll Support
      @media (max-width: 768px) {
        .n-tabs-rail {
          overflow-x: auto !important;
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          &::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        .n-tabs-tab {
          flex-shrink: 0 !important;
        }
      }
      // end::Mobile Scroll Support
    }
  }
}
</style>
