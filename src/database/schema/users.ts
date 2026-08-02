import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';

/** Lifecycle of a global user account. */
export type UserStatus = 'active' | 'suspended';

/**
 * Global identity — one row per person, mirroring their Cognito account.
 * Deliberately carries no org_id and no role: which org(s) a user belongs to,
 * and their role there, live on `memberships` (added in a later chunk).
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Link to the Cognito identity. Every user is provisioned from Cognito.
  cognitoSub: text('cognito_sub').notNull().unique(),

  // Store normalized (lowercased) at the service layer for case-insensitive
  // uniqueness. Can be promoted to a citext / lower(email) index later.
  email: text('email').notNull().unique(),
  fullName: text('full_name'),

  // Profile metadata
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  locale: text('locale').default('en'),
  timezone: text('timezone'),

  status: text('status').$type<UserStatus>().notNull().default('active'),

  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),

  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
