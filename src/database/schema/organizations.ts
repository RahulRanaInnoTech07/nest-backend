import { jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

/** Lifecycle of an organization (tenant). */
export type OrganizationStatus = 'active' | 'suspended';

/**
 * An organization is a tenant — think a school. It's the isolation boundary:
 * tenant-owned tables (added later) carry `org_id` and are fenced by RLS so one
 * org never sees another's data. Members join via `memberships` (later chunk).
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: text('name').notNull(),

  // URL-friendly unique handle, reserved for future subdomain/path tenancy
  // (e.g. school.kairos.app) even though v1 routes use the UUID.
  slug: text('slug').notNull().unique(),

  logoUrl: text('logo_url'),
  contactEmail: text('contact_email'),
  timezone: text('timezone'),

  status: text('status')
    .$type<OrganizationStatus>()
    .notNull()
    .default('active'),

  // Per-org configuration escape hatch.
  settings: jsonb('settings')
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),

  // The super admin who created the org. Kept if that user is later removed.
  createdBy: uuid('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),

  ...timestamps,
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
