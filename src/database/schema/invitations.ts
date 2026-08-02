import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { invitationStatusEnum, roleEnum } from './enums';
import { organizations } from './organizations';
import { roles } from './roles';
import { users } from './users';

/**
 * Invite-only join flow (v1). An org admin creates an invitation for an email +
 * role; the invitee accepts (after signing in via Cognito) and a membership is
 * created. Only the token's hash is stored — never the raw token.
 *
 * Like memberships, this is a control-plane table (accept-by-token happens
 * before an org context exists), so it's scoped in the repository, not by RLS.
 */
export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    email: text('email').notNull(),

    // The role the invitee will receive on acceptance.
    role: roleEnum('role')
      .notNull()
      .references(() => roles.key),

    // sha256 of the invite token; the raw token only ever lives in the link.
    tokenHash: text('token_hash').notNull().unique(),

    status: invitationStatusEnum('status').notNull().default('pending'),

    invitedBy: uuid('invited_by').references(() => users.id, {
      onDelete: 'set null',
    }),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    index('invitations_org_idx').on(table.orgId),
    // At most one *pending* invite per email per org (accepted/expired/revoked
    // rows are kept for history and don't block re-inviting).
    uniqueIndex('invitations_org_email_pending_uq')
      .on(table.orgId, table.email)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
