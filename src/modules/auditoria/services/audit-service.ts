import { db } from '@/server/db';
import { auditLogs } from '@/server/db/schema/auditLogs';
import { cookies, headers } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { sql, and, eq, gte, lte, desc, notInArray, ilike } from 'drizzle-orm';

/**
 * Filtros de búsqueda para la vista de auditoría.
 */
export interface AuditFilterParams {
  email?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Payload de entrada para la creación de logs.
 */
export interface CreateAuditLogPayload {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: unknown;
}

/**
 * Obtiene la sesión actual desde cookies de forma segura y controlada.
 */
async function getSessionSafely() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (token) {
      return await verifyJWT(token);
    }
  } catch {
    // Fuera de un contexto de solicitud (ej. build/seed)
  }
  return null;
}

/**
 * Sanitiza y reduce el tamaño de los metadatos para evitar persistir información sensible o pesada.
 */
function cleanAndMinimizeMetadata(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object') return null;

  const result: Record<string, unknown> = {};

  const sensitiveKeys = [
    'password',
    'passwordhash',
    'password_hash',
    'jwt',
    'token',
    'session',
    'observaciones',
    'observacionesgeneral',
    'observaciones_general',
    'enfermedadescronicas',
    'enfermedades_cronicas',
    'direccion',
    'ingresos',
  ];

  const metaObj = metadata as Record<string, unknown>;
  const keys = Object.keys(metaObj);
  const modifiedFields: string[] = [];
  let sensitiveFieldsModified = false;

  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sensitiveFieldsModified = true;
    } else {
      modifiedFields.push(key);
    }
  }

  // { "camposModificados": [...], "camposSensiblesModificados": true }
  result.camposModificados = modifiedFields.filter(
    f => !['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy'].includes(f)
  );
  result.camposSensiblesModificados = sensitiveFieldsModified;

  // Preservar solo mensajes o correos mínimos útiles para auditoría técnica
  if ('msg' in metaObj && metaObj.msg !== undefined && metaObj.msg !== null) {
    result.msg = String(metaObj.msg).substring(0, 100);
  }
  if ('reason' in metaObj && metaObj.reason !== undefined && metaObj.reason !== null) {
    result.reason = String(metaObj.reason).substring(0, 100);
  }
  if ('error' in metaObj && metaObj.error !== undefined && metaObj.error !== null) {
    result.error = String(metaObj.error).substring(0, 100);
  }
  if ('email' in metaObj && metaObj.email !== undefined && metaObj.email !== null) {
    result.email = String(metaObj.email).substring(0, 100);
  }

  return result;
}

/**
 * Aplica la política de privacidad sobre la IP del cliente en base a la acción.
 */
function anonymizeIp(ip: string, action: string): string {
  if (!ip) return '0.0.0.0';

  const fullIpActions = ['LOGIN_FAILED', 'LOGIN_SUCCESS', 'RATE_LIMIT_BLOCKED'];
  if (fullIpActions.includes(action)) {
    return ip;
  }

  // Anonimizar parcialmente para acciones comunes
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
  } else if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`;
    }
  }

  return 'xxx.xxx.xxx.xxx';
}

/**
 * Crea un log de auditoría de forma completamente asíncrona y segura.
 * JAMÁS interrumpe el flujo de negocio si ocurre un error.
 */
export async function createAuditLog(payload: CreateAuditLogPayload): Promise<void> {
  try {
    let finalUserId = payload.userId;
    let finalUserEmail = payload.userEmail;

    // Si no se proveen datos del usuario, intentar extraerlos de la sesión cookie
    if (!finalUserId || !finalUserEmail) {
      const session = await getSessionSafely();
      if (session) {
        finalUserId = finalUserId || session.id;
        finalUserEmail = finalUserEmail || session.email;
      }
    }

    // Capturar IP y User Agent de forma segura
    let ipAddress = '127.0.0.1';
    let userAgent = 'unknown';
    try {
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      ipAddress = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : (headersList.get('x-real-ip') || '127.0.0.1');
      userAgent = headersList.get('user-agent') || 'unknown';
    } catch {
      // Fuera de contexto HTTP
    }

    const cleanMetadata = cleanAndMinimizeMetadata(payload.metadata);
    const finalIp = anonymizeIp(ipAddress, payload.action);
    const finalUserAgent = userAgent ? userAgent.substring(0, 300) : 'unknown';

    // Insertar en base de datos
    await db.insert(auditLogs).values({
      userId: finalUserId || null,
      userEmail: finalUserEmail || null,
      action: payload.action,
      entityType: payload.entityType || null,
      entityId: payload.entityId ? String(payload.entityId) : null,
      metadata: cleanMetadata || null,
      ipAddress: finalIp,
      userAgent: finalUserAgent,
    });
  } catch (err) {
    // La regla de oro: Silenciar errores y registrar solo advertencias para no romper el flujo principal
    console.error('⚠️ [AUDIT_SERVICE_WARNING] No se pudo escribir en el log de auditoría:', err);
  }
}

/**
 * Comprueba el rate limiting de inicio de sesión basado en IP.
 * Límite: Máximo 5 intentos fallidos en los últimos 5 minutos.
 */
export async function checkLoginRateLimit(): Promise<{ blocked: boolean; error?: string }> {
  try {
    let ipAddress = '127.0.0.1';
    try {
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      ipAddress = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : (headersList.get('x-real-ip') || '127.0.0.1');
    } catch {
      // Sin contexto de solicitud
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const failures = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.action, 'LOGIN_FAILED'),
          eq(auditLogs.ipAddress, ipAddress),
          gte(auditLogs.createdAt, fiveMinutesAgo)
        )
      );

    const count = failures[0]?.count ?? 0;
    if (count >= 5) {
      // Registrar bloqueo de IP
      await createAuditLog({
        action: 'RATE_LIMIT_BLOCKED',
        metadata: { count, ipAddress },
      });

      return {
        blocked: true,
        error: 'Demasiados intentos de inicio de sesión fallidos. Su IP ha sido bloqueada temporalmente por 5 minutos.',
      };
    }

    return { blocked: false };
  } catch (err) {
    console.error('⚠️ [RATE_LIMIT_ERROR] Error al comprobar rate limit:', err);
    return { blocked: false };
  }
}

/**
 * Cantidad de logins exitosos en el día de hoy (desde las 00:00).
 */
export async function getLoginsDelDiaCount(): Promise<number> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const results = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.action, 'LOGIN_SUCCESS'),
          gte(auditLogs.createdAt, startOfToday)
        )
      );

    return results[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Cantidad de operaciones de negocio (excluyendo logins/logouts) realizadas hoy.
 */
export async function getOperacionesDelDiaCount(): Promise<number> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const results = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(
        and(
          notInArray(auditLogs.action, ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'RATE_LIMIT_BLOCKED']),
          gte(auditLogs.createdAt, startOfToday)
        )
      );

    return results[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Obtiene la actividad reciente del sistema para visualización simplificada.
 */
export async function getRecentActivity(limitNum = 5) {
  try {
    return await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        userEmail: auditLogs.userEmail,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limitNum);
  } catch {
    return [];
  }
}

/**
 * Obtiene el listado completo de logs de auditoría filtrado y paginado.
 */
export async function getFilteredAuditLogs(params: AuditFilterParams) {
  try {
    const conditions = [];

    if (params.email && params.email.trim() !== '') {
      conditions.push(ilike(auditLogs.userEmail, `%${params.email.trim()}%`));
    }

    if (params.action && params.action.trim() !== '') {
      conditions.push(eq(auditLogs.action, params.action.trim()));
    }

    if (params.entityType && params.entityType.trim() !== '') {
      conditions.push(eq(auditLogs.entityType, params.entityType.trim()));
    }

    if (params.fromDate && params.fromDate.trim() !== '') {
      const fromDate = new Date(params.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      conditions.push(gte(auditLogs.createdAt, fromDate));
    }

    if (params.toDate && params.toDate.trim() !== '') {
      const toDate = new Date(params.toDate);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(auditLogs.createdAt, toDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Obtener total count para paginación
    const totalRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(whereClause);
    const totalCount = totalRes[0]?.count ?? 0;

    // Obtener datos paginados y ordenados por fecha descendente
    const query = db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt));

    if (params.limit !== undefined) {
      query.limit(params.limit);
    }
    if (params.offset !== undefined) {
      query.offset(params.offset);
    }

    const data = await query;
    return { data, totalCount };
  } catch (err) {
    console.error('❌ Error al consultar logs de auditoría filtrados:', err);
    return { data: [], totalCount: 0 };
  }
}
