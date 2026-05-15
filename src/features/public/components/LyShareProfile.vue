<script setup>
import {
  ref,
  computed,
  watch
} from 'vue'
import {
  NModal,
  NCard,
  NSpace,
  NText,
  NSwitch,
  NInput,
  NButton,
  NInputGroup,
  NInputGroupLabel,
  useMessage
} from 'naive-ui'
import {
  PhCopySimple as CopyIcon,
  PhArrowSquareOut as OpenIcon,
  PhFloppyDisk as SaveIcon
} from 'phosphor-vue'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'
import { useGridStore } from '@/stores/grid.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gridStore = useGridStore()
const authStore = useAuthStore()
const message = useMessage()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const isUpdating = ref(false)

const user = computed(() => authStore.user)
const isPublic = computed(() => user.value?.isPublic ?? false)

/**
 * @description The base URL prefix shown in the input (read-only portion)
 */
const BASE_PREFIX = 'listify-me.up.railway.app/#/u/'

/**
 * @description Generates the shareable public profile URL using the user's handle or short UUID
 */
const profileUrl = computed(() => {
  if (!user.value?.id) return ''
  const base = window.location.origin + window.location.pathname
  const identifier = user.value.handle || user.value.id.substring(0, 8)
  return `${base}#/u/${identifier}`
})

/**
 * @description The prefix shown in the input, dynamic based on resolution
 */
const displayPrefix = computed(() => {
  return gridStore.screenLargerThen('xl') ? BASE_PREFIX : '@'
})

const localHandle = ref('')
const handleStatus = ref('idle') // 'idle', 'checking', 'available', 'taken', 'error', 'invalid'
const handleMessage = ref('')
let debounceTimer = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    localHandle.value = user.value?.handle || user.value?.id?.substring(0, 8) || ''
    handleStatus.value = 'idle'
    handleMessage.value = ''
  }
})

const handleRegex = /^[a-zA-Z0-9_-]+$/

function onHandleInput(value) {
  localHandle.value = value.toLowerCase().trim()
  handleStatus.value = 'checking'
  handleMessage.value = ''

  if (!localHandle.value) {
    handleStatus.value = 'idle'
    return
  }

  if (localHandle.value.length < 3 || localHandle.value.length > 30) {
    handleStatus.value = 'invalid'
    handleMessage.value = t('publicProfile.handleLength')
    return
  }

  if (!handleRegex.test(localHandle.value)) {
    handleStatus.value = 'invalid'
    handleMessage.value = t('publicProfile.handleInvalidChars')
    return
  }

  if (localHandle.value === user.value?.handle) {
    handleStatus.value = 'idle'
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(checkHandle, 500)
}

async function checkHandle() {
  try {
    const res = await api.get(`/public/check-handle/${localHandle.value}`)
    if (res.available) {
      handleStatus.value = 'available'
      handleMessage.value = t('publicProfile.handleAvailable')
    } else {
      handleStatus.value = 'taken'
      handleMessage.value = t('publicProfile.handleTaken')
    }
  } catch (e) {
    handleStatus.value = 'error'
    handleMessage.value = t('publicProfile.handleCheckError')
  }
}

const isSaveable = computed(() => {
  const currentIdentifier = user.value?.handle || user.value?.id?.substring(0, 8) || ''
  return (
    localHandle.value !== currentIdentifier &&
    handleStatus.value !== 'checking' &&
    handleStatus.value !== 'invalid' &&
    handleStatus.value !== 'taken'
  )
})

async function saveHandle() {
  if (!isSaveable.value) return

  isUpdating.value = true
  try {
    await authStore.updateProfile({ handle: localHandle.value || null })
    message.success(t('publicProfile.handleSaved'))
    handleStatus.value = 'idle'
    handleMessage.value = ''
  } catch (e) {
    message.error(e.message || t('publicProfile.handleSaveError'))
  } finally {
    isUpdating.value = false
  }
}

const inputStatus = computed(() => {
  if (['error', 'invalid', 'taken'].includes(handleStatus.value)) return 'error'
  if (handleStatus.value === 'available') return 'success'
  return undefined
})

/**
 * @function toggleVisibility
 * @description Toggles the isPublic flag on the user profile via the API
 */
async function toggleVisibility(newValue) {
  if (isUpdating.value) return
  isUpdating.value = true
  try {
    await authStore.updateProfile({ isPublic: newValue })
  } catch (e) {
    console.error('Failed to update visibility:', e)
  } finally {
    isUpdating.value = false
  }
}

/**
 * @function copyLink
 * @description Copies the full profile URL to the clipboard
 */
async function copyLink() {
  try {
    await navigator.clipboard.writeText(profileUrl.value)
    message.success(t('publicProfile.copied'))
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

/**
 * @function openProfile
 * @description Opens the public profile in a new browser tab
 */
function openProfile() {
  window.open(profileUrl.value, '_blank', 'noopener,noreferrer')
}

function closeModal() {
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    transform-origin="center"
    to="body"
    :style="{ width: gridStore.currentBreakpoint === 'xs' ? '300px' : '530px' }"
    :title="t('publicProfile.shareModalTitle')"
    :size="gridStore.currentBreakpoint === 'xs' ? 'medium' : 'huge'"
    @update:show="closeModal"
  >
    <n-space
      vertical
      :size="24"
    >
      <!-- begin::Visibility Toggle -->
      <n-space
        align="center"
        justify="space-between"
      >
        <n-space
          vertical
          :size="0"
          class="lh-1"
        >
          <n-text class="font-weight-500">
            {{ t('publicProfile.visibilityLabel') }}
          </n-text>
          <n-text
            depth="3"
            class="fz-12"
          >
            {{ isPublic ? t('publicProfile.visibilityOn') : t('publicProfile.visibilityOff') }}
          </n-text>
        </n-space>
        <n-switch
          :value="isPublic"
          :loading="isUpdating"
          @update:value="toggleVisibility"
        />
      </n-space>
      <!-- end::Visibility Toggle -->

      <!-- begin::Unified URL Input Group -->
      <n-space
        vertical
        :size="6"
      >
        <n-input-group>
          <n-input-group-label class="fz-12">
            {{ displayPrefix }}
          </n-input-group-label>
          <n-input
            :value="localHandle"
            :status="inputStatus"
            :loading="handleStatus === 'checking'"
            @update:value="onHandleInput"
            @keyup.enter="saveHandle"
            :placeholder="t('publicProfile.handlePlaceholder')"
            :disabled="!isPublic"
          />
          <n-button
            type="primary"
            :disabled="!isSaveable || !isPublic"
            @click="saveHandle"
          >
            {{ t('publicProfile.save') }}
          </n-button>
        </n-input-group>

        <!-- Action row -->
        <n-space
          align="center"
          justify="space-between"
          :size="8"
        >
          <n-button
            text
            type="primary"
            size="small"
            :disabled="!isPublic"
            @click="openProfile"
          >
            <template #icon>
              <open-icon />
            </template>
            {{ t('publicProfile.viewPublicProfile') }}
          </n-button>
        </n-space>
      </n-space>
      <!-- end::Unified URL Input Group -->
    </n-space>

  </n-modal>
</template>

<style scoped>
/* No custom CSS needed here. Using NaiveUI and Nightpack utility system. */
</style>

