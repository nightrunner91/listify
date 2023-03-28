<script setup lang='ts'>
import {
  NLayoutSider,
  NSpace,
  NButton,
  NIcon,
} from 'naive-ui'
import { 
  PhArrowLineUp as ToTopIcon,
  PhArrowLineDown as ToBottomIcon,
} from 'phosphor-vue'
import { useGridStore } from '@/stores/grid.store'

const gridStore = useGridStore()
</script>

<template>
  <n-layout-sider
    position="absolute"
    :width="64"
    :collapsed-width="64"
    :collapsed="true"
    :default-collapsed="true"
    sider-placement="right"
    class="py-6 top-0 z-plus-1 right-3 ly-scroller"
    style="left: auto; background: transparent;">
    <transition name="scroll-buttons">
      <n-space
        v-if="gridStore.showScroller"
        vertical
        align="center"
        justify="center"
        class="h-100">
        <n-button
          secondary
          circle>
          <template #icon>
            <n-icon :component="ToTopIcon" />
          </template>
        </n-button>
        <n-button
          secondary
          circle>
          <template #icon>
            <n-icon :component="ToBottomIcon" />
          </template>
        </n-button>
      </n-space>
    </transition>
  </n-layout-sider>
</template>

<style lang="scss">
.ly-scroller {
  > * {
    overflow: hidden !important;
  }
}
.scroll-buttons-enter-active,
.scroll-buttons-leave-active {
  transition: complex-transition(
    transition(opacity, base, ease-in),
    transition(transform, base, emphasized),
  );
}
.scroll-buttons-enter-from,
.scroll-buttons-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
