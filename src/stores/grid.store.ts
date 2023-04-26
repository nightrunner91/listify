/**
 * @module useGridStore
 * @description This store is used to save, update and get grid parameters
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { breakpoints } from '@/theme.config'

export const useGridStore = defineStore('grid', () => {
  
  /**
   * @constant windowSizes [mutable]
   * @type {Object}
   * @description Variable containing reatlime window width and height
   * @param {Number} width - window width in px
   * @param {Number} height - window width in px
   */
  const windowSizes = ref<WindowSizes>({
    width: 0,
    height: 0
  })


  /**
   * @constant gridBreakpoints [declarable]
   * @type {Object}
   * @description
   * Variable with breakpoints used in project.
   * @see {@link https://www.naiveui.com/en-US/dark/docs/customize-theme}
   * @see {@link https://www.naiveui.com/en-US/dark/components/config-provider}
   */
  const gridBreakpoints: GridBreakpoints = breakpoints


  /**
   * @constant currentBreakpoint [computable]
   * @type {String}
   * @description Reactively updates with window resize event
   * @returns
   * String corresponding to the current window width.
   * 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
   * @default 'xs'
   * @example
   * <div v-if="configState.currentBreakpoint == 'md'">Visible on MD</div>
   */
  const currentBreakpoint = computed(() => {
    let result = 'xs'
    Object.entries(gridBreakpoints).forEach(entry => {
      if (windowSizes.value.width >= entry[1]) {
        result = entry[0]
      }
    })
    return result
  })


  const scrollPosition = ref<number>(0)


  const showScroller = computed(() => {
    return scrollPosition.value >= windowSizes.value.height / 2 && screenLargerThen('l')
  })


  /**
   * @function screenLargerThen
   * @description Helps to detect if window reached specific breakpoint
   * @param {String} breakpoint - value based on gridBreakpoints
   * @returns {Boolean}
   * @example
   * <div v-if="configStore.screenLargerThen('lg')">Visible on LG+</div>
   */
  function screenLargerThen(breakpoint: keyof GridBreakpoints):boolean {
    return windowSizes.value.width >= gridBreakpoints[breakpoint]
  }


  /**
   * @function saveWindowSizes
   * @description Reactively saves current window width and height
   */
  function saveWindowSizes():void {
    windowSizes.value.width = window.innerWidth
    windowSizes.value.height = window.innerHeight
  }


  /**
   * @function watchWindowSizes
   * @event resize
   * @description Continously watches for window resize event and saves window sizes
   */
  function watchWindowSizes():void {
    saveWindowSizes()
    window.addEventListener('resize', saveWindowSizes)
  }


  return {
    windowSizes,
    gridBreakpoints,
    currentBreakpoint,
    scrollPosition,
    showScroller,
    watchWindowSizes,
    screenLargerThen,
  }
})
