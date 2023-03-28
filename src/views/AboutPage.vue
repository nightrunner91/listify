<script setup lang="ts">
import {
  NP,
  NH5,
  NGrid,
  NGridItem,
  NA,
  NList,
  NListItem,
  NIcon,
  NSpace,
} from 'naive-ui'
import {
  PhLink as LinkIcon,
  PhFileVue as VueIcon,
  PhFileTs as TypescriptIcon,
  PhLayout as NaiveIcon,
  PhTextAa as FontIcon,
  PhPhosphorLogo as PhosphorIcon,
} from 'phosphor-vue'
</script>

<template>
  <n-grid
    item-responsive
    responsive="screen"
    :cols="6"
    class="pt-6">
    <n-grid-item span="6 m:5 l:4">
      <n-p>This application is designed to make it easy for you to keep track of your favorite entertainment choices, whether it's games, films, anime, books, or anything else. Listify lets you manage all your preferences in one place. The user-friendly interface lets you effortlessly add, edit, and remove items, view details, and export/import data in JSON format. Plus, your lists are accessible from any device via the app's use of your browser's <n-a href="https://developer.mozilla.org/ru/docs/Web/API/Window/localStorage" target="_blank">localStorage</n-a>.</n-p>
      <n-p>The project is open-source and still in the development stage. If you have any suggestions or notice any bugs, please contact me via Telegram <n-a href="https://t.me/nightrunner91" target="_blank">@nightrunner91</n-a> or <n-a href="https://github.com/nightrunner91/listify/issues" target="_blank">open an issue</n-a> on Github. Thank you for choosing Listify.</n-p>
      <n-h5>Used stuff:</n-h5>
      <n-list :show-divider="false">
        <n-list-item>
          <n-space :wrap-item="false" align="center" size="small">
            <n-icon size="24" :component="VueIcon" />
            <n-text strong>Vue 3</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center" size="small">
            <n-icon size="24" :component="TypescriptIcon" />
            <n-text strong>Typescript</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center" size="small">
            <n-icon size="24" :component="NaiveIcon" />
            <n-text strong>Naive UI</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center" size="small">
            <n-icon size="24" :component="FontIcon" />
            <n-text strong>Onest Font</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center" size="small">
            <n-icon size="24" :component="PhosphorIcon" />
            <n-text strong>Phosphor Icons</n-text>
          </n-space>
        </n-list-item>
      </n-list>
    </n-grid-item>
  </n-grid>
</template>
