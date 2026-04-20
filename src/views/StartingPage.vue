<script setup>
import { ref } from 'vue'
import {
  NP,
  NH4,
  NH3,
  NGrid,
  NGridItem,
  NA,
  NList,
  NListItem,
  NIcon,
  NSpace,
  NText,
  NDivider,
  NAlert,
} from 'naive-ui'
import {
  PhFileVue as VueIcon,
  PhLayout as NaiveIcon,
  PhTextAa as FontIcon,
  PhPhosphorLogo as PhosphorIcon,
  PhDatabase as PostgresIcon,
  PhDatabase as FastifyIcon,
  PhCloudCheck as SyncIcon,
  PhUserCircle as AccountIcon,
  PhDesktop as DevicesIcon,
} from 'phosphor-vue'

const usedStuff = ref([
  {
    icon: VueIcon,
    title: 'Vue 3'
  },
  {
    icon: NaiveIcon,
    title: 'Naive UI'
  },
  {
    icon: FastifyIcon,
    title: 'Fastify'
  },
  {
    icon: PostgresIcon,
    title: 'PostgreSQL'
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

      <n-h4>How it works</n-h4>
      <n-list :show-divider="false" class="mb-6">
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="AccountIcon" />
            <n-text>Create an account to securely store your data.</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="DevicesIcon" />
            <n-text>Add and manage records from any device.</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="SyncIcon" />
            <n-text>Everything is automatically synced to the server.</n-text>
          </n-space>
        </n-list-item>
      </n-list>

      <n-h4>Your Data is Portable</n-h4>
      <n-p>
        Your collection is safely persisted on our servers. However, we believe in data portability. You can always export your collection as a <n-a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON" target="_blank">JSON</n-a> file for personal backups, migration, or sharing.
      </n-p>

      <n-h4>Community</n-h4>
      <n-p>
        Listify is an open-source project that's continuously evolving. If you have any suggestions or encounter bugs, please feel free to contact via <n-a href="https://t.me/nightrunner91" target="_blank">Telegram</n-a> or <n-a href="https://github.com/nightrunner91/listify/issues" target="_blank">open an issue</n-a> on Github.
      </n-p>

      <n-p>Thank you for using Listify!</n-p>

      <n-h4>Tech stack:</n-h4>
      <n-list :show-divider="false" class="mb-10">
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
