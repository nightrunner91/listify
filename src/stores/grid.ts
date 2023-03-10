import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { breakpoints } from '@/theme.config'

export interface windowSizesTypes {
  width: number | undefined,
  height: number | undefined,
}

function entries<T>(obj: T): Entries<T> {
  return Object.entries(obj) as any;
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export const useThemeStore = defineStore('theme', () => {
  const windowSizes = ref<windowSizesTypes>({
    width: undefined,
    height: undefined
  })

  const currentBreakpoint = computed(() => {
    let result = 'xs' // return 'xs' be default
    for (let i = 0; i < entries(breakpoints).length; i++) {
      if (windowSizes.value.width > entries(breakpoints)[i][1]) {
        result = entries(breakpoints)[i][0]
      }
    }
    return result
  })

  return {
    windowSizes,
    currentBreakpoint,
  }
})
