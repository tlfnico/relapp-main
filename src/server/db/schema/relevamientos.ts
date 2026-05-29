import { pgTable, uuid, varchar, timestamp, pgEnum, index, boolean, text, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { adultosMayores } from './adultosMayores';

// Enums para Riesgo Social y Estado del Relevamiento
export const riesgoSocialEnum = pgEnum('relevamiento_riesgo', ['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);
export const estadoRelevamientoEnum = pgEnum('relevamiento_estado', ['BORRADOR', 'FINALIZADO']);

export const relevamientos = pgTable('relevamientos', {
  id: uuid('id').primaryKey().defaultRandom(),
  adultoMayorId: uuid('adulto_mayor_id').references(() => adultosMayores.id).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  
  // Área Habitacional
  tipoVivienda: varchar('tipo_vivienda', { length: 100 }).notNull(),
  tieneAgua: boolean('tiene_agua').notNull(),
  tieneLuz: boolean('tiene_luz').notNull(),
  tieneGas: boolean('tiene_gas').notNull(),
  hacinamiento: boolean('hacinamiento').notNull(),

  // Área Salud y Autonomía
  enfermedadesCronicas: text('enfermedades_cronicas').notNull(),
  nivelMovilidad: varchar('nivel_movilidad', { length: 100 }).notNull(),
  tomaMedicamentos: boolean('toma_medicamentos').notNull(),

  // Área Socioeconómica
  ingresos: numeric('ingresos', { precision: 10, scale: 2 }).notNull(),
  obraSocial: varchar('obra_social', { length: 100 }).notNull(),
  redApoyo: varchar('red_apoyo', { length: 100 }).notNull(),

  // Campo Adicional de Riesgo y Estado del Proceso
  riesgoSocial: riesgoSocialEnum('riesgo_social').notNull(),
  estado: estadoRelevamientoEnum('estado').notNull(),
  observacionesGeneral: text('observaciones_general'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    adultoMayorIdIdx: index('relevamientos_adulto_mayor_id_idx').on(table.adultoMayorId),
    createdByIdx: index('relevamientos_created_by_idx').on(table.createdBy),
  };
});

export type Relevamiento = typeof relevamientos.$inferSelect;
export type NewRelevamiento = typeof relevamientos.$inferInsert;
