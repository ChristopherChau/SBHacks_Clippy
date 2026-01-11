import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { searchCache, allocationCache, contentCache } from './schema.js'
import { sql } from 'drizzle-orm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = createClient({
  url: `file:${resolve(__dirname, '../../cache.db')}`
})

export const db = drizzle(client)

// Initialize the database tables
export const initDb = async () => {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS search_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill TEXT NOT NULL UNIQUE,
      response TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS allocation_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT NOT NULL UNIQUE,
      response TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS content_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key TEXT NOT NULL UNIQUE,
      response TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
}

export { searchCache, allocationCache, contentCache }
