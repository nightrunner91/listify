<script setup>
import { ref, computed, onMounted } from 'vue'
import { NGrid, NGridItem, NIcon, NCard, NSkeleton, NStatistic, NSpace } from 'naive-ui'
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
import LyAnimatedCounter from '@/components/ly-animated-counter/LyAnimatedCounter.vue'

const router = useRouter()
const recordsStore = useRecordsStore()
const gridStore = useGridStore()
const themeStore = useThemeStore()

const isLoading = ref(true)

onMounted(() => {
  isLoading.value = false
})

const categories = [
  { key: 'games',   label: 'Games',    route: 'Games',   icon: GamesIcon },
  { key: 'tvshows', label: 'TV Shows', route: 'TVShows', icon: TvShowsIcon },
  { key: 'films',   label: 'Films',    route: 'Films',   icon: FilmsIcon },
  { key: 'anime',   label: 'Anime',    route: 'Anime',   icon: AnimeIcon },
  { key: 'manga',   label: 'Manga',    route: 'Manga',   icon: MangaIcon },
  { key: 'books',   label: 'Books',    route: 'Books',   icon: BooksIcon },
  { key: 'music',   label: 'Music',    route: 'Music',   icon: MusicIcon },
]

const gridCols = computed(() => {
  const bp = gridStore.currentBreakpoint
  if (bp === 'xs' || bp === 's') return 1
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
  <n-grid :cols="gridCols" :x-gap="24" :y-gap="24">
    <template v-if="isLoading">
      <n-grid-item v-for="n in 6" :key="n">
        <n-card size="small" style="height: 90px; border-radius: 12px;">
          <n-skeleton text :repeat="2" />
        </n-card>
      </n-grid-item>
    </template>

    <template v-else>
      <n-grid-item v-for="cat in categories" :key="cat.key">
        <n-card
          size="medium"
          class="category-card"
          @click="router.push({ name: cat.route })"
        >
          <n-space align="center" :wrap="false" justify="space-between">
            <n-statistic :label="cat.label">
              <ly-animated-counter :target="getCount(cat.key).value" />
            </n-statistic>
            <n-icon :size="32" :color="getIconColor(cat.key)" class="category-icon">
              <component :is="cat.icon" weight="duotone" />
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
  border-radius: 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.category-card:hover {
  background-color: var(--n-action-color);
}
.category-icon {
  opacity: 0.85;
}
</style>
