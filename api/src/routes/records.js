import { db } from '../db/index.js'
import { records, VALID_CATEGORIES } from '../db/schema.js'
import { eq, and, inArray } from 'drizzle-orm'
import { authenticate } from '../middleware/authenticate.js'
import { logActivity } from '../services/activity.service.js'

const CATEGORY_ENUM = { enum: VALID_CATEGORIES }

const RECORD_BODY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', maxLength: 500 },
    score: { type: 'integer', minimum: 0, maximum: 5 },
    liked: { type: 'boolean' },
    label: { type: 'string', maxLength: 100 },
  },
  additionalProperties: false,
}

export default async function recordsRoutes(app) {

  // All records routes require authentication
  app.addHook('preHandler', authenticate)

  // ─── GET /api/records — all categories ───────────────────────────────────

  app.get('/', async (request) => {
    const userId = request.user.id
    const rows = await db
      .select()
      .from(records)
      .where(eq(records.userId, userId))

    // Group by category
    const grouped = Object.fromEntries(VALID_CATEGORIES.map(c => [c, []]))
    for (const row of rows) {
      if (grouped[row.category]) grouped[row.category].push(row)
    }
    return grouped
  })

  // ─── GET /api/records/:category ──────────────────────────────────────────

  app.get('/:category', {
    schema: {
      params: {
        type: 'object',
        required: ['category'],
        properties: { category: CATEGORY_ENUM },
      },
    },
  }, async (request) => {
    const { category } = request.params
    const userId = request.user.id

    return db
      .select()
      .from(records)
      .where(and(eq(records.userId, userId), eq(records.category, category)))
  })

  // ─── POST /api/records/:category ─────────────────────────────────────────

  app.post('/:category', {
    schema: {
      params: {
        type: 'object',
        required: ['category'],
        properties: { category: CATEGORY_ENUM },
      },
      body: {
        ...RECORD_BODY_SCHEMA,
        required: ['title', 'label'],
      },
    },
  }, async (request, reply) => {
    const { category } = request.params
    const { title, score = 0, liked = false, label } = request.body
    const userId = request.user.id

    const [record] = await db
      .insert(records)
      .values({ userId, category, title, score, liked, label })
      .returning()

    // Log activity
    await logActivity(userId, {
      action: 'record_created',
      category,
      entityName: title,
    })

    return reply.status(201).send(record)
  })

  // ─── PUT /api/records/:id ─────────────────────────────────────────────────

  app.put('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: RECORD_BODY_SCHEMA,
    },
  }, async (request, reply) => {
    const { id } = request.params
    const userId = request.user.id
    const updates = request.body

    if (Object.keys(updates).length === 0) {
      return reply.status(400).send({ error: 'VALIDATION_ERROR', message: 'No fields to update' })
    }

    // Fetch old record for activity comparison
    const [old] = await db
      .select()
      .from(records)
      .where(and(eq(records.id, id), eq(records.userId, userId)))
      .limit(1)

    if (!old) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
    }

    // Add updatedAt
    updates.updatedAt = new Date()

    const [updated] = await db
      .update(records)
      .set(updates)
      .where(and(eq(records.id, id), eq(records.userId, userId)))
      .returning()

    // Log activities based on changes
    if (updates.score !== undefined && updates.score !== old.score) {
      await logActivity(userId, {
        action: 'record_score_updated',
        category: old.category,
        entityName: old.title,
        metadata: { score: updates.score }
      })
    }
    if (updates.liked !== undefined && updates.liked !== old.liked) {
      await logActivity(userId, {
        action: updates.liked ? 'record_liked' : 'record_unliked',
        category: old.category,
        entityName: old.title,
      })
    }
    if (updates.label !== undefined && updates.label !== old.label) {
      await logActivity(userId, {
        action: 'record_status_updated',
        category: old.category,
        entityName: old.title,
        metadata: { label: updates.label }
      })
    }

    return reply.send(updated)
  })

  // ─── DELETE /api/records/:id ──────────────────────────────────────────────

  app.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const userId = request.user.id

    const [deleted] = await db
      .delete(records)
      .where(and(eq(records.id, id), eq(records.userId, userId)))
      .returning()

    if (!deleted) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
    }

    // Log activity
    await logActivity(userId, {
      action: 'record_deleted',
      category: deleted.category,
      entityName: deleted.title,
    })

    return reply.status(204).send()
  })

  // ─── DELETE /api/records — bulk delete ───────────────────────────────────

  app.delete('/', {
    schema: {
      body: {
        type: 'object',
        required: ['ids'],
        properties: {
          ids: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { ids } = request.body
    const userId = request.user.id

    const deletedRows = await db
      .delete(records)
      .where(and(eq(records.userId, userId), inArray(records.id, ids)))
      .returning()

    // Log activities for each deleted item
    for (const row of deletedRows) {
      await logActivity(userId, {
        action: 'record_deleted',
        category: row.category,
        entityName: row.title,
      })
    }

    return reply.status(204).send()
  })
}
