/**
 * Configuration for external search providers by category.
 * This allows for gradual implementation of external APIs for different lists.
 */
export const EXTERNAL_SEARCH_CONFIG = {
  games: {
    enabled: true,
    provider: 'RAWG',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.games'
  },
  tvshows: {
    enabled: true,
    provider: 'TMDB',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.tvshows'
  },
  films: {
    enabled: true,
    provider: 'TMDB',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.films'
  },
  anime: {
    enabled: true,
    provider: 'TMDB',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.anime'
  },
  manga: {
    enabled: false,
    provider: 'MyAnimeList',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.manga'
  },
  books: {
    enabled: false,
    provider: 'GoogleBooks',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.books'
  },
  music: {
    enabled: false,
    provider: 'Spotify',
    minLength: 2,
    placeholderKey: 'records.searchPlaceholder.music'
  }
}

/**
 * @function getExternalSearchConfig
 * @description Returns the configuration for a specific category
 * @param {string} category 
 * @returns {Object|null}
 */
export function getExternalSearchConfig(category) {
  return EXTERNAL_SEARCH_CONFIG[category] || null
}

/**
 * @function isExternalSearchEnabled
 * @description Checks if external search is enabled for a category
 * @param {string} category 
 * @returns {boolean}
 */
export function isExternalSearchEnabled(category) {
  const config = getExternalSearchConfig(category)
  return config ? config.enabled : false
}
