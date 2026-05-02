<script setup>
import {
  ref,
  computed,
  watch
} from 'vue'
import {
  NAvatar,
  NSpace,
  NText,
  NButton,
  NInput,
  NColorPicker,
  NIcon,
  NPopover,
  NDivider,
  useMessage
} from 'naive-ui'
import {
  PhSignOut as LogoutIcon,
  PhExport as ExportIcon,
  PhDownloadSimple as ImportIcon,
  PhPencilSimple as EditIcon
} from 'phosphor-vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LyAvatarPicker from './LyAvatarPicker.vue'
import LyImport from '@/features/records/components/ly-import/LyImport.vue'
import LyExport from '@/features/records/components/ly-export/LyExport.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const message = useMessage()

const importRef = ref(null)
const exportRef = ref(null)
const showAvatarPicker = ref(false)
const showPopover = ref(false)

const user = computed(() => authStore.user)
const editableUsername = ref(user.value?.username || '')

watch(() => user.value?.username, (newVal) => {
  if (newVal) editableUsername.value = newVal
})

/** Computed avatar URL from user profile settings */
const avatarUrl = computed(() => {
  const style = user.value?.avatarStyle || 'adventurer-neutral'
  const seed = user.value?.avatarSeed || 'default'
  const options = user.value?.avatarOptions || {}

  const query = new URLSearchParams({
    seed,
    flip: (options.flip ?? false).toString(),
    rotate: (options.rotate ?? 0).toString(),
    scale: (options.scale ?? 100).toString(),
  })

  return `https://api.dicebear.com/9.x/${style}/svg?${query.toString()}`
})

/**
 * @function toggleEditUsername
 * @description Saves the edited username if it changed
 */
async function toggleEditUsername() {
  if (editableUsername.value === user.value?.username) return
  if (!editableUsername.value.trim()) {
    editableUsername.value = user.value?.username || ''
    return
  }
  await authStore.updateProfile({ username: editableUsername.value })
}

/**
 * @function updateBackgroundColor
 * @description Updates the profile background color in the store
 * @param {string} color - Hex color string
 */
async function updateBackgroundColor(color) {
  await authStore.updateProfile({ backgroundColor: color })
}

/**
 * @function handleLogout
 * @description Logs out and redirects to login
 */
async function handleLogout() {
  showPopover.value = false
  await authStore.logout()
  router.push('/login')
}

function openImport() {
  showPopover.value = false
  if (importRef.value) importRef.value.showModal = true
}

function openExport() {
  showPopover.value = false
  if (exportRef.value) exportRef.value.showModal = true
}

function openAvatarPicker() {
  showAvatarPicker.value = true
}
</script>

<template>
  <n-space
    v-if="user"
    :wrap-item="false"
    align="center"
    class="ml-2">
    <!-- begin::Avatar Trigger -->
    <n-popover
      v-model:show="showPopover"
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
      :padding="0"
      class="p-0"
    >
      <template #trigger>
        <n-avatar
          round
          :size="32"
          :src="avatarUrl"
          class="cursor-pointer"
        />
      </template>

      <!-- begin::Dropdown Panel -->
      <div
        class="w-200 no-overflow rounded-small"
      >
        <!-- begin::Cover Block -->
        <n-color-picker
          v-model:value="user.backgroundColor"
          :show-alpha="false"
          placement="bottom-end"
          class="h-56 profile-cover-trigger"
          @update:value="updateBackgroundColor"
        >
          <template #label />
        </n-color-picker>
        <!-- end::Cover Block -->

        <!-- begin::Avatar Overlap -->
        <div class="d-flex justify-content-start position-relative px-4">
          <div
            class="cursor-pointer position-relative"
            @click="openAvatarPicker"
          >
            <n-avatar
              round
              :size="56"
              :src="avatarUrl"
              class="profile-avatar d-flex mt-n9"
              :style="{ border: '3px solid var(--n-color)', background: 'var(--n-color)' }"
            />
          </div>
        </div>
        <!-- end::Avatar Overlap -->

        <!-- begin::User Info -->
        <n-space
          vertical
          :size="0"
          :wrap-item="false"
          class="px-4 pb-3"
        >
          <n-input
            v-model:value="editableUsername"
            size="large"
            :placeholder="t('userProfile.usernamePlaceholder')"
            :bordered="false"
            class="w-100 font-weight-500 mb-0"
            @blur="toggleEditUsername"
            @keyup.enter="toggleEditUsername"
          />
          <n-text
            depth="3"
            class="fz-12"
          >
            {{ user?.email }}
          </n-text>
        </n-space>
        <!-- end::User Info -->

        <n-divider class="my-0" />

        <!-- begin::Actions -->
        <n-space
          vertical
          size="small"
          :wrap-item="false"
          class="px-2 py-2"
        >
          <n-button
            quaternary
            size="small"
            class="justify-content-start"
            @click="openImport"
          >
            <template #icon>
              <n-icon :component="ImportIcon" />
            </template>
            {{ t('userProfile.importCollection') }}
          </n-button>
          <n-button
            quaternary
            size="small"
            class="w-100 justify-content-start"
            @click="openExport"
          >
            <template #icon>
              <n-icon :component="ExportIcon" />
            </template>
            {{ t('userProfile.exportCollection') }}
          </n-button>
          <n-button
            quaternary
            type="error"
            size="small"
            class="justify-content-start"
            @click="handleLogout"
          >
            <template #icon>
              <n-icon :component="LogoutIcon" />
            </template>
            {{ t('userProfile.logout') }}
          </n-button>
        </n-space>
        <!-- end::Actions -->
      </div>
      <!-- end::Dropdown Panel -->
    </n-popover>
    <!-- end::Avatar Trigger -->
  </n-space>

  <!-- begin::Hidden Modals -->
  <ly-avatar-picker
    v-model:show="showAvatarPicker"
    :current-style="user?.avatarStyle"
    :current-seed="user?.avatarSeed"
    :current-options="user?.avatarOptions"
    @update="authStore.updateProfile($event)"
  />
  <ly-import
    ref="importRef"
    variant="hidden"
  />
  <ly-export
    ref="exportRef"
    variant="hidden"
  />
  <!-- end::Hidden Modals -->
</template>

<style lang="scss" scoped>
.profile-cover-trigger {
  transition: 0.3s ease;

  :deep(.n-color-picker-trigger) {
    border: none;
    height: 100%;
    padding: 0;
    border-radius: 0;
  }

  :deep(.n-color-picker-trigger__fill) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &:hover {
    opacity: 0.8;
  }
}

:deep(.n-input) {
  background-color: transparent !important;

  .n-input__input-el {
    color: inherit;
  }

  .n-input-wrapper {
    padding: 0;
  }
}

.n-button {
  :deep(.n-button__content) {
    gap: 8px;
  }
}
</style>
