<script setup>
import {
  ref,
  onMounted
} from 'vue'
import {
  RouterView,
  useRoute,
  useRouter
} from 'vue-router'
import {
  NSpace,
  NLayoutContent,
  NGrid,
  NGridItem,
  NButton,
  useDialog
} from 'naive-ui'
import { PhTrashSimple as DeleteIcon } from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'
import LyTitle from '@/components/base/ly-title/LyTitle.vue'
import LySort from '@/features/records/components/ly-sort/LySort.vue'
import LyScroller from '@/components/base/ly-scroller/LyScroller.vue'
import LyFooter from '@/components/layout/ly-footer/LyFooter.vue'
import { useMenuStore } from '@/stores/menu.store'
import { useGridStore } from '@/stores/grid.store'
import { useRecordsStore } from '@/stores/records.store'
import { useI18n } from 'vue-i18n'
import { setScrollContentToTop } from '@/router'

const { t } = useI18n()
const menuStore = useMenuStore()
const gridStore = useGridStore()
const recordsStore = useRecordsStore()
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const contentRef = ref(null)

function scrollContentToTop() {
  contentRef.value?.scrollTo({
    top: 0,
    behavior: 'auto' 
  })
}

onMounted(() => {
  setScrollContentToTop(scrollContentToTop)
})

/**
 * @function updateScroll
 * @description Updates the global scroll position in the grid store
 * @param {Event} event - Scroll event
 */
function updateScroll(event) {
  gridStore.scrollPosition = (event.target).scrollTop
}

/**
 * @function confirmDeleteList
 * @description Shows a confirmation dialog before deleting a custom list
 */
function confirmDeleteList() {
  const list = recordsStore.getCustomList(route.params.id)
  dialog.warning({
    title: t('common.confirmAction'),
    content: t('customLists.deleteConfirm', { name: list?.name }),
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
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
    :class="{ 'ly-content--dimmed' : !menuStore.collapsed }"
    :native-scrollbar="true"
    :scrollbar-props="{ trigger: 'none' }"
    class="ly-content"
    @click="menuStore.closeMenu"
    @scroll="updateScroll($event)"
  >
    <!-- begin::Content Layout -->
    <n-grid
      item-responsive
      responsive="screen"
      :x-gap="12"
      :y-gap="8"
      :cols="6"
      class="pt-2 pt-s-10 px-4"
    >
      <n-grid-item
        span="6 s:4 l:4"
        offset="0 s:1 l:1"
        class="ly-grid"
      >
        <!-- begin::Top Header (Title+Sort) -->
        <n-space
          justify="space-between"
          :wrap-item="false"
          align="center"
          class="w-100 mb-6"
        >
          <ly-title />
          <ly-sort v-if="!route.meta.isCustom && route.meta.tag !== 'about' && route.meta.tag !== 'start'" />
          <n-button
            v-else-if="route.meta.isCustom"
            secondary
            type="error"
            :render-icon="renderIcon(DeleteIcon)"
            @click="confirmDeleteList"
          >
            {{ t('common.delete') }}
          </n-button>
        </n-space>
        <!-- end::Top Header -->

        <!-- begin::Main View -->
        <router-view />
        <!-- end::Main View -->


        <ly-footer />
      </n-grid-item>
    </n-grid>
    <!-- end::Content Layout -->

    <ly-scroller
      @scrollTop="contentRef?.scrollTo({ top: 0, behavior: 'smooth' })"
      @scrollBottom="contentRef?.scrollTo({ top: 999999999, behavior: 'smooth' })"
    />
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

.ly-grid {
  display: flex;
  flex-direction: column;
}
</style>
