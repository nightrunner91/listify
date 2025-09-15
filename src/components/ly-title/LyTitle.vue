<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NH1, NSpace, NText, NBadge, NIcon, NModal, NInput, NButton } from 'naive-ui'
import { PhPencilSimple as EditIcon, PhTrashSimple as DeleteIcon } from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme.store'
import { useRecordsStore } from '@/stores/records.store'

const route = useRoute()
const themeStore = useThemeStore()
const recordsStore = useRecordsStore()

const isCustomList = computed(() => {
  return route.meta.isCustom
})

const customListId = computed(() => {
  return route.params.id || null
})

const customList = computed(() => {
  return customListId.value ? recordsStore.getCustomList(customListId.value) : null
})

const showRenameModal = ref(false)
const newListName = ref('')
const nameError = ref('')

const barColor = ref('transparent')
const barWidth = ref('3px')
const barSize = '3px'
const barSpeed = 250

watch(
  [route, themeStore],
  async () => {
    barWidth.value = barSize
    await new Promise((resolve) => setTimeout(resolve, barSpeed * 1.5))
    barWidth.value = '70px'
    barColor.value = themeStore.categoryColor(route.meta.tag)
    if (isCustomList.value && customList.value) {
      newListName.value = customList.value.name
    }
  },
  { immediate: true, deep: true }
)

function openRenameModal() {
  newListName.value = customList.value?.name || ''
  nameError.value = ''
  showRenameModal.value = true
}

function saveRename() {
  if (newListName.value.trim().length < 5) {
    nameError.value = 'Name must be at least 5 characters.'
    return
  }
  recordsStore.renameCustomList(customListId.value, newListName.value.trim())
  showRenameModal.value = false
}
</script>

<template>
  <n-h1 class="mb-0">
    <n-text>
      <template v-if="isCustomList">
        <span class="mr-4">{{ customList?.name }}</span>

        <n-button
          text
          @click="openRenameModal"
          v-show="isCustomList">
          <n-icon size="24"><EditIcon /></n-icon>
        </n-button>
      </template>

      <template v-else>
        {{ route.meta.title }}
      </template>

      <n-badge
        v-if="route.meta.tag !== 'start' && !isCustomList"
        :value="recordsStore.recordsLength(route.meta.tag).value"
        :show-zero="true"
        class="ml-4 z-0" />

      <div
        :style="{
          backgroundColor: barColor,
          width: barWidth,
          height: barSize,
          borderRadius: barSize,
          transitionDuration: barSpeed + 'ms',
          transitionTimingFunction: 'cubic-bezier(0.0, 0, 0.2, 1)',
        }" />
    </n-text>

    <n-modal v-model:show="showRenameModal" preset="dialog" title="Rename Custom List">
      <div>
        <n-input v-model:value="newListName" placeholder="Enter new name" maxlength="50" />
        <div v-if="nameError" style="color:red;font-size:12px;margin-top:4px;">{{ nameError }}</div>
      </div>
      <template #action>
        <n-button type="primary" @click="saveRename">Save</n-button>
      </template>
    </n-modal>
  </n-h1>
</template>
