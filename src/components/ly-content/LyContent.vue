<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import {
  NLayoutContent,
  NGrid,
  NGridItem,
  type LayoutInst,
} from 'naive-ui'
import LyTitle from '@/components/ly-title/LyTitle.vue'
import LyScroller from '@/components/ly-scroller/LyScroller.vue'
import { useMenuStore } from '@/stores/menu.store'
import { useGridStore } from '@/stores/grid.store'

const menuStore = useMenuStore()
const gridStore = useGridStore()

const contentRef = ref<LayoutInst | null>(null)

function updateScroll(event: Event) {
  gridStore.scrollPosition = (event.target as Element).scrollTop
}
</script>

<template>
  <n-layout-content
    ref="contentRef"
    has-sider
    @click="menuStore.closeMenu"
    :class="{ 'ly-content--dimmed' : !menuStore.collapsed }"
    :native-scrollbar="false"
    :scrollbar-props="{ trigger: 'none' }"
    @scroll="updateScroll($event)"
    class="pl-4 pl-s-18 ly-content">
    <n-grid
      item-responsive
      responsive="screen"
      :x-gap="12"
      :y-gap="8"
      :cols="6"
      class="pt-2 pt-s-10 pr-4 pb-4 pb-s-10">
      <n-grid-item
        span="6 s:4 l:4"
        offset="0 s:1 l:1">
        <ly-title />
        <router-view />
      </n-grid-item>
    </n-grid>
    <ly-scroller
      @scrollTop="contentRef?.scrollTo({ top: 0, behavior: 'smooth' })"
      @scrollBottom="contentRef?.scrollTo({ top: 999999999, behavior: 'smooth' })" />
  </n-layout-content>
</template>

<style lang="scss" scoped>
.ly-content {
  &::before {
    @include pseudoelem();

    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    transition: transition(background-color);
    z-index: -1;
  }

  &--dimmed {
    &::before {
      z-index: 1;
      background-color: rgba(136, 115, 128, 0.21);
    }
  }
}

body.dark {
  .ly-content {
    &--dimmed {
      &::before {
        z-index: 1;
        background-color: rgba(4, 11, 6, 0.74);
      }
    }
  }
}
</style>
