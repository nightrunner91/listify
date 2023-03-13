<script setup lang="ts">
import { h, ref, type Component } from 'vue'
import { NMenu, NIcon, NBadge, type MenuOption } from 'naive-ui'
import {
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhFilmSlate as FilmsIcon,
  PhBookOpen as BooksIcon,
} from 'phosphor-vue'
import { useGridStore } from '@/stores/grid'

const gridStore = useGridStore()

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
    label: 'Games',
    key: 'games',
    extra: renderExtra(95),
    icon: renderIcon(GamesIcon)
  },
  {
    label: 'TV Shows',
    key: 'tvshows',
    extra: renderExtra(25),
    icon: renderIcon(TvShowsIcon)
  },
  {
    label: 'Films',
    key: 'films',
    extra: renderExtra(586),
    icon: renderIcon(FilmsIcon)
  },
  {
    label: 'Books',
    key: 'books',
    extra: renderExtra(37),
    icon: renderIcon(BooksIcon)
  },
]

defineProps(['collapsed'])
</script>

<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="collapsed"
    :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
    :collapsed-icon-size="20"
    :icon-size="24"
    :options="menuOptions" />
</template>

<style lang="scss">
.n-menu-item-content-header {
  display: flex;

  &__extra {
    margin-left: auto;
  }
}
</style>
