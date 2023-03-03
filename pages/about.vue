<script setup>
import { ref } from 'vue'

const name = ref('Nikita')
</script>

<template>
  <h2>This is about page</h2>
  <hr>
  <NuxtLink to="/">
    Back to Homepage
  </NuxtLink>
</template>
