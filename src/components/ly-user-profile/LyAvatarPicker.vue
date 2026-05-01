<script setup>
import {
  ref,
  watch,
  computed,
  reactive
} from 'vue'
import {
  NModal,
  NSpace,
  NButton,
  NSelect,
  NInput,
  NText,
  NAvatar,
  NSlider,
  NSwitch,
  NGrid,
  NGridItem,
  NDivider,
  NScrollbar
} from 'naive-ui'
import {
  PhDiceFive as RandomIcon,
  PhArrowClockwise as ResetIcon
} from 'phosphor-vue'
import { renderIcon } from '@/utils/render-icon'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const styleOptions = computed(() => [
  {
    label: t('avatarPicker.styles.adventurer'),
    value: 'adventurer' 
  },
  {
    label: t('avatarPicker.styles.adventurerNeutral'),
    value: 'adventurer-neutral' 
  },
  {
    label: t('avatarPicker.styles.avataaars'),
    value: 'avataaars' 
  },
  {
    label: t('avatarPicker.styles.avataaarsNeutral'),
    value: 'avataaars-neutral' 
  },
  {
    label: t('avatarPicker.styles.bigEars'),
    value: 'big-ears' 
  },
  {
    label: t('avatarPicker.styles.bigEarsNeutral'),
    value: 'big-ears-neutral' 
  },
  {
    label: t('avatarPicker.styles.bigSmile'),
    value: 'big-smile' 
  },
  {
    label: t('avatarPicker.styles.bottts'),
    value: 'bottts' 
  },
  {
    label: t('avatarPicker.styles.botttsNeutral'),
    value: 'bottts-neutral' 
  },
  {
    label: t('avatarPicker.styles.croodles'),
    value: 'croodles' 
  },
  {
    label: t('avatarPicker.styles.croodlesNeutral'),
    value: 'croodles-neutral' 
  },
  {
    label: t('avatarPicker.styles.funEmoji'),
    value: 'fun-emoji' 
  },
  {
    label: t('avatarPicker.styles.icons'),
    value: 'icons' 
  },
  {
    label: t('avatarPicker.styles.identicon'),
    value: 'identicon' 
  },
  {
    label: t('avatarPicker.styles.initials'),
    value: 'initials' 
  },
  {
    label: t('avatarPicker.styles.lorelei'),
    value: 'lorelei' 
  },
  {
    label: t('avatarPicker.styles.loreleiNeutral'),
    value: 'lorelei-neutral' 
  },
  {
    label: t('avatarPicker.styles.micah'),
    value: 'micah' 
  },
  {
    label: t('avatarPicker.styles.miniavs'),
    value: 'miniavs' 
  },
  {
    label: t('avatarPicker.styles.notionists'),
    value: 'notionists' 
  },
  {
    label: t('avatarPicker.styles.openPeeps'),
    value: 'open-peeps' 
  },
  {
    label: t('avatarPicker.styles.personas'),
    value: 'personas' 
  },
  {
    label: t('avatarPicker.styles.pixelArt'),
    value: 'pixel-art' 
  },
  {
    label: t('avatarPicker.styles.pixelArtNeutral'),
    value: 'pixel-art-neutral' 
  },
  {
    label: t('avatarPicker.styles.rings'),
    value: 'rings' 
  },
  {
    label: t('avatarPicker.styles.shapes'),
    value: 'shapes' 
  },
  {
    label: t('avatarPicker.styles.thumbs'),
    value: 'thumbs' 
  },
])

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
    preset="card"
    :title="t('avatarPicker.modalTitle')"
    class="avatar-picker-modal w-500"
    @update:show="emit('update:show', $event)"
  >
    <n-space
      vertical
      :size="24"
    >
      <!-- Preview Section -->
      <n-space
        vertical
        :size="0"
        class="pb-3 rounded-base"
        :style="{ background: 'var(--n-modal-color)' }"
      >
        <n-space
          justify="center"
          class="py-2"
        >
          <n-avatar
            round
            :size="140"
            :src="previewUrl"
            class="bg-white border-4 shadow-level-1"
            :style="{ borderColor: 'var(--n-border-color)' }"
          />
        </n-space>
        <n-space
          justify="center"
          class="mt-2"
        >
          <n-button
            size="small"
            quaternary
            :render-icon="renderIcon(RandomIcon)"
            @click="randomizeSeed"
          >
            {{ t('avatarPicker.randomSeed') }}
          </n-button>
          <n-button
            size="small"
            quaternary
            :render-icon="renderIcon(ResetIcon)"
            @click="resetOptions"
          >
            {{ t('avatarPicker.resetOptions') }}
          </n-button>
        </n-space>
      </n-space>

      <n-divider
        title-placement="left"
        class="m-0"
      >
        {{ t('avatarPicker.configuration') }}
      </n-divider>

      <n-scrollbar
        class="max-h-400"
        trigger="none"
      >
        <n-space
          vertical
          :size="20"
          class="pr-3"
        >
          <!-- Style & Seed -->
          <n-grid
            :cols="2"
            :x-gap="12"
          >
            <n-grid-item>
              <n-space
                vertical
                :size="8"
              >
                <n-text depth="3">
                  {{ t('avatarPicker.avatarStyle') }}
                </n-text>
                <n-select
                  v-model:value="selectedStyle"
                  :options="styleOptions"
                  filterable
                />
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space
                vertical
                :size="8"
              >
                <n-text depth="3">
                  {{ t('avatarPicker.seed') }}
                </n-text>
                <n-input
                  v-model:value="selectedSeed"
                  :placeholder="t('avatarPicker.seedPlaceholder')"
                />
              </n-space>
            </n-grid-item>
          </n-grid>

          <!-- Transformations -->
          <n-grid
            :cols="2"
            :x-gap="24"
            :y-gap="16"
          >
            <n-grid-item>
              <n-space
                vertical
                :size="8"
              >
                <n-text depth="3">
                  {{ t('avatarPicker.rotate', { degrees: options.rotate }) }}
                </n-text>
                <n-slider
                  v-model:value="options.rotate"
                  :min="0"
                  :max="360"
                  :step="1"
                />
              </n-space>
            </n-grid-item>
            <n-grid-item>
              <n-space
                vertical
                :size="8"
              >
                <n-text depth="3">
                  {{ t('avatarPicker.scale', { percent: options.scale }) }}
                </n-text>
                <n-slider
                  v-model:value="options.scale"
                  :min="0"
                  :max="200"
                  :step="1"
                />
              </n-space>
            </n-grid-item>
            <n-grid-item :span="2">
              <n-space
                align="center"
                justify=""
                class="w-100"
              >
                <n-switch v-model:value="options.flip" />
                <n-text depth="3">
                  {{ t('avatarPicker.flip') }}
                </n-text>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-space>
      </n-scrollbar>

      <n-button
        type="primary"
        block
        size="large"
        @click="handleSave"
      >
        {{ t('avatarPicker.confirm') }}
      </n-button>
    </n-space>
  </n-modal>
</template>
