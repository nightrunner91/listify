import { db } from '../db/index.js'
import { userSettings } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authenticate } from '../middleware/authenticate.js'

const VALID_THEMES = ['light', 'dark', 'system']

export default async function settingsRoutes(app) {

  app.addHook('preHandler', authenticate)

  // ─── GET /api/settings ────────────────────────────────────────────────────

  app.get('/', async (request) => {
    const userId = request.user.id

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

    return settings ?? {
      userId,
      theme: 'system' 
    }
  })

  // ─── PUT /api/settings ────────────────────────────────────────────────────

  app.put('/', {
    schema: {
      body: {
        type: 'object',
        required: ['theme'],
        properties: {
          theme: {
            type: 'string',
            enum: VALID_THEMES 
          },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const userId = request.user.id
    const { theme } = request.body

    const [updated] = await db
      .insert(userSettings)
      .values({
        userId,
        theme 
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          theme,
          updatedAt: new Date() 
        },
      })
      .returning()

    return reply.send(updated)
  })
}
