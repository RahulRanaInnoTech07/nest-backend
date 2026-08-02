import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Postgres native enums for the app's closed value sets. Types are derived from
 * the enum so TS and the database agree on the exact same values.
 *
 * Note: enums are for *fixed* sets. Adding a value later needs an `ALTER TYPE`
 * migration — fine for these, but why `permissions.key` stays free text.
 */

export const roleEnum = pgEnum('role', [
  'SUPER_ADMIN',
  'ORG_ADMIN',
  'CLASS_ADMIN',
  'TEACHER',
  'CONTENT_CREATOR',
  'STUDENT',
]);
export type RoleKey = (typeof roleEnum.enumValues)[number];

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended']);
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const orgStatusEnum = pgEnum('org_status', ['active', 'suspended']);
export type OrganizationStatus = (typeof orgStatusEnum.enumValues)[number];

export const membershipStatusEnum = pgEnum('membership_status', [
  'invited',
  'active',
  'suspended',
]);
export type MembershipStatus = (typeof membershipStatusEnum.enumValues)[number];

export const scopeTypeEnum = pgEnum('scope_type', [
  'class',
  'standard',
  'subject',
]);
export type ScopeType = (typeof scopeTypeEnum.enumValues)[number];

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);
export type InvitationStatus = (typeof invitationStatusEnum.enumValues)[number];
