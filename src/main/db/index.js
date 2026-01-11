import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { searchCache, allocationCache, contentCache } from './schema.js'
import { sql } from 'drizzle-orm'

export const createDb = (dbPath) => {
  const client = createClient({
    url: `file:${dbPath}`
  })

  const db = drizzle(client)

  // Initialize the database tables
  const initDb = async () => {
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
  return { db, initDb }
}

export { searchCache, allocationCache, contentCache }
