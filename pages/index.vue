<script setup>
import { ref } from 'vue'

const name = ref('Nikita')

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <h1>This is index page</h1>
  <p>My name is {{ name }}.</p>
  <hr>
  <NuxtLink to="/about">
    About page
  </NuxtLink>
</template>

<style lang="scss">
h1 {
  color: color('primary');
  padding: spacer(5);
}
</style>
