import { db } from '../db/index.js'
import {
  records,
  customLists,
  customListRecords,
  userSettings
} from '../db/schema.js'
import { VALID_CATEGORIES } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authenticate } from '../middleware/authenticate.js'
import { logActivity } from '../services/activity.service.js'

/**
 * POST /api/import
 *
 * Accepts the exact JSON format produced by the existing Export button in the Vue app.
 * Wipes the user's current data and replaces it with the imported data.
 *
 * Expected body shape:
 * {
 *   games: [...],
 *   tvshows: [...],
 *   films: [...],
 *   anime: [...],
 *   manga: [...],
 *   books: [...],
 *   music: [...],
 *   customLists: [...],  // optional
 * }
 */
export default async function importRoutes(app) {

  app.post('/import', {
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour' 
      },
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          games:       { type: 'array' },
          tvshows:     { type: 'array' },
          films:       { type: 'array' },
          anime:       { type: 'array' },
          manga:       { type: 'array' },
          books:       { type: 'array' },
          music:       { type: 'array' },
          customLists: { type: 'array' },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const userId = request.user.id
    const body = request.body

    // ── Fetch existing data ─────────────────────────────────────────────────
    const existingRecords = await db.select({ id: records.id, category: records.category, title: records.title }).from(records).where(eq(records.userId, userId))
    const existingCustomLists = await db.select({ id: customLists.id, name: customLists.name }).from(customLists).where(eq(customLists.userId, userId))
    const existingCustomListRecords = await db.select({ id: customListRecords.id, listId: customListRecords.listId, title: customListRecords.title }).from(customListRecords).where(eq(customListRecords.userId, userId))

    // ── Import standard records ─────────────────────────────────────────────
    const recordsToInsert = []
    for (const category of VALID_CATEGORIES) {
      const items = body[category] ?? []
      for (const item of items) {
        if (!item.title || !item.label) continue  // skip malformed
        
        // Check for duplicate in existingRecords
        const isDuplicate = existingRecords.some(r => 
          r.category === category && 
          r.title.toLowerCase() === String(item.title).toLowerCase()
        )
        
        if (isDuplicate) continue // Keep server version

        recordsToInsert.push({
          userId,
          category,
          title:  String(item.title).slice(0, 500),
          score:  Number.isInteger(item.score) ? Math.min(10, Math.max(0, item.score)) : 0,
          liked:  typeof item.liked === 'boolean' ? item.liked : false,
          label:  String(item.label).slice(0, 100),
        })
      }
    }

    if (recordsToInsert.length > 0) {
      await db.insert(records).values(recordsToInsert)
    }

    // ── Import custom lists ─────────────────────────────────────────────────
    const rawLists = Array.isArray(body.customLists) ? body.customLists : []
    let importedListCount = 0
    let importedListRecordCount = 0

    for (const rawList of rawLists) {
      if (!rawList.name) continue

      // Check if custom list exists
      let listId = null
      const existingList = existingCustomLists.find(l => l.name.toLowerCase() === String(rawList.name).toLowerCase())

      if (existingList) {
        listId = existingList.id
      } else {
        const [insertedList] = await db
          .insert(customLists)
          .values({
            userId,
            name: String(rawList.name).slice(0, 255),
            createdAt: rawList.createdAt ? new Date(rawList.createdAt) : new Date(),
            updatedAt: rawList.updatedAt ? new Date(rawList.updatedAt) : new Date(),
          })
          .returning()
        listId = insertedList.id
        importedListCount++
      }

      // Get existing records for this list (either from DB if it existed, or empty if new)
      const existingRecordsForList = existingCustomListRecords.filter(r => r.listId === listId)

      const listRecords = Array.isArray(rawList.records) ? rawList.records : []
      const clrToInsert = []
      for (const r of listRecords) {
        if (!r.title) continue

        // Check for duplicate
        const isDuplicate = existingRecordsForList.some(existing => 
          existing.title.toLowerCase() === String(r.title).toLowerCase()
        )

        if (isDuplicate) continue

        clrToInsert.push({
          listId,
          userId,
          title:     String(r.title).slice(0, 500),
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        })
      }
      
      if (clrToInsert.length > 0) {
        await db.insert(customListRecords).values(clrToInsert)
        importedListRecordCount += clrToInsert.length
      }
    }

    const totalImported = recordsToInsert.length + importedListCount + importedListRecordCount

    if (totalImported > 0) {
      await logActivity(userId, {
        action: 'collection_imported',
        category: 'system',
        metadata: { count: totalImported }
      })
    }

    return reply.status(200).send({
      imported: {
        records:           recordsToInsert.length,
        customLists:       importedListCount,
        customListRecords: importedListRecordCount,
      },
    })
  })
}
