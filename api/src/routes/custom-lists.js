import { db } from '../db/index.js'
import { customLists, customListRecords } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '../middleware/authenticate.js'
import { logActivity } from '../services/activity.service.js'

export default async function customListsRoutes(app) {

  app.addHook('preHandler', authenticate)

  // ─── GET /api/custom-lists ────────────────────────────────────────────────

  app.get('/', async (request) => {
    const userId = request.user.id

    const lists = await db
      .select()
      .from(customLists)
      .where(eq(customLists.userId, userId))

    const listIds = lists.map(l => l.id)

    // Fetch all records for these lists in one query
    let recordRows = []
    if (listIds.length > 0) {
      recordRows = await db
        .select()
        .from(customListRecords)
        .where(eq(customListRecords.userId, userId))
    }

    // Group records by listId
    const recordsByList = {}
    for (const r of recordRows) {
      if (!recordsByList[r.listId]) recordsByList[r.listId] = []
      recordsByList[r.listId].push({ id: r.id, title: r.title, createdAt: r.createdAt })
    }

    return lists.map(list => ({
      ...list,
      records: recordsByList[list.id] ?? [],
    }))
  })

  // ─── POST /api/custom-lists ───────────────────────────────────────────────

  app.post('/', async (request, reply) => {
    const userId = request.user.id

    // Auto-generate name
    const existing = await db
      .select({ name: customLists.name })
      .from(customLists)
      .where(eq(customLists.userId, userId))

    let maxNum = 0
    for (const { name } of existing) {
      const match = name.match(/Custom List #(\d+)/)
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]))
    }
    const name = `Custom List #${maxNum + 1}`

    const [list] = await db
      .insert(customLists)
      .values({ userId, name })
      .returning()

    // Log activity
    await logActivity(userId, {
      action: 'custom_list_created',
      category: 'custom',
      entityName: name,
    })

    return reply.status(201).send({ ...list, records: [] })
  })

  // ─── PATCH /api/custom-lists/:id ──────────────────────────────────────────

  app.patch('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 1, maxLength: 255 } },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { name } = request.body
    const userId = request.user.id

    const [updated] = await db
      .update(customLists)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(customLists.id, id), eq(customLists.userId, userId)))
      .returning()

    if (!updated) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Custom list not found' })
    }

    return reply.send(updated)
  })

  // ─── DELETE /api/custom-lists/:id ─────────────────────────────────────────

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
      .delete(customLists)
      .where(and(eq(customLists.id, id), eq(customLists.userId, userId)))
      .returning()

    if (!deleted) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Custom list not found' })
    }

    // Log activity
    await logActivity(userId, {
      action: 'custom_list_deleted',
      category: 'custom',
      entityName: deleted.name,
    })

    return reply.status(204).send()
  })

  // ─── POST /api/custom-lists/:listId/records ───────────────────────────────

  app.post('/:listId/records', {
    schema: {
      params: {
        type: 'object',
        required: ['listId'],
        properties: { listId: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: { title: { type: 'string', maxLength: 500 } },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { listId } = request.params
    const { title } = request.body
    const userId = request.user.id

    // Verify list belongs to user
    const [list] = await db
      .select({ id: customLists.id, name: customLists.name })
      .from(customLists)
      .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
      .limit(1)

    if (!list) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Custom list not found' })
    }

    const [record] = await db
      .insert(customListRecords)
      .values({ listId, userId, title })
      .returning()

    // Touch the list updatedAt
    await db
      .update(customLists)
      .set({ updatedAt: new Date() })
      .where(eq(customLists.id, listId))

    // Log activity
    await logActivity(userId, {
      action: 'custom_list_record_added',
      category: 'custom',
      entityName: title,
      metadata: { listName: list.name }
    })

    return reply.status(201).send(record)
  })

  // ─── PATCH /api/custom-lists/:listId/records/:recordId ───────────────────

  app.patch('/:listId/records/:recordId', {
    schema: {
      params: {
        type: 'object',
        required: ['listId', 'recordId'],
        properties: {
          listId:   { type: 'string', format: 'uuid' },
          recordId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: { title: { type: 'string', maxLength: 500 } },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const { listId, recordId } = request.params
    const { title } = request.body
    const userId = request.user.id

    // Verify list ownership
    const [list] = await db
      .select({ id: customLists.id })
      .from(customLists)
      .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
      .limit(1)

    if (!list) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Custom list not found' })
    }

    const [updated] = await db
      .update(customListRecords)
      .set({ title })
      .where(
        and(
          eq(customListRecords.id, recordId),
          eq(customListRecords.listId, listId),
          eq(customListRecords.userId, userId),
        )
      )
      .returning()

    if (!updated) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
    }

    // Touch the list updatedAt
    await db
      .update(customLists)
      .set({ updatedAt: new Date() })
      .where(eq(customLists.id, listId))

    return reply.send(updated)
  })

  // ─── DELETE /api/custom-lists/:listId/records/:recordId ──────────────────

  app.delete('/:listId/records/:recordId', {
    schema: {
      params: {
        type: 'object',
        required: ['listId', 'recordId'],
        properties: {
          listId:   { type: 'string', format: 'uuid' },
          recordId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const { listId, recordId } = request.params
    const userId = request.user.id

    // Verify list ownership to get its name for the log
    const [list] = await db
      .select({ id: customLists.id, name: customLists.name })
      .from(customLists)
      .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
      .limit(1)

    if (!list) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Custom list not found' })
    }

    const [deleted] = await db
      .delete(customListRecords)
      .where(
        and(
          eq(customListRecords.id, recordId),
          eq(customListRecords.listId, listId),
          eq(customListRecords.userId, userId),
        )
      )
      .returning()

    if (!deleted) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Record not found' })
    }

    // Touch the list updatedAt
    await db
      .update(customLists)
      .set({ updatedAt: new Date() })
      .where(eq(customLists.id, listId))

    // Log activity
    await logActivity(userId, {
      action: 'custom_list_record_deleted',
      category: 'custom',
      entityName: deleted.title,
      metadata: { listName: list.name }
    })

    return reply.status(204).send()
  })
}
