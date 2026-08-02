import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { roleEnum } from './enums';
import { permissions } from './permissions';
import { roles } from './roles';

/**
 * Join table wiring roles to permissions — this *is* the permission matrix
 * from the design (one row per checkmark). Composite primary key prevents
 * duplicate grants; cascades keep it clean if a role/permission is removed.
 */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleKey: roleEnum('role_key')
      .notNull()
      .references(() => roles.key, { onDelete: 'cascade' }),
    permissionKey: text('permission_key')
      .notNull()
      .references(() => permissions.key, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.roleKey, table.permissionKey] })],
);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
