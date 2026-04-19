<script setup>
import { NLayoutHeader, NSpace, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

import LyLogo from '@/components/ly-logo/LyLogo.vue'
import LyImport from '@/components/ly-import/LyImport.vue'
import LyExport from '@/components/ly-export/LyExport.vue'
import LyThemeSwitcher from '@/components/ly-theme-switcher/LyThemeSwitcher.vue'
import LyGithub from '@/components/ly-github/LyGithub.vue'
import LyVersion from '@/components/ly-version/LyVersion.vue'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <n-layout-header
    embedded
    style="height: 56px;"
    class="px-3"
    bordered>
    <n-space
      :wrap-item="false"
      align="center"
      class="w-100 h-100">
      <ly-logo />
      <ly-import variant="minified" />
      <ly-export />
      <ly-theme-switcher />
      <ly-github />
      <ly-version />
      <n-button v-if="authStore.user" quaternary type="error" @click="handleLogout">
        Logout
      </n-button>
    </n-space>
  </n-layout-header>
</template>
