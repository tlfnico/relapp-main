'use server';

import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { adultoMayorSchema, AdultoMayorInput } from '../validators/adultoMayor.schema';
import { createAdultoMayor, updateAdultoMayor, softDeleteAdultoMayor } from '../services/adulto-mayor-service';

export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Recupera y valida la sesión de usuario del lado del servidor de forma segura.
 */
async function getValidatedSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return null;
  return await verifyJWT(sessionToken);
}

/**
 * Server Action para la creación de un Adulto Mayor.
 * Permitido para todos los roles autorizados (ADMIN, SUPERVISOR, SOCIAL_WORKER).
 */
export async function createAdultoMayorAction(data: AdultoMayorInput): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    const parsed = adultoMayorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Los datos proporcionados no son válidos.' };
    }

    const input = parsed.data;

    const result = await createAdultoMayor({
      nombre: input.nombre,
      apellido: input.apellido,
      dni: input.dni,
      fechaNacimiento: input.fechaNacimiento,
      telefono: input.telefono || null,
      direccion: input.direccion,
      barrio: input.barrio,
      observaciones: input.observaciones || null,
      estado: input.estado,
      createdBy: session.id,
    });

    if (!result) {
      return { success: false, error: 'Error al registrar al adulto mayor. Es posible que el DNI ya esté registrado.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al procesar la solicitud.' };
  }
}

/**
 * Server Action para la actualización de un Adulto Mayor.
 * Permitido para todos los roles autorizados (ADMIN, SUPERVISOR, SOCIAL_WORKER).
 */
export async function updateAdultoMayorAction(id: string, data: AdultoMayorInput): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    const parsed = adultoMayorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Los datos proporcionados no son válidos.' };
    }

    const input = parsed.data;

    const result = await updateAdultoMayor(id, {
      nombre: input.nombre,
      apellido: input.apellido,
      dni: input.dni,
      fechaNacimiento: input.fechaNacimiento,
      telefono: input.telefono || null,
      direccion: input.direccion,
      barrio: input.barrio,
      observaciones: input.observaciones || null,
      estado: input.estado,
    });

    if (!result) {
      return { success: false, error: 'No se pudo actualizar el registro o este no existe.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al actualizar la información.' };
  }
}

/**
 * Server Action para el Soft Delete de un Adulto Mayor.
 * Restringido de forma estricta: Solo ADMIN y SUPERVISOR están autorizados (SOCIAL_WORKER bloqueado).
 */
export async function softDeleteAdultoMayorAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    // Validar autorización de rol (Ajuste Obligatorio 1 y sección de autorización)
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.SUPERVISOR) {
      return { success: false, error: 'No posee permisos suficientes para eliminar registros en RelApp.' };
    }

    const isDeleted = await softDeleteAdultoMayor(id);
    if (!isDeleted) {
      return { success: false, error: 'El registro no existe o ya ha sido removido.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al eliminar el registro.' };
  }
}
