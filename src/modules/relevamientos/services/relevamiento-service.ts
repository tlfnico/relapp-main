import { db } from '@/server/db';
import { relevamientos, Relevamiento, NewRelevamiento } from '@/server/db/schema/relevamientos';
import { users } from '@/server/db/schema/users';
import { adultosMayores } from '@/server/db/schema/adultosMayores';
import { eq, and, isNull, desc } from 'drizzle-orm';

export interface RelevamientoListItem {
  id: string;
  adultoMayorId: string;
  createdAt: Date;
  estado: 'BORRADOR' | 'FINALIZADO';
  riesgoSocial: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  createdByEmail: string;
}

export interface RelevamientoDetail extends Relevamiento {
  createdByEmail: string;
  adultoMayorNombre: string;
  adultoMayorApellido: string;
  adultoMayorDni: string;
}

/**
 * Obtiene la lista de relevamientos de un Adulto Mayor, excluyendo eliminados.
 * Ordenados por fecha de creación descendente.
 */
export async function getRelevamientosByAdultoMayor(
  adultoMayorId: string
): Promise<RelevamientoListItem[]> {
  try {
    const results = await db
      .select({
        id: relevamientos.id,
        adultoMayorId: relevamientos.adultoMayorId,
        createdAt: relevamientos.createdAt,
        estado: relevamientos.estado,
        riesgoSocial: relevamientos.riesgoSocial,
        createdByEmail: users.email,
      })
      .from(relevamientos)
      .innerJoin(users, eq(relevamientos.createdBy, users.id))
      .where(
        and(
          eq(relevamientos.adultoMayorId, adultoMayorId),
          isNull(relevamientos.deletedAt)
        )
      )
      .orderBy(desc(relevamientos.createdAt));

    return results;
  } catch {
    console.error('❌ Error al obtener listado de relevamientos del participante [DETALLES SENSIBLES SANITIZADOS]');
    return [];
  }
}

/**
 * Obtiene los detalles de un relevamiento por su ID.
 */
export async function getRelevamientoById(id: string): Promise<RelevamientoDetail | null> {
  try {
    const results = await db
      .select({
        relevamiento: relevamientos,
        createdByEmail: users.email,
        adultoMayorNombre: adultosMayores.nombre,
        adultoMayorApellido: adultosMayores.apellido,
        adultoMayorDni: adultosMayores.dni,
      })
      .from(relevamientos)
      .innerJoin(users, eq(relevamientos.createdBy, users.id))
      .innerJoin(adultosMayores, eq(relevamientos.adultoMayorId, adultosMayores.id))
      .where(
        and(
          eq(relevamientos.id, id),
          isNull(relevamientos.deletedAt)
        )
      )
      .limit(1);

    if (results.length === 0) return null;

    const { relevamiento, createdByEmail, adultoMayorNombre, adultoMayorApellido, adultoMayorDni } = results[0];

    return {
      ...relevamiento,
      createdByEmail,
      adultoMayorNombre,
      adultoMayorApellido,
      adultoMayorDni,
    };
  } catch {
    console.error('❌ Error al obtener detalle de relevamiento [DETALLES SENSIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Crea un nuevo relevamiento en base de datos.
 */
export async function createRelevamiento(
  data: Omit<NewRelevamiento, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<Relevamiento | null> {
  try {
    const results = await db
      .insert(relevamientos)
      .values(data)
      .returning();

    return results[0] || null;
  } catch {
    console.error('❌ Error al persistir relevamiento [DETALLES SENSIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Actualiza un relevamiento existente.
 */
export async function updateRelevamiento(
  id: string,
  data: Partial<Omit<NewRelevamiento, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'adultoMayorId'>>
): Promise<Relevamiento | null> {
  try {
    const results = await db
      .update(relevamientos)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(relevamientos.id, id),
          isNull(relevamientos.deletedAt)
        )
      )
      .returning();

    return results[0] || null;
  } catch {
    console.error('❌ Error al actualizar relevamiento [DETALLES SENSIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Soft Delete de un relevamiento (marcar deletedAt).
 */
export async function softDeleteRelevamiento(id: string): Promise<boolean> {
  try {
    const results = await db
      .update(relevamientos)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(relevamientos.id, id),
          isNull(relevamientos.deletedAt)
        )
      )
      .returning();

    return results.length > 0;
  } catch {
    console.error('❌ Error al marcar soft-delete del relevamiento [DETALLES SENSIBLES SANITIZADOS]');
    return false;
  }
}
