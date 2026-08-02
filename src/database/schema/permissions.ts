import { pgTable, text } from 'drizzle-orm/pg-core';

/**
 * Reference table of granular permissions, keyed `resource:action`
 * (e.g. 'content:publish', 'member:invite'). Global reference data — no
 * org_id, no RLS. The CASL policy layer builds abilities from these.
 */
export const permissions = pgTable('permissions', {
  key: text('key').primaryKey(),
  description: text('description').notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
