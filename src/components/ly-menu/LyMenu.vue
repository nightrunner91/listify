<script setup lang="ts">
import { h, ref, type Component } from 'vue'
import { NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhFilmSlate as FilmsIcon,
  PhBookOpen as BooksIcon,
} from 'phosphor-vue'

const activeKey = ref<string | null>(null)

function renderIcon (icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: 'Games',
    key: 'games',
    icon: renderIcon(GamesIcon)
  },
  {
    label: 'TV Shows',
    key: 'tvshows',
    icon: renderIcon(TvShowsIcon)
  },
  {
    label: 'Films',
    key: 'films',
    icon: renderIcon(FilmsIcon)
  },
  {
    label: 'Books',
    key: 'books',
    icon: renderIcon(BooksIcon)
  },
]

defineProps(['collapsed'])
</script>

<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="collapsed"
    :collapsed-width="62"
    :collapsed-icon-size="20"
    :icon-size="24"
    :options="menuOptions" />
</template>
