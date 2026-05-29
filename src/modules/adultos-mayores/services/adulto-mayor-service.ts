import { db } from '@/server/db';
import { adultosMayores, AdultoMayor, NewAdultoMayor } from '@/server/db/schema/adultosMayores';
import { users } from '@/server/db/schema/users';
import { eq, and, isNull, or, ilike } from 'drizzle-orm';

export interface AdultoMayorListItem {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  barrio: string;
  estado: 'ACTIVO' | 'PENDIENTE' | 'INACTIVO' | 'FALLECIDO';
}

export interface AdultoMayorDetail extends AdultoMayor {
  creatorEmail: string;
}

/**
 * Recupera el listado filtrado de adultos mayores excluyendo eliminados (soft delete).
 * Permite búsquedas server-side por DNI, nombre o apellido (Ajuste Obligatorio 4).
 * Soporta de forma preventiva paginación mediante limit y offset (Ajuste Obligatorio 9).
 */
export async function getAdultosMayoresList(
  search?: string,
  options: { limit?: number; offset?: number } = {}
): Promise<AdultoMayorListItem[]> {
  try {
    const searchFilter = search && search.trim() !== ''
      ? or(
          ilike(adultosMayores.nombre, `%${search}%`),
          ilike(adultosMayores.apellido, `%${search}%`),
          ilike(adultosMayores.dni, `%${search}%`)
        )
      : undefined;

    // Ajuste Obligatorio 1: Excluir registros eliminados con soft delete (deleted_at != null)
    const conditions = [isNull(adultosMayores.deletedAt)];
    if (searchFilter) {
      conditions.push(searchFilter);
    }

    const query = db
      .select({
        id: adultosMayores.id,
        nombre: adultosMayores.nombre,
        apellido: adultosMayores.apellido,
        dni: adultosMayores.dni,
        barrio: adultosMayores.barrio,
        estado: adultosMayores.estado,
      })
      .from(adultosMayores)
      .where(and(...conditions))
      .orderBy(adultosMayores.apellido, adultosMayores.nombre);

    if (options.limit !== undefined) {
      query.limit(options.limit);
    }
    if (options.offset !== undefined) {
      query.offset(options.offset);
    }

    return await query;
  } catch {
    // Ajuste Importante: Sanitización de logs, no loguear datos sensibles ni consultas
    console.error('❌ Error al listar adultos mayores [DETALLES SENCIBLES SANITIZADOS]');
    return [];
  }
}

/**
 * Obtiene el detalle de un adulto mayor incluyendo únicamente datos del creador permitidos (Ajuste Obligatorio 3).
 */
export async function getAdultoMayorById(id: string): Promise<AdultoMayorDetail | null> {
  try {
    const results = await db
      .select({
        adultoMayor: adultosMayores,
        creatorEmail: users.email,
      })
      .from(adultosMayores)
      .innerJoin(users, eq(adultosMayores.createdBy, users.id))
      .where(and(eq(adultosMayores.id, id), isNull(adultosMayores.deletedAt)))
      .limit(1);

    if (results.length === 0) return null;

    const { adultoMayor, creatorEmail } = results[0];
    return {
      ...adultoMayor,
      creatorEmail,
    };
  } catch {
    console.error('❌ Error al obtener detalle del adulto mayor [DETALLES SENCIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Crea físicamente un registro en base de datos.
 */
export async function createAdultoMayor(
  data: Omit<NewAdultoMayor, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<AdultoMayor | null> {
  try {
    const results = await db
      .insert(adultosMayores)
      .values(data)
      .returning();

    return results[0] || null;
  } catch {
    console.error('❌ Error al persistir adulto mayor [DETALLES SENCIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Actualiza un registro que no esté eliminado por soft delete.
 */
export async function updateAdultoMayor(
  id: string,
  data: Partial<Omit<NewAdultoMayor, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy'>>
): Promise<AdultoMayor | null> {
  try {
    const results = await db
      .update(adultosMayores)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(adultosMayores.id, id), isNull(adultosMayores.deletedAt)))
      .returning();

    return results[0] || null;
  } catch {
    console.error('❌ Error al actualizar adulto mayor [DETALLES SENCIBLES SANITIZADOS]');
    return null;
  }
}

/**
 * Ajuste Obligatorio 1: Realizar Soft Delete marcando la fecha deletedAt.
 */
export async function softDeleteAdultoMayor(id: string): Promise<boolean> {
  try {
    const results = await db
      .update(adultosMayores)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(adultosMayores.id, id), isNull(adultosMayores.deletedAt)))
      .returning();

    return results.length > 0;
  } catch {
    console.error('❌ Error al marcar soft-delete del adulto mayor [DETALLES SENCIBLES SANITIZADOS]');
    return false;
  }
}
