import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Reusable created_at / updated_at columns. Spread into any table:
 *   pgTable('x', { id: ..., ...timestamps })
 *
 * `updatedAt` bumps automatically on ORM updates via `$onUpdate`.
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
