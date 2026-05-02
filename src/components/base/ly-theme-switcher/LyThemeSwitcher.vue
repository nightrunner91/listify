<script setup>
import {
  computed,
  h
} from 'vue'
import {
  PhSun as LightIcon,
  PhMoon as DarkIcon,
  PhMonitor as SystemIcon
} from 'phosphor-vue'
import { useThemeStore } from '@/stores/theme.store'
import {
  NButton,
  NIcon,
  NDropdown
} from 'naive-ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const themeStore = useThemeStore()

const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const themeOptions = computed(() => [
  {
    label: t('common.light'),
    key: 'light',
    icon: renderIcon(LightIcon)
  },
  {
    label: t('common.dark'),
    key: 'dark',
    icon: renderIcon(DarkIcon)
  },
  {
    label: t('common.system'),
    key: 'system',
    icon: renderIcon(SystemIcon)
  }
])

function handleSelect(key) {
  themeStore.setTheme(key)
}

const currentThemeIcon = computed(() => {
  if (themeStore.themeMode === 'light') return LightIcon
  if (themeStore.themeMode === 'dark') return DarkIcon
  return SystemIcon
})
</script>

<template>
  <n-dropdown
    :options="themeOptions"
    :value="themeStore.themeMode"
    trigger="click"
    placement="bottom-end"
    size="small"
    @select="handleSelect"
  >
    <n-button
      quaternary
      circle
    >
      <template #icon>
        <n-icon
          :component="currentThemeIcon"
          :size="18"
        />
      </template>
    </n-button>
  </n-dropdown>
</template>
