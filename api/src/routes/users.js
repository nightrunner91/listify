import { authenticate } from '../middleware/authenticate.js'
import { updateUserProfile } from '../services/auth.service.js'

export default async function userRoutes(app) {
  app.addHook('preHandler', authenticate)

  // ─── PATCH /api/users/profile ─────────────────────────────────────────────
  
  app.patch('/profile', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username:        { type: 'string', minLength: 1, maxLength: 255 },
          avatarStyle:     { type: 'string', minLength: 1, maxLength: 50 },
          avatarSeed:      { type: 'string', minLength: 1, maxLength: 255 },
          backgroundColor: { type: 'string', minLength: 1, maxLength: 50 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const updated = await updateUserProfile(request.user.id, request.body)
    return reply.send(updated)
  })
}
