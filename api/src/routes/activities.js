import { authenticate } from '../middleware/authenticate.js'
import {
  getRecentActivities,
  softDeleteActivity,
  restoreActivity,
  restoreActivities,
  purgeSoftDeletedActivities,
  getSoftDeletedActivities
} from '../services/activity.service.js'

export default async function activitiesRoutes(app) {
  app.addHook('preHandler', authenticate)

  /**
   * GET /api/activities
   * Returns recent activities with cursor-based pagination.
   * Query params:
   *   - limit: number (default 20, max 100)
   *   - cursor: ISO timestamp string for pagination
   */
  app.get('/', async (request) => {
    const userId = request.user.id
    const limit = parseInt(request.query.limit) || 20
    const cursor = request.query.cursor || null

    const result = await getRecentActivities(userId, limit, cursor)
    return result
  })

  /**
   * DELETE /api/activities/:id
   * Soft-deletes an activity (marks as deleted but doesn't remove from DB).
   */
  app.delete('/:id', async (request) => {
    const userId = request.user.id
    const activityId = request.params.id

    await softDeleteActivity(userId, activityId)
    return { success: true }
  })

  /**
   * POST /api/activities/:id/restore
   * Restores a soft-deleted activity.
   */
  app.post('/:id/restore', async (request) => {
    const userId = request.user.id
    const activityId = request.params.id

    await restoreActivity(userId, activityId)
    return { success: true }
  })

  /**
   * POST /api/activities/restore-batch
   * Restores multiple soft-deleted activities.
   * Body: { activityIds: string[] }
   */
  app.post('/restore-batch', async (request) => {
    const userId = request.user.id
    const { activityIds } = request.body || {}

    await restoreActivities(userId, activityIds)
    return { success: true }
  })

  /**
   * POST /api/activities/purge
   * Actually deletes all soft-deleted activities for the user.
   * Called when user navigates away from the page.
   */
  app.post('/purge', async (request) => {
    const userId = request.user.id

    await purgeSoftDeletedActivities(userId)
    return { success: true }
  })

  /**
   * GET /api/activities/deleted
   * Returns list of soft-deleted activity IDs for the user.
   * Used to check which records to restore on page load.
   */
  app.get('/deleted', async (request) => {
    const userId = request.user.id

    const deleted = await getSoftDeletedActivities(userId)
    return { activities: deleted }
  })

  /**
   * POST /api/activities/restore-all
   * Restores all soft-deleted activities for the user.
   * Called when user explicitly wants to unmark all deleted items.
   */
  app.post('/restore-all', async (request) => {
    const userId = request.user.id

    await restoreActivities(userId, null)
    return { success: true }
  })
}
