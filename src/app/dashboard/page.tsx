import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { logoutAction } from '@/modules/auth/actions/logoutAction';
import Link from 'next/link';
import { ROLES } from '@/lib/constants/roles';

// Importar servicios del dashboard
import {
  getDashboardStats,
  getRiesgoStats,
  getBarriosStats,
  getRelevamientosTimeline,
  getMovilidadStats,
} from '@/modules/dashboard/services/dashboard-service';

// Importar servicios de auditoría
import {
  getLoginsDelDiaCount,
  getOperacionesDelDiaCount,
  getRecentActivity,
} from '@/modules/auditoria/services/audit-service';

// Importar componentes del dashboard
import DashboardStatCard from '@/modules/dashboard/components/DashboardStatCard';
import DashboardCharts from '@/modules/dashboard/components/DashboardCharts';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';

export const metadata = {
  title: 'Dashboard Institucional | RelApp',
  description: 'Métricas, análisis territorial y estadísticas consolidadas en tiempo real.',
};

function getActionBadge(action: string) {
  const mapping: Record<string, { label: string; style: string }> = {
    LOGIN_SUCCESS: { label: 'Login OK', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    LOGIN_FAILED: { label: 'Login Error', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' },
    LOGOUT: { label: 'Logout', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    RATE_LIMIT_BLOCKED: { label: 'IP Bloqueada', style: 'bg-red-500/20 text-red-300 border-red-500/30 font-semibold' },
    ADULTO_MAYOR_CREATED: { label: 'Nuevo Adulto', style: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    ADULTO_MAYOR_UPDATED: { label: 'Adulto Editado', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ADULTO_MAYOR_DELETED: { label: 'Adulto Borrado', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    RELEVAMIENTO_CREATED: { label: 'Nuevo Relev.', style: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    RELEVAMIENTO_UPDATED: { label: 'Relev. Editado', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    RELEVAMIENTO_FINALIZED: { label: 'Relev. Finalizado', style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-semibold' },
    RELEVAMIENTO_DELETED: { label: 'Relev. Borrado', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  };

  return mapping[action] || { label: action, style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return 'Hace instantes';
  if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export default async function DashboardPage() {
  // 1. Validar sesión JWT server-side
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  const session = await verifyJWT(sessionCookie);

  if (!session) {
    redirect('/login');
  }

  // 2. Ejecutar todas las consultas a la base de datos en paralelo
  const [
    stats,
    riesgoData,
    barriosData,
    timelineData,
    movilidadData,
    loginsHoy,
    operacionesHoy,
    recentActivity,
  ] = await Promise.all([
    getDashboardStats(),
    getRiesgoStats(),
    getBarriosStats(),
    getRelevamientosTimeline(),
    getMovilidadStats(),
    getLoginsDelDiaCount(),
    getOperacionesDelDiaCount(),
    getRecentActivity(5),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* Miga de Pan */}
        <Breadcrumbs items={[]} />
        
        {/* Cabecera del Dashboard */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/30">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl font-bold tracking-tight text-white">RelApp</h1>
            </div>
            <p className="text-sm text-zinc-400 mt-1">Plataforma Modular de Relevamientos Sociales</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Usuario
              </span>
              <span className="text-sm font-medium text-zinc-200 block">{session.email}</span>
              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {session.role}
              </span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="py-2 px-4 font-semibold rounded-xl text-white bg-zinc-800 hover:bg-zinc-700 hover:text-rose-400 transition duration-150 text-sm cursor-pointer border border-zinc-700/50"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>

        {/* Accesos Rápidos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/modules/adultos-mayores"
            className="flex flex-col gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/30 transition duration-300 hover:border-emerald-500/30 hover:shadow-emerald-950/20 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-405 transition">
                Gestión de Adultos Mayores
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Listado general, búsquedas por DNI, registro e historial de relevamientos.
            </p>
          </Link>

          <Link
            href="/modules/adultos-mayores/nuevo"
            className="flex flex-col gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/30 transition duration-300 hover:border-sky-500/30 hover:shadow-sky-950/20 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 group-hover:bg-sky-500/20 transition duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-sky-405 transition">
                Registrar Nuevo Participante
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Agregar un nuevo adulto mayor al sistema para iniciar su seguimiento social.
            </p>
          </Link>
        </section>

        {/* Grilla de Tarjetas KPI */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <DashboardStatCard
            title="Adultos Mayores"
            value={stats.totalAdultosMayores}
            variant="default"
            delay={0.05}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <DashboardStatCard
            title="Activos"
            value={stats.totalActivos}
            variant="success"
            delay={0.1}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <DashboardStatCard
            title="Relevamientos"
            value={stats.totalRelevamientos}
            variant="info"
            delay={0.15}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <DashboardStatCard
            title="Borradores"
            value={stats.totalBorradores}
            variant="warning"
            delay={0.2}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <DashboardStatCard
            title="Finalizados"
            value={stats.totalFinalizados}
            variant="success"
            delay={0.25}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
          <DashboardStatCard
            title="Riesgo Alto"
            value={stats.totalRiesgoAlto}
            variant="danger"
            delay={0.3}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </section>

        {/* Sección de Auditoría y Seguridad */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Métricas de Auditoría de Hoy */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/35 flex flex-col gap-4 hover:border-zinc-805 transition-all duration-300">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Seguridad y Control
            </h3>
            <p className="text-xs text-zinc-400">Resumen operativo de accesos y trazabilidad institucional.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-1">
                <span className="text-5xs uppercase tracking-wider font-bold text-zinc-500">Logins Hoy</span>
                <span className="text-2xl font-bold text-emerald-400">{loginsHoy}</span>
              </div>
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-1">
                <span className="text-5xs uppercase tracking-wider font-bold text-zinc-500 font-mono">Operaciones Hoy</span>
                <span className="text-2xl font-bold text-emerald-400">{operacionesHoy}</span>
              </div>
            </div>

            {session.role === ROLES.ADMIN && (
              <Link
                href="/modules/auditoria"
                className="mt-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition duration-150 border border-emerald-500/20 text-center shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <svg className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Panel de Auditoría
              </Link>
            )}
          </div>

          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/35 flex flex-col gap-4 hover:border-zinc-805 transition-all duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Actividad Reciente del Sistema
              </h3>
              <span className="text-5xs bg-zinc-850 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Últimos 5</span>
            </div>
            
            {recentActivity.length === 0 ? (
              <p className="text-xs text-zinc-500 italic my-auto text-center py-6">No hay actividad transaccional reportada hoy.</p>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800">
                {recentActivity.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <div key={log.id} className="py-2.5 flex justify-between items-center gap-4 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-5xs font-bold uppercase border ${badge.style}`}>
                            {badge.label}
                          </span>
                          {log.entityType && (
                            <span className="text-5xs bg-zinc-950 text-zinc-400 px-1.5 py-0.2 rounded font-bold tracking-wider border border-zinc-850 uppercase">
                              {log.entityType}
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-400 text-3xs font-medium mt-0.5">
                          Por: <strong className="text-zinc-300 font-bold">{log.userEmail || 'Sistema Anónimo'}</strong>
                        </span>
                      </div>
                      <span className="text-3xs text-zinc-500 font-medium whitespace-nowrap">
                        {formatRelativeDate(log.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sección de Gráficos Recharts */}
        <section>
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Estadísticas y Análisis Consolidado</h2>
            <span className="text-xs text-zinc-500">Actualizado hace unos instantes</span>
          </div>

          <DashboardCharts
            riesgoData={riesgoData}
            barriosData={barriosData}
            timelineData={timelineData}
            movilidadData={movilidadData}
          />
        </section>

      </PageTransition>
    </main>
  );
}
