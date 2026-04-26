<script setup>
import { ref, watch, computed, reactive } from 'vue'
import {
  NModal,
  NSpace,
  NButton,
  NSelect,
  NInput,
  NText,
  NAvatar,
  NIcon,
  NSlider,
  NSwitch,
  NColorPicker,
  NGrid,
  NGridItem,
  NDivider,
  NScrollbar,
} from 'naive-ui'
import {
  PhDiceFive as RandomIcon,
  PhCheck as SaveIcon,
  PhArrowClockwise as ResetIcon,
} from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'

function generateRandomSeed() {
  return Math.random().toString(36).substring(2, 12)
}

const props = defineProps({
  show: Boolean,
  currentStyle: String,
  currentSeed: String,
  currentOptions: Object,
})

const emit = defineEmits(['update:show', 'update'])

const selectedStyle = ref(props.currentStyle || 'adventurer')
const selectedSeed = ref(props.currentSeed || 'default')
const options = reactive({
  flip: false,
  rotate: 0,
  scale: 100,
  ...props.currentOptions
})

const styles = [
  { label: 'Adventurer', value: 'adventurer' },
  { label: 'Adventurer Neutral', value: 'adventurer-neutral' },
  { label: 'Avataaars', value: 'avataaars' },
  { label: 'Avataaars Neutral', value: 'avataaars-neutral' },
  { label: 'Big Ears', value: 'big-ears' },
  { label: 'Big Ears Neutral', value: 'big-ears-neutral' },
  { label: 'Big Smile', value: 'big-smile' },
  { label: 'Bottts', value: 'bottts' },
  { label: 'Bottts Neutral', value: 'bottts-neutral' },
  { label: 'Croodles', value: 'croodles' },
  { label: 'Croodles Neutral', value: 'croodles-neutral' },
  { label: 'Fun Emoji', value: 'fun-emoji' },
  { label: 'Icons', value: 'icons' },
  { label: 'Identicon', value: 'identicon' },
  { label: 'Initials', value: 'initials' },
  { label: 'Lorelei', value: 'lorelei' },
  { label: 'Lorelei Neutral', value: 'lorelei-neutral' },
  { label: 'Micah', value: 'micah' },
  { label: 'Miniavs', value: 'miniavs' },
  { label: 'Notionists', value: 'notionists' },
  { label: 'Open Peeps', value: 'open-peeps' },
  { label: 'Personas', value: 'personas' },
  { label: 'Pixel Art', value: 'pixel-art' },
  { label: 'Pixel Art Neutral', value: 'pixel-art-neutral' },
  { label: 'Rings', value: 'rings' },
  { label: 'Shapes', value: 'shapes' },
  { label: 'Thumbs', value: 'thumbs' },
]

watch(() => props.show, (newVal) => {
  if (newVal) {
    selectedStyle.value = props.currentStyle || 'adventurer'
    selectedSeed.value = props.currentSeed || 'default'
    Object.assign(options, {
      flip: false,
      rotate: 0,
      scale: 100,
      radius: 0,
      backgroundColor: ['b6e3f4'],
      ...props.currentOptions
    })
  }
})

const previewUrl = computed(() => {
  const query = new URLSearchParams({
    seed: selectedSeed.value,
    flip: options.flip.toString(),
    rotate: options.rotate.toString(),
    scale: options.scale.toString(),
  })
  
  return `https://api.dicebear.com/9.x/${selectedStyle.value}/svg?${query.toString()}`
})

function randomizeSeed() {
  selectedSeed.value = generateRandomSeed()
}

function resetOptions() {
  Object.assign(options, {
    flip: false,
    rotate: 0,
    scale: 100,
  })
}

function handleSave() {
  emit('update', {
    avatarStyle: selectedStyle.value,
    avatarSeed: selectedSeed.value,
    avatarOptions: { ...options },
  })
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    style="width: 500px"
    title="Customize Avatar"
    class="avatar-picker-modal"
  >
    <n-space vertical :size="24">
      <!-- Preview Section -->
      <div class="preview-section">
        <div class="preview-container">
          <n-avatar
            round
            :size="140"
            :src="previewUrl"
            class="preview-avatar"
          />
        </div>
        <n-space justify="center" class="mt-2">
          <n-button size="small" quaternary @click="randomizeSeed" :render-icon="renderIcon(RandomIcon)">
            Random Seed
          </n-button>
          <n-button size="small" quaternary @click="resetOptions" :render-icon="renderIcon(ResetIcon)">
            Reset Options
          </n-button>
        </n-space>
      </div>

      <n-divider title-placement="left" style="margin: 0">Configuration</n-divider>

      <n-scrollbar style="max-height: 400px" trigger="none">
        <n-space vertical :size="20" class="pr-3">
          <!-- Style & Seed -->
          <n-grid :cols="2" :x-gap="12">
            <n-grid-item>
              <n-space vertical :size="8">
                <n-text depth="3">Avatar Style</n-text>
                <n-select v-model:value="selectedStyle" :options="styles" filterable />
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space vertical :size="8">
                <n-text depth="3">Seed</n-text>
                <n-input v-model:value="selectedSeed" placeholder="Any string..." />
              </n-space>
            </n-grid-item>
          </n-grid>

          <!-- Transformations -->
          <n-grid :cols="2" :x-gap="24" :y-gap="16">
            <n-grid-item>
              <n-space vertical :size="8">
                <n-text depth="3">Rotation ({{ options.rotate }}°)</n-text>
                <n-slider v-model:value="options.rotate" :min="0" :max="360" :step="1" />
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space vertical :size="8">
                <n-text depth="3">Scale ({{ options.scale }}%)</n-text>
                <n-slider v-model:value="options.scale" :min="0" :max="200" :step="1" />
              </n-space>
            </n-grid-item>
            <n-grid-item :span="2">
              <n-space align="center" justify="" class="w-100">
                <n-switch v-model:value="options.flip" />
                <n-text depth="3">Flip Horizontally</n-text>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-scrollbar>

      <n-button type="primary" block size="large" @click="handleSave">
        Confirm configuration
      </n-button>
    </n-space>
  </n-modal>
</template>

<style scoped>
.preview-section {
  background: var(--n-modal-color);
  padding-bottom: 12px;
  border-radius: var(--n-border-radius);
}
.preview-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
.preview-avatar {
  background: white;
  border: 4px solid var(--n-border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.mt-2 {
  margin-top: 8px;
}
.pr-3 {
  padding-right: 12px;
}
</style>
