<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NCard, NForm, NFormItem, NInput, NButton, NSpace, NH3, NText } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref(null)

const formModel = ref({
  email: '',
  password: ''
})

const rules = {
  email: {
    required: true,
    message: 'Please input your email',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: 'blur'
  }
}

async function handleLogin() {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        await authStore.login(formModel.value.email, formModel.value.password)
        message.success('Logged in successfully!')
        router.push('/')
      } catch (error) {
        message.error(error.message || 'Failed to login')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="auth-container">
    <n-card class="auth-card" size="huge" hoverable>
      <div class="auth-header">
        <n-h3 style="margin-bottom: 0;">Sign in to Listify</n-h3>
        <n-text depth="3">Welcome back!</n-text>
      </div>

      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <n-form-item path="email" label="Email">
          <n-input v-model:value="formModel.email" placeholder="example@email.com" />
        </n-form-item>
        
        <n-form-item path="password" label="Password">
          <n-input
            v-model:value="formModel.password"
            type="password"
            show-password-on="click"
            placeholder="Your password"
          />
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          block
          :loading="loading"
          @click="handleLogin"
          style="margin-top: 12px;"
        >
          Login
        </n-button>
      </n-form>

      <div class="auth-footer">
        <n-text depth="3">Don't have an account? </n-text>
        <n-button text type="primary" @click="router.push('/register')">
          Register here
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--n-color);
  padding: 16px;
}

.auth-card {
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
}
</style>
