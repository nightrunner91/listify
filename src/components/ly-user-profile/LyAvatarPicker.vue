<script setup>
import { ref, watch, computed } from 'vue'
import {
  NModal,
  NCard,
  NSpace,
  NButton,
  NSelect,
  NInput,
  NText,
  NAvatar,
  NIcon,
} from 'naive-ui'
import {
  PhDiceFive as RandomIcon,
  PhCheck as SaveIcon,
} from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'

function generateRandomSeed() {
  return Math.random().toString(36).substring(2, 12)
}

const props = defineProps({
  show: Boolean,
  currentStyle: String,
  currentSeed: String,
})

const emit = defineEmits(['update:show', 'update'])

const selectedStyle = ref(props.currentStyle || 'adventurer')
const selectedSeed = ref(props.currentSeed || 'default')

const styles = [
  { label: 'Adventurer', value: 'adventurer' },
  { label: 'Avataaars', value: 'avataaars' },
  { label: 'Bottts', value: 'bottts' },
  { label: 'Lorelei', value: 'lorelei' },
  { label: 'Notionists', value: 'notionists' },
  { label: 'Open Peeps', value: 'open-peeps' },
  { label: 'Pixel Art', value: 'pixel-art' },
  { label: 'Shapes', value: 'shapes' },
  { label: 'Big Smile', value: 'big-smile' },
]

watch(() => props.show, (newVal) => {
  if (newVal) {
    selectedStyle.value = props.currentStyle
    selectedSeed.value = props.currentSeed
  }
})

const previewUrl = computed(() => {
  return `https://api.dicebear.com/9.x/${selectedStyle.value}/svg?seed=${selectedSeed.value}`
})

function randomizeSeed() {
  selectedSeed.value = generateRandomSeed()
}

function handleSave() {
  emit('update', {
    avatarStyle: selectedStyle.value,
    avatarSeed: selectedSeed.value,
  })
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    style="width: 400px"
    title="Customize Avatar"
  >
    <n-space vertical :size="20">
      <div class="preview-container">
        <n-avatar
          round
          :size="120"
          :src="previewUrl"
          class="preview-avatar"
        />
      </div>

      <n-space vertical :size="8">
        <n-text depth="3">Style</n-text>
        <n-select v-model:value="selectedStyle" :options="styles" />
      </n-space>

      <n-space vertical :size="8">
        <n-text depth="3">Seed</n-text>
        <n-input v-model:value="selectedSeed">
          <template #suffix>
            <n-button quaternary circle size="small" @click="randomizeSeed">
              <template #icon><n-icon :component="RandomIcon" /></template>
            </n-button>
          </template>
        </n-input>
      </n-space>

      <n-button type="primary" block @click="handleSave" :render-icon="renderIcon(SaveIcon)">
        Save Changes
      </n-button>
    </n-space>
  </n-modal>
</template>

<style scoped>
.preview-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
.preview-avatar {
  background: var(--n-card-color);
  border: 4px solid var(--n-border-color);
}
</style>
