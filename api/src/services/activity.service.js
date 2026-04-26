import { db } from '../db/index.js'
import { activities } from '../db/schema.js'
import { eq, desc, and, gte } from 'drizzle-orm'

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
export async function logActivity(userId, { action, category, entityId, entityName, metadata }) {
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
            metadata: metadata ? JSON.stringify(metadata) : existing.metadata,
            createdAt: now, // Move to top of timeline
          })
          .where(eq(activities.id, existing.id))
          .returning()
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
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: now,
      })
      .returning()
    return inserted
  } catch (err) {
    // We log the error but don't rethrow to avoid interrupting the main request flow
    console.error('[ActivityService] Failed to log activity:', err)
  }
}

/**
 * Get the most recent activities for a user.
 * 
 * @param {string} userId - UUID of the user
 * @param {number} limit - Number of activities to return
 */
export async function getRecentActivities(userId, limit = 10) {
  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.createdAt))
    .limit(limit)

  return rows.map(r => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata) : null,
  }))
}
