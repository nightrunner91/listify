// Environment is loaded via --env-file=.env (see package.json db:migrate script)
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './index.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

await migrate(db, {
  migrationsFolder: path.join(__dirname, '../../drizzle'),
})

console.log('✅ Migrations applied successfully')
process.exit(0)
