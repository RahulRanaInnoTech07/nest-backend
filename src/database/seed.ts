import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { permissions, rolePermissions, roles, type RoleKey } from './schema';

// Load the env file selected by ENV_FILE (default `.env`) before reading vars.
config({ path: process.env.ENV_FILE ?? '.env' });

const ROLE_ROWS: { key: RoleKey; name: string; level: number }[] = [
  { key: 'SUPER_ADMIN', name: 'Super Admin', level: 100 },
  { key: 'ORG_ADMIN', name: 'Org Admin', level: 80 },
  { key: 'CLASS_ADMIN', name: 'Class Admin', level: 60 },
  { key: 'TEACHER', name: 'Teacher', level: 40 },
  { key: 'CONTENT_CREATOR', name: 'Content Creator', level: 30 },
  { key: 'STUDENT', name: 'Student', level: 20 },
];

const PERMISSION_ROWS: { key: string; description: string }[] = [
  { key: 'org:create', description: 'Create an organization' },
  { key: 'org:update', description: 'Update organization details' },
  { key: 'org:suspend', description: 'Suspend or reactivate an organization' },
  { key: 'org:read', description: 'View organization details' },
  { key: 'member:invite', description: 'Invite members' },
  { key: 'member:remove', description: 'Remove members' },
  { key: 'member:read', description: 'View members' },
  { key: 'settings:manage', description: 'Manage organization settings' },
  { key: 'analytics:view', description: 'View analytics' },
  { key: 'class:manage', description: 'Manage classes' },
  { key: 'content:create', description: 'Create content' },
  { key: 'content:publish', description: 'Publish content' },
  { key: 'content:read', description: 'View published content' },
];

// The permission matrix from the design. Scoped roles (CLASS_ADMIN, TEACHER)
// get the capability here; the *scope* is enforced separately via role_scopes.
const MATRIX: Record<RoleKey, string[]> = {
  SUPER_ADMIN: PERMISSION_ROWS.map((p) => p.key), // everything
  ORG_ADMIN: [
    'org:update',
    'org:read',
    'member:invite',
    'member:remove',
    'member:read',
    'settings:manage',
    'analytics:view',
    'class:manage',
    'content:create',
    'content:publish',
    'content:read',
  ],
  CLASS_ADMIN: [
    'member:read',
    'class:manage',
    'content:create',
    'content:publish',
    'content:read',
  ],
  TEACHER: [
    'class:manage',
    'content:create',
    'content:publish',
    'content:read',
  ],
  CONTENT_CREATOR: ['content:create', 'content:read'],
  STUDENT: ['content:read'],
};

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  await db.insert(roles).values(ROLE_ROWS).onConflictDoNothing();
  await db.insert(permissions).values(PERMISSION_ROWS).onConflictDoNothing();

  const grants = Object.entries(MATRIX).flatMap(([roleKey, perms]) =>
    perms.map((permissionKey) => ({
      roleKey: roleKey as RoleKey,
      permissionKey,
    })),
  );
  await db.insert(rolePermissions).values(grants).onConflictDoNothing();

  console.log(
    `Seeded ${ROLE_ROWS.length} roles, ${PERMISSION_ROWS.length} permissions, ${grants.length} grants.`,
  );
  await pool.end();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
