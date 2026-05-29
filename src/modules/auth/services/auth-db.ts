import { db } from '@/server/db';
import { users } from '@/server/db/schema/users';
import { eq } from 'drizzle-orm';
import { UserRole } from '@/lib/constants/roles';

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

/**
 * Obtiene un usuario por correo electrónico (case-insensitive) desde PostgreSQL.
 */
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  try {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return results[0] || null;
  } catch {
    // Ajuste Obligatorio 7: Sanitizar y proteger consultas e información de base de datos
    return null;
  }
}

/**
 * Obtiene un usuario por su ID desde PostgreSQL.
 */
export async function getUserById(id: string): Promise<DBUser | null> {
  try {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return results[0] || null;
  } catch {
    // Ajuste Obligatorio 7: Sanitizar y proteger consultas e información de base de datos
    return null;
  }
}
