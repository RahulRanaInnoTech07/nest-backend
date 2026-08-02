import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { organizations } from './organizations';
import { users } from './users';

/**
 * Append-only trail of privileged actions. Immutable, so it carries only
 * `created_at` (no updated_at). `org_id` is nullable — platform-level actions
 * (e.g. a super admin creating an org) aren't scoped to a tenant.
 *
 * `metadata` typically holds before/after snapshots or extra context.
 */
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orgId: uuid('org_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),

    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // e.g. 'org.created', 'member.invited', 'membership.suspended'
    action: text('action').notNull(),

    // e.g. 'organization', 'membership', 'invitation'
    resourceType: text('resource_type'),
    resourceId: uuid('resource_id'),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_log_org_created_idx').on(table.orgId, table.createdAt),
    index('audit_log_actor_idx').on(table.actorUserId),
    index('audit_log_resource_idx').on(table.resourceType, table.resourceId),
  ],
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
