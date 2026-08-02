import { index, pgTable, unique, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { scopeTypeEnum } from './enums';
import { memberships } from './memberships';

/**
 * Narrows a scoped role (CLASS_ADMIN, TEACHER) to specific resources. A
 * membership with zero scope rows is org-wide; one or more rows limit it to
 * those classes / standards / subjects.
 *
 * `scope_id` is polymorphic (its target table depends on `scope_type`), so it's
 * a bare uuid rather than a single FK — deliberately decoupled from the
 * teacher/class/content domain, which is still being redesigned.
 */
export const roleScopes = pgTable(
  'role_scopes',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    membershipId: uuid('membership_id')
      .notNull()
      .references(() => memberships.id, { onDelete: 'cascade' }),

    scopeType: scopeTypeEnum('scope_type').notNull(),
    scopeId: uuid('scope_id').notNull(),

    ...timestamps,
  },
  (table) => [
    unique('role_scopes_unique').on(
      table.membershipId,
      table.scopeType,
      table.scopeId,
    ),
    index('role_scopes_membership_idx').on(table.membershipId),
  ],
);

export type RoleScope = typeof roleScopes.$inferSelect;
export type NewRoleScope = typeof roleScopes.$inferInsert;
