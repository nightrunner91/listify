<script setup>
import { ref } from 'vue'

const name = ref('Nikita')

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <h1>This is about page</h1>
  <p>My name is still {{ name }} btw.</p>
  <hr>
  <NuxtLink to="/">
    Back to Homepage
  </NuxtLink>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/@core/globals.scss';

h1 {
  color: color('danger');
}
</style>
