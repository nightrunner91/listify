<script setup>
import { ref } from 'vue'

const name = ref('Nikita')

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <h2>This is about page</h2>
  <p>My name is still {{ name }} btw.</p>
  <hr>
  <NuxtLink to="/">
    Back to Homepage
  </NuxtLink>
</template>
