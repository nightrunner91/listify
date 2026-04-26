<script setup>
import { ref, computed } from 'vue'
import {
  NCard,
  NAvatar,
  NSpace,
  NText,
  NButton,
  NInput,
  NColorPicker,
  NModal,
  NGrid,
  NGridItem,
  NIcon,
  useMessage,
} from 'naive-ui'
import {
  PhSignOut as LogoutIcon,
  PhDownloadSimple as ExportIcon,
  PhUploadSimple as ImportIcon,
  PhPencilSimple as EditIcon,
  PhCheck as SaveIcon,
  PhDiceFive as RandomIcon,
} from 'phosphor-vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRecordsStore } from '@/stores/records.store'
import { renderIcon } from '@/utils/render-icon'
import LyAvatarPicker from './LyAvatarPicker.vue'

const authStore = useAuthStore()
const recordsStore = useRecordsStore()
const message = useMessage()

const user = computed(() => authStore.user)
const totalItems = recordsStore.allRecordsLength()

const editableUsername = ref(user.value?.username || '')

const showAvatarPicker = ref(false)

async function updateBackgroundColor(color) {
  await authStore.updateProfile({ backgroundColor: color })
}

const avatarUrl = computed(() => {
  const style = user.value?.avatarStyle || 'adventurer'
  const seed = user.value?.avatarSeed || 'default'
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`
})

function handleLogout() {
  authStore.logout()
}

function handleExport() {
  recordsStore.exportCollection()
}
</script>

<template>
  <n-card class="ly-user-profile no-overflow" content-class="p-0">
    <n-space vertical :wrap-item="false" :size="0">
      <!-- Background Strip -->
      <n-color-picker
        v-model:value="user.backgroundColor"
        :show-alpha="false"
        placement="bottom-end"
        class="profile-cover"
        @update:value="updateBackgroundColor"
      >
        <template #label></template>
      </n-color-picker>

      <n-space align="center" :wrap-item="false" size="large" class="profile-content px-5 py-4">
        <!-- Avatar -->
        <div class="avatar-container" @click="showAvatarPicker = true">
          <n-avatar
            round
            :size="80"
            :src="avatarUrl"
            class="profile-avatar"
          />
          <div class="avatar-overlay">
            <n-icon :component="EditIcon" />
          </div>
        </div>

        <!-- Info -->
        <n-space vertical :size="4" :wrap-item="false">
          <n-space :size="0" vertical>
            <n-input
              v-model:value="editableUsername"
              size="small"
              placeholder="Username"
              autofocus
              @blur="toggleEditUsername"
              @keyup.enter="toggleEditUsername"
              style="width: 200px"
              class="profile-name"
            />
            <n-text depth="3" class="profile-email">{{ user?.email }}</n-text>
          </n-space>
        </n-space>
      </n-space>
    </n-space>

    <ly-avatar-picker
      v-model:show="showAvatarPicker"
      :current-style="user?.avatarStyle"
      :current-seed="user?.avatarSeed"
      @update="authStore.updateProfile($event)"
    />
  </n-card>
</template>

<style lang="scss" scoped>
.ly-user-profile {
}

.profile-cover {
  height: 60px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

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
}

.profile-name {
  background-color: transparent !important;
  height: 28px;
  width: auto;
  display: inline-flex;

  :deep(.n-input__border),
  :deep(.n-input__state-border) {
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.n-input__input-el) {
    font-size: 1.25rem;
    height: 100%;
    font-weight: 500;
    line-height: 1.6;
    color: inherit;
    padding-left: 0;

    &:hover, &:focus {
      opacity: 0.85;
    }
  }

  :deep(.n-input-wrapper) {
    padding-left: 0;
  }
}

.profile-email {
  font-size: 12px;
  line-height: 16px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  display: flex;
  border: 3px solid var(--n-color);
  border-radius: 50%;
  margin-top: -30px;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background: rgba(0,0,0,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 20px;
}
</style>
