<script setup>
import { ref } from 'vue'

const test = ref('Page')
</script>

<template>
  <section>
    <h1>About {{ test }}</h1>
  </section>
</template>
