<script setup>
import { ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  NSpace,
  NLayoutContent,
  NGrid,
  NGridItem,
  NButton,
  useDialog,
} from 'naive-ui'
import { PhTrashSimple as DeleteIcon } from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'
import LyTitle from '@/components/ly-title/LyTitle.vue'
import LyUserProfile from '@/components/ly-user-profile/LyUserProfile.vue'
import LyImport from '@/components/ly-import/LyImport.vue'
import LySort from '@/components/ly-sort/LySort.vue'
import LyScroller from '@/components/ly-scroller/LyScroller.vue'
import { useMenuStore } from '@/stores/menu.store'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'

const menuStore = useMenuStore()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const contentRef = ref(null)
const importRef = ref(null)

function updateScroll(event) {
  gridStore.scrollPosition = (event.target).scrollTop
}

function confirmDeleteList() {
  const list = recordsStore.getCustomList(route.params.id)
  dialog.warning({
    title: 'Confirm action',
    content: `Delete "${list?.name}"? This cannot be undone.`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      await recordsStore.deleteCustomList(route.params.id)
      router.push('/start')
    },
  })
}
</script>

<template>
  <n-layout-content
    ref="contentRef"
    has-sider
    @click="menuStore.closeMenu"
    :class="{ 'ly-content--dimmed' : !menuStore.collapsed }"
    :native-scrollbar="true"
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
        <n-space
          justify="space-between"
          :wrap-item="false"
          align="center"
          class="w-100 mb-6">
          <template v-if="route.meta.tag === 'start'">
            <ly-user-profile class="w-100" @import="importRef.showModal = true" />
          </template>
          <template v-else>
            <ly-title />
            <ly-sort v-if="!route.meta.isCustom && route.meta.tag !== 'about'" />
            <n-button
              v-else-if="route.meta.isCustom"
              secondary
              type="error"
              size="small"
              :render-icon="renderIcon(DeleteIcon)"
              @click="confirmDeleteList">
              Delete
            </n-button>
          </template>
        </n-space>
        <router-view />
        <ly-import ref="importRef" variant="hidden" v-show="false" />
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
    content: '';
    display: block;
    position: absolute;
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
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
