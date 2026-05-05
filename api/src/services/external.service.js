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
 * @function searchTMDB
 * @description Searches for media using the TMDB API
 * @param {string} query - The search query
 * @param {string} type - 'tv', 'movie', or 'multi'
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchTMDB(query, type) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured')
  }

  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`
  
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.status_message || `TMDB API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return (data.results || [])
    .filter(item => item.media_type !== 'person')
    .slice(0, 5)
    .map(item => {
      const title = item.title || item.name || 'Unknown'
      const date = item.release_date || item.first_air_date
      const year = date ? ` (${date.split('-')[0]})` : ''
      const label = `${title}${year}`

      return {
        id: item.id,
        label: label,
        value: title // We only put the title into the input, without the year
      }
    })
}

/**
 * @function searchOpenLibrary
 * @description Searches for books using the Open Library Search API
 * @param {string} query - The search query
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ListifyApp/1.0 (https://github.com/nightrunner91/listify)'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return (data.docs || []).map(book => {
    const title = book.title || 'Unknown Title'
    const authors = book.author_name ? ` - ${book.author_name.join(', ')}` : ''
    const year = book.first_publish_year ? ` (${book.first_publish_year})` : ''
    const label = `${title}${authors}${year}`

    return {
      id: book.key.replace('/works/', ''),
      label: label,
      value: title
    }
  })
}

/**
 * @function searchJikan
 * @description Searches for manga using the Jikan API (MyAnimeList)
 * @param {string} query - The search query
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchJikan(query) {
  const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`
  
  const response = await fetch(url)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Jikan API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return (data.data || []).map(item => {
    const title = item.title || 'Unknown Title'
    const year = item.published?.prop?.from?.year ? ` (${item.published.prop.from.year})` : ''
    const label = `${title}${year}`

    return {
      id: item.mal_id.toString(),
      label: label,
      value: title
    }
  })
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
    case 'tvshows':
      return await searchTMDB(query, 'tv')
    case 'films':
      return await searchTMDB(query, 'movie')
    case 'anime':
      // TMDB includes anime mostly as TV shows, but some as movies.
      // Using multi search to get both.
      return await searchTMDB(query, 'multi')
    case 'books':
      return await searchOpenLibrary(query)
    case 'manga':
      return await searchJikan(query)
    default:
      return []
  }
}
