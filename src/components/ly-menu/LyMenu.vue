<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { NMenu, NBadge, type MenuOption } from 'naive-ui'
import { RouterLink, useRoute } from 'vue-router'
import {
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhSparkle as AnimeIcon,
  PhFilmStrip as FilmsIcon,
  PhNotebook as MangaIcon,
  PhBooks as BooksIcon,
  PhMusicNotes as MusicIcon,
  PhPlus as NewIcon,
  PhHouse as StartIcon,
} from 'phosphor-vue'
import { useGridStore } from '@/stores/grid.store'
import { useMenuStore } from '@/stores/menu.store'
import { renderIcon } from '@/utils/render-icon'

const gridStore = useGridStore()
const menuStore = useMenuStore()
const route = useRoute()

const activeKey = ref<any>(null)

function renderExtra (total: number) {
  return () => h(NBadge, {
    class: 'ml-auto',
    value: total,
    max: 1000,
    showZero: true,
  })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Start' } },
        { default: () => 'Home' }
      ),
    key: 'start',
    icon: renderIcon(StartIcon),
  },
  {
    key: 'divider-2',
    type: 'divider',
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Games' } },
        { default: () => 'Games' }
      ),
    key: 'games',
    extra: renderExtra(95),
    icon: renderIcon(GamesIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'TVShows' } },
        { default: () => 'TV Shows' }
      ),
    key: 'tvshows',
    extra: renderExtra(25),
    icon: renderIcon(TvShowsIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Films' } },
        { default: () => 'Films' }
      ),
    key: 'films',
    extra: renderExtra(586),
    icon: renderIcon(FilmsIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Anime' } },
        { default: () => 'Anime' }
      ),
    key: 'anime',
    extra: renderExtra(13),
    icon: renderIcon(AnimeIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Manga' } },
        { default: () => 'Manga' }
      ),
    key: 'manga',
    extra: renderExtra(85),
    icon: renderIcon(MangaIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Books' } },
        { default: () => 'Books' }
      ),
    key: 'books',
    extra: renderExtra(37),
    icon: renderIcon(BooksIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Music' } },
        { default: () => 'Music' }
      ),
    key: 'music',
    extra: renderExtra(64),
    icon: renderIcon(MusicIcon)
  },
  {
    key: 'divider-2',
    type: 'divider',
  },
  {
    label: 'Create a New List',
    key: 'create-new',
    icon: renderIcon(NewIcon),
    disabled: true,
  },
]

watch(route, () => {
  activeKey.value = route.meta.tag
}, { flush: 'pre', immediate: true, deep: true })
</script>

<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="menuStore.collapsed"
    :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
    :collapsed-icon-size="24"
    :icon-size="28"
    :options="menuOptions"
    @update:value="menuStore.closeMenu" />
</template>

<style lang="scss">
.n-menu-divider {
  margin: spacer(4);
}

.n-menu-item-content-header {
  display: flex;

  &__extra {
    margin-left: auto;
  }
}
</style>
