import { db } from '../db/index.js'
import {
  users,
  records,
  customLists,
  customListRecords,
  activities,
  VALID_CATEGORIES
} from '../db/schema.js'
import {
  eq,
  and,
  desc
} from 'drizzle-orm'
import { RESERVED_HANDLES } from './users.js'

/**
 * Public routes — no authentication required.
 * Only exposes data for users who have explicitly enabled public visibility (isPublic = true).
 */
export default async function publicRoutes(app) {

  // ─── GET /api/public/check-handle/:handle ───────────────────────────────

  app.get('/check-handle/:handle', {
    schema: {
      params: {
        type: 'object',
        required: ['handle'],
        properties: {
          handle: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_-]+$'
          }
        },
      },
    },
  }, async (request, reply) => {
    const handle = request.params.handle.toLowerCase()
    
    if (RESERVED_HANDLES.includes(handle)) {
      return {
        available: false,
        reason: 'reserved' 
      }
    }
    
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1)
    if (existing.length > 0) {
      return {
        available: false,
        reason: 'taken' 
      }
    }
    
    return { available: true }
  })

  // ─── GET /api/public/user/:identifier ─────────────────────────────────────

  app.get('/user/:identifier', {
    schema: {
      params: {
        type: 'object',
        required: ['identifier'],
        properties: {identifier: {type: 'string',}},
      },
    },
  }, async (request, reply) => {
    const { identifier } = request.params
    const isFullUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier)
    const isShortUuid = !isFullUuid && /^[0-9a-fA-F]{8,}$/.test(identifier)
    
    let condition
    if (isFullUuid) {
      condition = eq(users.id, identifier)
    } else {
      // Try handle first, then fall back to short UUID prefix (cast uuid → text, then ILIKE)
      const [byHandle] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.handle, identifier.toLowerCase()))
        .limit(1)
      
      if (byHandle) {
        condition = eq(users.id, byHandle.id)
      } else if (isShortUuid) {
        // Resolve by UUID prefix: CAST(id AS TEXT) ILIKE 'abc12345%'
        const { sql } = await import('drizzle-orm')
        condition = sql`CAST(${users.id} AS TEXT) ILIKE ${identifier.toLowerCase() + '%'}`
      } else {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'User not found' 
        })
      }
    }

    // Fetch user — only serve if they opted in to public visibility
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        handle: users.handle,
        avatarStyle: users.avatarStyle,
        avatarSeed: users.avatarSeed,
        avatarOptions: users.avatarOptions,
        backgroundColor: users.backgroundColor,
        isPublic: users.isPublic,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(condition)
      .limit(1)

    if (!user) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'User not found'
      })
    }

    if (!user.isPublic) {
      return reply.status(404).send({
        error: 'PROFILE_PRIVATE',
        message: 'This profile is private'
      })
    }

    // Fetch records grouped by category
    const recordRows = await db
      .select()
      .from(records)
      .where(eq(records.userId, user.id))

    const groupedRecords = Object.fromEntries(VALID_CATEGORIES.map(c => [c, []]))
    for (const row of recordRows) {
      if (groupedRecords[row.category]) {
        groupedRecords[row.category].push({
          id: row.id,
          title: row.title,
          score: row.score,
          liked: row.liked,
          label: row.label,
          category: row.category,
          createdAt: row.createdAt,
        })
      }
    }

    // Fetch custom lists with their records
    const lists = await db
      .select()
      .from(customLists)
      .where(eq(customLists.userId, user.id))

    const listIds = lists.map(l => l.id)
    let customListRecordRows = []
    if (listIds.length > 0) {
      customListRecordRows = await db
        .select()
        .from(customListRecords)
        .where(eq(customListRecords.userId, user.id))
    }

    const recordsByList = {}
    for (const r of customListRecordRows) {
      if (!recordsByList[r.listId]) recordsByList[r.listId] = []
      recordsByList[r.listId].push({
        id: r.id,
        title: r.title,
        createdAt: r.createdAt,
      })
    }

    const publicCustomLists = lists.map(list => ({
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      records: recordsByList[list.id] ?? [],
    }))

    // Fetch latest activities (most recent 10)
    const recentActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, user.id))
      .orderBy(desc(activities.createdAt))
      .limit(10)

    return reply.send({
      user: {
        id: user.id,
        username: user.username,
        handle: user.handle,
        avatarStyle: user.avatarStyle,
        avatarSeed: user.avatarSeed,
        avatarOptions: user.avatarOptions,
        backgroundColor: user.backgroundColor,
        createdAt: user.createdAt,
      },
      records: groupedRecords,
      customLists: publicCustomLists,
      activities: recentActivities,
    })
  })
}
