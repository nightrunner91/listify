<script setup>
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
      <span class="ly-logo__container">
        <n-text class="ly-logo__prefix" :style="{color: themeStore.categoryColor(route.meta.tag)}">Li</n-text>
        <n-text class="ly-logo__suffix" depth="2">stify</n-text>
      </span>
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
  &__container {
    position: relative;
    display: inline-block;

    &:hover {
      .ly-logo {
        &__suffix {
          transform: translateX(0);
          opacity: 1;
        }
      }
    }
  }

  &__prefix {
    position: relative;
    background-color: var(--n-color);
    z-index: 2;
  }

  &__suffix {
    position: absolute;
    top: 0;
    left: 25px;
    width: 100%;
    display: block;
    transform: translateX(-100%);
    opacity: 0;
    transition: transform 0.2s cubic-bezier(0.77,0,0.175,1), opacity 0.3s ease;
    z-index: 1;
  }
}
</style>
