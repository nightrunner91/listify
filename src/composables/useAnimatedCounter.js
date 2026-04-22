import { ref, watch, onUnmounted, isRef } from 'vue'

export function useAnimatedCounter(getTarget) {
  const animatedValue = ref(0)
  let frameId = null

  const easeOutQuint = t => 1 - Math.pow(1 - t, 5)

  const animate = (start, end, duration) => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easedProgress = easeOutQuint(progress)
      
      animatedValue.value = Math.floor(easedProgress * (end - start) + start)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }
    frameId = window.requestAnimationFrame(step)
  }

  watch(() => getTarget(), (newValue, oldValue) => {
    if (frameId) {
      window.cancelAnimationFrame(frameId)
    }
    animate(0, newValue, 700)
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
