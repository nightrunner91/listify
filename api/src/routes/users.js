import { authenticate } from '../middleware/authenticate.js'
import { updateUserProfile } from '../services/auth.service.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export const RESERVED_HANDLES = [
  'admin', 'api', 'settings', 'profile', 'user', 'users', 'start', 'games', 'tvshows', 
  'anime', 'films', 'manga', 'books', 'music', 'about', 'login', 'register', 
  'auth', 'public', 'listify', 'custom', 'check-handle'
]

export default async function userRoutes(app) {
  app.addHook('preHandler', authenticate)

  // ─── PATCH /api/users/profile ─────────────────────────────────────────────
  
  app.patch('/profile', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username:        {
            type: 'string',
            minLength: 1,
            maxLength: 255 
          },
          handle: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_-]+$'
          },
          avatarStyle:     {
            type: 'string',
            minLength: 1,
            maxLength: 50 
          },
          avatarSeed:      {
            type: 'string',
            minLength: 1,
            maxLength: 255 
          },
          avatarOptions:   {
            type: 'object',
            additionalProperties: true 
          },
          backgroundColor: {
            type: 'string',
            minLength: 1,
            maxLength: 50 
          },
          isPublic: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    if (request.body.handle) {
      const handle = request.body.handle.toLowerCase()
      if (RESERVED_HANDLES.includes(handle)) {
        return reply.status(400).send({
          error: 'HANDLE_RESERVED',
          message: 'This handle is reserved' 
        })
      }
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1)
      if (existing.length > 0 && existing[0].id !== request.user.id) {
        return reply.status(400).send({
          error: 'HANDLE_TAKEN',
          message: 'This handle is already taken' 
        })
      }
      request.body.handle = handle
    }

    const updated = await updateUserProfile(request.user.id, request.body)
    return reply.send(updated)
  })
}
