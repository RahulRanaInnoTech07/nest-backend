import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

/**
 * Super-admin elevation. Platform admins operate *above* organizations, so this
 * is intentionally separate from memberships — one row grants a user
 * platform-wide access (create/suspend any org, oversee everything). No org_id.
 */
export const platformAdmins = pgTable('platform_admins', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  grantedBy: uuid('granted_by').references(() => users.id, {
    onDelete: 'set null',
  }),

  grantedAt: timestamp('granted_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  ...timestamps,
});

export type PlatformAdmin = typeof platformAdmins.$inferSelect;
export type NewPlatformAdmin = typeof platformAdmins.$inferInsert;
