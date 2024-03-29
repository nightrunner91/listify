<script setup>
import { h, ref, computed, watch } from 'vue'
import {
  NListItem,
  NSpace,
  NInput,
  NDropdown,
  NButton,
  NIcon,
  NText,
  NRate,
  NCheckbox,
} from 'naive-ui'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records.store'
import { useGridStore } from '@/stores/grid.store'
import { PhHeart as LikeIcon } from 'phosphor-vue'
import { lyStorage } from '@/main'

const recordsStore = useRecordsStore()
const gridStore = useGridStore()
const route = useRoute()
const props = defineProps(['id', 'index'])
const tag = route.meta.tag
const showCheckbox = ref(false)

const record = computed(() => {
  return recordsStore.getRecord(props.id, tag) || {}
})

const renderDropdownIcon = (option) => {
  return h(option.icon, { size: 16 })
}

watch(record, () => {
  if (record.value.id) {
    /* eslint-disable-next-line no-unused-vars */
    const { selected, ...recordWithoutSelected } = record.value
    lyStorage.setStorage({
      key: `rec_${record.value.id}`,
      data: recordWithoutSelected
    })
  }
}, { immediate: true, deep: true })
</script>

<template>
  <n-list-item
    @mouseover="showCheckbox = true"
    @mouseleave="showCheckbox = false"
    class="px-4 px-sm-5"
    :style="gridStore.screenLargerThen('m') ? '' : 'border-radius: 0;'">
    <n-space
      :wrap-item="false"
      align="center"
      :wrap="!gridStore.screenLargerThen('m')"
      :size="gridStore.screenLargerThen('m') ? 'medium' : 'small'"
      class="py-2 py-m-0">

      <n-space
        :wrap-item="false"
        :wrap="false"
        align="center"
        size="small"
        class="w-100 w-m-50">
        <n-space
          :wrap-item="false"
          align="center"
          justify="center"
          :size="0">
          <n-checkbox
            v-show="showCheckbox || record.selected"
            v-model:checked="record.selected" />

          <n-text
            v-show="!showCheckbox && !record.selected"
            align="center"
            style="width: 16px; font-size: 12px; line-height: 1"
            depth="3">
            {{ index + 1 }}
          </n-text>
        </n-space>

        <n-input
          :id="`input-${record.id}`"
          v-model:value="record.title"
          type="text"
          :size="gridStore.screenLargerThen('m') ? 'medium' : 'small'"
          placeholder="Name of record"
          class="w-100 w-m-75 record-input" />
      </n-space>

      <n-space
        :wrap-item="false"
        align="center"
        justify="center"
        size="small"
        class="w-100 w-m-50">
        <n-rate
          v-model:value="record.score"
          clearable
          size="small"
          class="mr-0 mr-s-4 mr-m-7" />
          
        <n-button
          quaternary
          round
          circle
          type="error"
          size="small"
          class="ml-4 ml-s-6 ml-m-10"
          @click="record.liked = !record.liked">
          <template #icon>
            <like-icon
              :weight="record.liked ? 'fill' : 'regular'"
              :class="{ 'opacity-4' : !record.liked }" />
          </template>
        </n-button>

        <n-dropdown
          size="small"
          trigger="click"
          placement="bottom-end"
          :options="recordsStore.labels[tag]"
          :render-icon="renderDropdownIcon"
          @select="key => record.label = key">
          <n-button
            quaternary
            size="small"
            class="ml-auto">
            <template #icon>
              <n-icon
                depth="2"
                :component="recordsStore.getLabelIcon(tag, record.label)" />
            </template>
            {{ recordsStore.getLabelName(tag, record.label) }}
          </n-button>
        </n-dropdown>

      </n-space>

    </n-space>
  </n-list-item>
</template>

<style lang="scss">
.n-list {
  background-color: transparent;
}

.record-input {
  background-color: transparent !important;

  .n-input__border {
    border: none !important;
  }

  .n-input__input-el {
    font-weight: 500;
  }
}
</style>
