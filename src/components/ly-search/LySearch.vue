<script lang="ts" setup>
import { NInput, NIcon } from 'naive-ui'
import { PhMagnifyingGlass as SearchIcon } from 'phosphor-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <n-input
    size="large"
    :placeholder="`Search in ${route.meta.title}...`"
    class="mb-4">
    <template #prefix>
      <search-icon weight="bold" class="opacity-5" />
    </template>
  </n-input>
</template>

<style lang="scss">
.n-input .n-input__prefix {
  margin-right: spacer(2);
}
.n-input .n-input__suffix {
  margin-left: spacer(2);
}
</style>
