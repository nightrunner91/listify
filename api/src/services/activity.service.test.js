import { describe, test } from 'node:test'
import assert from 'node:assert'
import { checkEpisodeProgress, shouldCoalesce } from './activity.service.js'

describe('checkEpisodeProgress', () => {
  test('returns null if oldRecord is missing', () => {
    const result = checkEpisodeProgress(null, { episode: 1 })
    assert.strictEqual(result, null)
  })

  test('returns null for non-episode tracking categories', () => {
    const oldRecord = { id: 'uuid-1', category: 'games', season: 1, episode: 1, title: 'Game' }
    const result = checkEpisodeProgress(oldRecord, { episode: 2 })
    assert.strictEqual(result, null)
  })

  test('returns null if progress is decremented', () => {
    const oldRecord = { id: 'uuid-1', category: 'tvshows', season: 1, episode: 3, title: 'Show' }
    const result = checkEpisodeProgress(oldRecord, { episode: 2 })
    assert.strictEqual(result, null)
  })

  test('returns null if progress is unchanged', () => {
    const oldRecord = { id: 'uuid-1', category: 'tvshows', season: 1, episode: 3, title: 'Show' }
    const result = checkEpisodeProgress(oldRecord, { episode: 3 })
    assert.strictEqual(result, null)
  })

  test('logs activity details for same-season episode increment', () => {
    const oldRecord = { id: 'uuid-1', category: 'tvshows', season: 1, episode: 3, title: 'Show' }
    const result = checkEpisodeProgress(oldRecord, { episode: 4 })
    
    assert.ok(result)
    assert.strictEqual(result.action, 'record_episode_incremented')
    assert.strictEqual(result.category, 'tvshows')
    assert.strictEqual(result.entityId, 'uuid-1')
    assert.strictEqual(result.entityName, 'Show')
    assert.deepStrictEqual(result.metadata, {
      season: 1,
      episode: 4,
      isSeasonTransition: false
    })
  })

  test('logs activity details and detects season increment', () => {
    const oldRecord = { id: 'uuid-1', category: 'tvshows', season: 1, episode: 10, title: 'Show' }
    const result = checkEpisodeProgress(oldRecord, { season: 2, episode: 1 })
    
    assert.ok(result)
    assert.strictEqual(result.action, 'record_episode_incremented')
    assert.deepStrictEqual(result.metadata, {
      season: 2,
      episode: 1,
      isSeasonTransition: true
    })
  })

  test('prevents logging season decrement', () => {
    const oldRecord = { id: 'uuid-1', category: 'tvshows', season: 2, episode: 1, title: 'Show' }
    const result = checkEpisodeProgress(oldRecord, { season: 1, episode: 10 })
    assert.strictEqual(result, null)
  })

  test('handles null/undefined/0 initial values correctly', () => {
    const oldRecord = { id: 'uuid-1', category: 'anime', season: null, episode: null, title: 'Anime' }
    const result = checkEpisodeProgress(oldRecord, { season: 1, episode: 1 })
    
    assert.ok(result)
    assert.deepStrictEqual(result.metadata, {
      season: 1,
      episode: 1,
      isSeasonTransition: true // Went from null (0) to 1
    })
  })
})

describe('shouldCoalesce', () => {
  test('returns false if actions do not match', () => {
    const existing = { action: 'record_created', createdAt: new Date(), metadata: {} }
    const result = shouldCoalesce(existing, 'record_episode_incremented', {}, new Date())
    assert.strictEqual(result, false)
  })

  test('coalesces general activity if within 10 minutes', () => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const existing = { action: 'record_created', createdAt: fiveMinutesAgo }
    
    const result = shouldCoalesce(existing, 'record_created', {}, now)
    assert.strictEqual(result, true)
  })

  test('does not coalesce general activity if older than 10 minutes', () => {
    const now = new Date()
    const elevenMinutesAgo = new Date(now.getTime() - 11 * 60 * 1000)
    const existing = { action: 'record_created', createdAt: elevenMinutesAgo }
    
    const result = shouldCoalesce(existing, 'record_created', {}, now)
    assert.strictEqual(result, false)
  })

  test('coalesces episode increment within 1 minute of same season', () => {
    const now = new Date()
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
    const existing = {
      action: 'record_episode_incremented',
      createdAt: thirtySecondsAgo,
      metadata: { season: 1, episode: 2 }
    }
    const newMetadata = { season: 1, episode: 3, isSeasonTransition: false }

    const result = shouldCoalesce(existing, 'record_episode_incremented', newMetadata, now)
    assert.strictEqual(result, true)
  })

  test('does not coalesce episode increment if older than 1 minute', () => {
    const now = new Date()
    const seventySecondsAgo = new Date(now.getTime() - 70 * 1000)
    const existing = {
      action: 'record_episode_incremented',
      createdAt: seventySecondsAgo,
      metadata: { season: 1, episode: 2 }
    }
    const newMetadata = { season: 1, episode: 3, isSeasonTransition: false }

    const result = shouldCoalesce(existing, 'record_episode_incremented', newMetadata, now)
    assert.strictEqual(result, false)
  })

  test('does not coalesce episode increment if season has changed', () => {
    const now = new Date()
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
    const existing = {
      action: 'record_episode_incremented',
      createdAt: thirtySecondsAgo,
      metadata: { season: 1, episode: 10 }
    }
    const newMetadata = { season: 2, episode: 1, isSeasonTransition: true }

    const result = shouldCoalesce(existing, 'record_episode_incremented', newMetadata, now)
    assert.strictEqual(result, false)
  })

  test('does not coalesce episode increment if flagged as season transition', () => {
    const now = new Date()
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
    const existing = {
      action: 'record_episode_incremented',
      createdAt: thirtySecondsAgo,
      metadata: { season: 2, episode: 0 }
    }
    const newMetadata = { season: 2, episode: 1, isSeasonTransition: true }

    const result = shouldCoalesce(existing, 'record_episode_incremented', newMetadata, now)
    assert.strictEqual(result, false)
  })
})
