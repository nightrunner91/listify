<script setup>
import { NLayoutSider } from 'naive-ui'
import { useMenuStore } from '@/stores/menu.store'
import { useGridStore } from '@/stores/grid.store'
import LyMenu from '@/components/layout/ly-menu/LyMenu.vue'

const menuStore = useMenuStore()
const gridStore = useGridStore()
</script>

<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    position="absolute"
    :collapsed-width="gridStore.screenLargerThen('s') ? 64 : 0"
    :width="300"
    :show-trigger="gridStore.screenLargerThen('s')"
    :collapsed="menuStore.collapsed"
    class="py-4 py-l-9 top-0 left-0 z-plus-2"
    @collapse="menuStore.closeMenu"
    @expand="menuStore.openMenu"
  >
    <ly-menu />
  </n-layout-sider>
</template>
