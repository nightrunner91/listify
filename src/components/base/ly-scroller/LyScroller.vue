<script setup>
import { useGridStore } from '@/stores/grid.store'
import {
  NButton,
  NIcon,
  NSpace
} from 'naive-ui'
import {
  PhArrowLineDown as ToBottomIcon,
  PhArrowLineUp as ToTopIcon
} from 'phosphor-vue'

const gridStore = useGridStore()

defineEmits(['scrollTop', 'scrollBottom'])
</script>

<template>
  <transition name="scroll-buttons">
    <n-space
      v-if="gridStore.showScroller"
      vertical
      align="center"
      justify="center"
      :wrap-items="false"
      class="position-fixed right-10 top-0 bottom-0 m-auto w-40 h-80"
    >
      <n-button
        secondary
        circle
        @click.prevent="$emit('scrollTop')"
      >
        <template #icon>
          <n-icon :component="ToTopIcon" />
        </template>
      </n-button>
      <n-button
        secondary
        circle
        @click.prevent="$emit('scrollBottom')"
      >
        <template #icon>
          <n-icon :component="ToBottomIcon" />
        </template>
      </n-button>
    </n-space>
  </transition>
</template>

<style lang="scss">
.scroll-buttons-enter-active,
.scroll-buttons-leave-active {
  transition: complex-transition(
    transition(opacity, base, ease-in),
    transition(transform, base, emphasized),
    transition(scale, short, emphasized),
  );
}
.scroll-buttons-enter-from,
.scroll-buttons-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.9);
}
</style>
