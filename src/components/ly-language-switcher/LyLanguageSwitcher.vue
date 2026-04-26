<script setup>
import { computed } from 'vue'
import { NDropdown, NButton, NIcon } from 'naive-ui'
import { PhTranslate } from 'phosphor-vue'
import { useI18n } from 'vue-i18n'
import { setI18nLanguage } from '@/i18n'

const { locale } = useI18n()

const options = [
  { label: 'English', key: 'en' },
  { label: 'Русский', key: 'ru' },
  { label: 'Română', key: 'ro' }
]

const handleSelect = (key) => {
  setI18nLanguage(key)
}
</script>

<template>
  <n-dropdown trigger="click" :options="options" @select="handleSelect" :value="locale">
    <n-button quaternary circle>
      <template #icon>
        <n-icon>
          <ph-translate />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>
