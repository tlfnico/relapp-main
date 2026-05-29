import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { logoutAction } from '@/modules/auth/actions/logoutAction';
import Link from 'next/link';

// Importar servicios del dashboard
import {
  getDashboardStats,
  getRiesgoStats,
  getBarriosStats,
  getRelevamientosTimeline,
  getMovilidadStats,
} from '@/modules/dashboard/services/dashboard-service';

// Importar componentes del dashboard
import DashboardStatCard from '@/modules/dashboard/components/DashboardStatCard';
import DashboardCharts from '@/modules/dashboard/components/DashboardCharts';

export const metadata = {
  title: 'Dashboard Institucional | RelApp',
  description: 'Métricas, análisis territorial y estadísticas consolidadas en tiempo real.',
};

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
  const [stats, riesgoData, barriosData, timelineData, movilidadData] = await Promise.all([
    getDashboardStats(),
    getRiesgoStats(),
    getBarriosStats(),
    getRelevamientosTimeline(),
    getMovilidadStats(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* Cabecera del Dashboard */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
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
            className="flex flex-col gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md transition duration-200 hover:border-emerald-500/30 hover:shadow-emerald-500/5 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition">
                Gestión de Adultos Mayores
              </h2>
            </div>
            <p className="text-sm text-zinc-400">
              Listado general, búsquedas por DNI, registro e historial de relevamientos.
            </p>
          </Link>

          <Link
            href="/modules/adultos-mayores/nuevo"
            className="flex flex-col gap-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md transition duration-200 hover:border-sky-500/30 hover:shadow-sky-500/5 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 group-hover:bg-sky-500/20 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-sky-400 transition">
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
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
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

      </div>
    </main>
  );
}
