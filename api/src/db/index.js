import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

const { Pool } = pg

const poolConfig = {
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
}

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL
} else if (!process.env.PGHOST) {
  console.error('[DB] CRITICAL ERROR: Neither DATABASE_URL nor PGHOST environment variables are found!')
  console.error('[DB] If you are on Railway, make sure you linked the Postgres database to this service.')
  process.exit(1)
}

const pool = new Pool(poolConfig)

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err)
})

export const db = drizzle(pool, { schema })

export async function checkDbConnection() {
  const client = await pool.connect()
  await client.query('SELECT 1')
  client.release()
}
