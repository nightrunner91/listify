<script setup lang="ts">
import {
  NButton,
  NH3,
  NText,
} from 'naive-ui'
import {
  PhList as OpenIcon,
  PhCaretLeft as CloseIcon,
} from 'phosphor-vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu.store'
import { useGridStore } from '@/stores/grid.store'
import { useThemeStore } from '@/stores/theme.store'

const route = useRoute()
const menuStore = useMenuStore()
const gridStore = useGridStore()
const themeStore = useThemeStore()
</script>

<template>
  <n-h3
    v-if="gridStore.screenLargerThen('s')"
    class="m-0 mr-auto pl-2 no-select ly-logo"
    @click="menuStore.closeMenu">
    <router-link
      :to="{ name: 'Start' }"
      style="text-decoration: none;">
      <n-text :style="{color: themeStore.categoryColor(route.meta.tag as string)}">Li</n-text>
      <n-text
        class="ly-logo__suffix"
        depth="2">stify</n-text>
    </router-link>
  </n-h3>
  <n-button
    v-else
    quaternary
    circle
    size="large"
    @click="menuStore.toggleMenu"
    class="mr-auto">
    <template #icon>
      <open-icon v-if="menuStore.collapsed" weight="bold" />
      <close-icon v-else weight="bold" />
    </template>
  </n-button>
</template>

<style lang="scss" scoped>
.ly-logo {
  &__suffix {
    position: relative;
    display: inline-block;
    opacity: 0;
    transition: transition(opacity, short, ease);

    &::before {
      @include pseudoelem();

      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--n-color);
      z-index: 2;
      transform: scaleX(1);
      transform-origin: 100% 100%;
      transition: transition(transform, short, emphasized);
    }
  }

  &:hover {
    .ly-logo {
      &__suffix {
        opacity: 1;

        &::before {
          transform: scaleX(0);
        }
      }
    }
  }
}
</style>
