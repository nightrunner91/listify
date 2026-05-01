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
  try {
    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    // Coalescing logic: if there's a recent activity for the same entity and action, update it
    if (entityId) {
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

      if (existing) {
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
    const values = items.map(item => ({
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
