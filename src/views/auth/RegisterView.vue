<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NCard, NForm, NFormItem, NInput, NButton, NSpace, NH2, NText } from 'naive-ui'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

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
    message: 'Please input your email',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: 'blur',
    min: 8
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: (rule, value) => {
      if (!value) return new Error('Please confirm your password')
      if (value !== formModel.value.password) return new Error('Passwords do not match')
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
        message.success('Account created successfully!')
        router.push('/')
      } catch (error) {
        message.error(error.message || 'Failed to register')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="auth-container">
    <n-card class="auth-card" hoverable>
      <div class="auth-header">
        <n-h2 style="margin-bottom: 0;">Create an Account</n-h2>
        <n-text depth="3">Join Listify today</n-text>
      </div>

      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        size="large"
        @keyup.enter="handleRegister"
      >
        <n-form-item path="email" label="Email">
          <n-input v-model:value="formModel.email" placeholder="example@email.com" />
        </n-form-item>
        
        <n-form-item path="password" label="Password">
          <n-input
            v-model:value="formModel.password"
            type="password"
            show-password-on="click"
            placeholder="At least 8 characters"
          />
        </n-form-item>

        <n-form-item path="confirmPassword" label="Confirm Password">
          <n-input
            v-model:value="formModel.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="Repeat your password"
          />
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          block
          :loading="loading"
          @click="handleRegister"
          style="margin-top: 12px;"
        >
          Register
        </n-button>
      </n-form>

      <div class="auth-footer">
        <n-text depth="3">Already have an account? </n-text>
        <n-button text type="primary" @click="router.push('/login')">
          Log in here
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
