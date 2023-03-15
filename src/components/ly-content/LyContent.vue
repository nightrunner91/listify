<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
  NLayoutContent,
  NGrid,
  NGridItem,
} from 'naive-ui'
import LyTitle from '@/components/ly-title/LyTitle.vue'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()
</script>

<template>
  <n-layout-content
    @click="menuStore.closeMenu"
    :class="{ 'ly-content--dimmed' : !menuStore.collapsed }"
    class="pl-2 pl-s-18 ly-content">
    <n-grid
      item-responsive
      responsive="screen"
      :x-gap="12"
      :y-gap="8"
      :cols="6"
      class="py-2 py-l-10 pr-2">
      <n-grid-item
        span="6 l:4"
        offset="0 l:1">
        <ly-title />
        <router-view />
      </n-grid-item>
    </n-grid>
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
  }

  &--dimmed {
    &::before {
      background-color: rgba(136, 115, 128, 0.1);
    }
  }
}

body.dark {
  .ly-content {
    &--dimmed {
      &::before {
        background-color: rgba(0, 0, 0, 0.74);
      }
    }
  }
}
</style>
