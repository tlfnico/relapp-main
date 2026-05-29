import { pgTable, uuid, varchar, timestamp, pgEnum, index, uniqueIndex, date, text } from 'drizzle-orm/pg-core';
import { users } from './users';

// Registrar el enum de estados aprobado para el MVP
export const estadoEnum = pgEnum('adulto_mayor_estado', ['ACTIVO', 'PENDIENTE', 'INACTIVO', 'FALLECIDO']);

export const adultosMayores = pgTable('adultos_mayores', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  dni: varchar('dni', { length: 20 }).notNull(),
  fechaNacimiento: date('fecha_nacimiento').notNull(),
  telefono: varchar('telefono', { length: 50 }),
  direccion: varchar('direccion', { length: 255 }).notNull(),
  barrio: varchar('barrio', { length: 100 }).notNull(),
  observaciones: text('observaciones'),
  estado: estadoEnum('estado').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Para soft delete (Ajuste Obligatorio 1)
  createdBy: uuid('created_by').references(() => users.id).notNull(), // Relación con el creador (Ajuste Obligatorio 3)
}, (table) => {
  return {
    dniUniqueIdx: uniqueIndex('adultos_mayores_dni_unique_idx').on(table.dni), // Índice DNI único
    apellidoIdx: index('adultos_mayores_apellido_idx').on(table.apellido),   // Índice en apellido para listados rápidos
    estadoIdx: index('adultos_mayores_estado_idx').on(table.estado),       // Índice en estado para filtros de flujo
  };
});

export type AdultoMayor = typeof adultosMayores.$inferSelect;
export type NewAdultoMayor = typeof adultosMayores.$inferInsert;
