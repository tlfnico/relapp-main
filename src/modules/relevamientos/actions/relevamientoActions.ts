'use server';

import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { relevamientoSchema, RelevamientoInput } from '../validators/relevamiento.schema';
import {
  createRelevamiento,
  updateRelevamiento,
  getRelevamientoById,
  softDeleteRelevamiento,
} from '../services/relevamiento-service';

export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Recupera y valida la sesión de usuario del lado del servidor.
 */
async function getValidatedSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return null;
  return await verifyJWT(sessionToken);
}

/**
 * Server Action para crear un Relevamiento.
 * Permitido para todos los roles activos (ADMIN, SUPERVISOR, SOCIAL_WORKER).
 */
export async function createRelevamientoAction(data: RelevamientoInput): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    const parsed = relevamientoSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Los datos proporcionados no son válidos.' };
    }

    const input = parsed.data;

    const result = await createRelevamiento({
      adultoMayorId: input.adultoMayorId,
      tipoVivienda: input.tipoVivienda,
      tieneAgua: input.tieneAgua,
      tieneLuz: input.tieneLuz,
      tieneGas: input.tieneGas,
      hacinamiento: input.hacinamiento,
      enfermedadesCronicas: input.enfermedadesCronicas,
      nivelMovilidad: input.nivelMovilidad,
      tomaMedicamentos: input.tomaMedicamentos,
      ingresos: input.ingresos,
      obraSocial: input.obraSocial,
      redApoyo: input.redApoyo,
      riesgoSocial: input.riesgoSocial,
      estado: input.estado,
      observacionesGeneral: input.observacionesGeneral || null,
      createdBy: session.id,
    });

    if (!result) {
      return { success: false, error: 'Error al persistir el relevamiento en la base de datos.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al procesar la solicitud.' };
  }
}

/**
 * Server Action para actualizar un Relevamiento.
 * Restricciones:
 * - SOCIAL_WORKER: Solo puede editar si el estado actual es BORRADOR.
 * - SUPERVISOR: Puede editar tanto BORRADOR como FINALIZADO.
 * - ADMIN: Puede editar tanto BORRADOR como FINALIZADO.
 */
export async function updateRelevamientoAction(id: string, data: RelevamientoInput): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    // Buscar el relevamiento actual
    const currentRelevamiento = await getRelevamientoById(id);
    if (!currentRelevamiento) {
      return { success: false, error: 'El relevamiento especificado no existe.' };
    }

    // Reglas de autorización por rol y estado
    if (session.role === ROLES.SOCIAL_WORKER) {
      if (currentRelevamiento.estado === 'FINALIZADO') {
        return {
          success: false,
          error: 'No tiene permisos para modificar un relevamiento ya FINALIZADO.',
        };
      }
    }

    const parsed = relevamientoSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Los datos proporcionados no son válidos.' };
    }

    const input = parsed.data;

    const result = await updateRelevamiento(id, {
      tipoVivienda: input.tipoVivienda,
      tieneAgua: input.tieneAgua,
      tieneLuz: input.tieneLuz,
      tieneGas: input.tieneGas,
      hacinamiento: input.hacinamiento,
      enfermedadesCronicas: input.enfermedadesCronicas,
      nivelMovilidad: input.nivelMovilidad,
      tomaMedicamentos: input.tomaMedicamentos,
      ingresos: input.ingresos,
      obraSocial: input.obraSocial,
      redApoyo: input.redApoyo,
      riesgoSocial: input.riesgoSocial,
      estado: input.estado,
      observacionesGeneral: input.observacionesGeneral || null,
    });

    if (!result) {
      return { success: false, error: 'No se pudo actualizar el relevamiento o este no existe.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al actualizar la información.' };
  }
}

/**
 * Server Action para Soft Delete de Relevamientos.
 * Restricciones:
 * - ADMIN: Único rol permitido para soft delete.
 */
export async function softDeleteRelevamientoAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getValidatedSession();
    if (!session) {
      return { success: false, error: 'Sesión inválida o vencida. Por favor, inicie sesión.' };
    }

    // Solo ADMIN puede eliminar
    if (session.role !== ROLES.ADMIN) {
      return {
        success: false,
        error: 'No posee permisos suficientes para eliminar relevamientos (Solo administradores).',
      };
    }

    const isDeleted = await softDeleteRelevamiento(id);
    if (!isDeleted) {
      return { success: false, error: 'El relevamiento no existe o ya ha sido removido.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Ha ocurrido un error inesperado al eliminar el relevamiento.' };
  }
}
