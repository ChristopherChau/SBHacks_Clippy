import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const searchCache = sqliteTable('search_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  skill: text('skill').notNull().unique(),
  response: text('response').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const allocationCache = sqliteTable('allocation_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cacheKey: text('cache_key').notNull().unique(),
  response: text('response').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const contentCache = sqliteTable('content_cache', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cacheKey: text('cache_key').notNull().unique(),
  response: text('response').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})
