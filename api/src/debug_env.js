import { fileURLToPath } from 'url'
import path from 'path'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '../../.env')
console.log('__dirname:', __dirname)
console.log('envPath:', envPath)

const result = config({ path: envPath })
console.log('dotenv result error:', result.error)
console.log('RAWG_API_KEY:', process.env.RAWG_API_KEY)
