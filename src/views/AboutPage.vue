<script setup lang="ts">
import { NP, NGrid, NGridItem, NA } from 'naive-ui'
</script>

<template>
  <n-grid
    :cols="2"
    class="pt-6">
    <n-grid-item span="1">
      <n-p>This application is designed to make it easy for you to keep track of your favorite entertainment choices, whether it's games, films, anime, books, or anything else. Listify lets you manage all your preferences in one place.</n-p>
      <n-p>The interface is designed to enhance your experience by making it easy for you to add, edit, and remove items, view details about each entry, and export/import data in JSON format. You can access your lists from any device because the app uses your browser's localStorage to store your data.</n-p>
      <n-p>The project is open-source and still in the development stage. If you have any suggestions or notice any bugs, please contact me via Telegram <n-a href="https://t.me/nightrunner91" target="_blank">@nightrunner91</n-a> or <n-a href="https://github.com/nightrunner91/listify/issues" target="_blank">open an issue</n-a> on Github. Thank you for choosing Listify.</n-p>
    </n-grid-item>
  </n-grid>
</template>
