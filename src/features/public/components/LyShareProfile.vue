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
  NDivider,
  useMessage
} from 'naive-ui'
import {
  PhCopySimple as CopyIcon, PhArrowSquareOut as OpenIcon 
} from 'phosphor-vue'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
 * @description Generates the shareable public profile URL using the user's UUID or handle
 */
const profileUrl = computed(() => {
  if (!user.value?.id) return ''
  const base = window.location.origin + window.location.pathname
  const identifier = user.value.handle || user.value.id
  return `${base}#/profile/${identifier}`
})

const localHandle = ref('')
const handleStatus = ref('idle') // 'idle', 'checking', 'available', 'taken', 'error', 'invalid'
const handleMessage = ref('')
let debounceTimer = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    localHandle.value = user.value?.handle || ''
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

async function saveHandle() {
  if (handleStatus.value === 'checking' || handleStatus.value === 'invalid' || handleStatus.value === 'taken') return
  if (localHandle.value === (user.value?.handle || '')) return
  
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
  if (handleStatus.value === 'error' || handleStatus.value === 'invalid' || handleStatus.value === 'taken') return 'error'
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
 * @description Copies the profile URL to the clipboard
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
    :title="t('publicProfile.modalTitle')"
    style="max-width: 520px"
    @update:show="closeModal"
  >
    <n-space
      vertical
      :size="20"
    >
      <!-- begin::Visibility Toggle -->
      <n-space
        align="center"
        justify="space-between"
        :wrap-item="false"
      >
        <n-space
          vertical
          :size="4"
        >
          <n-text>{{ t('publicProfile.visibilityLabel') }}</n-text>
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

      <!-- begin::Profile Handle -->
      <n-space vertical :size="4">
        <n-text class="font-weight-600">{{ t('publicProfile.profileHandle') }}</n-text>
        <n-text depth="3" class="fz-12">{{ t('publicProfile.profileHandleDesc') }}</n-text>
        <n-input-group class="mt-2">
          <n-input-group-label>@</n-input-group-label>
          <n-input 
            :value="localHandle" 
            :status="inputStatus"
            :loading="handleStatus === 'checking'"
            @update:value="onHandleInput"
            @keyup.enter="saveHandle"
            :placeholder="t('publicProfile.handlePlaceholder')"
          />
          <n-button 
            type="primary" 
            :disabled="localHandle === (user?.handle || '') || handleStatus === 'invalid' || handleStatus === 'taken' || handleStatus === 'checking'"
            :loading="isUpdating"
            @click="saveHandle"
          >
            {{ t('publicProfile.save') }}
          </n-button>
        </n-input-group>
        <n-text 
          v-if="handleMessage" 
          :type="inputStatus === 'error' ? 'error' : (inputStatus === 'success' ? 'success' : 'default')" 
          class="fz-12"
        >
          {{ handleMessage }}
        </n-text>
      </n-space>
      <!-- end::Profile Handle -->

      <!-- begin::Share Link (only shown when public) -->
      <template v-if="isPublic">
        <n-divider class="my-0" />
        <n-space
          vertical
          :size="8"
        >
          <n-text
            depth="3"
            class="fz-12 font-weight-600 letter-spacing-1"
          >
            {{ t('publicProfile.copyLink').toUpperCase() }}
          </n-text>
          <n-input-group>
            <n-input
              :value="profileUrl"
              readonly
              class="flex-1"
            />
            <n-button @click="copyLink">
              <template #icon>
                <copy-icon />
              </template>
            </n-button>
          </n-input-group>
          <n-button
            text
            type="primary"
            size="small"
            @click="openProfile"
          >
            <template #icon>
              <open-icon />
            </template>
            {{ t('publicProfile.viewPublicProfile') }}
          </n-button>
        </n-space>
      </template>
      <!-- end::Share Link -->
    </n-space>
  </n-modal>
</template>
