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
} from 'naive-ui'
import {
  PhFileVue as VueIcon,
  PhLayout as NaiveIcon,
  PhTextAa as FontIcon,
  PhPhosphorLogo as PhosphorIcon,
  PhDatabase as PostgresIcon,
  PhHardDrive as FastifyIcon,
  PhListPlus as SyncIcon,
  PhUserCircle as AccountIcon,
  PhDesktop as DevicesIcon,
  PhShieldCheck as PrivacyIcon,
  PhGitBranch as OpenSourceIcon,
} from 'phosphor-vue'

const usedStuff = ref([
  {
    icon: VueIcon,
    title: 'Vue 3',
  },
  {
    icon: FastifyIcon,
    title: 'Fastify',
  },
  {
    icon: PostgresIcon,
    title: 'PostgreSQL',
  },
  {
    icon: NaiveIcon,
    title: 'Naive UI',
  },
  {
    icon: FontIcon,
    title: 'Onest Font',
  },
  {
    icon: PhosphorIcon,
    title: 'Phosphor Icons',
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
      <n-p>
        Listify is a personal media tracker built around one idea: your collection should be simple to maintain, always accessible, and entirely yours. Whether you're logging games you've finished, films on your watchlist, books you're reading, or anything in between — Listify keeps it organized without getting in the way.
      </n-p>

      <n-h4>How it works</n-h4>
      <n-list :show-divider="false" class="mb-6">
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="AccountIcon" />
            <n-text>Sign up and create your personal Listify account.</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="DevicesIcon" />
            <n-text>Add and manage records from any device — desktop or mobile.</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="SyncIcon" />
            <n-text>Use built-in categories or create custom lists for anything that doesn't fit the defaults.</n-text>
          </n-space>
        </n-list-item>
      </n-list>

      <n-h4>Your Data, Your Rules</n-h4>
      <n-p>
        Your collection lives on our servers, but it belongs to you. Listify supports full data portability — export your entire collection as a <n-a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON" target="_blank">JSON</n-a> or CSV file at any time. Use it for backups, migration, or just keeping a local copy in your favorite spreadsheet software.
      </n-p>
      <n-list :show-divider="false" class="mb-6">
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="PrivacyIcon" />
            <n-text>No tracking, no ads, no third-party data sharing.</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space :wrap-item="false" align="center">
            <n-icon size="24" :component="OpenSourceIcon" />
            <n-text>Open-source — inspect, fork, or self-host the entire project.</n-text>
          </n-space>
        </n-list-item>
      </n-list>

      <n-h4>Community & Contributions</n-h4>
      <n-p>
        Listify is an actively developed open-source project. New features, categories, and quality-of-life improvements are added regularly. If you have an idea, found a bug, or just want to say hello — reach out via <n-a href="https://t.me/nightrunner91" target="_blank">Telegram</n-a> or <n-a href="https://github.com/nightrunner91/listify/issues" target="_blank">open an issue on GitHub</n-a>. Contributions are always welcome.
      </n-p>

      <n-p>Thank you for using Listify — and for being part of what it's becoming.</n-p>

      <n-h4>Tech Stack</n-h4>
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
