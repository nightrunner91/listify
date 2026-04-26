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

const isEditingUsername = ref(false)
const editableUsername = ref(user.value?.username || '')

const showAvatarPicker = ref(false)

async function toggleEditUsername() {
  if (isEditingUsername.value) {
    if (editableUsername.value.trim() && editableUsername.value !== user.value.username) {
      const success = await authStore.updateProfile({ username: editableUsername.value.trim() })
      if (success) message.success('Username updated')
    }
  } else {
    editableUsername.value = user.value.username
  }
  isEditingUsername.value = !isEditingUsername.value
}

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

// We need a way to trigger import, maybe via a hidden input or just opening the import component
// For now, let's assume we can trigger it or just use the existing logic if available.
</script>

<template>
  <n-card class="ly-user-profile">
    <!-- Background Strip -->
    <n-color-picker
      v-model:value="user.backgroundColor"
      :show-alpha="false"
      class="profile-cover"
      @update:value="updateBackgroundColor"
    />

    <n-space align="center" :wrap-item="false" :size="24" class="profile-content">
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
      <n-space vertical :size="4" class="flex-grow-1">
        <n-space align="center" :size="8">
          <template v-if="!isEditingUsername">
            <n-text strong class="username-display">{{ user?.username }}</n-text>
            <n-button quaternary circle size="tiny" @click="toggleEditUsername">
              <template #icon><n-icon :component="EditIcon" /></template>
            </n-button>
          </template>
          <template v-else>
            <n-input
              v-model:value="editableUsername"
              size="small"
              placeholder="Username"
              autofocus
              @blur="toggleEditUsername"
              @keyup.enter="toggleEditUsername"
              style="width: 200px"
            />
          </template>
        </n-space>
        <n-text depth="3">{{ user?.email }}</n-text>
        <n-text depth="2" class="stats-text">
          <b>{{ totalItems }}</b> items in collection
        </n-text>
      </n-space>

      <!-- Actions -->
      <n-space class="profile-actions">
        <!-- We use the minified variant of LyImport if we can, or just trigger it -->
        <n-button secondary size="small" :render-icon="renderIcon(ImportIcon)" @click="$emit('import')">
          Import
        </n-button>
        <n-button secondary size="small" :render-icon="renderIcon(ExportIcon)" @click="handleExport">
          Export
        </n-button>
        <n-button secondary type="error" size="small" :render-icon="renderIcon(LogoutIcon)" @click="handleLogout">
          Logout
        </n-button>
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
  overflow: hidden;
  position: relative;
  
  :deep(.n-card__content) {
    padding: 0 !important;
  }
}

.profile-cover {
  height: 50px;
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

.profile-content {
  padding: 0 24px;
  margin-top: -20px;
  height: 100px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  
  .profile-avatar {
    border: 4px solid var(--n-card-color);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-overlay {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  background: rgba(0,0,0,0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 20px;
}

.username-display {
  font-size: 1.25rem;
}

.stats-text {
  font-size: 0.9rem;
  margin-top: 4px;
}

.flex-grow-1 {
  flex-grow: 1;
}

@media (max-width: 600px) {
  .profile-actions {
    display: none;
  }
}
</style>
