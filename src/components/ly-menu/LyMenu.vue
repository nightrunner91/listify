<script setup>
import { h, ref, watch, computed } from 'vue'
import { NMenu, NBadge } from 'naive-ui'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  PhGameController as GamesIcon,
  PhTelevision as TvShowsIcon,
  PhSmileyWink as AnimeIcon,
  PhFilmStrip as FilmsIcon,
  PhImageSquare as MangaIcon,
  PhBooks as BooksIcon,
  PhMusicNotes as MusicIcon,
  PhPlus as NewIcon,
  PhHouse as StartIcon,
  PhList as CustomIcon,
  PhInfo as AboutIcon
} from 'phosphor-vue'
import { useGridStore } from '@/stores/grid.store'
import { useMenuStore } from '@/stores/menu.store'
import { useRecordsStore } from '@/stores/records.store'
import { renderIcon } from '@/utils/render-icon'

const { t } = useI18n()
const gridStore = useGridStore()
const menuStore = useMenuStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const router = useRouter()

const activeKey = ref(null)
const iconsStyle = 'regular'

function renderExtra (total) {
  return () => h(NBadge, {
    class: 'ml-auto',
    value: total,
    max: 1000,
    showZero: true,
  })
}

const menuOptions = computed(() => {
  const baseOptions = [
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Start' } },
          { default: () => t('menu.home') }
        ),
      key: 'start',
      icon: renderIcon(StartIcon, { weight: iconsStyle }),
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
          { default: () => t('categories.games') }
        ),
      key: 'games',
      extra: renderExtra(recordsStore.recordsLength('games').value),
      icon: renderIcon(GamesIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'TVShows' } },
          { default: () => t('categories.tvshows') }
        ),
      key: 'tvshows',
      extra: renderExtra(recordsStore.recordsLength('tvshows').value),
      icon: renderIcon(TvShowsIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Films' } },
          { default: () => t('categories.films') }
        ),
      key: 'films',
      extra: renderExtra(recordsStore.recordsLength('films').value),
      icon: renderIcon(FilmsIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Anime' } },
          { default: () => t('categories.anime') }
        ),
      key: 'anime',
      extra: renderExtra(recordsStore.recordsLength('anime').value),
      icon: renderIcon(AnimeIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Manga' } },
          { default: () => t('categories.manga') }
        ),
      key: 'manga',
      extra: renderExtra(recordsStore.recordsLength('manga').value),
      icon: renderIcon(MangaIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Books' } },
          { default: () => t('categories.books') }
        ),
      key: 'books',
      extra: renderExtra(recordsStore.recordsLength('books').value),
      icon: renderIcon(BooksIcon, { weight: iconsStyle })
    },
    {
      label: () =>
        h(
          RouterLink,
          { to: { name: 'Music' } },
          { default: () => t('categories.music') }
        ),
      key: 'music',
      extra: renderExtra(recordsStore.recordsLength('music').value),
      icon: renderIcon(MusicIcon, { weight: iconsStyle })
    },
  ]

  // Add custom lists
  const customListOptions = recordsStore.customLists.map(list => ({
    label: () =>
      h(
        RouterLink,
        { to: { name: 'CustomList', params: { id: list.id } } },
        { default: () => list.name }
      ),
    key: `custom-${list.id}`,
    icon: renderIcon(CustomIcon, { weight: iconsStyle }),
  }))

  // Add create button at the end
  const createOption = {
    label: () => t('menu.createList'),
    key: 'create-new',
    icon: renderIcon(NewIcon, { weight: iconsStyle }),
    disabled: false,
  }

  const aboutOption = {
    label: () =>
      h(
        RouterLink,
        { to: { name: 'About' } },
        { default: () => t('categories.about') }
      ),
    key: 'about',
    icon: renderIcon(AboutIcon, { weight: iconsStyle }),
  }

  return [
    ...baseOptions,
    {
      key: 'divider-2',
      type: 'divider',
    },
    ...customListOptions,
    createOption,
    { key: 'divider-about', type: 'divider' },
    aboutOption,
  ]
})

async function handleMenuUpdate(key) {
  if (key === 'create-new') {
    const id = await recordsStore.createCustomList()
    router.push({ name: 'CustomList', params: { id } })
    return
  }
  menuStore.closeMenu(key)
}

watch(route, () => {
  activeKey.value = route.meta.tag
}, { flush: 'pre', immediate: true, deep: true })
</script>

<template>
  <n-menu
    v-model:value="activeKey"
    :collapsed="menuStore.collapsed"
    :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
    :options="menuOptions"
    @update:value="handleMenuUpdate" />
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
