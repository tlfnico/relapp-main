export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  SOCIAL_WORKER: 'SOCIAL_WORKER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
