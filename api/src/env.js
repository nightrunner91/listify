/**
 * Environment loader — must be the FIRST import in index.js.
 * Loads .env relative to this file's location.
 */
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '../../.env') })
