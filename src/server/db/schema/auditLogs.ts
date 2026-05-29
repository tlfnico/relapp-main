import { pgTable, uuid, varchar, timestamp, text, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  userEmail: varchar('user_email', { length: 255 }),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 255 }),
  entityId: varchar('entity_id', { length: 255 }),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
    userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
    entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  };
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
