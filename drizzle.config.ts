import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load the same env file the app uses (selected by ENV_FILE), defaulting to
// `.env`. A missing file is a no-op, so prod can rely on host env vars.
config({ path: process.env.ENV_FILE ?? '.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
