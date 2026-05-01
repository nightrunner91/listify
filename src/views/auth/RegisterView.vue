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
  password: '',
  confirmPassword: ''
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
    trigger: 'blur',
    min: 8
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: (rule, value) => {
      if (!value) return new Error(t('validation.confirmPasswordRequired'))
      if (value !== formModel.value.password) return new Error(t('validation.passwordMismatch'))
      return true
    }
  }
}

async function handleRegister() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        await authStore.register(formModel.value.email, formModel.value.password)
        await Promise.all([
          recordsStore.restoreRecords(),
          themeStore.restoreTheme(),
        ])
        message.success(t('auth.register.successMessage'))
        router.push('/')
      } catch (error) {
        message.error(error.message || t('auth.register.errorMessage'))
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
                  {{ $t('auth.register.title') }}
                </n-h3>
                <n-text depth="3">
                  {{ $t('auth.register.subtitle') }}
                </n-text>
              </n-space>

              <n-form
                ref="formRef"
                :model="formModel"
                :rules="rules"
                size="large"
                @keyup.enter="handleRegister"
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
                    :placeholder="$t('auth.register.passwordPlaceholder')"
                  />
                </n-form-item>

                <n-form-item
                  path="confirmPassword"
                  :label="$t('auth.register.confirmPasswordLabel')"
                >
                  <n-input
                    v-model:value="formModel.confirmPassword"
                    type="password"
                    show-password-on="click"
                    :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
                  />
                </n-form-item>

                <n-form-item :show-label="false">
                  <n-button
                    type="primary"
                    size="large"
                    block
                    :loading="loading"
                    @click="handleRegister"
                  >
                    {{ $t('auth.register.registerButton') }}
                  </n-button>
                </n-form-item>
              </n-form>

              <n-space
                justify="center"
                align="center"
                :size="2"
                vertical
              >
                <n-text depth="3">
                  {{ $t('auth.register.haveAccount') }}
                </n-text>
                <n-button
                  text
                  type="primary"
                  @click="router.push('/login')"
                >
                  {{ $t('auth.register.loginLink') }}
                </n-button>
              </n-space>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </n-layout>
</template>
