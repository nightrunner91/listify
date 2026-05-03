import { searchGames } from './services/external.service.js'
import { config } from 'dotenv'

// Ensure we load .env exactly as the backend does
config({ path: '../../.env' })

async function test() {
  try {
    const results = await searchGames('Batman')
    console.log(results)
  } catch (err) {
    console.error('Error:', err.message)
  }
}
test()
