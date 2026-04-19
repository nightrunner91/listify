#!/usr/bin/env node
/**
 * One-time data migration script.
 *
 * Usage:
 *   node scripts/migrate.js --file ./listify-export.json --token YOUR_ACCESS_TOKEN
 *
 * Steps:
 *   1. Export your data from the Listify app using the Export button → save the .json file
 *   2. Register an account via the API (POST /api/auth/register) and copy the accessToken
 *   3. Run this script with the file path and token
 *   4. Done. Script can be deleted.
 */

import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)

function getArg(name) {
  const idx = args.indexOf(name)
  return idx !== -1 ? args[idx + 1] : null
}

const filePath = getArg('--file')
const token    = getArg('--token')
const apiUrl   = getArg('--api') ?? 'http://localhost:3000'

if (!filePath || !token) {
  console.error('Usage: node scripts/migrate.js --file <path> --token <accessToken> [--api <url>]')
  process.exit(1)
}

// Read and parse the export file
let data
try {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8')
  data = JSON.parse(raw)
  console.log('📄 File loaded successfully')
} catch (err) {
  console.error('❌ Failed to read or parse the file:', err.message)
  process.exit(1)
}

// Send to /api/import
console.log(`🚀 Sending data to ${apiUrl}/api/import ...`)

let res
try {
  res = await fetch(`${apiUrl}/api/import`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
} catch (err) {
  console.error('❌ Network error:', err.message)
  process.exit(1)
}

const body = await res.json()

if (res.ok) {
  console.log('✅ Migration complete!')
  console.log(`   Records imported:           ${body.imported.records}`)
  console.log(`   Custom lists imported:      ${body.imported.customLists}`)
  console.log(`   Custom list items imported: ${body.imported.customListRecords}`)
} else {
  console.error('❌ Import failed:', body)
  process.exit(1)
}
