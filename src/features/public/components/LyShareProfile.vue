<script setup>
import {
  ref,
  computed
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
  NDivider,
  useMessage
} from 'naive-ui'
import {
  PhCopySimple as CopyIcon, PhArrowSquareOut as OpenIcon 
} from 'phosphor-vue'
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
 * @description Generates the shareable public profile URL using the user's UUID
 */
const profileUrl = computed(() => {
  if (!user.value?.id) return ''
  const base = window.location.origin + window.location.pathname
  return `${base}#/user/${user.value.id}`
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
    style="max-width: 460px"
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
            <n-button
              secondary
              type="primary"
              @click="copyLink"
            >
              <template #icon>
                <copy-icon />
              </template>
              {{ t('publicProfile.copyLink') }}
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
