import { db } from '../db/index.js'
import { activities } from '../db/schema.js'
import {
  eq,
  desc,
  and,
  gte,
  sql
} from 'drizzle-orm'

const MAX_ACTIVITIES_PER_USER = 100

/**
 * Helper to check if the update is an episode/season increment for TV shows or Anime.
 * 
 * @param {Object} oldRecord - The current record in the database
 * @param {Object} updates - The updates being applied
 * @returns {Object|null} Activity logging details, or null if not an increment
 */
export function checkEpisodeProgress(oldRecord, updates) {
  if (!oldRecord) return null
  const isEpisodeTrackingCategory = oldRecord.category === 'tvshows' || oldRecord.category === 'anime'
  if (!isEpisodeTrackingCategory) return null

  const oldSeason = oldRecord.season || 0
  const oldEpisode = oldRecord.episode || 0
  
  const newSeason = updates.season !== undefined ? (updates.season || 0) : oldSeason
  const newEpisode = updates.episode !== undefined ? (updates.episode || 0) : oldEpisode

  const isSeasonIncrement = newSeason > oldSeason
  const isEpisodeIncrement = newSeason === oldSeason && newEpisode > oldEpisode

  if (isSeasonIncrement || isEpisodeIncrement) {
    return {
      action: 'record_episode_incremented',
      category: oldRecord.category,
      entityId: oldRecord.id,
      entityName: updates.title || oldRecord.title,
      metadata: {
        season: newSeason,
        episode: newEpisode,
        isSeasonTransition: isSeasonIncrement
      }
    }
  }

  return null
}

/**
 * Helper to determine if a new activity should coalesce with an existing one.
 * 
 * @param {Object} existing - The existing activity from the DB
 * @param {string} newAction - The new action name
 * @param {Object} newMetadata - The new metadata
 * @param {Date} now - The current time
 * @returns {boolean} True if they should coalesce, false otherwise
 */
export function shouldCoalesce(existing, newAction, newMetadata, now = new Date()) {
  if (!existing || existing.action !== newAction) return false

  const elapsed = now.getTime() - new Date(existing.createdAt).getTime()
  
  if (newAction === 'record_episode_incremented') {
    // 1-minute debounce for episode increments
    if (elapsed > 1 * 60 * 1000) return false

    // Season transitions should never coalesce/debounce (must create a new log)
    const existingSeason = existing.metadata?.season
    const newSeason = newMetadata?.season
    const isSeasonTransition = newMetadata?.isSeasonTransition

    if (isSeasonTransition || existingSeason !== newSeason) {
      return false
    }

    return true
  }

  // Default 10-minute coalesce for other activities
  return elapsed <= 10 * 60 * 1000
}

/**
 * Log a user activity to the database.
 * 
 * @param {string} userId - UUID of the user
 * @param {Object} data - Activity data
 * @param {string} data.action - Action key (e.g., 'record_created')
 * @param {string} [data.category] - Category (e.g., 'games')
 * @param {string} [data.entityId] - UUID of the item/list
 * @param {string} [data.entityName] - Name of the item/list
 * @param {Object} [data.metadata] - Extra info (score, listName, etc.)
 */
export async function logActivity(userId, {
  action, category, entityId, entityName, metadata 
}) {
  // Guard clause: skip logging for item actions if title is null, undefined, or an empty string.
  // We specifically target actions that are supposed to have an entity name (title).
  const isItemAction = action.startsWith('record_') || action.startsWith('custom_list_record_')
  const isNameEmpty = !entityName || (typeof entityName === 'string' && entityName.trim() === '')

  if (isItemAction && isNameEmpty) {
    return
  }
  try {
    const now = new Date()

    // Coalescing logic: if there's a recent activity for the same entity and action, update it
    if (entityId) {
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
      const [existing] = await db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.userId, userId),
            eq(activities.action, action),
            eq(activities.entityId, entityId),
            gte(activities.createdAt, tenMinutesAgo)
          )
        )
        .orderBy(desc(activities.createdAt))
        .limit(1)

      if (existing && shouldCoalesce(existing, action, metadata, now)) {
        const [updated] = await db
          .update(activities)
          .set({
            entityName,
            metadata: metadata ?? existing.metadata,
            createdAt: now, // Move to top of timeline
          })
          .where(eq(activities.id, existing.id))
          .returning()
        
        // No need to prune on update since count hasn't changed
        return updated
      }
    }

    const [inserted] = await db
      .insert(activities)
      .values({
        userId,
        action,
        category,
        entityId,
        entityName,
        metadata,
        createdAt: now,
      })
      .returning()

    // Prune old activities asynchronously to avoid blocking the main request
    pruneActivities(userId).catch(err => console.error('[ActivityService] Pruning failed:', err))

    return inserted
  } catch (err) {
    // We log the error but don't rethrow to avoid interrupting the main request flow
    console.error('[ActivityService] Failed to log activity:', err)
  }
}

/**
 * Log multiple activities in a single batch.
 * 
 * @param {string} userId - UUID of the user
 * @param {Array} items - Array of activity data objects
 */
export async function logBatchActivities(userId, items) {
  if (!items || items.length === 0) return

  try {
    const filteredItems = items.filter(item => {
      const isItemAction = item.action.startsWith('record_') || item.action.startsWith('custom_list_record_')
      const isNameEmpty = !item.entityName || (typeof item.entityName === 'string' && item.entityName.trim() === '')
      return !(isItemAction && isNameEmpty)
    })

    if (filteredItems.length === 0) return

    const values = filteredItems.map(item => ({
      userId,
      action: item.action,
      category: item.category,
      entityId: item.entityId,
      entityName: item.entityName,
      metadata: item.metadata,
      createdAt: new Date(),
    }))

    const inserted = await db.insert(activities).values(values).returning()
    
    // Prune once after batch insertion
    pruneActivities(userId).catch(err => console.error('[ActivityService] Pruning failed:', err))
    
    return inserted
  } catch (err) {
    console.error('[ActivityService] Failed to log batch activities:', err)
  }
}

/**
 * Keep only the most recent N activities for a user.
 * 
 * @param {string} userId - UUID of the user
 */
async function pruneActivities(userId) {
  // Find the timestamp of the Nth most recent activity
  const offsetRows = await db
    .select({ createdAt: activities.createdAt })
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.createdAt))
    .offset(MAX_ACTIVITIES_PER_USER)
    .limit(1)

  if (offsetRows.length > 0) {
    const threshold = offsetRows[0].createdAt
    await db
      .delete(activities)
      .where(
        and(
          eq(activities.userId, userId),
          sql`${activities.createdAt} <= ${threshold}`
        )
      )
  }
}

/**
 * Get the most recent activities for a user.
 * 
 * @param {string} userId - UUID of the user
 * @param {number} limit - Number of activities to return
 */
export async function getRecentActivities(userId, limit = 10) {
  return db
    .select()
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.createdAt))
    .limit(limit)
}
