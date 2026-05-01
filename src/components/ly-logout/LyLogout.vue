<script setup>
import { NButton, NIcon } from 'naive-ui'
import {PhSignOut as LogoutIcon} from 'phosphor-vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <n-button
    v-if="authStore.user"
    quaternary
    size="small"
    type="error"
    @click="handleLogout"
  >
    <template
      #icon
    >
      <n-icon
        :component="LogoutIcon"
        :size="18"
      />
    </template>
    <span>{{ t('userProfile.logout') }}</span>
  </n-button>
</template>

