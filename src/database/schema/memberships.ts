import { index, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { membershipStatusEnum, roleEnum } from './enums';
import { organizations } from './organizations';
import { roles } from './roles';
import { users } from './users';

/**
 * The heart of the model: one row per (user, org) pair, carrying the user's
 * role in that org. This is what makes membership multi-org and keeps the role
 * off the user record.
 *
 * Tenant-associated (has org_id), but intentionally NOT RLS-fenced: it's a
 * control-plane table read during auth *before* an active org is chosen
 * (e.g. "list the orgs I belong to"). It's scoped explicitly in the repository
 * instead — by user_id for the cross-org case, by org_id for the in-org case.
 * RLS lands on the true domain tables later.
 */
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // The user's role in this org (FK to the roles reference table).
    role: roleEnum('role')
      .notNull()
      .references(() => roles.key),

    status: membershipStatusEnum('status').notNull().default('active'),

    // Who invited them (kept if that user is later removed).
    invitedBy: uuid('invited_by').references(() => users.id, {
      onDelete: 'set null',
    }),

    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    ...timestamps,
  },
  (table) => [
    // One membership per user per org.
    unique('memberships_user_org_unique').on(table.userId, table.orgId),
    // org_id leads the index — the shape most tenant queries filter on.
    index('memberships_org_role_idx').on(table.orgId, table.role),
  ],
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
