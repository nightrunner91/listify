import { db } from '../db/index.js'
import { activities } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

/**
 * Log a user activity to the database.
 * 
 * @param {string} userId - UUID of the user
 * @param {Object} data - Activity data
 * @param {string} data.action - Action key (e.g., 'record_created')
 * @param {string} [data.category] - Category (e.g., 'games')
 * @param {string} [data.entityName] - Name of the item/list
 * @param {Object} [data.metadata] - Extra info (score, listName, etc.)
 */
export async function logActivity(userId, { action, category, entityName, metadata }) {
  try {
    const [inserted] = await db
      .insert(activities)
      .values({
        userId,
        action,
        category,
        entityName,
        metadata: metadata ? JSON.stringify(metadata) : null,
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
