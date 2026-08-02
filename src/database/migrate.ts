import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Production-safe migrator: uses only runtime deps (drizzle-orm + pg), so it
// runs inside the built image without drizzle-kit or tsx. Applies the SQL
// migrations in ./drizzle, tracked in the same `drizzle.__drizzle_migrations`
// table drizzle-kit uses — so it never re-runs an applied migration.
config({ path: process.env.ENV_FILE ?? '.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migrations applied.');
  await pool.end();
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
