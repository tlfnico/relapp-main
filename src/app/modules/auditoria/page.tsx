import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { getFilteredAuditLogs } from '@/modules/auditoria/services/audit-service';
import { ROLES } from '@/lib/constants/roles';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import AnimatedEmptyState from '@/components/AnimatedEmptyState';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    email?: string;
    action?: string;
    entityType?: string;
    fromDate?: string;
    toDate?: string;
    page?: string;
  }>;
}

/**
 * Mapea las acciones a etiquetas y estilos visuales premium.
 */
function getActionBadge(action: string) {
  const mapping: Record<string, { label: string; style: string }> = {
    LOGIN_SUCCESS: {
      label: 'Inicio Sesión OK',
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    LOGIN_FAILED: {
      label: 'Inicio Sesión Fallido',
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium animate-pulse',
    },
    LOGOUT: {
      label: 'Cierre Sesión',
      style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    },
    RATE_LIMIT_BLOCKED: {
      label: 'IP Bloqueada',
      style: 'bg-red-500/25 text-red-300 border-red-500/40 font-bold',
    },
    ADULTO_MAYOR_CREATED: {
      label: 'Adulto Registrado',
      style: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    ADULTO_MAYOR_UPDATED: {
      label: 'Adulto Modificado',
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    ADULTO_MAYOR_DELETED: {
      label: 'Adulto Eliminado',
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    RELEVAMIENTO_CREATED: {
      label: 'Relevamiento Creado',
      style: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    RELEVAMIENTO_UPDATED: {
      label: 'Relevamiento Modificado',
      style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    RELEVAMIENTO_FINALIZED: {
      label: 'Relevamiento Finalizado',
      style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-semibold',
    },
    RELEVAMIENTO_DELETED: {
      label: 'Relevamiento Eliminado',
      style: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
  };

  return mapping[action] || {
    label: action,
    style: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };
}

/**
 * Formateador de fecha local y relativa para auditoría.
 */
function formatDate(date: Date) {
  const localStr = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${localStr} ${timeStr}`;
}

export default async function AuditLogAdminPage({ searchParams }: PageProps) {
  // 1. Doble Validación de Seguridad Server-Side
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  const session = await verifyJWT(sessionCookie);

  if (!session) {
    redirect('/login');
  }

  // Validación estricta de ADMIN (Supervisor y Social Worker redirigidos obligatoriamente)
  if (session.role !== ROLES.ADMIN) {
    redirect('/unauthorized');
  }

  // 2. Extraer parámetros de búsqueda y paginación
  const params = await searchParams;
  const email = params.email || '';
  const action = params.action || '';
  const entityType = params.entityType || '';
  const fromDate = params.fromDate || '';
  const toDate = params.toDate || '';
  const pageNum = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;
  const offset = (pageNum - 1) * limit;

  // 3. Consultar los datos filtrados desde la base de datos
  const { data: logs, totalCount } = await getFilteredAuditLogs({
    email,
    action,
    entityType,
    fromDate,
    toDate,
    limit,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Generar URL con filtros para paginación
  const buildPageUrl = (pageIndex: number) => {
    const query = new URLSearchParams();
    if (email) query.set('email', email);
    if (action) query.set('action', action);
    if (entityType) query.set('entityType', entityType);
    if (fromDate) query.set('fromDate', fromDate);
    if (toDate) query.set('toDate', toDate);
    query.set('page', String(pageIndex));
    return `/modules/auditoria?${query.toString()}`;
  };

  // Lista de acciones conocidas para autocompletado del filtro
  const auditActions = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'RATE_LIMIT_BLOCKED',
    'ADULTO_MAYOR_CREATED',
    'ADULTO_MAYOR_UPDATED',
    'ADULTO_MAYOR_DELETED',
    'RELEVAMIENTO_CREATED',
    'RELEVAMIENTO_UPDATED',
    'RELEVAMIENTO_FINALIZED',
    'RELEVAMIENTO_DELETED',
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Auditoría' }]} />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Cabecera Administrativa */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/30">
          <div>
            <div className="flex items-center gap-2.5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Panel de Auditoría
                  <span className="px-2 py-0.5 text-4xs uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                    Exclusivo Admin
                  </span>
                </h1>
                <p className="text-sm text-zinc-400 mt-1">Bitácora de seguridad, accesos y trazabilidad transaccional.</p>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Administrador
            </span>
            <span className="text-sm font-medium text-zinc-200 block">{session.email}</span>
          </div>
        </header>

        {/* Buscador y Filtros Avanzados */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
            Filtros de Búsqueda
          </h2>
          <form method="GET" action="/modules/auditoria" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Correo Electrónico</label>
              <input
                type="text"
                name="email"
                defaultValue={email}
                placeholder="Ej: admin@relapp.com"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-zinc-600 text-white"
              />
            </div>

            {/* Acción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Acción</label>
              <select
                name="action"
                defaultValue={action}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white"
              >
                <option value="">Todas las acciones</option>
                {auditActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Entidad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Tipo de Entidad</label>
              <select
                name="entityType"
                defaultValue={entityType}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white"
              >
                <option value="">Todas las entidades</option>
                <option value="ADULTO_MAYOR">ADULTO_MAYOR</option>
                <option value="RELEVAMIENTO">RELEVAMIENTO</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Desde</label>
              <input
                type="date"
                name="fromDate"
                defaultValue={fromDate}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Hasta</label>
              <input
                type="date"
                name="toDate"
                defaultValue={toDate}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white"
              />
            </div>

            {/* Acciones */}
            <div className="lg:col-span-5 flex justify-end gap-3 mt-2 border-t border-zinc-800 pt-4">
              <Link
                href="/modules/auditoria"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition"
              >
                Limpiar Filtros
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition shadow-md shadow-emerald-950/20"
              >
                Buscar / Filtrar
              </button>
            </div>

          </form>
        </section>

        {/* Listado y Tabla */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Bitácora General</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Mostrando registros ordenados cronológicamente.</p>
            </div>
            <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700/50">
              Total logs: <strong className="text-emerald-400 font-bold">{totalCount}</strong>
            </span>
          </div>

          {logs.length === 0 ? (
            <AnimatedEmptyState
              icon={<ShieldAlert className="w-5 h-5 text-zinc-450" />}
              title="No se encontraron registros de auditoría"
              description="Intente cambiar los filtros o busque otros términos."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Acción</th>
                    <th className="px-6 py-4">Entidad Relacionada</th>
                    <th className="px-6 py-4">Dirección IP</th>
                    <th className="px-6 py-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                  {logs.map((item) => {
                    const badge = getActionBadge(item.action);
                    return (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        
                        {/* Fecha */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="block font-medium text-white">{formatDate(item.createdAt)}</span>
                          <span className="block text-4xs text-zinc-500 mt-0.5 tracking-wide font-mono uppercase">
                            UTC {item.createdAt.toISOString()}
                          </span>
                        </td>

                        {/* Usuario */}
                        <td className="px-6 py-4">
                          <span className="block text-zinc-200 font-medium">{item.userEmail || 'Sistema Anónimo'}</span>
                          {item.userId && (
                            <span className="block text-5xs text-zinc-600 font-mono select-all">
                              ID: {item.userId}
                            </span>
                          )}
                        </td>

                        {/* Acción */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.style}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Entidad */}
                        <td className="px-6 py-4">
                          {item.entityType ? (
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-5xs font-bold bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-700/50">
                                {item.entityType}
                              </span>
                              {item.entityId && (
                                <span className="block text-5xs font-mono text-zinc-500 mt-1 select-all">
                                  ID: {item.entityId}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>

                        {/* Dirección IP */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                            {item.ipAddress || '0.0.0.0'}
                          </span>
                        </td>

                        {/* Metadata sanitizada */}
                        <td className="px-6 py-4">
                          {item.metadata && Object.keys(item.metadata).length > 0 ? (
                            <details className="cursor-pointer group">
                              <summary className="text-xs text-zinc-400 group-hover:text-emerald-400 select-none outline-none font-medium">
                                Ver Detalles ({Object.keys(item.metadata).length})
                              </summary>
                              <div className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-3xs font-mono text-zinc-400 overflow-x-auto max-w-[280px] md:max-w-xs shadow-inner">
                                <pre className="text-zinc-400 whitespace-pre-wrap leading-relaxed select-all">
                                  {JSON.stringify(item.metadata, null, 2)}
                                </pre>
                              </div>
                            </details>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          <div className="p-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/20">
            <span className="text-xs text-zinc-500">
              Página <strong className="text-zinc-300 font-semibold">{pageNum}</strong> de <strong className="text-zinc-300 font-semibold">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <Link
                href={pageNum > 1 ? buildPageUrl(pageNum - 1) : '#'}
                className={`px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700/50 transition ${
                  pageNum <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Anterior
              </Link>
              <Link
                href={pageNum < totalPages ? buildPageUrl(pageNum + 1) : '#'}
                className={`px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700/50 transition ${
                  pageNum >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>

        </section>

      </PageTransition>
    </main>
  );
}
