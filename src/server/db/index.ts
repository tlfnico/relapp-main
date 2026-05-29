import 'dotenv/config';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as usersSchema from './schema/users';
import * as adultosMayoresSchema from './schema/adultosMayores';
import * as relevamientosSchema from './schema/relevamientos';
import * as auditLogsSchema from './schema/auditLogs';

const schema = {
  ...usersSchema,
  ...adultosMayoresSchema,
  ...relevamientosSchema,
  ...auditLogsSchema,
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    '❌ DATABASE_URL no está definida en el archivo .env'
  );
}

// Evita múltiples pools en desarrollo (Hot Reload)
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });