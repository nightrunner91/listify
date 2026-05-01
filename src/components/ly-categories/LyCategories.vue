<script setup>
import { ref, computed, onMounted } from 'vue'
import { NGrid, NGridItem, NIcon, NCard, NSkeleton, NStatistic, NSpace, NNumberAnimation } from 'naive-ui'
import {
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhFilmStrip as FilmsIcon,
  PhSmileyWink as AnimeIcon,
  PhImageSquare as MangaIcon,
  PhBooks as BooksIcon,
  PhMusicNotes as MusicIcon,
} from 'phosphor-vue'
import { useRouter } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'
import { useThemeStore } from '@/stores/theme.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()


const router = useRouter()
const recordsStore = useRecordsStore()
const gridStore = useGridStore()
const themeStore = useThemeStore()

const isLoading = ref(true)

onMounted(() => {
  isLoading.value = false
})

const categories = computed(() => [
  {
    key: 'games',
    label: t('categories.games'),
    route: 'Games',
    icon: GamesIcon 
  },
  {
    key: 'tvshows',
    label: t('categories.tvshows'),
    route: 'TVShows',
    icon: TvShowsIcon 
  },
  {
    key: 'films',
    label: t('categories.films'),
    route: 'Films',
    icon: FilmsIcon 
  },
  {
    key: 'anime',
    label: t('categories.anime'),
    route: 'Anime',
    icon: AnimeIcon 
  },
  {
    key: 'manga',
    label: t('categories.manga'),
    route: 'Manga',
    icon: MangaIcon 
  },
  {
    key: 'books',
    label: t('categories.books'),
    route: 'Books',
    icon: BooksIcon 
  },
  {
    key: 'music',
    label: t('categories.music'),
    route: 'Music',
    icon: MusicIcon 
  },
])

const gridCols = computed(() => {
  const bp = gridStore.currentBreakpoint
  if (bp === 'xs') return 1
  if (bp === 's') return 2
  if (bp === 'm') return 3
  return 4
})

function getCount(key) {
  return recordsStore.recordsLength(key)
}

function getIconColor(key) {
  return themeStore.categoryColor(key) || 'var(--n-text-color)'
}
</script>

<template>
  <n-grid
    :cols="gridCols"
    :x-gap="24"
    :y-gap="24"
  >
    <template
      v-if="isLoading"
    >
      <n-grid-item
        v-for="n in 6"
        :key="n"
      >
        <n-card
          size="small"
          style="height: 90px; border-radius: 12px;"
        >
          <n-skeleton
            text
            :repeat="2"
          />
        </n-card>
      </n-grid-item>
    </template>

    <template
      v-else
    >
      <n-grid-item
        v-for="cat in categories"
        :key="cat.key"
      >
        <n-card
          size="medium"
          class="category-card"
          @click="router.push({ name: cat.route })"
        >
          <n-space
            align="center"
            :wrap="false"
            justify="space-between"
          >
            <n-statistic
              :label="cat.label"
            >
              <n-number-animation
                :to="getCount(cat.key).value"
                class="category-number"
              />
            </n-statistic>
            <n-icon
              :size="28"
              :color="getIconColor(cat.key)"
              class="category-icon"
            >
              <component
                :is="cat.icon"
                weight="duotone"
              />
            </n-icon>
          </n-space>
        </n-card>
      </n-grid-item>
    </template>
  </n-grid>
</template>

<style scoped>
.category-card {
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.category-card:hover {
  background-color: var(--n-action-color);
}
.category-icon {
  opacity: 0.85;
}
</style>
