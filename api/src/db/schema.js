import { pgTable, uuid, varchar, smallint, boolean, timestamp, text } from 'drizzle-orm/pg-core'

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     varchar('email', { length: 255 }).unique().notNull(),
  password:  varchar('password', { length: 255 }),   // null for OAuth-only accounts
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Refresh Tokens ──────────────────────────────────────────────────────────

export const refreshTokens = pgTable('refresh_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Records ─────────────────────────────────────────────────────────────────

export const VALID_CATEGORIES = /** @type {const} */ ([
  'games', 'tvshows', 'films', 'anime', 'manga', 'books', 'music',
])

export const records = pgTable('records', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category:  varchar('category', { length: 50 }).notNull(),
  title:     varchar('title', { length: 500 }).notNull().default(''),
  score:     smallint('score').notNull().default(0),
  liked:     boolean('liked').notNull().default(false),
  label:     varchar('label', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Custom Lists ─────────────────────────────────────────────────────────────

export const customLists = pgTable('custom_lists', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      varchar('name', { length: 255 }).notNull().default('Custom List'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Custom List Records ──────────────────────────────────────────────────────

export const customListRecords = pgTable('custom_list_records', {
  id:        uuid('id').primaryKey().defaultRandom(),
  listId:    uuid('list_id').notNull().references(() => customLists.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:     varchar('title', { length: 500 }).notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── User Settings ────────────────────────────────────────────────────────────

export const userSettings = pgTable('user_settings', {
  userId:    uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme:     varchar('theme', { length: 10 }).notNull().default('system'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
