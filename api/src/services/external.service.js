/**
 * @module ExternalService
 * @description Service for interacting with external APIs (RAWG, TMDB, etc.)
 */

/**
 * @function searchGames
 * @description Searches for games using the RAWG API
 * @param {string} query - The search query
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchGames(query) {
  const apiKey = process.env.RAWG_API_KEY
  if (!apiKey) {
    throw new Error('RAWG_API_KEY is not configured')
  }

  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=5`
  
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `RAWG API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  // Map RAWG results to a unified format for Naive UI AutoComplete
  // label: what is shown in the dropdown
  // value: what is put into the input on selection
  return (data.results || []).map(game => ({
    id: game.id,
    label: game.name,
    value: game.name
  }))
}

/**
 * @function externalSearch
 * @description Unified search method for different categories
 * @param {string} query
 * @param {string} category
 */
export async function externalSearch(query, category) {
  if (!query || query.trim().length < 2) return []

  switch (category) {
    case 'games':
      return await searchGames(query)
    // Future categories can be added here
    // case 'tvshows':
    // case 'films':
    //   return await searchMovies(query)
    default:
      return []
  }
}
