import { authenticate } from '../middleware/authenticate.js'
import { getRecentActivities } from '../services/activity.service.js'

export default async function activitiesRoutes(app) {
  // All activity routes require authentication
  app.addHook('preHandler', authenticate)

  /**
   * GET /api/activities
   * Returns the 10 most recent activities for the authenticated user.
   */
  app.get('/', async (request) => {
    const userId = request.user.id
    return getRecentActivities(userId, 10)
  })
}
