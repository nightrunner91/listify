<script setup>
import { ref } from 'vue'
import {
  NP,
  NH4,
  NGrid,
  NGridItem,
  NA,
  NList,
  NListItem,
  NIcon,
  NSpace,
  NText,
  NDivider
} from 'naive-ui'
import {
  PhFileVue as VueIcon,
  PhFileTs as TypescriptIcon,
  PhLayout as NaiveIcon,
  PhTextAa as FontIcon,
  PhPhosphorLogo as PhosphorIcon,
} from 'phosphor-vue'

const usedStuff = ref([
  {
    icon: VueIcon,
    title: 'Vue 3'
  },
  {
    icon: TypescriptIcon,
    title: 'Typescript'
  },
  {
    icon: NaiveIcon,
    title: 'Naive UI'
  },
  {
    icon: FontIcon,
    title: 'Onest Font'
  },
  {
    icon: PhosphorIcon,
    title: 'Phosphor Icons'
  },
  
])
</script>

<template>
  <n-grid
    item-responsive
    responsive="screen"
    :cols="6"
    class="pt-6">
    <n-grid-item span="6 m:5 l:4">

      <n-p>Listify is designed to track your favorite entertainment choices, whether it's games, films, anime, books, or anything else.</n-p>
      <n-p>It uses your browser's <n-a href="https://developer.mozilla.org/ru/docs/Web/API/Window/localStorage" target="_blank">localStorage</n-a> to store data, so make sure that your device supports it. Since browser memory isn't a very reliable form of storage, Listify provides import and export of your collection in <n-a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON" target="_blank">JSON</n-a> format. It's recommended to export your collection from time to time to avoid losing it suddenly.</n-p>
      <n-p>Listify is an open-source project that's still in development. If you have any suggestions or encounter any bugs, please feel free to contact via <n-a href="https://t.me/nightrunner91" target="_blank">Telegram</n-a> or <n-a href="https://github.com/nightrunner91/listify/issues" target="_blank">open an issue</n-a> on Github.</n-p>

      <n-p>Thank you for using Listify!</n-p>

      <n-divider />

      <n-h4>Used stuff:</n-h4>
      <n-list :show-divider="false">
        <n-list-item
          v-for="(item, index) in usedStuff"
          :key="`item-${index}`">
          <n-space
            :wrap-item="false"
            align="center">
            <n-icon
              size="24"
              :component="item.icon" />
            <n-text>{{ item.title }}</n-text>
          </n-space>
        </n-list-item>
      </n-list>

    </n-grid-item>
  </n-grid>
</template>
