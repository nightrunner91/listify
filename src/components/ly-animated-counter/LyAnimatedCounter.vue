<template>
  <span>{{ animatedValue }}</span>
</template>

<script setup>
import { defineProps } from 'vue'
import { useAnimatedCounter } from '@/composables/useAnimatedCounter'

const props = defineProps({
  target: {
    type: Number,
    required: true,
  },
})

const { animatedValue } = useAnimatedCounter(() => props.target)
</script>
