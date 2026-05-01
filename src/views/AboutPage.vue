<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
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
    class="pt-6"
  >
    <n-grid-item
      span="6 m:5 l:4"
    >
      <n-p>
        {{ t('about.description') }}
      </n-p>

      <n-h4>{{ t('about.howItWorks') }}</n-h4>
      <n-list
        :show-divider="false"
        class="mb-6"
      >
        <n-list-item>
          <n-space
            :wrap-item="false"
            align="start"
            :wrap="false"
          >
            <n-icon
              size="24"
              :component="AccountIcon"
            />
            <n-text>{{ t('about.step1') }}</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space
            :wrap-item="false"
            align="start"
            :wrap="false"
          >
            <n-icon
              size="24"
              :component="DevicesIcon"
            />
            <n-text>{{ t('about.step2') }}</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space
            :wrap-item="false"
            align="start"
            :wrap="false"
          >
            <n-icon
              size="24"
              :component="SyncIcon"
            />
            <n-text>{{ t('about.step3') }}</n-text>
          </n-space>
        </n-list-item>
      </n-list>

      <n-h4>{{ t('about.dataTitle') }}</n-h4>
      <n-p>
        <i18n-t
          keypath="about.dataDescription"
          tag="span"
        >
          <template
            #format1
          >
            <n-a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
              target="_blank"
            >
              JSON
            </n-a>
          </template>
          <template
            #format2
          >
            <n-a
              href="https://en.wikipedia.org/wiki/Comma-separated_values"
              target="_blank"
            >
              CSV
            </n-a>
          </template>
        </i18n-t>
      </n-p>
      <n-list
        :show-divider="false"
        class="mb-6"
      >
        <n-list-item>
          <n-space
            :wrap-item="false"
            align="start"
            :wrap="false"
          >
            <n-icon
              size="24"
              :component="PrivacyIcon"
            />
            <n-text>{{ t('about.privacy') }}</n-text>
          </n-space>
        </n-list-item>
        <n-list-item>
          <n-space
            :wrap-item="false"
            align="start"
            :wrap="false"
          >
            <n-icon
              size="24"
              :component="OpenSourceIcon"
            />
            <n-text>{{ t('about.openSource') }}</n-text>
          </n-space>
        </n-list-item>
      </n-list>

      <n-h4>{{ t('about.communityTitle') }}</n-h4>
      <n-p>
        <i18n-t
          keypath="about.communityDescription"
          tag="span"
        >
          <template
            #link1
          >
            <n-a
              href="https://t.me/nightrunner91"
              target="_blank"
            >
              {{ t('about.telegram') }}
            </n-a>
          </template>
          <template
            #link2
          >
            <n-a
              href="https://github.com/nightrunner91/listify/issues"
              target="_blank"
            >
              {{ t('about.githubIssue') }}
            </n-a>
          </template>
        </i18n-t>
      </n-p>

      <n-p>{{ t('about.thankYou') }}</n-p>

      <n-h4>{{ t('about.techStack') }}</n-h4>
      <n-list
        :show-divider="false"
        class="mb-10"
      >
        <n-list-item
          v-for="(item, index) in usedStuff"
          :key="`item-${index}`"
        >
          <n-space
            :wrap-item="false"
            align="center"
          >
            <n-icon
              size="24"
              :component="item.icon"
            />
            <n-text>{{ item.title }}</n-text>
          </n-space>
        </n-list-item>
      </n-list>
    </n-grid-item>
  </n-grid>
</template>
