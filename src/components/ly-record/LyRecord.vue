<script setup lang="ts">
import { computed } from 'vue'
import {
  NListItem,
  NSpace,
  NInput,
  NDropdown,
  NButton,
  NText,
  NRate,
} from 'naive-ui'
import { useRoute } from 'vue-router'
import { useRecordsStore } from '@/stores/records'
import { 
  PhHeart as LikeIcon,
} from 'phosphor-vue'

const recordsStore = useRecordsStore()
const route = useRoute()

const props = defineProps(['id', 'index'])
const tag = route.meta.tag as string

const record = computed(() => {
  return recordsStore.getRecord(props.id, tag)
})
</script>

<template>
  <n-list-item>
    <n-space
      :wrap-item="false"
      align="center">

      <n-text depth="3">
        {{ index + 1 }}
      </n-text>

      <n-input
        v-model:value="record.title"
        type="text"
        size="small"
        placeholder=""
        style="width: 40%" />

      <n-button
        quaternary
        round
        circle
        type="error"
        size="small"
        @click="record.liked = !record.liked">
        <template #icon>
          <like-icon
            :weight="record.liked ? 'fill' : 'regular'"
            :class="{ 'opacity-4' : !record.liked }" />
        </template>
      </n-button>

      <n-rate
        v-model:value="record.score"
        size="small"
        class="ml-8" />

      <n-dropdown
        size="small"
        trigger="click"
        placement="bottom-end"
        :options="recordsStore.labels[tag]"
        @select="key => record.label = key">
        <n-button
          quaternary
          size="small"
          class="ml-auto">
          {{ recordsStore.getLabelName(tag, record.label) }}
        </n-button>
      </n-dropdown>

    </n-space>
  </n-list-item>
</template>

<style lang="scss">
.n-list {
  background-color: transparent;
}
</style>