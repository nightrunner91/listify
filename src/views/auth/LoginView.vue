<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  useMessage,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  NH3,
  NText,
  NLayout,
  NGrid,
  NGi
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'
import { useRecordsStore } from '@/stores/records.store'
import { useThemeStore } from '@/stores/theme.store'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const recordsStore = useRecordsStore()
const themeStore = useThemeStore()
const { t } = useI18n()

const loading = ref(false)
const formRef = ref(null)

const formModel = ref({
  email: '',
  password: ''
})

const rules = {
  email: {
    required: true,
    message: t('validation.emailRequired'),
    trigger: 'blur'
  },
  password: {
    required: true,
    message: t('validation.passwordRequired'),
    trigger: 'blur'
  }
}

async function handleLogin() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        await authStore.login(formModel.value.email, formModel.value.password)
        await Promise.all([
          recordsStore.restoreRecords(),
          themeStore.restoreTheme(),
        ])
        message.success(t('auth.login.successMessage'))
        router.push('/')
      } catch (error) {
        message.error(error.message || t('auth.login.errorMessage'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <n-layout position="absolute">
    <n-space
      vertical
      justify="center"
      align="center"
      class="h-100 p-4"
    >
      <n-grid :cols="24">
        <n-gi
          :span="24"
          :m="16"
          :l="10"
          :offset="0"
          :m-offset="4"
          :l-offset="7"
        >
          <n-card
            size="huge"
            hoverable
            content-class="p-14"
          >
            <n-space
              vertical
              :size="32"
            >
              <n-space
                vertical
                align="center"
                :size="2"
              >
                <n-h3 class="mb-0">
                  {{ $t('auth.login.title') }}
                </n-h3>
                <n-text depth="3">
                  {{ $t('auth.login.subtitle') }}
                </n-text>
              </n-space>

              <n-form
                ref="formRef"
                :model="formModel"
                :rules="rules"
                size="large"
                @keyup.enter="handleLogin"
              >
                <n-form-item
                  path="email"
                  :label="$t('auth.login.emailLabel')"
                >
                  <n-input
                    v-model:value="formModel.email"
                    :placeholder="$t('auth.login.emailPlaceholder')"
                  />
                </n-form-item>
                
                <n-form-item
                  path="password"
                  :label="$t('auth.login.passwordLabel')"
                >
                  <n-input
                    v-model:value="formModel.password"
                    type="password"
                    show-password-on="click"
                    :placeholder="$t('auth.login.passwordPlaceholder')"
                  />
                </n-form-item>

                <n-form-item :show-label="false">
                  <n-button
                    type="primary"
                    size="large"
                    block
                    :loading="loading"
                    @click="handleLogin"
                  >
                    {{ $t('auth.login.loginButton') }}
                  </n-button>
                </n-form-item>
              </n-form>

              <n-space
                vertical
                justify="center"
                align="center"
                :size="2"
              >
                <n-text depth="3">
                  {{ $t('auth.login.noAccount') }}
                </n-text>
                <n-button
                  text
                  type="primary"
                  @click="router.push('/register')"
                >
                  {{ $t('auth.login.registerLink') }}
                </n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </n-layout>
</template>
