import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { ROLES } from '@/lib/constants/roles';

// Declarar el PostgreSQL Enum para los roles aprobados del sistema
export const roleEnum = pgEnum('user_role', [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIAL_WORKER]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // Generará gen_random_uuid()
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type DBUser = typeof users.$inferSelect;
export type NewDBUser = typeof users.$inferInsert;
