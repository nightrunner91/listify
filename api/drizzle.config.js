import { defineConfig } from 'drizzle-kit'

// DATABASE_URL is injected by Node --env-file=.env (see package.json scripts)
export default defineConfig({
  schema:    './src/db/schema.js',
  out:       './drizzle',
  dialect:   'postgresql',
  dbCredentials: {url: process.env.DATABASE_URL,},
})
