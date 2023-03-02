<script setup>
import { ref } from 'vue'

const test = ref('Welcome')
</script>

<template>
  <div>
    <h1>{{ test }} to the homepage</h1>
  </div>
</template>
