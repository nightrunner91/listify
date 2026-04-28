<script setup>
import { computed, h } from 'vue'
import { NDropdown, NButton, NIcon } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { setI18nLanguage } from '@/i18n'

const { locale } = useI18n()

const flagMap = {
  en: 'gb',
  ru: 'ru',
  ro: 'ro'
}

const renderFlag = (countryCode) => {
  return () => h(NIcon, null, { 
    default: () => h('span', { class: `fi fi-${countryCode} fis ly-flag` }) 
  })
}

const options = [
  { label: 'English', key: 'en', icon: renderFlag(flagMap.en) },
  { label: 'Русский', key: 'ru', icon: renderFlag(flagMap.ru) },
  { label: 'Română', key: 'ro', icon: renderFlag(flagMap.ro) }
]

const currentFlag = computed(() => flagMap[locale.value] || flagMap.en)

const handleSelect = (key) => {
  setI18nLanguage(key)
}
</script>

<template>
  <n-dropdown trigger="click" :options="options" @select="handleSelect" :value="locale" size="small">
    <n-button quaternary circle>
      <template #icon>
        <n-icon>
          <span :class="['fi', `fi-${currentFlag}`, 'fis', 'ly-flag']"></span>
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<style scoped>
.ly-flag {
  border-radius: 50%;
  width: 1em;
  height: 1em;
  display: block;
}
</style>
