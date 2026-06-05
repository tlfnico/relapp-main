import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/modules/auth/utils/jwt';
import { ROLES } from '@/lib/constants/roles';
import { getRelevamientoById } from '@/modules/relevamientos/services/relevamiento-service';
import DeleteRelevamientoButton from '@/modules/relevamientos/components/DeleteRelevamientoButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft, Edit } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RelevamientoDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Obtener datos del relevamiento
  const data = await getRelevamientoById(id);
  if (!data) {
    notFound();
  }

  // 2. Obtener sesión de usuario
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = sessionToken ? await verifyJWT(sessionToken) : null;
  if (!session) {
    notFound(); // O redirigir
  }

  // Determinar permisos
  const isAuthorizedToDelete = session.role === ROLES.ADMIN;
  const isAuthorizedToEdit =
    session.role !== ROLES.SOCIAL_WORKER || data.estado === 'BORRADOR';

  // Configurar badges de Riesgo Social
  const getRiesgoBadge = (riesgo: string) => {
    switch (riesgo) {
      case 'BAJO':
        return { label: 'Bajo', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'MEDIO':
        return { label: 'Medio', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'ALTO':
        return { label: 'Alto', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'CRITICO':
        return { label: 'Crítico', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' };
      default:
        return { label: riesgo, style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  // Configurar badges de Estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return { label: 'Borrador', style: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
      case 'FINALIZADO':
        return { label: 'Finalizado', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default:
        return { label: estado, style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const riesgoBadge = getRiesgoBadge(data.riesgoSocial);
  const estadoBadge = getEstadoBadge(data.estado);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <PageTransition className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Miga de Pan y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Adultos Mayores', href: '/modules/adultos-mayores' },
              { label: `${data.adultoMayorApellido}, ${data.adultoMayorNombre}`, href: `/modules/adultos-mayores/${data.adultoMayorId}` },
              { label: 'Detalle del Relevamiento' },
            ]}
          />
          <Link
            href={`/modules/adultos-mayores/${data.adultoMayorId}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Participante
          </Link>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Relevamiento Social
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${estadoBadge.style}`}>
                {estadoBadge.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${riesgoBadge.style}`}>
                Riesgo: {riesgoBadge.label}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Participante: <strong>{data.adultoMayorApellido}, {data.adultoMayorNombre}</strong> (DNI: {data.adultoMayorDni})
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthorizedToEdit && (
              <Link
                href={`/modules/relevamientos/${data.id}/editar`}
                className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Relevamiento
              </Link>
            )}
            {isAuthorizedToDelete && (
              <DeleteRelevamientoButton id={data.id} adultoMayorId={data.adultoMayorId} />
            )}
          </div>
        </div>

        {/* Detalle en Secciones */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-8 space-y-8">
          
          {/* Sección Habitacional */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Área Habitacional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="text-zinc-500 font-medium">Tipo de Vivienda:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.tipoVivienda}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Acceso a Agua de Red:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.tieneAgua ? 'Sí tiene' : 'No tiene'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Acceso a Electricidad:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.tieneLuz ? 'Sí tiene' : 'No tiene'}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Acceso a Gas de Red:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.tieneGas ? 'Sí tiene (Red)' : 'No tiene (Usa Garrafa)'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-500 font-medium">Situación de Hacinamiento:</span>
                <span className="ml-2 text-zinc-250 font-semibold">
                  {data.hacinamiento ? '🚨 Presenta hacinamiento crítico' : 'No presenta hacinamiento'}
                </span>
              </div>
            </div>
          </div>

          {/* Sección Salud y Autonomía */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Área Salud y Autonomía
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="text-zinc-500 font-medium">Nivel de Movilidad:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.nivelMovilidad}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Toma Medicamentos Regularmente:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.tomaMedicamentos ? 'Sí' : 'No'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-zinc-500 font-medium mb-1.5">Enfermedades Crónicas Detalladas:</span>
                <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-3 text-zinc-300">
                  {data.enfermedadesCronicas}
                </div>
              </div>
            </div>
          </div>

          {/* Sección Socioeconómica */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Área Socioeconómica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="text-zinc-500 font-medium">Ingresos Mensuales:</span>
                <span className="ml-2 text-zinc-250 font-mono font-bold">
                  ${parseFloat(data.ingresos).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Obra Social / Cobertura:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.obraSocial}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-zinc-500 font-medium">Red de Apoyo:</span>
                <span className="ml-2 text-zinc-250 font-semibold">{data.redApoyo}</span>
              </div>
            </div>
          </div>

          {/* Observaciones generales */}
          {data.observacionesGeneral && (
            <div className="border-t border-zinc-800 pt-6">
              <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Informe General / Observaciones del Encuestador</span>
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {data.observacionesGeneral}
              </div>
            </div>
          )}

          {/* Auditoría */}
          <div className="border-t border-zinc-800 pt-6 flex flex-wrap gap-x-8 gap-y-4 text-xs text-zinc-500">
            <div>
              <span>Encuestador responsable: </span>
              <span className="font-semibold text-zinc-400 select-all">{data.createdByEmail}</span>
            </div>
            <div>
              <span>Realizado el: </span>
              <span className="font-semibold text-zinc-400">
                {new Date(data.createdAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {data.updatedAt && data.updatedAt.getTime() !== data.createdAt.getTime() && (
              <div>
                <span>Última modificación: </span>
                <span className="font-semibold text-zinc-400">
                  {new Date(data.updatedAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </main>
  );
}
