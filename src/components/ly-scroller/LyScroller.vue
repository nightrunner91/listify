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
</script>

<template>
  <n-layout-sider
    position="absolute"
    :width="64"
    :collapsed-width="64"
    :collapsed="true"
    :default-collapsed="true"
    class="py-6 top-0 z-plus-1 right-3"
    style="left: auto; background: transparent;">
    <n-space
      vertical
      align="center"
      justify="center"
      class="h-100">
      <n-button secondary circle>
        <template #icon>
          <n-icon :component="ToTopIcon" />
        </template>
      </n-button>
      <n-button secondary circle>
        <template #icon>
          <n-icon :component="ToBottomIcon" />
        </template>
      </n-button>
    </n-space>
  </n-layout-sider>
</template>
