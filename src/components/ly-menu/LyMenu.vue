<script setup lang="ts">
import { h, ref, type Component } from 'vue'
import { NMenu, NIcon, NBadge, type MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import {
  PhHeart as FavouritesIcon,
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhFilmSlate as FilmsIcon,
  PhBookOpen as BooksIcon,
  PhPlus as NewIcon,
} from 'phosphor-vue'
import { useGridStore } from '@/stores/grid'
import { useMenuStore } from '@/stores/menu'

const gridStore = useGridStore()
const menuStore = useMenuStore()

const activeKey = ref<string | null>(null)

function renderExtra (total: number) {
  return () => h(NBadge, {
    class: 'ml-auto',
    value: total,
    max: 1000,
    showZero: true,
  })
}

function renderIcon (icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'Favourites' } },
        { default: () => 'Favourites' }
      ),
    key: 'favourites',
    extra: renderExtra(1299),
    icon: renderIcon(FavouritesIcon)
  },
  {
    key: 'divider-1',
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
        { to: { name: 'Books' } },
        { default: () => 'Books' }
      ),
    key: 'books',
    extra: renderExtra(37),
    icon: renderIcon(BooksIcon)
  },
  {
    key: 'divider-2',
    type: 'divider',
  },
  {
    label: 'Create a New List',
    key: 'create-new',
    icon: renderIcon(NewIcon)
  },
]
</script>

<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="menuStore.collapsed"
    :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
    :collapsed-icon-size="24"
    :icon-size="24"
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
