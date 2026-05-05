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
  try {
    const apiKey = process.env.RAWG_API_KEY
    if (!apiKey) {
      console.warn('RAWG_API_KEY is not configured')
      return []
    }

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=5`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`RAWG API error: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    
    // label: what is shown in the dropdown
    // value: what is put into the input on selection
    return (data.results || []).map(game => {
      const year = game.released ? ` (${game.released.split('-')[0]})` : ''
      const label = `${game.name}${year}`
      return {
        id: game.id,
        label: label,
        value: label
      }
    })
  } catch (error) {
    console.error('Error in searchGames:', error)
    return []
  }
}

/**
 * @function searchTMDB
 * @description Searches for media using the TMDB API
 * @param {string} query - The search query
 * @param {string} type - 'tv', 'movie', or 'multi'
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchTMDB(query, type) {
  try {
    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey) {
      console.warn('TMDB_API_KEY is not configured')
      return []
    }

    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`TMDB API error: ${response.statusText}`)
      return []
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
          value: label
        }
      })
  } catch (error) {
    console.error('Error in searchTMDB:', error)
    return []
  }
}

/**
 * @function searchITunes
 * @description Searches for media (books, music) using the iTunes Search API
 * @param {string} query - The search query
 * @param {string} entity - 'ebook' or 'musicTrack'
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchITunes(query, entity = 'ebook') {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=5`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`iTunes Search API error: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    
    return (data.results || []).map(item => {
      const title = item.trackName || item.collectionName || 'Unknown Title'
      const creator = item.artistName ? ` - ${item.artistName}` : ''
      const yearStr = item.releaseDate ? item.releaseDate.substring(0, 4) : ''
      const year = yearStr ? ` (${yearStr})` : ''
      const label = `${title}${creator}${year}`

      return {
        id: item.trackId ? item.trackId.toString() : (item.collectionId ? item.collectionId.toString() : Math.random().toString()),
        label: label,
        value: label
      }
    })
  } catch (error) {
    console.error('Error in searchITunes:', error)
    return []
  }
}

/**
 * @function searchJikan
 * @description Searches for anime or manga using the Jikan API (MyAnimeList)
 * @param {string} query - The search query
 * @param {string} type - 'anime' or 'manga'
 * @returns {Promise<Array>} - List of suggestions in { id, label, value } format
 */
export async function searchJikan(query, type = 'manga') {
  try {
    const endpoint = type === 'anime' ? 'anime' : 'manga'
    const url = `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(query)}&limit=5`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Jikan API error: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    
    return (data.data || []).map(item => {
      const title = item.title || 'Unknown Title'
      
      // Determine year based on type
      let yearValue = ''
      if (type === 'anime') {
        yearValue = item.aired?.prop?.from?.year || ''
      } else {
        yearValue = item.published?.prop?.from?.year || ''
      }
      
      const year = yearValue ? ` (${yearValue})` : ''
      const label = `${title}${year}`

      return {
        id: item.mal_id.toString(),
        label: label,
        value: label
      }
    })
  } catch (error) {
    console.error('Error in searchJikan:', error)
    return []
  }
}

/**
 * @function externalSearch
 * @description Unified search method for different categories
 * @param {string} query
 * @param {string} category
 */
export async function externalSearch(query, category) {
  if (!query || query.trim().length < 2) return []

  try {
    switch (category) {
      case 'games':
        return await searchGames(query)
      case 'tvshows':
        return await searchTMDB(query, 'tv')
      case 'films':
        return await searchTMDB(query, 'movie')
      case 'anime':
        return await searchJikan(query, 'anime')
      case 'books':
        return await searchITunes(query, 'ebook')
      case 'music':
        return await searchITunes(query, 'musicTrack')
      case 'manga':
        return await searchJikan(query, 'manga')
      default:
        return []
    }
  } catch (error) {
    console.error(`Error in externalSearch for category ${category}:`, error)
    return []
  }
}
