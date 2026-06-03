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
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, User, Calendar, Phone, MapPin, Edit, Plus, FileText, ShieldAlert } from 'lucide-react';

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
  // Mapeo semántico de colores de badge para tema oscuro
  let badgeStyle = 'bg-zinc-800 text-zinc-300 border-zinc-700/50';
  if (data.estado === 'ACTIVO') badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (data.estado === 'PENDIENTE') badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  else if (data.estado === 'INACTIVO') badgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
  else if (data.estado === 'FALLECIDO') badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
              { label: `${data.apellido}, ${data.nombre}` },
            ]}
          />
          <Link
            href="/modules/adultos-mayores"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Listado
          </Link>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {data.apellido}, {data.nombre}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeStyle}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-zinc-450 text-sm mt-1">
              Ficha individual y registros socio-sanitarios.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/modules/relevamientos/nuevo?adultoMayorId=${data.id}`}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 hover:text-zinc-900 font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Iniciar Relevamiento
            </Link>
            <Link
              href={`/modules/adultos-mayores/${data.id}/editar`}
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Ficha
            </Link>
            {isAuthorizedToDelete && <DeleteButton id={data.id} />}
          </div>
        </div>

        {/* Ficha de Detalles */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* DNI */}
            <div>
              <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest">Documento (DNI)</span>
              <span className="block text-zinc-100 font-mono text-sm mt-1.5 select-all">{data.dni}</span>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest">Fecha de Nacimiento</span>
              <span className="block text-zinc-150 text-sm mt-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-500" />
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
              <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest">Teléfono de Contacto</span>
              <span className="block text-zinc-150 text-sm mt-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-zinc-500" />
                {data.telefono || 'No especificado'}
              </span>
            </div>

            {/* Barrio */}
            <div>
              <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest">Barrio de Residencia</span>
              <span className="block text-zinc-150 text-sm mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-500" />
                {data.barrio}
              </span>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest">Dirección Particular</span>
              <span className="block text-zinc-150 text-sm mt-1.5 select-all">{data.direccion}</span>
            </div>
          </div>

          {/* Observaciones */}
          <div className="border-t border-zinc-800 pt-6">
            <span className="block text-3xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Observaciones y Diagnóstico Social</span>
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {data.observaciones || 'Sin observaciones registradas.'}
            </div>
          </div>

          {/* Auditoría Básica */}
          <div className="border-t border-zinc-800 pt-6 flex flex-wrap gap-x-8 gap-y-4 text-4xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div>
              <span>Registrado por: </span>
              <span className="text-zinc-300 select-all">{data.creatorEmail}</span>
            </div>
            <div>
              <span>Creado: </span>
              <span className="text-zinc-300">
                {new Date(data.createdAt).toLocaleDateString('es-AR')}
              </span>
            </div>
            <div>
              <span>Actualizado: </span>
              <span className="text-zinc-300">
                {new Date(data.updatedAt).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>
        </div>

        {/* Historial de Relevamientos */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Historial de Relevamientos
            </h2>
            <span className="text-xs font-semibold bg-zinc-850 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full">
              {relevamientosList.length} Relevamiento(s)
            </span>
          </div>

          {relevamientosList.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center justify-center gap-3">
              <p className="text-zinc-500 text-sm">No se han registrado relevamientos para este participante.</p>
              <Link
                href={`/modules/relevamientos/nuevo?adultoMayorId=${data.id}`}
                className="inline-flex items-center px-4 py-2 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Iniciar Primer Relevamiento
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Riesgo Social</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Encuestador</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {relevamientosList.map((r) => {
                    const getRiesgoStyle = (rStyle: string) => {
                      switch (rStyle) {
                        case 'BAJO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        case 'MEDIO': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        case 'ALTO': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                        case 'CRITICO': return 'bg-rose-500/20 text-rose-450 border-rose-500/30 animate-pulse';
                        default: return 'bg-zinc-800 text-zinc-300 border-zinc-700/55';
                      }
                    };
                    const getEstadoStyle = (eStyle: string) => {
                      switch (eStyle) {
                        case 'BORRADOR': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
                        case 'FINALIZADO': return 'bg-blue-500/10 text-blue-450 border-blue-500/20 font-semibold';
                        default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
                      }
                    };

                    return (
                      <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-zinc-150">
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
                        <td className="px-4 py-3 text-zinc-400 text-xs select-all">
                          {r.createdByEmail}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            href={`/modules/relevamientos/${r.id}`}
                            className="inline-flex items-center px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 transition"
                          >
                            Ver Detalle
                          </Link>
                          {session && (session.role !== ROLES.SOCIAL_WORKER || r.estado === 'BORRADOR') && (
                            <Link
                              href={`/modules/relevamientos/${r.id}/editar`}
                              className="inline-flex items-center px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 transition"
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
      </PageTransition>
    </main>
  );
}
