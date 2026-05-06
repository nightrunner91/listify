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

/**
 * Public routes — no authentication required.
 * Only exposes data for users who have explicitly enabled public visibility (isPublic = true).
 */
export default async function publicRoutes(app) {

  // ─── GET /api/public/user/:id ─────────────────────────────────────────────

  app.get('/user/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          }
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params

    // Fetch user — only serve if they opted in to public visibility
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        avatarStyle: users.avatarStyle,
        avatarSeed: users.avatarSeed,
        avatarOptions: users.avatarOptions,
        backgroundColor: users.backgroundColor,
        isPublic: users.isPublic,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
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
      .where(eq(records.userId, id))

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
      .where(eq(customLists.userId, id))

    const listIds = lists.map(l => l.id)
    let customListRecordRows = []
    if (listIds.length > 0) {
      customListRecordRows = await db
        .select()
        .from(customListRecords)
        .where(eq(customListRecords.userId, id))
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
      .where(eq(activities.userId, id))
      .orderBy(desc(activities.createdAt))
      .limit(10)

    return reply.send({
      user: {
        id: user.id,
        username: user.username,
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
