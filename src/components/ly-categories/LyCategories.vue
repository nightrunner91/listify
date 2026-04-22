<script setup>
import { ref, computed, onMounted } from 'vue'
import { NGrid, NGridItem, NIcon, NCard, NSkeleton, NText, NSpace } from 'naive-ui'
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
import { useThemeStore } from '@/stores/theme.store'
import { useGridStore } from '@/stores/grid.store'

const router = useRouter()
const recordsStore = useRecordsStore()
const themeStore = useThemeStore()
const gridStore = useGridStore()

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

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

function cardStyle(key) {
  const color = themeStore.categoryColor(key)
  return { '--card-rgb': hexToRgb(color) }
}

const isLightTheme = computed(() => !themeStore.currentTheme)

function getCount(key) {
  return recordsStore.recordsLength(key).value
}
</script>

<template>
  <n-grid :cols="gridCols" :x-gap="24" :y-gap="24">
    <template v-if="isLoading">
      <n-grid-item v-for="n in 6" :key="n">
        <n-skeleton class="card-skeleton" :sharp="false" />
      </n-grid-item>
    </template>

    <template v-else>
      <n-grid-item v-for="cat in categories" :key="cat.key">
        <n-card
          class="category-card"
          :class="{ 'category-card--light': isLightTheme }"
          :style="cardStyle(cat.key)"
          @click="router.push({ name: cat.route })"
        >
          <n-space justify="space-between" :wrap="false" align="center" style="width: 100%" class="mb-5">
            <n-text class="card-title" strong>{{ cat.label }}</n-text>
            <n-icon class="card-icon" :size="26">
              <component :is="cat.icon" weight="regular" />
            </n-icon>
          </n-space>

          <n-text
            class="card-count"
            :class="{ 'card-count--empty': getCount(cat.key) === 0 }"
            tag="div"
          >
            {{ getCount(cat.key) }}
          </n-text>

          <n-text
            class="card-description"
            :class="{ 'card-description--empty': getCount(cat.key) === 0 }"
            :depth="getCount(cat.key) > 0 ? 3 : 3"
            tag="span"
          >
            {{ getCount(cat.key) > 0 ? 'items added' : 'nothing here yet' }}
          </n-text>
        </n-card>
      </n-grid-item>
    </template>
  </n-grid>
</template>

<style scoped lang="scss">
.card-skeleton {
  height: 130px;
}

.category-card {
  border-color: rgba(var(--card-rgb), 0.36);
  background: linear-gradient(165deg, rgba(var(--card-rgb), 0.1) 0%, rgba(var(--card-rgb), 0.07) 52%, rgba(var(--card-rgb), 0.01) 100%);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease, transform 200ms ease;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--card-rgb), 0.62);
    background: linear-gradient(165deg, rgba(var(--card-rgb), 0.43) 0%, rgba(var(--card-rgb), 0.37) 52%, rgba(var(--card-rgb), 0.3) 100%);
  }

  &--light {
    border-color: rgba(var(--card-rgb), 0.4);
    background: linear-gradient(165deg, rgba(var(--card-rgb), 0.89) 0%, rgba(var(--card-rgb), 0.8) 52%, rgba(var(--card-rgb), 0.72) 100%);
    box-shadow: 0 8px 20px rgba(var(--card-rgb), 0.25);

    .card-title,
    .card-count,
    .card-icon {
      color: rgb(255, 255, 255);
    }

    .card-description {
      color: rgba(255, 255, 255, 0.92);
    }

    .card-count--empty {
      opacity: 0.85;
    }

    .card-description--empty {
      opacity: 0.75;
    }

    .card-icon {
      color: rgb(255, 255, 255);
      opacity: 1;
    }

    &:hover {
      border-color: rgba(var(--card-rgb), 0.58);
      background: linear-gradient(165deg, rgba(var(--card-rgb), 0.96) 0%, rgba(var(--card-rgb), 0.87) 52%, rgba(var(--card-rgb), 0.79) 100%);

      .card-icon {
        color: rgb(255, 255, 255);
      }
    }
  }
}

.card-title {
  font-size: 18px;
}

.card-icon {
  color: rgba(var(--card-rgb), 1);
  opacity: 0.92;
  flex-shrink: 0;
}

.card-count {
  font-size: 44px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -1px;
  margin-top: 4px;

  &--empty {
    opacity: 0.38;
  }
}

.card-description {
  font-size: 13px;

  &--empty {
    opacity: 0.58;
  }
}
</style>
