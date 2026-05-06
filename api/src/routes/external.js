import { authenticate } from '../middleware/authenticate.js'
import { externalSearch } from '../services/external.service.js'

/**
 * @function externalRoutes
 * @description Routes for external API proxies
 * @param {import('fastify').FastifyInstance} app
 */
export default async function externalRoutes(app) {
  // All external proxy routes require authentication
  app.addHook('preHandler', authenticate)

  /**
   * @route GET /api/external/search
   * @description Proxies search requests to external APIs
   */
  app.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q', 'category'],
        properties: {
          q: {
            type: 'string',
            minLength: 1 
          },
          category: { type: 'string' }
        }
      }
    }
  }, async (request) => {
    const {
      q, category 
    } = request.query
    return await externalSearch(q, category)
  })
}
