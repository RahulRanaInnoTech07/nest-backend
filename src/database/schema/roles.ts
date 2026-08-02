import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { roleEnum } from './enums';

/**
 * Reference table of roles — global, shared across all orgs (not tenant-owned,
 * so no org_id and no RLS). The `key` is the native `role` enum; this table
 * carries display metadata (`name`) and a coarse `level` for rank comparisons.
 */
export const roles = pgTable('roles', {
  key: roleEnum('key').primaryKey(),
  name: text('name').notNull(),
  level: integer('level').notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
