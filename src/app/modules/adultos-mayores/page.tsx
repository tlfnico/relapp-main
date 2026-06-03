import React from 'react';
import Link from 'next/link';
import { getAdultosMayoresList } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import { getEstadoBadge } from '@/modules/adultos-mayores/utils/estadoBadge';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { Plus, Search, ArrowLeft, User, MapPin, ClipboardList } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdultosMayoresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || '';

  const list = await getAdultosMayoresList(q);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-7xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: 'Adultos Mayores' }]} />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-400" />
              Gestión de Adultos Mayores
            </h1>
            <p className="text-zinc-450 text-sm mt-1">
              Administración del núcleo de participantes y registros sociales de RelApp.
            </p>
          </div>
          <Link
            href="/modules/adultos-mayores/nuevo"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 rounded-xl text-sm font-bold transition shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </Link>
        </div>

        {/* Buscador Simple Server-Side */}
        <form method="GET" action="/modules/adultos-mayores" className="flex gap-3 max-w-2xl">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-550">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre, apellido o DNI..."
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-xl text-sm text-white transition placeholder:text-zinc-550 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer border border-zinc-750"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/modules/adultos-mayores"
              className="px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer"
            >
              Limpiar
            </Link>
          )}
        </form>

        {/* Tabla de Listado */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
          {list.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                <Search className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-300 font-semibold">No se encontraron registros</p>
                <p className="text-zinc-500 text-sm mt-1">Pruebe refinando los criterios de búsqueda o registre uno nuevo.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Nombre Completo</th>
                    <th className="px-6 py-4">DNI</th>
                    <th className="px-6 py-4">Barrio</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
                  {list.map((item) => {
                    const badge = getEstadoBadge(item.estado);
                    // Mapeo semántico de colores de badge para tema oscuro
                    let badgeStyle = 'bg-zinc-800 text-zinc-300 border-zinc-700/50';
                    if (item.estado === 'ACTIVO') badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    else if (item.estado === 'PENDIENTE') badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    else if (item.estado === 'INACTIVO') badgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
                    else if (item.estado === 'FALLECIDO') badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    return (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-100">
                          {item.apellido}, {item.nombre}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-450 select-all">
                          {item.dni}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 flex items-center gap-1.5 mt-1 border-0">
                          <MapPin className="w-3.5 h-3.5 text-zinc-550" />
                          {item.barrio}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeStyle}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/modules/adultos-mayores/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-zinc-450" />
                            Ver Detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageTransition>
    </main>
  );
}
