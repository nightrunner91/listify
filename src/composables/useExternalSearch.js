import { ref } from 'vue'
import { api } from '@/api/client'

/**
 * @function useExternalSearch
 * @description Composable for fetching suggestions from external APIs via backend proxy
 */
export function useExternalSearch() {
  const suggestions = ref([])
  const isLoading = ref(false)
  let debounceTimeout = null

  /**
   * @function search
   * @description Performs a debounced search request
   * @param {string} query 
   * @param {string} category 
   */
  const search = (query, category) => {
    if (!query || query.trim().length < 2) {
      suggestions.value = []
      return
    }

    if (debounceTimeout) clearTimeout(debounceTimeout)

    debounceTimeout = setTimeout(async () => {
      isLoading.value = true
      try {
        const results = await api.get(`/external/search?q=${encodeURIComponent(query)}&category=${category}`)
        suggestions.value = results || []
      } catch (err) {
        console.error('External search failed:', err)
        suggestions.value = []
      } finally {
        isLoading.value = false
      }
    }, 500)
  }

  return {
    suggestions,
    isLoading,
    search
  }
}
