import { db } from '../db/index.js'
import { records, VALID_CATEGORIES } from '../db/schema.js'
import { eq, and, inArray } from 'drizzle-orm'
import { authenticate } from '../middleware/authenticate.js'

const CATEGORY_ENUM = { enum: VALID_CATEGORIES }

const RECORD_BODY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', maxLength: 500 },
    score: { type: 'integer', minimum: 0, maximum: 10 },
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

    // Add updatedAt
    updates.updatedAt = new Date()

    const [updated] = await db
      .update(records)
      .set(updates)
      .where(and(eq(records.id, id), eq(records.userId, userId)))
      .returning()

    if (!updated) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
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
      .returning({ id: records.id })

    if (!deleted) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
    }

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

    await db
      .delete(records)
      .where(and(eq(records.userId, userId), inArray(records.id, ids)))

    return reply.status(204).send()
  })
}
