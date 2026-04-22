import { ref, watch, onUnmounted } from 'vue'

export function useAnimatedCounter(targetValue) {
  const animatedValue = ref(0)
  let frameId = null

  const animate = (start, end, duration) => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      animatedValue.value = Math.floor(progress * (end - start) + start)
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }
    frameId = window.requestAnimationFrame(step)
  }

  watch(targetValue, (newValue, oldValue) => {
    if (frameId) {
      window.cancelAnimationFrame(frameId)
    }
    animate(oldValue || 0, newValue, 800)
  }, { immediate: true })

  onUnmounted(() => {
    if (frameId) {
      window.cancelAnimationFrame(frameId)
    }
  })

  return {
    animatedValue,
  }
}
