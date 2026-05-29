import React from 'react';
import Link from 'next/link';
import { getAdultosMayoresList } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import { getEstadoBadge } from '@/modules/adultos-mayores/utils/estadoBadge';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

/**
 * Ajuste Obligatorio 4: Búsqueda simple server-side y parámetros q por query.
 */
export default async function AdultosMayoresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || '';

  const list = await getAdultosMayoresList(q);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Adultos Mayores</h1>
          <p className="text-slate-500 text-sm mt-1">
            Administración del núcleo de participantes y registros sociales de RelApp.
          </p>
        </div>
        <Link
          href="/modules/adultos-mayores/nuevo"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </Link>
      </div>

      {/* Buscador Simple Server-Side */}
      <form method="GET" action="/modules/adultos-mayores" className="flex gap-3 max-w-2xl">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl text-sm text-slate-900 transition-colors placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          Buscar
        </button>
        {q && (
          <Link
            href="/modules/adultos-mayores"
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center border border-slate-200"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Tabla de Listado */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-slate-700 font-medium">No se encontraron registros</p>
            <p className="text-slate-400 text-sm mt-1">Prueba refinando los criterios de búsqueda o registra uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">DNI</th>
                  <th className="px-6 py-4">Barrio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {list.map((item) => {
                  const badge = getEstadoBadge(item.estado);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.apellido}, {item.nombre}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {item.dni}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.barrio}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/modules/adultos-mayores/${item.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                        >
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
    </div>
  );
}
