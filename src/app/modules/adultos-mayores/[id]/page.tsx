import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { getAdultoMayorById } from '@/modules/adultos-mayores/services/adulto-mayor-service';
import { getEstadoBadge } from '@/modules/adultos-mayores/utils/estadoBadge';
import DeleteButton from '@/modules/adultos-mayores/components/DeleteButton';
import { getRelevamientosByAdultoMayor } from '@/modules/relevamientos/services/relevamiento-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdultoMayorDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Obtener datos del adulto mayor (excluye eliminados automáticamente por el service)
  const data = await getAdultoMayorById(id);
  if (!data) {
    notFound();
  }

  // Obtener el historial de relevamientos
  const relevamientosList = await getRelevamientosByAdultoMayor(id);

  // 2. Obtener sesión de usuario para validar permisos en UI
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = sessionToken ? await verifyJWT(sessionToken) : null;
  const isAuthorizedToDelete = session && (session.role === ROLES.ADMIN || session.role === ROLES.SUPERVISOR);

  const badge = getEstadoBadge(data.estado);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Miga de Pan */}
      <nav className="text-sm text-slate-500 flex items-center gap-2">
        <Link href="/modules/adultos-mayores" className="hover:text-slate-800 transition-colors">
          Adultos Mayores
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{data.apellido}, {data.nombre}</span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {data.apellido}, {data.nombre}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Ficha de identificación y localización.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/modules/relevamientos/nuevo?adultoMayorId=${data.id}`}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center"
          >
            Iniciar Relevamiento
          </Link>
          <Link
            href={`/modules/adultos-mayores/${data.id}/editar`}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors shadow-sm flex items-center justify-center"
          >
            Editar Información
          </Link>
          {isAuthorizedToDelete && <DeleteButton id={data.id} />}
        </div>
      </div>

      {/* Ficha de Detalles */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* DNI */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Documento Nacional de Identidad (DNI)</span>
            <span className="block text-slate-900 font-mono text-sm mt-1">{data.dni}</span>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</span>
            <span className="block text-slate-900 text-sm mt-1">
              {new Date(data.fechaNacimiento).toLocaleDateString('es-AR', {
                timeZone: 'UTC',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Teléfono */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</span>
            <span className="block text-slate-900 text-sm mt-1">{data.telefono || 'No especificado'}</span>
          </div>

          {/* Barrio */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Barrio de Residencia</span>
            <span className="block text-slate-900 text-sm mt-1">{data.barrio}</span>
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Dirección Particular</span>
            <span className="block text-slate-900 text-sm mt-1">{data.direccion}</span>
          </div>
        </div>

        {/* Observaciones Sanitizadas */}
        <div className="border-t border-slate-100 pt-6">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observaciones y Diagnóstico Social</span>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {data.observaciones || 'Sin observaciones registradas.'}
          </div>
        </div>

        {/* Auditoría Básica (Ajuste Obligatorio 3 - email del creador) */}
        <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-x-8 gap-y-4 text-xs text-slate-400">
          <div>
            <span>Registrado por: </span>
            <span className="font-semibold text-slate-600">{data.creatorEmail}</span>
          </div>
          <div>
            <span>Fecha de Creación: </span>
            <span className="font-semibold text-slate-600">
              {new Date(data.createdAt).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div>
            <span>Última Actualización: </span>
            <span className="font-semibold text-slate-600">
              {new Date(data.updatedAt).toLocaleDateString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de Relevamientos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Historial de Relevamientos</h2>
          <span className="text-xs text-slate-400 font-semibold">{relevamientosList.length} Relevamiento(s)</span>
        </div>

        {relevamientosList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No se han registrado relevamientos para este participante.</p>
            <Link
              href={`/modules/relevamientos/nuevo?adultoMayorId=${data.id}`}
              className="mt-3 inline-flex items-center px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors"
            >
              Iniciar Primer Relevamiento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Riesgo Social</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Encuestador</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {relevamientosList.map((r) => {
                  // Badges de Riesgo y Estado
                  const getRiesgoStyle = (rStyle: string) => {
                    switch (rStyle) {
                      case 'BAJO': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      case 'MEDIO': return 'bg-amber-50 text-amber-700 border-amber-100';
                      case 'ALTO': return 'bg-orange-50 text-orange-700 border-orange-100';
                      case 'CRITICO': return 'bg-rose-50 text-rose-700 border-rose-100';
                      default: return 'bg-slate-50 text-slate-600 border-slate-100';
                    }
                  };
                  const getEstadoStyle = (eStyle: string) => {
                    switch (eStyle) {
                      case 'BORRADOR': return 'bg-slate-100 text-slate-600 border-slate-200';
                      case 'FINALIZADO': return 'bg-blue-50 text-blue-700 border-blue-100';
                      default: return 'bg-slate-50 text-slate-600 border-slate-100';
                    }
                  };

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {new Date(r.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${getRiesgoStyle(r.riesgoSocial)}`}>
                          {r.riesgoSocial}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${getEstadoStyle(r.estado)}`}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {r.createdByEmail}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          href={`/modules/relevamientos/${r.id}`}
                          className="inline-flex items-center px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Ver Detalle
                        </Link>
                        {session && (session.role !== ROLES.SOCIAL_WORKER || r.estado === 'BORRADOR') && (
                          <Link
                            href={`/modules/relevamientos/${r.id}/editar`}
                            className="inline-flex items-center px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                          >
                            Editar
                          </Link>
                        )}
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
